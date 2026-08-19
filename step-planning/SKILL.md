---
name: step-planning
description: Plan a single implementation step — pull only the sections that step references, write test-covered requirements plus manual-only feel requirements, list assumptions to confirm, and state scope edges. Use this as the first of three prompts per step in the dev-system iteration cycle. Trigger on "plan this step", "requirements for step N", "let's start the next step".
---

# Step planning

First of the three prompts run for each step of the implementation plan: **planning → implementation → validation.** This one establishes what "done" means for the step, before any code is written.

## Output principle (applies to all three step prompts)

Default to **small, high-impact output** so no step gets skimmed and the operator always has a real chance to respond. Two exceptions:

- The **manual-validation checklist** is exempt from compression — always complete and specific (that checklist is produced in the implementation prompt).
- A step carrying a **hard-to-reverse decision** gets the space it needs to explain that decision.

> Part of the **dev system** — see the `dev-system` skill for the full pipeline, the artifact map, and the principles that hold across every phase.

## Working conventions

Artifacts under `docs/` by default. Per-step work goes in `docs/steps/<NN>-<slug>.md`.

Control comes from the operator reviewing this plan and pushing back before implementation starts.

**Reference links.** Write every section reference as a markdown link to the file and line it lives at — `[3.2.4](docs/prd.md#L142)`, `[slice-prd.md § In scope → Auth](docs/slice-prd.md#L34)` — with the visible text left as the plain reference. Resolve the line by finding the heading (`grep -n`); never guess it. See the `dev-system` skill for the full rule.

## What to do

1. **Pull only the referenced sections named by this step** in `docs/implementation-plan.md` — not all the docs. The whole point of per-step references is that you read narrowly here.

2. **Create requirements** — the acceptance criteria for marking the step done. Each requirement must be **covered by a test**, with one exception (feel requirements, below). If a requirement rests on an assumption, **list the assumptions to the operator for confirmation** rather than silently baking them in.

3. **Propose feel requirements when the step involves application feel** — e.g. "input response feels tight to the beat", "hit feedback feels punchy". These carry a **manual-only carve-out**: no automated test, the manual check *is* the acceptance criterion. This is the one explicit exception to "every requirement is test-covered." The operator owns what the app should feel like, so **feel requirements are approved before any work starts.**

4. **State the scope edges** — what is in scope for this step and what is not — so implementation doesn't bloat or overengineer.

## Output shape

Write to `docs/steps/<NN>-<slug>.md`:

```
# Step <N> — <title>

## Requirements (test-covered)
- <criterion> — verified by <test idea>
...

## Feel requirements (manual-only) — approved before work starts
- <criterion> — what to feel for: <note>
...

## Assumptions to confirm
- <assumption the operator needs to sign off before implementation>
...

## Scope
In:  <what this step covers>
Out: <what it explicitly doesn't>
```

## Handoff

Keep the prose tight (output principle). Surface the assumptions and feel requirements clearly and get them approved before moving to the implementation prompt — work does not start until the assumptions are confirmed and the feel requirements are agreed.

**Next step.** End with a single sentence naming what runs next and what gates it — e.g. *"Next: Phase 7, `step-implementation` for Step 3, once the assumptions and feel requirements above are approved."* Suggest it; don't run it.
