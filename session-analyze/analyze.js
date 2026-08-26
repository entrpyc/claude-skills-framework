#!/usr/bin/env node
/**
 * analyze.js — decompose the session that is running right now.
 *
 * Locates the live transcript, then prints a chronological timeline with a wall
 * clock on every entry, rollups of where the time went, and an inventory of
 * everything the session actually did — the material for checking each step
 * against the skill that was supposed to have ordered it.
 *
 * Reads only. Never edits a transcript.
 *
 *   node analyze.js --marker <token>     # token must appear in this command line
 *   node analyze.js --session <path or session id>
 *   node analyze.js --marker <token> --collapse 15 --max-timeline 400
 *
 * The marker works because the command line you type is itself recorded in the
 * transcript before it runs, so the file containing the token is this session.
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

const ROOT = arg('projects-root', path.join(os.homedir(), '.claude', 'projects'));
const MARKER = arg('marker', null);
const SESSION = arg('session', null);
const COLLAPSE = parseFloat(arg('collapse', '15'));       // seconds
const MAX_TIMELINE = parseInt(arg('max-timeline', '500'), 10);
const CWD = process.cwd();

// ------------------------------------------------------------------- locate

function allTranscripts() {
  const out = [];
  if (!fs.existsSync(ROOT)) return out;
  for (const dir of fs.readdirSync(ROOT)) {
    const full = path.join(ROOT, dir);
    let stat; try { stat = fs.statSync(full); } catch (e) { continue; }
    if (!stat.isDirectory()) continue;
    for (const f of fs.readdirSync(full)) if (f.endsWith('.jsonl')) out.push(path.join(full, f));
  }
  return out;
}

function locate() {
  if (SESSION) {
    if (fs.existsSync(SESSION)) return { file: SESSION, how: 'given by path' };
    const hit = allTranscripts().find((f) => path.basename(f, '.jsonl').startsWith(SESSION));
    if (hit) return { file: hit, how: 'given by session id' };
    console.error('No transcript matches --session ' + SESSION);
    process.exit(1);
  }
  if (MARKER) {
    const hits = allTranscripts().filter((f) => {
      try { return fs.readFileSync(f, 'utf8').includes(MARKER); } catch (e) { return false; }
    });
    if (hits.length === 1) return { file: hits[0], how: 'marker `' + MARKER + '`' };
    if (hits.length > 1) {
      hits.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
      return { file: hits[0], how: 'marker `' + MARKER + '` — matched ' + hits.length + ' files, took the newest' };
    }
  }
  // Fallback: newest transcript whose cwd is this one.
  const candidates = allTranscripts()
    .map((f) => ({ f, m: fs.statSync(f).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  for (const c of candidates.slice(0, 40)) {
    let head = '';
    try { head = fs.readFileSync(c.f, 'utf8').slice(0, 200000); } catch (e) { continue; }
    if (head.includes(JSON.stringify(CWD).slice(1, -1))) {
      return { file: c.f, how: 'newest transcript for this cwd — NOT marker-confirmed' };
    }
  }
  console.error('Could not locate the live transcript under ' + ROOT);
  process.exit(1);
}

// ------------------------------------------------------------------ parsing

const IDE_WRAPPERS = /<(ide_opened_file|ide_selection|ide_diagnostics)>[\s\S]*?<\/\1>/g;
const NOISE_PREFIX = /^(<command-name>|<command-message>|<local-command-|<bash-|Base directory for this skill:|Caveat: The messages below)/;

const textOf = (content) => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
};

const clip = (t, n) => {
  const s = String(t).replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n) + ' …' : s;
};

const commandOf = (input) => {
  const i = input || {};
  return clip(i.command || i.file_path || i.pattern || i.prompt || i.skill || i.url || JSON.stringify(i), 4000);
};

const KINDS = [
  ['tests', /\b(vitest|jest|pytest|playwright|phpunit|go test|cargo test|mvn test|(npm|yarn|pnpm)\s+(run\s+)?test)\b/i],
  ['typecheck', /\b(tsc|mypy|pyright|flow|(npm|yarn|pnpm)\s+run\s+typecheck)\b/i],
  ['lint', /\b(eslint|biome|ruff|prettier|stylelint)\b/i],
  ['build', /\b((npm|yarn|pnpm)\s+run\s+build|next build|vite build|tsup|webpack|docker build|cargo build)\b/i],
  ['install', /\b((npm|yarn|pnpm)\s+(i|install|add)|pip install)\b/i],
  ['migrate', /\b(migrat|prisma|drizzle-kit|alembic|knex)\w*/i],
  ['run app', /\b((npm|yarn|pnpm)\s+run\s+(dev|start|worker)|docker (compose )?up|serve)\b/i],
  ['git', /\bgit\b/i],
  ['read', /^\s*(cat|sed -n|head|tail|less|wc|ls|find|grep|rg|type)\b/i],
  ['edit', /(sed -i|tee\b|Set-Content|Out-File)/],
];
const kindOf = (cmd) => (KINDS.find((k) => k[1].test(cmd)) || ['other'])[0];

