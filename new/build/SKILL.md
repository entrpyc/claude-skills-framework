---
name: build
description: Implement whatever the operator points at from docs/scope/plan.md — one or more steps, substeps, or individual acceptance criteria. Reads only the plan and the references its target names, writes each criterion's test before the code and watches it fail, breaks the behavior on purpose to prove every test it did not watch fail, checks a criterion off only once its test is green and has been seen red, updates the plan's status, and hands back whatever the operator has to do by hand. Runs as often as the operator aims it. Trigger on "build 1.2", "implement step 3", "build these criteria", "go ahead and code it".
---

# Build

Implement what the operator aims you at. This is step 4 of the dev system, and unlike every phase before it, **it runs many times per scope and the operator chooses the target each time** — one or more steps, substeps, or single acceptance criteria from `docs/scope/plan.md`.

Never pick the target yourself, and never build past it. Something outside the target that needs doing is reported, not built.

## How it runs

1. **Build it.** Read the target in `docs/scope/plan.md` and only the references it names — the scope PRD requirements, the scope TDD decisions. Write the least code that satisfies the acceptance criteria.

2. **Reach green.** Run the tests covering the target — its own tests, plus the tests over the callers of what you changed and anything binding to a name, shape, route or schema you edited. **Go and look rather than assuming nothing else touches it.** When a step's last substep lands, run the whole suite: that is the first time the substeps are measured together.

3. **Check off what is covered.** Tick `[x]` on every criterion whose test is green **and has been seen red**, and update the plan's *Status* line. Everything else stays unchecked.

4. **Hand over the manual work.** Say what the operator has to do by hand for the implementation to be complete: env vars to set, migrations to run, accounts or keys to create, third-party configuration, anything to check in a browser. If there is none, say nothing.

## Rules

- **Never weaken a test, a criterion, or a requirement to reach green.** That turns a real gap into a documented one, which is the opposite of the point. If an honest test is red, the criterion is not met — report it red.
- **Never narrow a run to dodge a failure.** A red test outside your criteria is a real result: fix it, or report it. Never `.skip` a test to get green, and never report a test as passing without running it.
- **Under-achieve rather than over-engineer.** Write the least code that satisfies the criteria. Anything the code does not cover, say so instead of coding around it.
- **The criteria are the spec.** If one cannot be built as written, stop and tell the operator — do not reinterpret it.
- **Stay inside the target.** Code the operator did not aim you at is not yours to change. If the target cannot be built without touching it, say so and wait.
- **The plan is the record.** Every check and status update goes into `docs/scope/plan.md`, not into chat.

## What goes in the chat

The code and the plan are the deliverable. Keep the report to what the operator could not see for themselves:

- what was built, in a line;
- anything the criteria left uncovered;

If tests are red, **that is what you report** — what fails and what the code would need to do. Not a finished run.
