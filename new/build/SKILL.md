---
name: build
description: Implement whatever the operator points at from docs/scope/plan.md — one or more steps, substeps, or individual acceptance criteria. Reads only the plan and the references its target names, writes the code and the tests that verify each criterion, checks a criterion off only once its test is green, updates the plan's status, and hands back whatever the operator has to do by hand to complete the work. Runs as often as the operator aims it. Trigger on "build 1.2", "implement step 3", "build these criteria", "go ahead and code it".
---

# Build

Implement what the operator aims you at. This is step 4 of the dev system, and unlike every phase before it, **it runs many times per scope and the operator chooses the target each time** — one or more steps, substeps, or single acceptance criteria from `docs/scope/plan.md`.

Never pick the target yourself, and never build past it. Something outside the target that needs doing is reported, not built.

## How it runs

1. **Build it.** Read the target in `docs/scope/plan.md` and only the references it names — the scope PRD requirements, the scope TDD decisions. Write the least code that satisfies the acceptance criteria, and write the test each criterion names as its verification.
2. **Run the tests.** A criterion is met when its test is green. Run the tests covering the target — the whole suite when a step's last substep lands, so nothing built earlier broke.
3. **Check off what is covered.** Tick `[x]` on every criterion whose test is green, and update the plan's *Status* line. **A criterion whose test is red, missing, or does not actually exercise the behavior stays unchecked** — never tick one because the code looks right.
4. **Hand over the manual work.** Say what the operator has to do by hand for the implementation to be complete: env vars to set, migrations to run, accounts or keys to create, third-party configuration, anything to check in a browser. If there is none, say nothing.

## Rules

- **Under-achieve rather than over-engineer.** Write the least code that satisfies the criteria. Anything the code does not cover, say so instead of coding around it.
- **The criteria are the spec.** Not the ticket, not your reading of the feature. If a criterion cannot be built as written, stop and tell the operator — do not reinterpret it.
- **Green means green.** Never check a criterion off on a test you have not seen pass, and never weaken a test to make it pass.
- **Stay inside the target.** Code the operator did not aim you at is not yours to change. If the target cannot be built without touching it, say so and wait.
- **The plan is the record.** Every check and status update goes into `docs/scope/plan.md`, not into chat.

## What goes in the chat

The code and the plan are the deliverable. Keep the report to what the operator could not see for themselves:

- what was built, in a line;
- anything the criteria left uncovered;
- the manual steps from step 4.

No file lists, no recaps of the criteria, no summary of how it went.
