#!/usr/bin/env node
/**
 * scan.js — decompose past Claude Code sessions into the two things the
 * refine-dev-system skill reports on:
 *
 *   1. every operator prompt in a dev-system session that invoked no skill;
 *   2. where the wall clock went in the slowest sessions.
 *
 * Reads the transcripts under ~/.claude/projects/<project>/<session>.jsonl.
 * Writes markdown to stdout. Reads only — it never edits a transcript.
 *
 *   node scan.js [--project <substring>] [--since YYYY-MM-DD] [--slowest N]
 *                [--skills a,b,c] [--all-skills] [--projects-root <path>]
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

// ---------------------------------------------------------------- arguments

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf('--' + name);
  return i === -1 ? fallback : argv[i + 1];
};
const flag = (name) => argv.includes('--' + name);

const ROOT = arg('projects-root', path.join(os.homedir(), '.claude', 'projects'));
const PROJECT = arg('project', null);
const SINCE = arg('since', null);
const SLOWEST = parseInt(arg('slowest', '5'), 10);
const MAX_PROMPT = parseInt(arg('max-prompt', '600'), 10);
const ALL_SKILLS = flag('all-skills');

// The phase skills this skill refines, plus the names they have carried before.
const FORMER_NAMES = [
  'active-scope-plan', 'active-scope-implementation', 'active-scope-finalize',
  'step-planning', 'step-implementation', 'ticket-planning', 'ticket-implementation',
];
const TARGET_SKILLS = (arg('skills', 'plan,build,finalize').split(',').concat(FORMER_NAMES))
  .map((s) => s.trim()).filter(Boolean);

// ------------------------------------------------------------------ parsing

const IDE_WRAPPERS = /<(ide_opened_file|ide_selection|ide_diagnostics)>[\s\S]*?<\/\1>/g;
const NOISE_PREFIX = /^(<command-name>|<command-message>|<local-command-|<bash-|Base directory for this skill:|Caveat: The messages below)/;

function textOf(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
}

/** An operator prompt, or null when the entry is IDE context rather than typing. */
function promptText(entry) {
  let t = textOf(entry.message && entry.message.content);
  if (!t) return null;
  t = t.replace(IDE_WRAPPERS, '').trim();
  if (!t || NOISE_PREFIX.test(t)) return null;
  return t;
}

function parseSession(file) {
  const events = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { events.push(JSON.parse(line)); } catch (e) { /* half-written line */ }
  }
  const stamped = events.filter((e) => e.timestamp).sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
  if (!stamped.length) return null;

  const s = {
    file,
    id: path.basename(file, '.jsonl'),
    project: path.basename(path.dirname(file)),
    cwd: (events.find((e) => e.cwd) || {}).cwd || '',
    start: stamped[0].timestamp,
    end: stamped[stamped.length - 1].timestamp,
    prompts: [],        // { t, text, skills: [] } — one per operator turn
    skills: [],         // { t, name }
    calls: [],          // { name, t, sec, input, sidechain }
    buckets: { model: 0, tool: 0, wait: 0, idle: 0 },
  };

  const open = new Map();     // tool_use_id -> { name, t, input, sidechain }
  let turn = null;

  for (const e of stamped) {
    if (e.type === 'user' && e.origin && e.origin.kind === 'human') {
      const text = promptText(e);
      if (text) { turn = { t: e.timestamp, text, skills: [] }; s.prompts.push(turn); }
    }
    if (e.type === 'assistant' && Array.isArray(e.message.content)) {
      for (const b of e.message.content) {
        if (b.type !== 'tool_use') continue;
        open.set(b.id, { name: b.name, t: e.timestamp, input: b.input, sidechain: !!e.isSidechain });
        if (b.name === 'Skill' && b.input && b.input.skill) {
          s.skills.push({ t: e.timestamp, name: b.input.skill });
          if (turn) turn.skills.push(b.input.skill);
        }
      }
    }
    if (e.type === 'user' && Array.isArray(e.message.content)) {
      for (const b of e.message.content) {
        if (b.type !== 'tool_result' || !open.has(b.tool_use_id)) continue;
        const u = open.get(b.tool_use_id);
        s.calls.push(Object.assign({}, u, { sec: (new Date(e.timestamp) - new Date(u.t)) / 1000, end: e.timestamp }));
        open.delete(b.tool_use_id);
      }
    }
  }

  // Where the wall clock went. Every interval between two consecutive events is
  // attributed once, so the four buckets add up to the wall clock.
  const openAt = new Map();
  for (let i = 1; i < stamped.length; i++) {
    const prev = stamped[i - 1], next = stamped[i];
    const mins = (new Date(next.timestamp) - new Date(prev.timestamp)) / 60000;

    if (prev.type === 'assistant' && Array.isArray(prev.message.content)) {
      for (const b of prev.message.content) if (b.type === 'tool_use') openAt.set(b.id, b.name);
    }
    if (prev.type === 'user' && Array.isArray(prev.message.content)) {
      for (const b of prev.message.content) if (b.type === 'tool_result') openAt.delete(b.tool_use_id);
    }

    const waitingOnOperator = Array.from(openAt.values()).includes('AskUserQuestion');
    const nextIsPrompt = (next.type === 'user' && next.origin && next.origin.kind === 'human')
      || (next.type === 'queue-operation' && next.operation === 'enqueue');

    if (waitingOnOperator || nextIsPrompt) s.buckets.wait += mins;
    else if (openAt.size) s.buckets.tool += mins;
    else if (mins > 10) s.buckets.idle += mins;
    else s.buckets.model += mins;
  }
  s.wall = (new Date(s.end) - new Date(s.start)) / 60000;
  return s;
}

