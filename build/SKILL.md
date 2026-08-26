---
name: build
description: Implement whatever the operator points at from docs/scope/plan.md — one or more steps, substeps, or individual acceptance criteria. Resolves the target, stops if an earlier substep it needs is unbuilt, reads only the plan and the references its target names, reads docs/design-references when the work is visual, writes each criterion's test before the code, confirms the major assumptions with the operator and records every assumption it made, major and minor, stops and re-plans with the operator on a dead end, writes the least code the criteria need and records every edge it leaves uncovered, checks a criterion off only once its test is green, updates the plan, and hands back whatever the operator has to do by hand. Runs as often as the operator aims it. Trigger on "build 1.2", "implement step 3", "build these criteria", "go ahead and code it".
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
5. **Reach green** — `conventions` § Reaching green. **Every criterion's test is written before its code, and first run once that code is there.** There is no run before it: a red nobody acts on costs a whole run, and on anything needing a server or a browser it costs several.

   A criterion is proved by the **narrowest run that covers it** (`conventions` § Reaching green). The whole suite runs **once**, when the step's **last** substep lands: that is the first time the substeps are measured together, and it is not how an individual criterion is checked. **A target that ends mid-step does not trigger it**, and a red it surfaces in code this target never touched is a pre-existing red — reported in a line, not triaged.

   When a red's output does not name its cause, instrument it rather than guessing a fix and paying a run per guess.

   **Start that run in the background and write the step's records while it runs** — the *Assumptions*, *Edge cases* and *Manual steps* blocks, and the check-offs. **Wait on it with `Monitor` — never by re-reading its output file, and never by sleeping:** a piped run writes nothing until the process exits, so polling the file reads empty until the moment it does not, and a blocking `sleep` is refused by the harness outright.
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

- **A criterion is met when its test passes**, proved per `conventions` § Reaching green.
- **Under-achieve rather than over-engineer.** Write the least code that satisfies the criteria — they are the ceiling, not the floor. An edge the criteria do not name is not yours to handle: no defensive branch for input that should not occur, no retry or fallback nobody asked for, no configuration knob with one caller, no abstraction placed for a second use case that does not exist. **When you catch yourself adding code just in case, delete it and write one line in the substep's Edge cases instead.** The bar: *would the criteria's tests still pass without this code?* If yes, it does not belong here.

  Two things this does not license: **do not skip a criterion**, and **do not leave the code broken on the path the criteria do cover.** Under-achieving is about the unnamed edges, never the named centre.
- **The scope's `Out of scope` is a ceiling you cannot raise** — `conventions` § The ceiling. Read `docs/scope/prd.md` § 5 before you build; something the criteria cannot be satisfied without goes to the operator as a dead end (step 4).
- **The criteria are the spec.** If one cannot be built as written, that is step 4 — a question with options, never a reinterpretation.
- **Never re-plan silently.** Any answer that changes what gets built is written into `docs/scope/plan.md` in the same run — and into `docs/scope/prd.md` too, where what the operator chose changed a requirement or the ceiling.
- **Stay inside the target.** Code the operator did not aim you at is not yours to change. If the target cannot be built without touching it, say so and wait.
- **The plan is the record.** Every check and status update goes into `docs/scope/plan.md`, not into chat.

## What goes in the chat

Per `conventions` § What goes in the chat — the code and the plan are the deliverable. Beyond that:

- what was built, in a line;
- the manual steps from step 8.

If tests are red, **that is what you report** — what fails and what the code would need to do. Not a finished run.