// What kind of failure it was — the first match wins, so the specific ones lead.
const FAILURE_KINDS = [
  ['operator rejected', /user (doesn't|does not) want|tool use was rejected|user (rejected|denied)|requested permissions/i],
  ['validation', /InputValidationError|tool_use_error|Invalid (input|parameters|argument)|is not a valid/i],
  ['edit did not match', /String to replace not found|match count|not unique|has not been read yet|file has (been|not been) (modified|read)|expected to find/i],
  ['not found', /ENOENT|no such file or directory|cannot find (the )?(path|file)|command not found|is not recognized|CommandNotFound|was not found|does not exist/i],
  ['permission', /EACCES|EPERM|Access is denied|permission denied|is locked|EBUSY/i],
  ['timeout', /timed ?out|ETIMEDOUT|took too long|exceeded .* timeout/i],
  ['syntax error', /SyntaxError|ParserError|ParseError|Unexpected token|unexpected EOF|unexpected end of/i],
  ['tests failed', /\b\d+ (failed|failing)\b|Tests:\s+\d+ failed|AssertionError|FAIL |✕/],
  ['nonzero exit', /^Exit code [1-9]/m],
];
const failKindOf = (txt) => (FAILURE_KINDS.find((k) => k[1].test(String(txt))) || ['other'])[0];

// One readable line out of whatever the failure printed.
const errSummary = (txt) => {
  const lines = String(txt).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return '(no output)';
  const meaty = lines.find((l) => /^([A-Za-z]*Error|error|FAIL|✕|Assertion|Cannot|Could not|No such|Expected)\b/.test(l))
    || lines.find((l) => /No such file|not recognized|command not found|Permission denied|Cannot find|cannot access|cannot open|could not |unable to |\bENOENT\b|\berror\b/i.test(l));
  if (/^Exit code \d+/.test(lines[0])) {
    const rest = meaty || lines.slice(1).find((l) => l.length > 3) || '';
    return lines[0] + (rest ? ' — ' + clip(rest, 200) : '');
  }
  return clip(meaty || lines[0], 240);
};

// Two calls share a signature when they are plausibly the same attempt retried.
const sigOf = (c) => {
  const i = c.input || {};
  if (i.file_path) return c.name + ' ' + i.file_path;
  let cmd = String(i.command || i.pattern || i.prompt || commandOf(i)).trim();
  cmd = cmd.replace(/^(cd\s+("[^"]*"|'[^']*'|\S+)\s*(&&|;)\s*)+/i, '');   // the cd prefix is not the attempt
  const words = cmd.split(/\s+/);
  const target = words.slice(1).find((w) => !w.startsWith('-') && w.length < 80 && /[\\/]/.test(w)) || '';
  return c.name + ' ' + (words[0] || '') + ' ' + target;
};

const located = locate();
const events = [];
for (const line of fs.readFileSync(located.file, 'utf8').split('\n')) {
  if (!line.trim()) continue;
  try { events.push(JSON.parse(line)); } catch (e) { /* half-written tail */ }
}
const stamped = events.filter((e) => e.timestamp).sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
if (!stamped.length) { console.error('Transcript has no timestamped entries: ' + located.file); process.exit(1); }

const T0 = new Date(stamped[0].timestamp).getTime();
const TN = new Date(stamped[stamped.length - 1].timestamp).getTime();
const at = (ts) => (new Date(ts).getTime() - T0) / 1000;                 // seconds from start
const offset = (sec) => {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return '+' + (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(s).padStart(2, '0');
};
const dur = (sec) => (sec >= 90 ? (sec / 60).toFixed(1) + 'm' : sec.toFixed(0) + 's');

// Pass 1 — pair tool calls with their results.
const open = new Map();
const calls = new Map();   // tool_use_id -> { name, start, sec, input, sidechain }
for (const e of stamped) {
  if (e.type === 'assistant' && Array.isArray(e.message.content)) {
    for (const b of e.message.content) {
      if (b.type === 'tool_use') open.set(b.id, { id: b.id, name: b.name, start: at(e.timestamp), input: b.input, sidechain: !!e.isSidechain });
    }
  }
  if (e.type === 'user' && Array.isArray(e.message.content)) {
    for (const b of e.message.content) {
      if (b.type !== 'tool_result' || !open.has(b.tool_use_id)) continue;
      const u = open.get(b.tool_use_id);
      u.sec = at(e.timestamp) - u.start;
      const body = typeof b.content === 'string' ? b.content
        : Array.isArray(b.content) ? b.content.map((x) => (x && x.text) || '').join('\n') : '';
      u.failed = !!b.is_error || (typeof e.toolUseResult === 'object' && e.toolUseResult && e.toolUseResult.is_error === true);
      if (u.failed) { u.failKind = failKindOf(body); u.err = errSummary(body); }
      calls.set(u.id, u);
      open.delete(b.tool_use_id);
    }
  }
}
for (const u of open.values()) { u.sec = null; calls.set(u.id, u); }   // still running

// Pass 2 — the timeline, and the four wall-clock buckets.
const timeline = [];
const buckets = { model: 0, tool: 0, wait: 0, idle: 0 };
const openAt = new Map();
const prompts = [];
const skills = [];

for (let i = 0; i < stamped.length; i++) {
  const e = stamped[i];

  if (e.type === 'user' && e.origin && e.origin.kind === 'human') {
    let t = textOf(e.message.content).replace(IDE_WRAPPERS, '').trim();
    if (t && !NOISE_PREFIX.test(t)) {
      prompts.push({ at: at(e.timestamp), text: t });
      timeline.push({ kind: 'prompt', at: at(e.timestamp), text: t });
    }
  }
  if (e.type === 'assistant' && Array.isArray(e.message.content) && !e.isSidechain) {
    const said = textOf(e.message.content).trim();
    if (said.length > 40) timeline.push({ kind: 'say', at: at(e.timestamp), text: said });
    for (const b of e.message.content) {
      if (b.type !== 'tool_use') continue;
      const c = calls.get(b.id);
      if (b.name === 'Skill' && b.input && b.input.skill) {
        skills.push({ at: at(e.timestamp), name: b.input.skill });
        timeline.push({ kind: 'skill', at: at(e.timestamp), text: b.input.skill });
      } else {
        timeline.push({ kind: 'tool', at: at(e.timestamp), name: b.name, sec: c ? c.sec : null, input: b.input, sidechain: !!e.isSidechain,
          failKind: c && c.failed ? c.failKind : null, err: c && c.failed ? c.err : null });
      }
    }
  }

  if (i === 0) continue;
  const prev = stamped[i - 1];
  const gap = (new Date(e.timestamp) - new Date(prev.timestamp)) / 60000;
  if (prev.type === 'assistant' && Array.isArray(prev.message.content)) {
    for (const b of prev.message.content) if (b.type === 'tool_use') openAt.set(b.id, b.name);
  }
  if (prev.type === 'user' && Array.isArray(prev.message.content)) {
    for (const b of prev.message.content) if (b.type === 'tool_result') openAt.delete(b.tool_use_id);
  }
  const asking = Array.from(openAt.values()).includes('AskUserQuestion');
  const nextIsPrompt = (e.type === 'user' && e.origin && e.origin.kind === 'human')
    || (e.type === 'queue-operation' && e.operation === 'enqueue');
  if (asking || nextIsPrompt) buckets.wait += gap;
  else if (openAt.size) buckets.tool += gap;
  else if (gap > 10) buckets.idle += gap;
  else buckets.model += gap;
}

// Collapse runs of cheap same-tool calls so the timeline stays readable.
const collapsed = [];
for (const entry of timeline) {
  const last = collapsed[collapsed.length - 1];
  if (entry.kind === 'tool' && !entry.failKind && last && !last.failKind && last.kind === 'tool' && last.name === entry.name
    && (entry.sec === null || entry.sec < COLLAPSE) && (last.sec === null || last.sec < COLLAPSE)
    && entry.at - last.lastAt <= 90) {                       // only a contiguous run
    last.n = (last.n || 1) + 1;
    last.sec = (last.sec || 0) + (entry.sec || 0);
    last.lastAt = entry.at;
    last.also = last.also || [];
    last.also.push(commandOf(entry.input));
    continue;
  }
  collapsed.push(Object.assign({}, entry, { lastAt: entry.at }));
}

// ------------------------------------------------------------------- report

const out = [];
const say = (l) => out.push(l === undefined ? '' : l);
const wall = (TN - T0) / 60000;

say('# Session analysis');
say();
say('Transcript: `' + located.file + '`  (' + located.how + ')');
say('Session: `' + path.basename(located.file, '.jsonl') + '`  ·  cwd `' + ((events.find((e) => e.cwd) || {}).cwd || '?') + '`');
say('Span: ' + stamped[0].timestamp.slice(0, 19).replace('T', ' ') + ' → ' + stamped[stamped.length - 1].timestamp.slice(0, 19).replace('T', ' ') + ' UTC');
say();
say('**Wall clock ' + wall.toFixed(0) + 'm** — model ' + buckets.model.toFixed(0) + 'm · tool ' + buckets.tool.toFixed(0)
  + 'm · operator wait ' + buckets.wait.toFixed(0) + 'm · idle ' + buckets.idle.toFixed(0) + 'm');
say();
if (!SESSION) {
  say('The turn running this analysis is not in the transcript yet, so the tail is missing.');
  say();
}

say('## Skills invoked');
say();
if (!skills.length) say('None — no Skill call in this session.');
for (const k of skills) say('- ' + offset(k.at) + ' — `' + k.name + '`');
say();

say('## Operator prompts');
say();
for (const p of prompts) {
  say('- **' + offset(p.at) + '** — ' + JSON.stringify(clip(p.text, 400)));
}
say();

say('## Timeline');
say();
say('`offset` · `duration` — what ran. Runs of cheap same-tool calls are collapsed.');
say();
const shown = collapsed.slice(0, MAX_TIMELINE);
for (const e of shown) {
  if (e.kind === 'prompt') { say('**' + offset(e.at) + ' ── OPERATOR** ' + JSON.stringify(clip(e.text, 200))); continue; }
  if (e.kind === 'skill') { say('**' + offset(e.at) + ' ── SKILL `' + e.text + '`**'); continue; }
  if (e.kind === 'say') { say(offset(e.at) + '  » ' + clip(e.text, 220)); continue; }
  const n = e.n ? ' ×' + e.n : '';
  const d = e.sec === null ? 'unfinished' : dur(e.sec);
  const span = e.n ? offset(e.at) + '→' + offset(e.lastAt) : offset(e.at);
  say(span + '  ' + (e.failKind ? '✗ ' : '') + (e.name + n).padEnd(18) + ' ' + d.padStart(7) + '  `' + clip(commandOf(e.input), 150) + '`'
    + (e.sidechain ? '  _(subagent)_' : ''));
  if (e.failKind) say('       ✗ ' + e.failKind + ' — ' + clip(e.err, 200));
  for (const extra of (e.also || []).slice(0, 5)) say('       ↳ `' + clip(extra, 130) + '`');
  if (e.also && e.also.length > 5) say('       ↳ … ' + (e.also.length - 5) + ' more');
}
if (collapsed.length > shown.length) say('… ' + (collapsed.length - shown.length) + ' further entries not shown (raise --max-timeline).');
say();

say('## Where the time went');
say();
const list = Array.from(calls.values());
const byTool = {};
for (const c of list) byTool[c.name] = (byTool[c.name] || 0) + (c.sec || 0);
say('By tool: ' + Object.entries(byTool).sort((a, b) => b[1] - a[1])
  .map((e) => e[0] + ' ' + dur(e[1]) + (e[0] === 'AskUserQuestion' ? ' (operator wait)' : '')).join(' · '));
say();

const byKind = {};
const repeats = {};
for (const c of list) {
  if (c.name !== 'Bash' && c.name !== 'PowerShell') continue;
  const cmd = commandOf(c.input);
  const k = kindOf(cmd);
  byKind[k] = byKind[k] || { sec: 0, n: 0 };
  byKind[k].sec += c.sec || 0; byKind[k].n++;
  repeats[cmd] = (repeats[cmd] || 0) + 1;
}
say('By shell command kind: ' + (Object.entries(byKind).sort((a, b) => b[1].sec - a[1].sec)
  .map((e) => e[0] + ' ' + dur(e[1].sec) + ' ×' + e[1].n).join(' · ') || 'no shell commands'));
say();

const rerun = Object.entries(repeats).filter((e) => e[1] > 1).sort((a, b) => b[1] - a[1]).slice(0, 8);
if (rerun.length) {
  say('Identical commands run more than once:');
  for (const e of rerun) say('- ×' + e[1] + ' `' + clip(e[0], 140) + '`');
  say();
}

say('Longest single calls:');
for (const c of list.slice().sort((a, b) => (b.sec || 0) - (a.sec || 0)).slice(0, 10)) {
  say('- ' + dur(c.sec || 0) + ' at ' + offset(c.start) + ' — ' + c.name + (c.sidechain ? ' (subagent)' : '')
    + ' — `' + clip(commandOf(c.input), 150) + '`');
}
say();

// The thing a call was aimed at — the path tokens in it, minus the ones so common
// (the project root in every `cd`) that they would relate everything to everything.
const stripCd = (cmd) => String(cmd).replace(/^(cd\s+("[^"]*"|'[^']*'|\S+)\s*(&&|;)\s*)+/i, '');
const rawTargets = (c) => {
  const i = c.input || {};
  const text = [i.file_path, stripCd(i.command || ''), i.pattern, i.notebook_path].filter(Boolean).join(' ');
  const out = new Set();
  for (const w of String(text).split(/[\s'"`(),;=]+/)) {
    const t = w.replace(/^[^\w.\/\\]+/, '').replace(/[^\w.\/\\]+$/, '').toLowerCase();
    if (t.length > 3 && /[\/\\.]/.test(t) && /[a-z]/.test(t)) out.add(t);
  }
  return out;
};
const targetFreq = {};
for (const c of list) for (const t of rawTargets(c)) targetFreq[t] = (targetFreq[t] || 0) + 1;
const tooCommon = (t) => targetFreq[t] > Math.max(3, list.length * 0.25);
const targetsOf = (c) => (c._targets = c._targets
  || new Set(Array.from(rawTargets(c)).filter((t) => !tooCommon(t))));
// Two calls belong to the same episode when they are the same attempt retried, or
// when the later one is aimed at what the failed one was aimed at.
const related = (a, b) => {
  if (sigOf(a) === sigOf(b)) return true;
  const tb = targetsOf(b);
  for (const t of targetsOf(a)) if (tb.has(t)) return true;
  return false;
};

// ------------------------------------------------------------------ failures
// A failed call and every later attempt at the same thing form one episode, so
// the cost of a failure is the whole detour, not just the call that broke.
const ordered = list.slice().sort((a, b) => a.start - b.start);
const claimed = new Set();
const episodes = [];
for (let i = 0; i < ordered.length; i++) {
  const c = ordered[i];
  if (!c.failed || claimed.has(c.id)) continue;
  claimed.add(c.id);
  const ep = { first: c, tries: [c], recovered: null };
  let cursor = c.start + (c.sec || 0);
  for (let j = i + 1; j < ordered.length; j++) {
    const d = ordered[j];
    if (d.start - cursor > 300) break;                                    // the session moved on
    if (prompts.some((q) => q.at > cursor && q.at <= d.start)) break;     // the operator stepped in
    if (!related(c, d)) continue;
    ep.tries.push(d); claimed.add(d.id);
    cursor = d.start + (d.sec || 0);
    if (!d.failed) { ep.recovered = d; break; }
  }
  ep.span = cursor - c.start;
  // A rejected call sat waiting on the operator; that time is theirs, never the skill's.
  ep.direct = ep.tries.reduce((a, t) => a + (t.failKind === 'operator rejected' ? 0 : (t.sec || 0)), 0);
  ep.waited = ep.tries.reduce((a, t) => a + (t.failKind === 'operator rejected' ? (t.sec || 0) : 0), 0);
  episodes.push(ep);
}

say('## Failed actions');
say();
if (!episodes.length) {
  say('None — every tool call in this session returned successfully.');
  say();
} else {
  const failedCalls = list.filter((c) => c.failed).length;
  const detour = episodes.reduce((a, e) => a + e.span, 0);
  const inCalls = episodes.reduce((a, e) => a + e.direct, 0);
  const waited = episodes.reduce((a, e) => a + e.waited, 0);
  say('**' + failedCalls + ' call' + (failedCalls === 1 ? '' : 's') + ' failed** in ' + episodes.length + ' episode' + (episodes.length === 1 ? '' : 's') + ' · '
    + dur(inCalls) + ' inside the failing calls themselves · '
    + dur(detour) + ' from each first failure to the attempt that got past it — '
    + (detour / 60 / (wall || 1) * 100).toFixed(0) + '% of wall clock, work interleaved between the attempts included.');
  if (waited) say('' + dur(waited) + ' of that is the operator deciding on a call they then rejected — their time, not the skill’s.');
  say();
  say('Each entry is a failure to attribute in the report: a rule steered into it, a habit did, '
    + 'the machine did, or the operator refused it.');
  say();
  for (const ep of episodes.slice().sort((a, b) => b.span - a.span)) {
    const c = ep.first;
    say('- **✗ ' + offset(c.start) + ' · ' + c.name + ' · ' + c.failKind + '** — `'
      + clip(commandOf(c.input), 150) + '`' + (c.sidechain ? ' _(subagent)_' : ''));
    say('  ' + clip(c.err, 240));
    if (ep.tries.length === 1) {
      say('  → not retried · ' + dur(ep.direct) + ' spent'
        + (ep.waited ? ', after ' + dur(ep.waited) + ' of operator time before the refusal' : ''));
    } else {
      say('  → ' + ep.tries.length + ' attempts over ' + dur(ep.span) + ' (' + dur(ep.direct) + ' in the calls)'
        + (ep.recovered
          ? ' · got past it at ' + offset(ep.recovered.start) + ' with `' + clip(commandOf(ep.recovered.input), 110) + '`'
          : ' · never got past it here'));
    }
  }
  say();

  const kinds = {};
  for (const c of list) if (c.failed) kinds[c.failKind] = (kinds[c.failKind] || 0) + 1;
  say('Failure kinds: ' + Object.entries(kinds).sort((a, b) => b[1] - a[1])
    .map((e) => e[0] + ' ×' + e[1]).join(' · '));
  say();

  const byTool = {};
  for (const c of list) if (c.failed) byTool[c.name] = (byTool[c.name] || 0) + 1;
  say('Failed by tool: ' + Object.entries(byTool).sort((a, b) => b[1] - a[1])
    .map((e) => e[0] + ' ' + e[1] + '/' + list.filter((c) => c.name === e[0]).length).join(' · '));
  say();

  const sigs = {};
  for (const c of list) if (c.failed) (sigs[sigOf(c)] = sigs[sigOf(c)] || []).push(c);
  const repeated = Object.entries(sigs).filter((e) => e[1].length > 1).sort((a, b) => b[1].length - a[1].length);
  if (repeated.length) {
    say('The same thing failed more than once — the strongest candidates for a rule:');
    for (const [sig, cs] of repeated) {
      say('- ×' + cs.length + ' `' + clip(sig, 120) + '` — ' + cs[0].failKind
        + ' at ' + cs.map((c) => offset(c.start)).join(', '));
    }
    say();
  }

  const rejected = list.filter((c) => c.failed && c.failKind === 'operator rejected');
  if (rejected.length) {
    say('Refused by the operator ×' + rejected.length + ' — what the skill told you to do and the operator would not have:');
    for (const c of rejected) say('- ' + offset(c.start) + ' — ' + c.name + ' `' + clip(commandOf(c.input), 130) + '`');
    say();
  }
}

say('## What the session actually did');
say();
say('Every line here is a step to check against the skill that was running. Anything the skill did not order is a finding.');
say();
const touched = new Map();
for (const c of list) {
  if (!['Edit', 'Write', 'NotebookEdit', 'Read'].includes(c.name)) continue;
  const f = (c.input && c.input.file_path) || '?';
  const rec = touched.get(f) || { read: 0, wrote: 0 };
  if (c.name === 'Read') rec.read++; else rec.wrote++;
  touched.set(f, rec);
}
say('Files touched: ' + (touched.size || 'none'));
for (const e of Array.from(touched.entries()).sort((a, b) => b[1].wrote - a[1].wrote).slice(0, 40)) {
  say('- ' + (e[1].wrote ? '**written ×' + e[1].wrote + '**' : 'read only') + (e[1].read ? ' · read ×' + e[1].read : '')
    + ' — `' + e[0] + '`');
}
say();
say('Tool call counts: ' + Object.entries(list.reduce((a, c) => { a[c.name] = (a[c.name] || 0) + 1; return a; }, {}))
  .sort((a, b) => b[1] - a[1]).map((e) => e[0] + ' ' + e[1]).join(' · '));
say();
const subagents = list.filter((c) => c.name === 'Agent' || c.name === 'Task');
if (subagents.length) {
  say('Subagents spawned: ' + subagents.length);
  for (const s of subagents) say('- ' + dur(s.sec || 0) + ' — `' + clip(commandOf(s.input), 160) + '`');
  say();
}
const shellByKind = {};
for (const c of list) {
  if (c.name !== 'Bash' && c.name !== 'PowerShell') continue;
  const k = kindOf(commandOf(c.input));
  (shellByKind[k] = shellByKind[k] || []).push(clip(commandOf(c.input), 120));
}
for (const k of Object.keys(shellByKind)) {
  say('**' + k + '** ×' + shellByKind[k].length);
  for (const cmd of shellByKind[k].slice(0, 6)) say('- `' + cmd + '`');
  if (shellByKind[k].length > 6) say('- … ' + (shellByKind[k].length - 6) + ' more');
  say();
}

process.stdout.write(out.join('\n') + '\n');