// ------------------------------------------------------------- command kinds

const KINDS = [
  ['tests', /\b(vitest|jest|pytest|playwright|phpunit|go test|cargo test|mvn test|(npm|yarn|pnpm)\s+(run\s+)?test)\b/i],
  ['typecheck', /\b(tsc|mypy|pyright|flow|(npm|yarn|pnpm)\s+run\s+typecheck)\b/i],
  ['install', /\b((npm|yarn|pnpm)\s+(i|install|add)|pip install)\b/i],
  ['lint', /\b(eslint|biome|ruff|prettier|stylelint)\b/i],
  ['build', /\b((npm|yarn|pnpm)\s+run\s+build|next build|vite build|tsup|webpack|docker build|cargo build)\b/i],
  ['git', /\bgit\b/i],
  ['read', /^\s*(cat|sed -n|head|tail|less|wc|ls|find|grep|rg|type)\b/i],
  ['edit', /(sed -i|tee\b|Set-Content|Out-File)/],
];
const kindOf = (cmd) => (KINDS.find((k) => k[1].test(cmd)) || ['other'])[0];

const commandOf = (call) => {
  const i = call.input || {};
  return String(i.command || i.file_path || i.pattern || i.prompt || i.skill || JSON.stringify(i)).replace(/\s+/g, ' ');
};

/** Prompts that read as the operator answering a question Claude asked. */
const ANSWERISH = /^(yes|no|ok|okay|sure|accept|continue|go ahead|proceed|do it|y|n|t|[1-9][).:]?)\b/i;

// ------------------------------------------------------------------- collect

if (!fs.existsSync(ROOT)) { console.error('No transcript root at ' + ROOT); process.exit(1); }

const files = [];
for (const dir of fs.readdirSync(ROOT)) {
  const full = path.join(ROOT, dir);
  if (!fs.statSync(full).isDirectory()) continue;
  for (const f of fs.readdirSync(full)) if (f.endsWith('.jsonl')) files.push(path.join(full, f));
}

const sessions = [];
for (const f of files) {
  let s;
  try { s = parseSession(f); } catch (e) { continue; }
  if (!s || !s.prompts.length) continue;
  if (SINCE && s.start < SINCE) continue;
  if (PROJECT && !(s.project + ' ' + s.cwd).toLowerCase().includes(PROJECT.toLowerCase())) continue;
  if (!ALL_SKILLS && !s.skills.some((k) => TARGET_SKILLS.includes(k.name))) continue;
  sessions.push(s);
}
sessions.sort((a, b) => b.wall - a.wall);

// -------------------------------------------------------------------- report

const out = [];
const say = (l) => out.push(l === undefined ? '' : l);
const m = (x) => x.toFixed(0) + 'm';
const clip = (t, n) => (t.length > n ? t.slice(0, n) + ' …' : t);
const shortProject = (p) => p.replace(/^c--Users-[^-]+-/, '');

say('# Session scan');
say();
say('Root: `' + ROOT + '`  ·  ' + sessions.length + ' session(s)'
  + (PROJECT ? '  ·  project filter `' + PROJECT + '`' : '')
  + (SINCE ? '  ·  since ' + SINCE : '')
  + (ALL_SKILLS ? '  ·  all skills' : '  ·  skills ' + TARGET_SKILLS.slice(0, 3).join(', ') + ' (+ former names)'));
say();

