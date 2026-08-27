---
name: build
description: Implement whatever the operator points at from docs/scope/plan.md — one or more steps, substeps, or individual acceptance criteria. Resolves the target, stops if an earlier substep it needs is unbuilt, reads only the plan and the references its target names, reads docs/design-references when the work is visual, writes each criterion's test before the code and proves it red before implementing, runs only the tests its criteria name and never the full suite, confirms the major assumptions with the operator and records every assumption it made, major and minor, stops and re-plans with the operator on a dead end, writes the least code the criteria need and records every edge it leaves uncovered, checks a criterion off only once its test is green, updates the plan, and hands back whatever the operator has to do by hand. Runs as often as the operator aims it. Trigger on "build 1.2", "implement step 3", "build these criteria", "go ahead and code it".
---
# Build

Implement what the operator aims you at. This is step 4 of the dev system, and unlike every phase before it, **it runs many times per scope and the operator chooses the target each time** — one or more steps, substeps, or single acceptance criteria from `docs/scope/plan.md`.

Never pick the target yourself, and never build past it. Something outside the target that needs doing is reported, not built.

> **Read the `conventions` skill before anything below.** It carries the rules every phase follows, and they are not repeated here.

## How it runs

1. **Resolve the target, and check nothing under it is missing.** Turn what the operator said into an explicit list of criterion numbers. **Skip criteria already checked** — never rebuild something marked done; if you believe a check is wrong, say so rather than quietly redoing it. If every criterion in the target is already checked, say so in one line and stop.

   Then look **behind** the target. The plan is sequential, but the operator can aim you anywhere in it, so a targeted build can land on ground that was never laid. Read the substeps before the target: **if the target needs something an earlier substep owns and that substep has unchecked criteria, stop and ask** — build the dependency first, or build against a stub and accept the rework. That is the operator's call, not yours.

   Where the target is a whole step or several substeps, take them in plan order.
2. **Build it.** Read only the references the target names — the scope PRD requirements, the scope TDD decisions, and the design references where the target names one (`conventions` § Design references) — **and the files the substep's *Touches:* line names.** That line is the survey, done once at plan time while the whole scope was in view, so no build rediscovers the same seam. Anything past it is discovery: if the build needed a file the line does not name, **add it to the line** before you check the criterion off.
3. **Confirm the major assumptions, record all of them.** Building makes decisions the plan never made — it is the phase that hits reality. Classify each one by `conventions` § Major assumptions, ask the major ones before you build on them, decide the minor ones yourself — and **record both kinds in the substep's *Assumptions* block in `docs/scope/plan.md`**, marked major or minor, written as settled decisions.

   A major assumption that invalidates the planned approach is not an assumption any more — that is step 4.
4. **Stop on a dead end — as a question, with options.** If the planned approach cannot satisfy the criteria without a change the plan did not anticipate, **stop.** Do not force tests green on a broken approach, and do not pick the way out yourself.

   Put it to the operator with `AskUserQuestion`: **two to four concrete approaches**, each one line on what it changes and what it costs — scope, rework, what it drags in. Name which you would pick and why. Wait for the answer before writing more code.

   > *The in-process queue the plan assumed cannot hold ordering across restarts, which 2.3.2 requires.*
   > — **Durable queue.** Ordering survives anything; new infrastructure, an extra substep, a running cost.
   > — **Drop the restart guarantee from 2.3.2** and re-plan it as its own substep in this step.
   > — **Persist the order in the existing table.** No new infrastructure; slower at scale, and the guarantee becomes an edge case.
   >

   **Then edit `docs/scope/plan.md` to match what they chose** — a criterion reworded, a substep added, an order changed. A plan that no longer describes what is being built has stopped being the record, and nothing else in the system will notice.

   **A divergence from the scope PRD is the same stop.** If the only way to satisfy a criterion is to make the code contradict `docs/scope/prd.md` or the project requirement behind it, take it to the operator per `conventions` § Reconciling — and where they choose the requirement, **edit `docs/scope/prd.md` yourself in the same run**, exactly as you edit the plan.
