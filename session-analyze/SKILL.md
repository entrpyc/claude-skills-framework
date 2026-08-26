---
name: session-analyze
description: Analyse the session that is running right now. Locates this session's own transcript, cuts it into the steps it actually took, puts a wall clock on each one, names and quotes the rule of the skills invoked this session that ordered it, and lists separately every step no rule ordered. Reports in the chat and changes nothing — it ends in a paste-ready prompt that asks a fresh session to make the edits, and the edits themselves are that session's or refine-dev-system's job. Trigger on "analyse session", "session analyze", "what took so long", "how long did each step take", "what parts of the skill caused this", "what steps did you take that the skill didn't ask for", "give me a prompt to fix it".
---
# Analyse this session

Answer three questions about **the session running right now**, from its own transcript:

1. **Where did the wall clock go**, step by step — every step with a duration on it.
2. **Which rule caused each step** — quoted from the skills this session invoked.
3. **Which steps no rule ordered** — the work that happened anyway.

This is a diagnostic, pulled mid-run or at the end of one. It reads the transcript, the skills and nothing else; it writes nothing and applies no edits. The one thing it hands over is **the prompt that asks for them** — step 8. Edits to the skills go through `refine-dev-system`, which works across many sessions and can tell a pattern from an incident. This skill sees exactly one session, and one session is not enough evidence to change a skill on.

> **Read the `conventions` skill first.** *Never invent* and *Checkpoints* bind. § *What goes in the chat* does **not**: this phase produces no artifact, so the report **is** the deliverable and it goes in the chat — the same exemption the manual steps and the deployment handover have.

## How it runs

1. **Locate and decompose this session.** Invent a token nothing else would contain, and pass it as the marker:

   ```
   node <this skill's directory>/analyze.js --marker <TOKEN-YOU-JUST-INVENTED>
   ```

   The command line you type is written to the transcript before it runs, so the file containing the token is this session — that is the whole trick. The script prints the wall clock split four ways, the skills invoked, every operator prompt, a timeline with an offset and a duration on every call, the rollups, and an inventory of what the session touched.

   - If the marker matches nothing, the script falls back to the newest transcript for this working directory and **says so** — check the first operator prompt it prints is the one you remember before trusting a word of it.
   - `--session <id or path>` analyses a named transcript instead. Use it only when the operator points at one.
   - `--collapse <sec>` and `--max-timeline <n>` control how much detail survives; raise them when a stretch of the run looks compressed.

   **The turn running this analysis is not in the transcript yet.** Say so in the report rather than presenting a partial tail as the whole session.
2. **Read the skills this session invoked** — every one in the scan's *Skills invoked* list, in full, plus `conventions`. The attribution in step 4 quotes them, and a quote from memory is a fabrication. Read the installed copy that actually ran, under `~/.claude/skills/`.

   **If no skill ran**, say so first: there is no rule to attribute anything to, the whole session is unordered work by definition, and the finding is which phase should have been pulled and was not. Report the steps and their durations, and stop there.
3. **Cut the timeline into steps.** A step is **one piece of work with one purpose** — not one tool call, and not one skill instruction. Cut at:

   - an operator prompt, or a Skill call;
   - a narration line announcing a new purpose;
   - a change in what is being worked on — a different file, a different criterion, a different kind of command.

   Two constraints make the cut honest:

   - **Every second belongs to exactly one step**, waiting and idle included. The steps sum to the session's wall clock. If they do not, the cut is wrong — usually a gap nobody claimed, which is where the time went.
   - **Name each step by what it was for**, not by what tool it used. *"Re-ran the full suite after every edit"* is a step; *"Bash ×14"* is a row in a table.
4. **Attribute each step to a rule.** Quote it — `<skill> § <section> — "<the sentence>"`. Every step gets one of three verdicts:

   - **ordered** — a rule asked for it and it did what the rule asked.
   - **over-served** — a rule asked for it and the step did more than the rule needs: the whole suite where the tests over the change would do, a re-read of something already in context, a check repeated per substep that the rule wanted once.
   - **unordered** — no rule asked for it.

   Where the cost is in *operator wait*, attribute the **asking**, never the waiting: the rule that produced a question mid-run instead of at the start, or five questions that could have been one set. **Idle is nobody's** — report it and move on.
5. **List the unordered steps on their own.** This is the second deliverable and it does not get folded into the table. For each: what it did, what it cost, why it happened — a habit, a dead end, an operator prompt mid-run, a check you set yourself — and which it is:

   - a **hole** — the step was necessary and no rule covers it;
   - a **drift** — the step was not necessary and the skill neither asked for it nor forbade it.

   Both are findings for `refine-dev-system`. Say which, and stop there: no proposed wording, no edit. They come back in step 8 as something to fix, still without a sentence written for them.