say('## Sessions by wall clock');
say();
say('| Session | Project | Started | Skills | Wall | Model | Tool | Operator wait | Idle | Prompts |');
say('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const s of sessions) {
  const names = Array.from(new Set(s.skills.map((k) => k.name))).join(', ') || '—';
  say('| ' + s.id.slice(0, 8) + ' | ' + shortProject(s.project) + ' | ' + s.start.slice(0, 16).replace('T', ' ')
    + ' | ' + names + ' | ' + m(s.wall) + ' | ' + m(s.buckets.model) + ' | ' + m(s.buckets.tool)
    + ' | ' + m(s.buckets.wait) + ' | ' + m(s.buckets.idle) + ' | ' + s.prompts.length + ' |');
}
say();

say('## Where the wall clock went — the ' + Math.min(SLOWEST, sessions.length) + ' slowest');
say();
for (const s of sessions.slice(0, SLOWEST)) {
  const names = Array.from(new Set(s.skills.map((k) => k.name))).join(', ') || '—';
  say('### ' + s.id.slice(0, 8) + ' — ' + m(s.wall) + ' wall — ' + names);
  say();
  say('Transcript: `' + s.file + '`');
  say();
  say('First prompt: ' + JSON.stringify(clip(s.prompts[0].text, 200)));
  say();

  const byTool = {}, byKind = {}, repeats = {};
  for (const c of s.calls) {
    byTool[c.name] = (byTool[c.name] || 0) + c.sec;
    if (c.name === 'Bash' || c.name === 'PowerShell') {
      const cmd = commandOf(c);
      const k = kindOf(cmd);
      byKind[k] = byKind[k] || { sec: 0, n: 0 };
      byKind[k].sec += c.sec; byKind[k].n++;
      repeats[cmd] = (repeats[cmd] || 0) + 1;
    }
  }
  say('Tool time by tool: ' + Object.entries(byTool).sort((a, b) => b[1] - a[1])
    .map((e) => e[0] + ' ' + (e[1] / 60).toFixed(1) + 'm' + (e[0] === 'AskUserQuestion' ? ' (operator wait, not Claude)' : ''))
    .join(' · '));
  say();
  say('Shell time by kind: ' + (Object.entries(byKind).sort((a, b) => b[1].sec - a[1].sec)
    .map((e) => e[0] + ' ' + (e[1].sec / 60).toFixed(1) + 'm ×' + e[1].n).join(' · ') || 'none'));
  say();
  const rerun = Object.entries(repeats).filter((e) => e[1] > 1).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (rerun.length) {
    say('Identical commands run more than once:');
    for (const e of rerun) say('- ×' + e[1] + ' `' + clip(e[0], 120) + '`');
    say();
  }
  say('Longest single calls:');
  for (const c of s.calls.slice().sort((a, b) => b.sec - a.sec).slice(0, 8)) {
    say('- ' + (c.sec / 60).toFixed(1) + 'm — ' + c.name + (c.sidechain ? ' (subagent)' : '')
      + ' — `' + clip(commandOf(c), 140) + '`');
  }
  say();
  say('Counts: ' + s.calls.length + ' tool calls · '
    + ['AskUserQuestion', 'Read', 'Grep', 'Glob', 'Edit', 'Write', 'Agent']
      .map((n) => n + ' ' + s.calls.filter((c) => c.name === n).length).join(' · '));
  say();
}

say('## Prompts that invoked no skill');
say();
const unskilled = [];
for (const s of sessions) {
  for (let i = 0; i < s.prompts.length; i++) {
    const p = s.prompts[i];
    if (p.skills.length) continue;
    const active = s.skills.filter((k) => k.t < p.t).pop();
    unskilled.push({ s: s, p: p, i: i, active: active ? active.name : null });
  }
}
const totalPrompts = sessions.reduce((n, s) => n + s.prompts.length, 0);
say(unskilled.length + ' of ' + totalPrompts + ' operator prompts invoked no skill.');
say();
let last = null;
for (const u of unskilled) {
  if (u.s.id !== last) {
    if (last) say();
    say('### ' + u.s.id.slice(0, 8) + ' — ' + shortProject(u.s.project));
    say();
    last = u.s.id;
  }
  const tags = [u.i === 0 ? 'opening prompt' : 'follow-up #' + u.i,
    u.active ? 'during `' + u.active + '`' : 'no skill had run'];
  if (u.p.text.length < 40 && ANSWERISH.test(u.p.text)) tags.push('reads as an answer');
  say('- **' + u.p.t.slice(0, 16).replace('T', ' ') + '** · ' + tags.join(' · '));
  say('  > ' + clip(u.p.text, MAX_PROMPT).split('\n').join('\n  > '));
}
say();

process.stdout.write(out.join('\n') + '\n');
