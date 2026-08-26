---
name: refine-dev-system
description: Refine the dev-system skills against how they actually ran. Scans past Claude Code sessions that invoked plan, build or finalize, lists verbatim every operator prompt in them that invoked no skill, decomposes the wall clock of the slowest sessions and names the instruction that ordered each cost, then puts the resulting edits to the skill files to the operator. Reads transcripts and skills; writes findings and only the edits the operator chooses. Trigger on "refine the dev system", "improve the skills", "why was that session so slow", "which prompts didn't invoke a skill", "what in the skill made that take so long".
---

# Refine the dev system

Refine the dev-system skills against the evidence of how they actually ran. The transcripts under `~/.claude/projects/` are that evidence: every prompt the operator typed, every skill that fired, every command and how long it took.

Two lists come out of every run, and both are mandatory:

1. **Every operator prompt that invoked no skill**, listed verbatim, in the sessions where `plan`, `build` or `finalize` ran. Each one is the operator doing by hand what a skill was supposed to do — a trigger that did not fire, a gap the skill left, a correction it made necessary.
2. **The slowest sessions by wall clock**, decomposed, with the **instruction that ordered each cost** named and quoted.

This phase is not part of the delivery flow. It is pulled at any time, it touches no product document and no product code, and the only thing it may change is the skill files themselves.

> **Read the `conventions` skill first.** Four of its sections bind here — *Asking the operator*, *What goes in the chat*, *Never invent* and *Checkpoints*. The document conventions — reference numbers, status markers, the ceiling, reconciling — do not: this phase writes no product document.

## How it runs

1. **Scan the sessions.** Run the scanner that ships with this skill:

   ```
   node <this skill's directory>/scan.js --project <substring> --since <YYYY-MM-DD> --slowest 5
   ```

   It reads `~/.claude/projects/<project>/<session>.jsonl`, keeps the sessions where a phase skill fired, and prints markdown: a session table, a wall-clock decomposition of the slowest ones, and every prompt that invoked no skill. It only reads.

   - `--project` matches the transcript folder name or the session's `cwd`; omit it to take every project on this machine.
   - `--since` cuts off old runs. Default to the last two or three weeks — a skill that has been edited since is a different skill, and findings against the old text are noise.
   - `--all-skills` widens past `plan`, `build` and `finalize`; `--skills a,b` replaces the list.

   If the scan comes back empty, say what it looked at and stop. Never analyse from memory of a session — if the transcript is not there, the finding is not there.
2. **Read the skills that ran.** Every skill named in the scan's *Skills* column, in full, plus `conventions`. Read the sources you are going to edit, and read them now: **every finding quotes an instruction, and a paraphrase from memory is a fabricated finding.**

   The installed copies under `~/.claude/skills/` are what actually ran. If they differ from the sources in this repo, say so before going further — a finding against text that was not in the room is worthless.
3. **Classify every prompt that invoked no skill.** One bucket each, and **every prompt in the scan's list is carried into the report, including the ones that turn out to be nothing:**

   | Bucket                     | What it looks like                                                                     | What it points at                                 |
   | -------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------- |
   | **missed trigger**   | The prompt asked for a phase's work and no skill ran —*"build 5.2"*, *"fix failing tests"* | the skill's`description` — its trigger phrases  |
   | **gap**              | The operator asked for something the skill was supposed to have done —*"why didn't you build group 4?"* | the instruction that should have covered it       |
   | **correction**       | The operator correcting a result the skill accepted as finished                        | whatever the phase used as its check              |
   | **handover shortfall** | The operator asking for something the phase should have handed over —*"where do I add the key?"* | the phase's handover section                      |
   | **approval friction** | *"continue"*, *"accept"*, an answer to a question that could have been batched          | the asking or checkpoint instructions             |
   | **out of band**      | Genuinely outside the dev system                                                        | nothing — counted, listed, and not a finding     |

   For every prompt in the first five buckets, name the instruction: **quote the sentence that should have prevented it**, or write *"no instruction covers this"* — which is the more useful finding of the two, because it is a hole rather than a wording problem.

   Where the prompt alone does not settle the bucket, read the transcript around it — the scan prints each session's file path, and the timestamp locates the turn.
