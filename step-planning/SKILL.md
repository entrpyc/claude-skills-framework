---
name: step-planning
description: Plan a single implementation step — pull only the sections that step references, resolve major assumptions with the operator before writing, and produce a step doc with goal, out of scope, user prerequisites, test-covered acceptance criteria, user steps, and the assumptions made. Use this as the first of three prompts per step in the dev-system iteration cycle. Trigger on "plan this step", "requirements for step N", "let's start the next step".
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

Control comes from the operator answering the major-assumption questions and reviewing this plan before implementation starts.

**Reference links.** Write every section reference as a markdown link to the file and line it lives at — `[3.2.4](docs/prd.md#L142)`, `[slice-prd.md § In scope → Auth](docs/slice-prd.md#L34)` — with the visible text left as the plain reference. Resolve the line by finding the heading (`grep -n`); never guess it. See the `dev-system` skill for the full rule.

## What to do

1. **Pull only the referenced sections named by this step** in `docs/implementation-plan.md` — not all the docs. The whole point of per-step references is that you read narrowly here.

2. **Find the assumptions and classify each one.** An assumption is **anything this step needs that the PRD doesn't describe**, and that you would otherwise decide on your own while planning. Sort every one into:

   - **Major** — it could change the target architecture, produce code later steps won't anticipate, is user-facing, or affects what running the application costs.
   - **Minor** — not fully covered by the PRD, but it doesn't contradict the target architecture, isn't user-facing, and isn't cost-impacting.

   When a call sits on the line, treat it as major. The cost of asking is one question; the cost of a wrong silent major is rework in every step after it.

3. **Ask the major ones — before writing the doc.** Put them to the operator as a short numbered set of questions, and **carry a suggested approach with every question** so they can confirm in one word instead of designing from scratch:

   > 1. The PRD doesn't say what happens when the token expires mid-session. **Suggested:** silently refresh once, then bounce to login if that fails. OK?

   Ask everything in one pass rather than trickling questions out. Answers become ordinary content of the doc — acceptance criteria, out-of-scope lines, prerequisites — and the assumption itself is recorded as settled under **Assumptions → Major**. Minor assumptions are **not** brought to the operator; they're just listed. **Never leave an open question inside the doc** — the written step doc records decisions, not things still hanging.

4. **Write the step doc** in the shape below, once the major assumptions are answered.

5. **Every acceptance criterion must be covered by a test.** Name the test on the criterion line — if you can't name one that would fail when the criterion isn't met, the criterion is too vague to implement against; sharpen it or split it until it is testable.

6. **Give every acceptance criterion its sub-bullets for how it's achieved** — one line each, plain language, no code. These exist to keep the operator in the loop on *how* the thing gets built, so they must stay short enough to actually read.

7. **Keep out of scope sharp.** It's the anti-overengineering lever: name the things a reasonable implementer might reach for on this step that are explicitly not wanted.

8. **Separate the two kinds of manual work.** *User prerequisites* block the start of implementation (an account, a key, a service wired up). *User steps* come after the code is done (deploy, flip a flag, publish). Both list only things Claude genuinely can't do itself.

9. **Leave the Implementation notes section empty.** It exists to hold what's learned only once code meets reality, and `step-implementation` is what fills it. Planning writes the heading and nothing under it — anything you already know at planning time belongs in **Assumptions**, not there.

## Output shape

Write to `docs/steps/<NN>-<slug>.md`:

```
# Step <N> — <title>

## Goal
<one or two sentences on what this step delivers>

- As a user I want to be able to <x>
- As a user I want to be able to <y>

## Out of scope
- <thing this step explicitly does not implement>
...

## User prerequisites
- <what the operator must wire, configure, or provide before implementation starts>
(or: none)

## Acceptance criteria
- <criterion the implementation must meet for the goal to be fully met> — verified by <test>
  - <how it's achieved — short>
  - <how it's achieved — short>
...

## User steps
- <what the operator does after implementation to finalize the work>
(or: none)

## Assumptions

### Major (confirmed with the operator)
- <the decision, one line>
...
(or: none)

### Minor
- <the decision, one line>
...
(or: none)

## Implementation notes
_Filled in during implementation — leave empty here._
```

Keep every assumption to one plain line — the section is a scan, not a design record.

## Handoff

Keep the prose tight (output principle). The major-assumption questions come first and gate everything: **work does not start until they're answered and the step doc is approved.**

**Next step.** End with a single sentence naming what runs next and what gates it — e.g. *"Next: Phase 7, `step-implementation` for Step 3, once the step doc above is approved and its user prerequisites are done."* Suggest it; don't run it.