6. **Name the three biggest costs**, in minutes, and say for each what would have removed it. A cost with no remedy is still worth naming — some sessions are slow because the work was large, and saying so plainly is the honest result.
7. **Report in the chat**, in the format below. Save it to a file only if the operator asks.
8. **Draft the prompt that fixes it.** The report ends in a **paste-ready prompt** for a fresh session pointed at the skills, written so it works with **no editing and no memory of this run** — every fact it needs is in it. It is a handover, not an edit: it says what happened, what it cost and what the fix has to achieve, and leaves the wording to the session that writes it.

   It carries these and nothing else:

   - **One block per finding, biggest cost first** — the minutes, what actually ran, and **who owns it**: the skill and section quoted where a rule ordered it, or *no rule ordered this* where it is a hole or a drift.
   - **What the fix has to achieve**, one sentence each — a rule that does not exist, a rule that over-serves, two instructions pulling different ways. Never the replacement sentence itself.
   - **What must not change.** Where a finding sits against a rule that exists for a reason, name the rule and say it stands — otherwise the next session buys the minutes back by deleting the guarantee that cost them.
   - **What not to fix** — the costs step 6 found no remedy for. Left out, they read as work, and a rule gets invented for a session that was simply large.
   - **The constraint**: the fixing session decides the wording, puts each edit to the operator before applying it, and touches the skill files only.

   **One prompt per analysis, covering every finding, in one fenced block** so it can be copied whole. Never split it per skill, and never fold the findings table into it — the report is for the operator, the prompt is for the next session.
9. **Checkpoint.** Stop. Do not edit a skill, do not edit the project, and do not roll into `refine-dev-system` — say what the findings are and let the operator pull it.

## Format

````markdown
# Session analysis — <session id, short>

**Wall clock <n>m** — model <n>m · tool <n>m · operator wait <n>m · idle <n>m
**Skills invoked:** `<skill>` at +<offset>, …
**Not in the data:** the turn running this analysis.

## Steps

| # | Step | Span | Wall | Ordered by | Verdict |
| - | ---- | ---- | ---- | ---------- | ------- |
| 1 | <what it was for> | +0:00→+4:12 | 4m | `<skill>` § <section> | ordered |

_Steps sum to <n>m of <n>m wall clock._

### <n>. <step name> — <n>m

**What ran:** the calls, in one or two lines, with the ones that cost minutes named.
**Ordered by:** `<skill>` § <section> — "<the rule, quoted>"
**Verdict:** ordered / over-served / unordered
**Where the minutes went:** one line.

## Steps no rule ordered

- **<step> — <n>m** — <what it did>. <Why it happened.> **Hole** / **drift**.

## The three biggest costs

1. **<n>m — <what>** — ordered by "<rule>" / ordered by nothing. <What would have removed it.>

## The prompt that fixes it

<one line: paste this into a fresh session in the skills directory>

```
The dev-system skills cost <n>m of avoidable wall clock in one session. Fix the skills, not the project. The skills are in <path>.

1. <n>m — <what ran>. Ordered by `<skill>` § <section> — "<the rule, quoted>". <What the fix has to achieve, one sentence.>
2. <n>m — <what ran>. No rule ordered it — <hole or drift>. <What the fix has to achieve, one sentence.>
3. …

Do not change: <the rule that stands, and why>.
Do not fix: <the cost with no remedy, and why it is not one>.

Decide the wording yourself, put each edit to me before you apply it, and change nothing outside the skill files.
```
````

## Rules

- **Read the transcript, not your memory of the session.** You were in the room, which is exactly the problem: memory compresses the parts that felt routine, and the routine parts are where the wall clock goes.
- **Every step carries a wall clock, and the steps sum to the session's.** A step with no number on it is a description, not an analysis.
- **Quote the rule; never paraphrase it.** If no sentence in the skill covers the step, the answer is *"no rule ordered this"* — which is the finding this skill exists to produce.
- **Never bill the operator's waiting to the skill** — but do bill the asking that caused it. `AskUserQuestion` time is the operator's, and it is reported separately for that reason.
- **This session only.** Another session, another day, or a pattern across runs is `refine-dev-system`'s job.
- **Findings only, no edits.** Nothing is changed here — not the skills, not the project, not the transcript. The fix prompt is the exception that proves it: it **asks** for the edits and never writes one.
- **The fix prompt stands alone.** Whoever pastes it has not read the report and was not in this session. A reference to "the step above", a number with no unit, or a skill named without its section makes it unusable exactly where it is meant to be used.
- **Say what is missing.** The current turn is absent from the data, a marker fallback is uncertain, a collapsed run hides detail — each one is a line in the report, not something the reader has to work out.