5. **Reach green** — `conventions` § Reaching green. Every criterion goes **red before green**, and that is three moves in order:

   1. **Write the criterion's test, before any of its code.** Writing it first is what keeps it honest about the behavior rather than about the implementation.
   2. **Run it before the code exists, and confirm it fails.** A test that is already green here is a **false positive** — it asserts nothing, or it asserts something that was true before this criterion existed — and it will go green on the finished code whatever that code does. **The red must also be for the right reason:** the behavior missing, not a typo, a bad import, or a fixture that never loaded. A test that errors before it reaches its assertion has not been proved capable of failing. **A criterion whose test will not go red cannot be built against** — fix the test until it does, and only then write the implementation.
   3. **Write the least code that turns it green**, and run the same test again.

   **Move 2 orders a run whose expected outcome is absence** — the element is not there, the response never comes, the state never arrives. A wait sized for the happy path is then paid in full, every time, for a result that was known in the first second. **Proving the red is not optional; paying minutes for it is.** So before the first red run of anything driven through a browser, a live server or another out-of-process runner, two things:

   - **Size every wait to the absence, not to the arrival.** Give each action and assertion that can time out an explicit short timeout for the red run — seconds, never the runner's thirty-second default, and never a poll window sized for a slow success. A poll or retry also **exits on a terminal signal** — an error rendered on screen, a 4xx or 5xx response, a page error, a process that died — rather than running its clock out; a wait whose only ending is expiry is sized wrong, and doubling it when it fails buys nothing. **The red is the same evidence at two seconds as at three minutes.**
   - **Attach the diagnostics before the first run, not after the third.** A run through a browser or a server discards its own evidence by default: the assertion reports `expected null not to be null` and the reason — a rejected request, a thrown error, a message rendered on screen — is in a console, a network response or a server log the test never captured. Subscribe to them up front and print them on failure: page errors, console output, and every failed response with its status and its body. **A first red that names its cause is one run; one that does not costs a run per guess.**

   **Run the tests the target's criteria name, and nothing else.** The plan names a test on every criterion, and that list is the whole of what this phase runs — a criterion, its test; a substep, its criteria's tests; a step, the same across its substeps. **Never run the full suite.** Not to check a criterion, not to sweep what the change might have touched, not once at the end of a step, not "just to be sure". A named script, project, tag or directory that exists to run everything is not yours to type, and neither is a bare runner invocation that picks it all up by default. **A local run measured in minutes has either reached past the criteria or is waiting something out** — kill it and look at what you invoked and what it is waiting on, rather than waiting it out. A red is the usual culprit: a suite whose green takes seconds does not take minutes because the code is missing, it takes minutes because every missing thing is being waited for at full price.

   **What a change breaks outside its criteria is the pipeline's finding, not this phase's.** The full suite is the pipeline's to run; a build green on its criteria is done, and a regression it could not see is reported there rather than hunted here.

   When a red's output does not name its cause, instrument it rather than guessing a fix and paying a run per guess — and where the test drives a browser, a server or another out-of-process runner, that instrumentation goes in before the first red, per move 2 above. Reaching the third run before anything names the cause means the first two were paid for nothing.

   **Where a run will take more than a moment, start it in the background and write the step's records while it runs** — the *Assumptions*, *Edge cases* and *Manual steps* blocks, and the check-offs. **Wait on it with `Monitor` — never by re-reading its output file, and never by sleeping:** a piped run writes nothing until the process exits, so polling the file reads empty until the moment it does not, and a blocking `sleep` is refused by the harness outright.
6. **Record the edges.** Write every case the code does not handle into the substep's **Edge cases** block in `docs/scope/plan.md` — one line each, naming what is not handled and **what the operator would see if it happened**. This is where the just-in-case code went instead of into the codebase, and it is what makes under-achieving safe rather than sloppy.

   > - Concurrent edits to the same record: last write wins silently — no conflict detection. Two people editing at once will lose one set of changes.
   > - An upload larger than the browser can buffer fails with a generic error, not a size message.
   >

   Write what the operator would **observe**, not the internal reason. An edge that genuinely has to be handled becomes a criterion in a later substep — take it to the operator; the rest stay as known, accepted gaps. **List an edge belonging to a later substep too.** Nothing else in this system sweeps for them, so an unlisted one is simply lost.
7. **Check off what is covered.** Tick `[x]` on every criterion whose test is green, and update the plan's *Status* line. Everything else stays unchecked.
8. **Hand over the manual work — and write it down.** What the operator has to do by hand for the implementation to be complete: env vars to set, migrations to run, accounts or keys to create, third-party configuration, anything to check in a browser.

   **Write each one into the substep's *Manual steps* block in `docs/scope/plan.md`, then say it in the chat.** Name the exact variable, command or setting, and what the operator would see without it — `finalize` sweeps these blocks months later to build the deployment handover, and the chat is gone by then. Something the operator has already done in an earlier run still gets written down; `finalize` de-duplicates.

   If there is none, leave the block empty and say nothing.

## Rules

- **A criterion is met when its test passes**, proved per `conventions` § Reaching green — and only where that same test was **seen to fail first**, for the right reason, before the code existed. A test never observed red is not evidence of anything.
- **Never the full suite.** This phase runs the tests its criteria name and no others. The full suite is the pipeline's, and what a change breaks beyond its criteria is the pipeline's to find — step 5.
- **Under-achieve rather than over-engineer.** Write the least code that satisfies the criteria — they are the ceiling, not the floor. An edge the criteria do not name is not yours to handle: no defensive branch for input that should not occur, no retry or fallback nobody asked for, no configuration knob with one caller, no abstraction placed for a second use case that does not exist. **When you catch yourself adding code just in case, delete it and write one line in the substep's Edge cases instead.** The bar: *would the criteria's tests still pass without this code?* If yes, it does not belong here.

  Two things this does not license: **do not skip a criterion**, and **do not leave the code broken on the path the criteria do cover.** Under-achieving is about the unnamed edges, never the named centre.
- **The scope's `Out of scope` is a ceiling you cannot raise** — `conventions` § The ceiling. Read `docs/scope/prd.md` § 5 before you build; something the criteria cannot be satisfied without goes to the operator as a dead end (step 4).
- **The criteria are the spec.** If one cannot be built as written, that is step 4 — a question with options, never a reinterpretation.
- **Never re-plan silently.** Any answer that changes what gets built is written into `docs/scope/plan.md` in the same run — and into `docs/scope/prd.md` too, where what the operator chose changed a requirement or the ceiling.
- **Once a `Monitor` is on a background run, that is the waiting.** Nothing else counts — not re-reading its output file, not a shell call to see whether it has finished, not a sleep. Step 5.
- **Stay inside the target.** Code the operator did not aim you at is not yours to change. If the target cannot be built without touching it, say so and wait.
- **The plan is the record.** Every check and status update goes into `docs/scope/plan.md`, not into chat.

## What goes in the chat

Per `conventions` § What goes in the chat — the code and the plan are the deliverable. Beyond that:

- what was built, in a line;
- the manual steps from step 8.

If tests are red, **that is what you report** — what fails and what the code would need to do. Not a finished run.
