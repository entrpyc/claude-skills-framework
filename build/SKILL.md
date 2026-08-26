---
name: build
description: Implement whatever the operator points at from docs/scope/plan.md — one or more steps, substeps, or individual acceptance criteria. Resolves the target, stops if an earlier substep it needs is unbuilt, reads only the plan and the references its target names, reads docs/design-references when the work is visual, writes each criterion's test before the code and watches it fail, confirms the major assumptions with the operator and records every assumption it made, major and minor, stops and re-plans with the operator on a dead end, writes the least code the criteria need and records every edge it leaves uncovered, checks a criterion off only once its test is green, updates the plan, and hands back whatever the operator has to do by hand. Runs as often as the operator aims it. Trigger on "build 1.2", "implement step 3", "build these criteria", "go ahead and code it".
---
# Build

Implement what the operator aims you at. This is step 4 of the dev system, and unlike every phase before it, **it runs many times per scope and the operator chooses the target each time** — one or more steps, substeps, or single acceptance criteria from `docs/scope/plan.md`.

Never pick the target yourself, and never build past it. Something outside the target that needs doing is reported, not built.

> **Read the `conventions` skill before anything below.** It carries the rules every phase follows — asking the operator, reference numbers and citing, status markers, diagrams, and what goes in the chat.

## How it runs

1. **Resolve the target, and check nothing under it is missing.** Turn what the operator said into an explicit list of criterion numbers. **Skip criteria already checked** — never rebuild something marked done; if you believe a check is wrong, say so rather than quietly redoing it. If every criterion in the target is already checked, say so in one line and stop.

   Then look **behind** the target. The plan is sequential, but the operator can aim you anywhere in it, so a targeted build can land on ground that was never laid. Read the substeps before the target: **if the target needs something an earlier substep owns and that substep has unchecked criteria, stop and ask** — build the dependency first, or build against a stub and accept the rework. That is the operator's call, not yours.

   Where the target is a whole step or several substeps, take them in plan order.
2. **Build it.** Read only the references the target names — the scope PRD requirements, the scope TDD decisions, and the design references where the target names one (`conventions` § Design references).
3. **Confirm the major assumptions, record all of them.** Building makes decisions the plan never made — it is the phase that hits reality. Classify each one by `conventions` § Major assumptions, and **put every major one to the operator with `AskUserQuestion` before you build on it.** Minor ones you decide yourself without asking.

   **Both kinds go into the substep's *Assumptions* block in `docs/scope/plan.md`**, marked major or minor, written as settled decisions. Asking is what the classification decides; recording is not optional either way — an assumption only you know about is one the next substep will contradict without noticing.

   A major assumption that invalidates the planned approach is not an assumption any more — that is step 4.
4. **Stop on a dead end — as a question, with options.** If the planned approach cannot satisfy the criteria without a change the plan did not anticipate, **stop.** Do not force tests green on a broken approach, and do not pick the way out yourself.

   Put it to the operator with `AskUserQuestion`: **two to four concrete approaches**, each one line on what it changes and what it costs — scope, rework, what it drags in. Name which you would pick and why. Wait for the answer before writing more code.

   > *The in-process queue the plan assumed cannot hold ordering across restarts, which 2.3.2 requires.*
   > — **Durable queue.** Ordering survives anything; new infrastructure, an extra substep, a running cost.
   > — **Drop the restart guarantee from 2.3.2** and re-plan it as its own substep in this step.
   > — **Persist the order in the existing table.** No new infrastructure; slower at scale, and the guarantee becomes an edge case.
   >

   **Then edit `docs/scope/plan.md` to match what they chose** — a criterion reworded, a substep added, an order changed. A plan that no longer describes what is being built has stopped being the record, and nothing else in the system will notice.

   **A divergence from the scope PRD is the same stop.** If the only way to satisfy a criterion is to make the code contradict `docs/scope/prd.md` or the project requirement behind it, ask it the same way, with the two options the source-of-truth rule requires: change the approach so the code matches, or change the requirement. **The second is the operator's alone** — never taken by writing the code and letting the document fall behind.
5. **Reach green.** Run the tests covering the target — its own tests, plus the tests over the callers of what you changed and anything binding to a name, shape, route or schema you edited. **Go and look rather than assuming nothing else touches it.** When a step's last substep lands, run the whole suite: that is the first time the substeps are measured together.
6. **Record the edges.** Write every case the code does not handle into the substep's **Edge cases** block in `docs/scope/plan.md` — one line each, naming what is not handled and **what the operator would see if it happened**. This is where the just-in-case code went instead of into the codebase, and it is what makes under-achieving safe rather than sloppy.

   > - Concurrent edits to the same record: last write wins silently — no conflict detection. Two people editing at once will lose one set of changes.
   > - An upload larger than the browser can buffer fails with a generic error, not a size message.

   Write what the operator would **observe**, not the internal reason. An edge that genuinely has to be handled becomes a criterion in a later substep — take it to the operator; the rest stay as known, accepted gaps. **List an edge belonging to a later substep too.** Nothing else in this system sweeps for them, so an unlisted one is simply lost.
7. **Check off what is covered.** Tick `[x]` on every criterion whose test is green, and update the plan's *Status* line. Everything else stays unchecked.
8. **Hand over the manual work.** Say what the operator has to do by hand for the implementation to be complete: env vars to set, migrations to run, accounts or keys to create, third-party configuration, anything to check in a browser. If there is none, say nothing.

## Rules

- **A criterion is met when its test passes.**
- **Never weaken a test, a criterion, or a requirement to reach green.** That turns a real gap into a documented one, which is the opposite of the point. If an honest test is red, the criterion is not met — report it red.
- **Never narrow a run to dodge a failure.** A red test outside your criteria is a real result: fix it, or report it. Never `.skip` a test to get green, and never report a test as passing without running it.
- **Under-achieve rather than over-engineer.** Write the least code that satisfies the criteria — they are the ceiling, not the floor. An edge the criteria do not name is not yours to handle: no defensive branch for input that should not occur, no retry or fallback nobody asked for, no configuration knob with one caller, no abstraction placed for a second use case that does not exist. **When you catch yourself adding code just in case, delete it and write one line in the substep's Edge cases instead.** The bar: *would the criteria's tests still pass without this code?* If yes, it does not belong here.

  Two things this does not license: **do not skip a criterion**, and **do not leave the code broken on the path the criteria do cover.** Under-achieving is about the unnamed edges, never the named centre.
- **The scope's `Out of scope` is a ceiling you cannot raise.** Read `docs/scope/prd.md` § 5 before you build. Nothing in it gets built here, however close the target sits to it and however cheap it looks while you are already in the file. Something the criteria cannot be satisfied without goes to the operator as a dead end (step 4) — the scope PRD is what changes, never the code quietly covering more.
- **The criteria are the spec.** If one cannot be built as written, that is step 4 — a question with options, never a reinterpretation.
- **Never re-plan silently.** Any answer that changes what gets built is written into `docs/scope/plan.md` in the same run.
- **Stay inside the target.** Code the operator did not aim you at is not yours to change. If the target cannot be built without touching it, say so and wait.
- **The plan is the record.** Every check and status update goes into `docs/scope/plan.md`, not into chat.

## What goes in the chat

Per `conventions` § What goes in the chat — the code and the plan are the deliverable. Beyond that:

- what was built, in a line;
- the manual steps from step 8.

If tests are red, **that is what you report** — what fails and what the code would need to do. Not a finished run.