4. **Attribute the wall clock.** For each of the slowest sessions, in this order:

   1. **Take the decomposition first.** *Model*, *tool*, *operator wait* and *idle* add up to the wall clock. Say which one dominates **before** looking at any single call — a session that is 80% operator wait and one that is 80% test runs have nothing in common, and the loudest single call is usually in neither.
   2. **For every cost worth more than a tenth of the session, name what ordered it.** Quote the instruction. A cost gets one of three verdicts:

      - **earned** — the instruction ordered it and it bought something the phase needs.
      - **instruction-caused** — the instruction ordered more than the result was worth: a full suite where the changed tests would do, a re-read of a document already in context, a verification pass repeated per substep instead of once.
      - **unordered** — nothing in the skill asked for it. That is a hole in the skill, not a slow instruction, and it is the finding.
   3. **Read operator wait carefully.** It is not Claude's time — but a question left open for four hours is still the skill's doing when the skill asked five questions it could have asked as one, or asked mid-run what it could have asked at the start. Attribute the *asking*, never the *waiting*. **Idle is nobody's** — report it and move on.
   4. **Cite the evidence** on every cost: session id, minutes, and the command or call verbatim.
5. **Check the pattern, not the session.** A finding worth an edit shows up in **two sessions, or once at real cost**. One occurrence at trivial cost goes on the list marked *once* and proposes nothing — a skill that grows an instruction per incident becomes unreadable, and an unreadable skill is ignored wholesale.
6. **Write the findings file** to `<this skill's directory>/findings/<YYYY-MM-DD>-<project>.md`, in the format below. Read the previous findings files in that folder first: something that appears in two of them is a refinement that did not take, and that is worth saying.
7. **Put the edits to the operator.** `AskUserQuestion`, at most 5 per set, per `conventions` § *Asking the operator*. Every proposed edit carries **which skill and which section, the line as it reads now, the line as it would read, and what the change costs** — an instruction that saves ten minutes a run but adds a question the operator has to answer is a trade, not an improvement. **Leaving it as it is** is always one of the options.

   Apply what they choose, in the same run, to the skill sources. Nothing is edited that the operator did not choose — including obvious-looking fixes found along the way.
8. **Check the description separately.** Every *missed trigger* is a `description` failure, not a body failure. The fix is a trigger phrase in the frontmatter matching what the operator actually typed — quote their words, do not invent a tidier phrasing of them.
9. **Checkpoint.** One line saying where the findings file is and which skills were edited. Then stop.

## Format

```markdown
# Dev-system refinement — <YYYY-MM-DD>

**Scanned:** <n> sessions · <project> · <date range> · skills <names>
**Repeat findings:** what also appears in <earlier findings file>, or "none".

---

## 1. Prompts that invoked no skill

<n> of <total> operator prompts. Every one is listed.

### 1.1 <bucket>

- **<session> · <timestamp>** — "<the prompt, verbatim>"
  **Points at:** `<skill>` § <section> — "<the instruction, quoted>"
  _or_ **No instruction covers this.**
  **Seen:** <n> times across <n> sessions.

### 1.2 Out of band

- **<session> · <timestamp>** — "<the prompt, verbatim>" — outside the dev system.

## 2. Where the wall clock went

| Session | Skill | Wall | Model | Tool | Operator wait | Idle |
| ------- | ----- | ---- | ----- | ---- | ------------- | ---- |

### 2.1 <session> — <n>m

**Dominated by:** <bucket>, <n>m of <n>m.

- **<n>m — <what happened>** — `<command or call>`
  **Ordered by:** `<skill>` § <section> — "<the instruction, quoted>"
  **Verdict:** earned / instruction-caused / unordered
  **Why:** one line.

## 3. Proposed edits

| # | Skill | Section | Evidence | Change | Costs |
| - | ----- | ------- | -------- | ------ | ----- |

_Chosen by the operator: <what they picked>. Applied: <what was edited>._
```

## Rules

- **Every finding cites its evidence** — session id, timestamp, and the prompt or command verbatim. A finding with nothing under it is an opinion about the skill, and this phase has no use for those.
- **Quote the instruction; never paraphrase it.** If you cannot find the sentence, the finding is *"no instruction covers this"* — which is a stronger result, not a weaker one.
- **List every unskilled prompt**, including the ones that turn out to be out of band. The count is part of the finding: what share of the operator's typing the system did not catch.
- **Never conclude from wall clock alone.** The longest session in the table is routinely the one the operator walked away from. Decompose first, and say which bucket the time was in before naming a cause.
- **Prompt text is evidence.** Quote it as typed — the typos, the terseness and the frustration are the data. Never tidy it.
- **Read only, over there.** The transcripts, the analysed project's code and its documents are never edited by this phase. The only writable things are the findings file and the skill sources.
- **Nothing is edited that the operator did not choose** — `conventions` § *Asking the operator*. Every edit lands in the same run it was chosen in.
- **Don't grow a skill for a one-off.** An instruction added per incident is how a skill becomes long enough to be skipped. Two sessions, or one real cost.
- **This machine only.** The scan sees the transcripts on this machine, under `~/.claude/projects/`. Say so when reporting a count, so a thin result is not read as a clean bill.
