---
name: step-implementation
description: Implement a single planned step — write the code and tests, abort-and-replan if the approach turns out to be a dead end, record what implementation revealed in the step doc's Implementation notes (confirming major assumptions with the operator, listing minor ones), and produce a complete manual-validation checklist covering the acceptance criteria and the user steps. Use this as the second of three prompts per step in the dev-system iteration cycle. Trigger on "implement this step", "build step N", "go ahead and code it".
---

# Step implementation

Second of the three prompts per step: planning → **implementation** → validation. The step's goal, out-of-scope list, user prerequisites, acceptance criteria, and user steps already exist from planning (`docs/steps/<NN>-<slug>.md`).

The step doc's **user prerequisites are assumed done** — the operator doesn't trigger this prompt until they are. Start building; only stop if one turns out to be missing in practice.

## Output principle (applies to all three step prompts)

Default to **small, high-impact output**. Two exceptions:

- The **manual-validation checklist** (produced here) is **exempt from compression** — always complete and specific.
- A step carrying a **hard-to-reverse decision** gets the space it needs to explain it.

> Part of the **dev system** — see the `dev-system` skill for the full pipeline, the artifact map, and the principles that hold across every phase.

## Working conventions

Artifacts under `docs/`. Per-step doc: `docs/steps/<NN>-<slug>.md`.

**Reference links.** Write every section reference as a markdown link to the file and line it lives at — `[3.2.4](docs/prd.md#L142)`, `[slice-prd.md § In scope → Auth](docs/slice-prd.md#L34)` — with the visible text left as the plain reference. Resolve the line by finding the heading (`grep -n`); never guess it. See the `dev-system` skill for the full rule.

## What to do

1. **Implement.** No need to ask permission or clarifying questions — *unless* the work requires changing a major architectural decision. The acceptance criteria and the out-of-scope list are your brief; build to them and don't reach past them.

2. **Abort and re-plan on a dead end — as a question, with options.** If the planned approach can't satisfy the acceptance criteria without a major architectural change, **stop.** Do not force tests green on a broken approach and do not pick the way out on your own. Surface it as a **question to the operator with two or three concrete approach options**, each one line on what it changes and what it costs (scope, rework, architectural blast radius), and name which you'd pick and why. Wait for the choice before writing more code.

   > The planned in-process queue can't hold ordering across restarts, which criterion 3 requires. **A:** add a durable queue (new infra, ~1 extra step). **B:** drop the restart guarantee from this step and re-plan it into its own step. **C:** persist order in the existing DB table (cheapest, slower at scale). I'd take C. Which?

   (This catch lives here, not in validation, because a dead end only reveals itself when the approach hits reality — validation runs too late to catch it.)

3. **Record every assumption you make while building, in the step doc's Implementation notes.** An assumption here is anything the code needed that the step doc didn't settle — it only showed up because implementation hit reality. Classify each one the same way planning does:

   - **Major** — it could change the target architecture, produce code later steps won't anticipate, is user-facing, or affects what running the application costs.
   - **Minor** — not covered by the step doc, but it doesn't contradict the target architecture, isn't user-facing, and isn't cost-impacting.

   When a call sits on the line, treat it as major.

   **Ask the major ones, the same way planning does — before you build on them.** A short numbered question with a **suggested approach carried on each one**, so the operator can confirm in a word:

   > 1. The step doc doesn't say whether a duplicate upload replaces the existing file or errors. **Suggested:** replace, keeping the newer timestamp. OK?

   Batch them where you can rather than trickling them out, and write the answer into Implementation notes as settled — never leave an open question in the doc. **Minor assumptions are not surfaced to the operator**; just list them. A major assumption that turns out to invalidate the planned approach isn't an assumption any more — that's the dead end in item 2, so handle it there.

   Implementation notes are for what implementation taught you — assumptions, and anything else worth carrying forward (a constraint the code hit, a deviation from the plan, something the next step needs to know). Leave the section as planning wrote it if nothing came up.

4. **Reach "done."** Done means: every acceptance criterion implemented, covered by tests, **the full test suite run and green**, and every manual check done by the operator and approved. **Work is not done until the tests pass** — a failing, skipped, or never-run test means the step is still in progress. Never present the step for validation with red tests, never disable or `.skip` a test to get green, and never report the step complete on the assumption that a test would pass without running it.

5. **Kill false positives.** Once tests pass, check them against the acceptance criteria for false positives — tests that pass without actually proving the criterion — and fix them.

6. **Output the manual-validation checklist** (exempt from compression — make it complete and specific). It covers one check per acceptance criterion with a note on what to look for, plus the step doc's user steps. This checklist **relays what planning already established — it doesn't invent criteria.** Any work required from the operator is written as clear specific steps.

## Implementation notes shape

Written into the step doc `docs/steps/<NN>-<slug>.md`, replacing the empty section planning left there:

```
## Implementation notes

### Assumptions — major (confirmed with the operator)
- <the decision, one line>
...
(or: none)

### Assumptions — minor
- <the decision, one line>
...
(or: none)

### Other notes
- <what implementation revealed that the next step or the docs should know>
...
(or: none)
```

One plain line per entry, same as planning's assumptions — it's a scan, not a design record.

## Manual-validation checklist shape

```
## Manual validation — Step <N>

### Acceptance criteria checks
- <criterion> — what to look for: <note>
...

### User steps (if any)
1. <specific action the operator takes to finalize the work>

Mark the step done only after every check above passes.
```

## Handoff

When every acceptance criterion is implemented, the full test suite is green, false positives are cleared, and the Implementation notes are written into the step doc, present the manual-validation checklist and wait for the operator to run it. If tests are still failing, that is what you report — not a finished step. The step closes only when the manual checks pass — then move to the validation prompt.

**Next step.** End with a single sentence naming what runs next and what gates it — e.g. *"Next: Phase 8, `step-validation` for Step 3, once every check above passes."* If the step aborted into a re-plan instead, point back at `step-planning` for the same step. Suggest it; don't run it.
