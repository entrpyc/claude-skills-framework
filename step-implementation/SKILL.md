---
name: step-implementation
description: Implement a single planned step — do any manual pre-work handoff, write the code and tests, abort-and-replan if the approach turns out to be a dead end, and produce a complete manual-validation checklist including feel checks. Use this as the second of three prompts per step in the dev-system iteration cycle. Trigger on "implement this step", "build step N", "go ahead and code it".
---

# Step implementation

Second of the three prompts per step: planning → **implementation** → validation. The step's requirements, feel requirements, assumptions, and scope edges already exist from planning (`docs/steps/<NN>-<slug>.md`).

## Output principle (applies to all three step prompts)

Default to **small, high-impact output**. Two exceptions:

- The **manual-validation checklist** (produced here) is **exempt from compression** — always complete and specific.
- A step carrying a **hard-to-reverse decision** gets the space it needs to explain it.

> Part of the **dev system** — see the `dev-system` skill for the full pipeline, the artifact map, and the principles that hold across every phase.

## Working conventions

Artifacts under `docs/`. Per-step doc: `docs/steps/<NN>-<slug>.md`.

**Reference links.** Write every section reference as a markdown link to the file and line it lives at — `[3.2.4](docs/prd.md#L142)`, `[slice-prd.md § In scope → Auth](docs/slice-prd.md#L34)` — with the visible text left as the plain reference. Resolve the line by finding the heading (`grep -n`); never guess it. See the `dev-system` skill for the full rule.

## What to do

1. **Manual pre-work first, if any.** If the step needs the operator to do something manually before you can proceed (set up an account, provide a key, make an asset), **list clear specific steps** and proceed only once they're done.

2. **Implement.** No need to ask permission or clarifying questions — *unless* the work requires changing a major architectural decision. The requirements and scope edges are your brief; build to them.

3. **Abort and re-plan on a dead end.** If the planned approach can't satisfy the requirements without a major architectural change, **stop.** Do not force tests green on a broken approach. Surface the problem and re-plan. (This catch lives here, not in validation, because a dead end only reveals itself when the approach hits reality — validation runs too late to catch it.)

4. **Reach "done."** Done means: every requirement implemented, covered by tests, all tests passing — **and** every manual check (including feel checks) done by the operator and approved. The step is not done until the manual checks pass.

5. **Kill false positives.** Once tests pass, check them against the requirements for false positives — tests that pass without actually proving the requirement — and fix them.

6. **Output the manual-validation checklist** (exempt from compression — make it complete and specific). It includes any manual pre-work still needed and the feel checks, each with a note on what to feel for. This checklist **relays the feel requirements planning already established — it doesn't invent them.** Any work required from the operator is written as clear specific steps.

## Manual-validation checklist shape

```
## Manual validation — Step <N>

### Pre-work (if any)
1. <specific action the operator must take>

### Feel checks
- <feel requirement> — what to feel for: <note>
...

Mark the step done only after every check above passes.
```

## Handoff

When code is done, tests pass, and false positives are cleared, present the manual-validation checklist and wait for the operator to run it. The step closes only when those checks pass — then move to the validation prompt.

**Next step.** End with a single sentence naming what runs next and what gates it — e.g. *"Next: Phase 8, `step-validation` for Step 3, once every check above passes."* If the step aborted into a re-plan instead, point back at `step-planning` for the same step. Suggest it; don't run it.
