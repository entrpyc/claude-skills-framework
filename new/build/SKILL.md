---
name: build
description: Implement whatever the operator points at from docs/scope/plan.md — one or more steps, substeps, or individual acceptance criteria. Resolves the target, stops if an earlier substep it needs is unbuilt, reads only the plan and the references its target names, writes each criterion's test before the code and watches it fail, stops and re-plans with the operator on a dead end, breaks the behavior on purpose to prove every test it did not watch fail, checks a criterion off only once its test is green and has been seen red, updates the plan, and hands back whatever the operator has to do by hand. Runs as often as the operator aims it. Trigger on "build 1.2", "implement step 3", "build these criteria", "go ahead and code it".
---
# Build

Implement what the operator aims you at. This is step 4 of the dev system, and unlike every phase before it, **it runs many times per scope and the operator chooses the target each time** — one or more steps, substeps, or single acceptance criteria from `docs/scope/plan.md`.

Never pick the target yourself, and never build past it. Something outside the target that needs doing is reported, not built.

> **Read the `conventions` skill before anything below.** It carries the rules every phase follows — asking the operator, reference numbers and citing, status markers, diagrams, and what goes in the chat.

## How it runs

1. **Resolve the target, and check nothing under it is missing.** Turn what the operator said into an explicit list of criterion numbers. **Skip criteria already checked** — never rebuild something marked done; if you believe a check is wrong, say so rather than quietly redoing it. If every criterion in the target is already checked, say so in one line and stop.

   Then look **behind** the target. The plan is sequential, but the operator can aim you anywhere in it, so a targeted build can land on ground that was never laid. Read the substeps before the target: **if the target needs something an earlier substep owns and that substep has unchecked criteria, stop and ask** — build the dependency first, or build against a stub and accept the rework. That is the operator's call, not yours.

   Where the target is a whole step or several substeps, take them in plan order.
2. **Build it.** Read only the references the target names — the scope PRD requirements, the scope TDD decisions. Write the least code that satisfies the acceptance criteria.
3. **Stop on a dead end — as a question, with options.** If the planned approach cannot satisfy the criteria without a change the plan did not anticipate, **stop.** Do not force tests green on a broken approach, and do not pick the way out yourself.

   Put it to the operator with `AskUserQuestion`: **two to four concrete approaches**, each one line on what it changes and what it costs — scope, rework, what it drags in. Name which you would pick and why. Wait for the answer before writing more code.

   > *The in-process queue the plan assumed cannot hold ordering across restarts, which 2.3.2 requires.*
   > — **Durable queue.** Ordering survives anything; new infrastructure, an extra substep, a running cost.
   > — **Drop the restart guarantee from 2.3.2** and re-plan it as its own substep in this step.
   > — **Persist the order in the existing table.** No new infrastructure; slower at scale, and the guarantee becomes an edge case.
   >

   **Then edit `docs/scope/plan.md` to match what they chose** — a criterion reworded, a substep added, an order changed. A plan that no longer describes what is being built has stopped being the record, and nothing else in the system will notice.

   **A divergence from the scope PRD is the same stop.** If the only way to satisfy a criterion is to make the code contradict `docs/scope/prd.md` or the project requirement behind it, ask it the same way, with the two options the source-of-truth rule requires: change the approach so the code matches, or change the requirement. **The second is the operator's alone** — never taken by writing the code and letting the document fall behind.
4. **Reach green.** Run the tests covering the target — its own tests, plus the tests over the callers of what you changed and anything binding to a name, shape, route or schema you edited. **Go and look rather than assuming nothing else touches it.** When a step's last substep lands, run the whole suite: that is the first time the substeps are measured together.
5. **Check off what is covered.** Tick `[x]` on every criterion whose test is green **and has been seen red**, and update the plan's *Status* line. Everything else stays unchecked.
6. **Hand over the manual work.** Say what the operator has to do by hand for the implementation to be complete: env vars to set, migrations to run, accounts or keys to create, third-party configuration, anything to check in a browser. If there is none, say nothing.

## Rules

- **A criterion is met when its test passes.**
- **Never weaken a test, a criterion, or a requirement to reach green.** That turns a real gap into a documented one, which is the opposite of the point. If an honest test is red, the criterion is not met — report it red.
- **Never narrow a run to dodge a failure.** A red test outside your criteria is a real result: fix it, or report it. Never `.skip` a test to get green, and never report a test as passing without running it.
- **Under-achieve rather than over-engineer.** Write the least code that satisfies the criteria. Anything the code does not cover, say so instead of coding around it.
- **The criteria are the spec.** If one cannot be built as written, that is step 3 — a question with options, never a reinterpretation.
- **Never re-plan silently.** Any answer that changes what gets built is written into `docs/scope/plan.md` in the same run.
- **Stay inside the target.** Code the operator did not aim you at is not yours to change. If the target cannot be built without touching it, say so and wait.
- **The plan is the record.** Every check and status update goes into `docs/scope/plan.md`, not into chat.

## What goes in the chat

Per `conventions` § What goes in the chat — the code and the plan are the deliverable. Beyond that:

- what was built, in a line;
- **any plan edit made in step 3**, and what it changed;
- anything the criteria left uncovered;
- the manual steps from step 6.

If tests are red, **that is what you report** — what fails and what the code would need to do. Not a finished run.
