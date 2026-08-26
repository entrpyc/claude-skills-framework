---
name: active-scope-implementation
description: Implement whatever the operator points at — one or more groups, tasks, or individual acceptance criteria from the active-scope implementation plan. Reads only the references its target names, writes the least code that satisfies the criteria, logs what it doesn't cover as edge cases, confirms major assumptions with the operator, aborts and re-plans on a dead end, checks its own tests for false positives with a deliberate-break pass, runs the tests covering the work rather than the whole suite until a group's last task lands, writes the result back into the plan, and hands over a manual-validation checklist. Runs as often as the operator aims it. Trigger on "implement 2.3", "build group 1", "implement these criteria", "go ahead and code it".
---

# Active-scope implementation

Build what the operator aims you at. This is Phase 5, and unlike every phase before it, it runs many times per scope and **the operator chooses the target each time.**

The target is one or more of:

- a **group** — `Group 2`, meaning every unchecked criterion in it;
- a **task** — `Task 2.3`, meaning every unchecked criterion in it;
- specific **criteria** — `2.3.1`, `2.3.1 and 2.4.2`.

**The operator picks the target; a run builds one task of it.** Several tasks named at once are built one per run, in plan order, with a checkpoint after each — never sized or split as a question (§ 1).

**The criteria are the brief and the ceiling.** They already exist, they were agreed, and they are not yours to widen, narrow, or reinterpret. Everything below serves that.

> Part of the **dev system** — see the `dev-system` skill for the pipeline, references, question rules, major-assumption rules, and what goes in the chat.

## Working conventions

```
docs/
  active-scope/implementation-plan.md  <- read the target; write status, the
                                          requirement check-off, and Record back
  active-scope/prd.md                  <- read only the sections the target's tasks cite
  project/architecture.md              <- same
  project/prd.md                       <- same
  design-references/                   <- read where a task cites one; never write here
```

**Read narrowly.** The plan gave each task its references precisely so this phase doesn't re-read four documents. Read what the target's tasks name, plus the group's *Delivers* line for the feature the work is part of. Reading more isn't thoroughness — it's how implementation drifts toward scope the criteria don't cover.

## What to do

### 1. Resolve the target, and say what it resolved to

Turn what the operator said into an explicit list of criterion numbers. Skip criteria already checked — **never rebuild something already marked done**; if the operator wants it rebuilt they'll say so, and if you believe it's wrongly checked, say that instead of quietly redoing it.

Then check the ordering, because a targeted build can land out of order in ways the plan's layout hides:

- **Unmet `Depends on`.** A task in the target depends on a task with unchecked criteria. **Stop and ask** — build the dependency first, or build against a stub and accept the rework. Don't decide this yourself.
- **Partial task.** The target is some but not all of a task's criteria. Fine and expected — but the task's *Record* stays open and its checkbox set stays mixed, so say so rather than leaving it looking abandoned.
- **Nothing left.** Every criterion in the target is already checked. Say so in one line and stop.

**One task per run, with a checkpoint after each. Don't ask how to split the target** — this is the operator's standing answer, and a target spanning several tasks is a queue, not a question.

So where the target is a group, or several tasks named at once, take them in plan order and **stop after each task**: steps 2 through 10 for that task, its manual-validation checklist, then hand control back. Say up front which task this run is building and what's queued behind it, so nothing looks dropped. Individual criteria inside one task are a single run.

This is why it's the cheaper split anyway: the diff stays small enough to hold in your head, and step 7's break pass scales with criteria, so a thirty-criterion run in a repo with a slow suite burns an hour before any code is reviewable. The fixed costs get paid once either way.

### 2. Confirm prerequisites, then build

The task lists *Prerequisites* — operator-side things that must exist first. **Assume they're done**; the operator didn't aim you here otherwise. Only stop if one turns out to be genuinely missing in practice.

Then implement. No permission-asking and no clarifying questions, *unless* the work needs a major architectural decision changed — that's step 4 or step 5.

**Write each criterion's test before the code that satisfies it, and watch it go red.** A red observed on the behavior's genuine absence *is* step 7's deliberate break, at zero extra cost — it happens in a run you were making anyway, and every criterion that gets it needs no break later. Writing the code first doesn't save that run, it defers it to step 7 and multiplies it, because breaks then have to be staged, batched and restored one set at a time.

Two conditions on the credit, and they're the same ones step 7 applies: you must have **seen** it red, and red **for the right reason** — the behavior missing, not a typo, an import error, or a fixture that hadn't been written yet. Note which criteria earned it as you go; that list is what step 7 starts from.

### 3. Prefer under-achieving to over-engineering

**Write the least code that satisfies the acceptance criteria.** The criteria are the ceiling, not the floor. An edge the criteria don't name is not yours to handle: no defensive branch for input that shouldn't occur, no retry or fallback nobody asked for, no configuration knob with one caller, no abstraction placed for a second use case that doesn't exist. When you catch yourself adding code "just in case," **delete it and write one line in Edge cases instead.**

The bar: *would the criteria's tests still pass without this code?* If yes, it doesn't belong here. Thin code the operator can hold in their head plus a visible list of what it doesn't cover beats thorough code nobody reviews.

**The pull is strongest toward the rest of the group.** A neighbouring task is *already planned* — building part of it now doesn't save work, it moves an unreviewed diff into this run and checks nothing. Leave it. Where a task's *Out of scope* names it, that's the plan telling you in advance.

Two things this does not license: **don't skip a criterion**, and **don't leave the code broken on the path the criteria do cover.** Under-achieving is about the unnamed edges, never the named centre.

### 4. Record assumptions; ask the major ones

An assumption here is anything the code needed that the plan didn't settle — it only showed up because implementation hit reality. Classify by `dev-system` § *Major assumptions*, and watch the growth test in particular: a data shape, a module boundary, a name other code will bind to. Those are cheap now and expensive three scopes from now.

**Ask the major ones with `AskUserQuestion` before you build on them** — at most 5, options labeled **future-proof** and **cheaper now**, batched rather than trickled. Write the answer into the task's *Record* as settled. **Minor assumptions are not surfaced**; just list them. Never leave an open question in the plan.

A major assumption that invalidates the planned approach isn't an assumption any more — that's step 5.

**Where the target sits changes what you'll be asking about, not how much you ask.** Group 1 is the plan's foundation (`active-scope-plan` Rule 8) — the shapes, boundaries and names every later group binds to — so that is where the major assumptions actually live, and where the operator expects to be close to the work. After it, most decisions are already settled by what Group 1 fixed, and the run should mostly need nothing.

**Which makes a later group needing new shape a signal, not a chore.** A second data shape for something Group 1 already models, a boundary the foundation doesn't have, a name other code will bind to: that is the foundation coming up short, and it doesn't get absorbed quietly because the group is meant to be routine. Ask it here, or — where it changes the planned approach — stop at step 5. Then say it at the checkpoint, because it is the plan being wrong, not the code.

### 5. Abort and re-plan on a dead end — as a question, with options

If the planned approach can't satisfy the criteria without a major architectural change, **stop.** Do not force tests green on a broken approach and do not pick the way out on your own.

Put it to the operator with `AskUserQuestion`: two to four concrete approaches, each one line on what it changes and what it costs (scope, rework, blast radius), with **future-proof** and **cheaper now** labeled. Name which you'd pick and why. Wait for the choice before writing more code.

> *The planned in-process queue can't hold ordering across restarts, which 2.3.2 requires.*
> — **future-proof:** durable queue. Ordering survives anything; new infra, an extra task, a running cost.
> — **cheaper now:** drop the restart guarantee from 2.3.2 and re-plan it as its own task in this group.
> — Persist order in the existing table. No new infra; slower at scale, and the ceiling becomes an edge case.

Whatever they choose that changes the plan — a criterion reworded, a task added, a dependency introduced — **edit `implementation-plan.md` to match.** A plan that no longer describes what's being built stops being the record.

**A divergence from the PRD is the same stop.** If the only way to satisfy a criterion is to make the code contradict `active-scope prd` — or the project requirement it refines — that is not an implementation detail to absorb. Ask it the same way, with the two options `dev-system` § *The source of truth* requires: change the approach so the code matches, or change the requirement. **The second is the operator's alone**, and you never take it by writing the code and letting the doc fall behind.

### 6. Log every uncovered case as an edge case

One line each, in the task's *Record*, naming what isn't handled and **what the operator would see if it happened**. This is where the "just in case" code went instead of into the codebase, and it is what makes under-achieving safe rather than sloppy.

> - Concurrent edits to the same record: last write wins silently — no conflict detection. Two people editing at once will lose one set of changes.
> - Upload larger than the browser can buffer fails with a generic error, not a size message.

Write what the operator would *observe*, not the internal reason — "loses one set of changes silently" is useful where "no optimistic-locking check" is not. An entry that genuinely must be handled becomes a criterion in a later task; the rest stay as known, accepted gaps.

If an edge belongs to a *later* task, still list it. Nothing else in this system sweeps for edges at feature level, so an unlisted one is simply lost.

### 7. Break your own tests on purpose — before the run that closes the task

**Green tests are a claim, not a result.** A test that passes without exercising the behavior it names is worse than no test: it certifies the criterion as met and stops anyone looking again.

Checking your own work is the weakest form of this check — you'd have to find your own reasoning wrong — so don't do it by reasoning. Do it mechanically: **for each targeted criterion, break the behavior in the code, run its test, and confirm it fails. Then put the code back.** A test you cannot make fail proves nothing, and this pass is the only thing standing between a hollow test and a checked box.

**This runs before the run that closes the task, and that ordering is the point.** It is the step most likely to change the code, so putting it first means the run that settles the work happens once instead of once per rewrite.

**Start from what step 2 already earned.** Every criterion whose test you watched fail before writing its code is done — it has been broken, on the strongest break there is. The pass below covers only what's left. In a run that followed step 2 properly, that is a short list and this step is nearly free.

Five things keep the remainder cheap. None of them reduce what gets checked:

- **Know what a run costs before you plan the pass.** Time one narrow run and one full run, once. Where the repo builds the app or boots servers before the first test executes, a single test costs what the whole suite costs — and then narrowing buys nothing while batching buys everything. **Plan the pass around the number of runs, not the number of tests**, and say the per-run cost at the checkpoint if it shaped what you did.
- **Run narrow — where narrow is actually cheaper.** A break check asserts exactly one thing: this criterion's test goes red. Where that test can run alone for less, run it alone. The never-narrow rule belongs to the group's gate (step 10); it does not apply here, and paying a full suite to read one test's colour is waste.
- **Batch the breaks up to the point of conflict.** Break several independent behaviors at once and run their tests in one go: if every corresponding test goes red and no other test's result moves, all of them passed. The floor on runs is how many breaks interfere with each other's tests — never the criterion count. Where the fixed cost dominates, batch to that floor rather than to what's comfortable to read. Bisect only what's ambiguous.
- **An observed red already counts.** See step 2 — this is the default path, not an exception. Credit it only where you actually saw it red for the right reason; having written the test first is not the same as having watched it fail.
- **Restore mechanically, not by hand.** Revert with the VCS — `git stash` or `git checkout -- <file>` — and end the step with the diff back to what it was before the first break. Hand-editing a break back out is how a deliberate break ships.

**Break the behavior, never the build — and read the run before you conclude.** A break run has three outcomes, and only one of them is a pass:

- **The expected tests went red and nothing else moved.** Pass.
- **Nothing ran.** A compile error, a type error, a setup failure — the run produced no test results, or an error where the results should be. **That is void, not green.** A break that stops the code compiling proves nothing about any test, and it costs a full run to learn nothing. Type-check or build first, cheaply, before spending the run.
- **The expected test stayed green.** Ambiguous, never a pass — and never assume it's the hollow test. The break may simply have been absorbed: a `Map` that de-duplicates whatever you let through, a default that fills the value back in, a second code path reaching the same result. **A break needs the same care as the code** — change what the assertion actually reads, and confirm you changed it. Find out which of the two it was before you conclude anything; from outside the run they look identical.

The shapes that survive a reasoning-based check and die to a deliberate break:

- **Asserting the mock** — the test stubs the thing under test, then checks the stub was called.
- **Asserting existence** — a function is defined, a field is present, a component renders. Never that it does the right thing.
- **Tautology** — the expected value comes from the same code path being tested.
- **Happy path only** — the criterion names a failure, empty, or permission case; the test walks only the success path.
- **Assertion-free** — runs code, throws nothing, passes.
- **Passes on the wrong reason** — right outcome, wrong cause; the assertion holds even if the feature is bypassed.

Rewrite what fails this pass, and verify the rewrite by breaking the code again — narrowly, same as above. Count them for the *Record*.

**Never close a finding by weakening a criterion so the existing test passes.** That converts a real gap into a documented one and defeats the point of the pass. If an honest test is now red, the criterion is not met — report it red.

### 8. Reach green — the tests that cover the work

With the code settled by step 7: every targeted criterion implemented and covered by the test named on it. **Run those tests, and what else reaches the code you touched.** **Work is not done until they pass** — a failing, skipped, or never-run test means the run is still in progress.

**Not the full suite. That is the group's gate, not the task's** (step 10). A task run buys the evidence a task needs; the whole suite runs once, when the last task of the group lands, instead of once per task on the way there.

**"What reaches the code you touched" is chosen, not guessed.** Its own test file, the tests over the callers of what you changed, and the tests over anything binding to a name, shape, route or schema you edited. **Go and look** — a narrow run is only worth anything if it was picked deliberately; "I didn't think anything else touched it" is how a break reaches step 10 with three tasks of code on top of it.

**Never narrow to dodge a failure.** A red test outside your criteria is a real result: fix it here, or report it. Never disable or `.skip` a test to get green, and never report a test as passing without running it.

If it comes back red, fix and re-run; where the fix changes a criterion's behavior, redo that one criterion's break check narrowly rather than repeating step 7 wholesale.

**And once, not twice.** Step 7 ends with the tree restored to its final state — the next narrow run *is* this step. Don't spend one run to close step 7 and another to open step 8.

### 9. Write the result back into the plan

`docs/active-scope/implementation-plan.md` is the scope's status, so leaving it stale is leaving the system without a state.

**If this run finishes a group, step 10 happens first.** The last tick is what claims the group, so it goes in after the suite is green and the feature walks — not before.

- **Tick each criterion you actually met** — `- [ ]` → `- [x]`. Only criteria whose test is green and survived step 7.
- **Tick every requirement those criteria complete** — in the task's *Requirements* block and in the *Requirements coverage* table at the top, which have to agree. A requirement is ticked only when **every** criterion listed against it is checked, across every step listed for it, and the tests naming them are green. A requirement whose last criterion isn't yours to build stays unticked, however finished the step looks.
- **Fill the task's Record** in the shape below.
- **Update the Status line** at the top: the new criteria and requirements counts, and any group now complete.
- **Correct the plan where reality diverged** — a criterion reworded after step 5, a dependency discovered, a prerequisite the plan missed. Note the change in *Notes* so the edit isn't silent.

### 10. If your run completes a group: the full suite, then the feature

When the last unchecked criterion in a group gets ticked, two checks happen that happen nowhere else — and **the group isn't complete until both pass.**

**First, the full suite. Not the tests you wrote; all of them.** Every task in the group ran narrowly by design (step 8), so this is the first time their changes are measured together, and the first chance to see one task break another's test — or something outside the group entirely. **This is the gate, so it is the one run that is never narrowed**: never disable or `.skip` a test to close it, never narrow the run to make it pass, never report it without running it. Note anything skipped or excluded by config — **a test that doesn't run is a false positive with extra steps.**

**Red here is expected sometimes, and it is yours to inspect and fix.** Don't report it as someone else's problem and don't tick the last criterion around it. Find the cause, fix it, re-run. Three shapes:

- **One task in the group broke another's test.** The common case, and exactly what this gate exists to catch. Fix the code.
- **Something outside the group broke.** The narrow runs never reached it. Fix it, and say so at the checkpoint — the blast radius was wider than the plan thought.
- **The test encoded an assumption this group deliberately changed.** The one to be careful with: from inside a run, a stale test and a real regression look identical. Establish which it is before you touch the test, and **never weaken, skip, or delete a test to close the gate.** Where a test genuinely no longer describes what the product does, that is a divergence — it goes to the operator as a question (step 5), never into a quiet edit.

**Then walk the feature end to end**, because a green suite says the parts pass, not that the feature works — and **nothing else in this system ever checks that.** Individually-passing tasks that were never wired together is the most common way a scope ends up half-built. Walk the group's *Delivers* line as a user would, using the real application, not the tests. Read the group's edge cases together — an edge that's tolerable per task can be a broken feature in aggregate.

**One walkthrough, on an environment you don't build twice.** This is a fixed tax on any run that closes a group, so pay it once: reuse whatever the suite you just ran stood up — the build, the servers, the seeded database — rather than migrating, seeding and tearing down from scratch, and walk the whole *Delivers* line in a single pass instead of one trip per task. The check is that the feature works end to end; repeating the setup around it doesn't make it more true.

If the feature doesn't work end-to-end, **that is the result.** Say what's missing and which task should own it. Don't tick the last criterion to close the group out.

## Record shape

Replaces the empty *Record* placeholder under the task in the plan:

```
**Record** — _updated <YYYY-MM-DD>_
- **Edge cases:** <what isn't handled> — <what the operator would see> (or: none)
- **Assumptions, major (confirmed):** <the decision, one line> (or: none)
- **Assumptions, minor:** <the decision, one line> (or: none)
- **Reworked:** <criterion numbers that needed a second pass> — <a phrase each> (or: none)
- **False positives fixed:** <n> (or: 0)
- **Operator steps:** <what the operator must do to finalize — a migration to
  run, an env var to set, a flag to flip> (or: none)
- **Notes:** <what the next task or the docs should know; any plan edit made> (or: none)
```

One plain line per entry — a scan, not a design record.

Two entries earn their keep more than they look like they do. **Reworked** measures the plan's quality, not the code's — a task that repeatedly misses on the first pass is a planning signal, so record it honestly; a flattered number teaches nothing. **Operator steps** is the section they act on, so a vague or stale one is a broken deploy, not a documentation nit; write the actual variable name and the actual command.

## Manual-validation checklist

Exempt from the five-line cap, because it's an interaction rather than a record. It **relays what the plan established — it doesn't invent criteria.**

```
## Manual validation — <target>

### Criteria checks
- **2.3.1** <criterion> — what to look for: <note>
- **2.3.2** <criterion> — what to look for: <note>

### Operator steps (if any)
1. <specific action to finalize the work>

### If this completed a group
- <the group's Delivers line, as one end-to-end walkthrough>

Mark the work accepted only after every check above passes.
```

## Checkpoint

Present the checklist and wait. Beyond it, at most a few lines:

- what the code hit that the plan didn't foresee;
- **whether operator steps changed** — if you added or removed one, say which, because that's the part they act on;
- the false-positive count from step 7, if it wasn't zero;
- **what verification cost**, but only where it was the dominant cost of the run — the number of full runs and what one takes. A repo whose fixed setup makes every run expensive is something the operator can fix once and stop paying for; they can't act on it if it stays invisible;
- **if a group completed: that the full suite ran, and what it took to get green** — anything that broke outside this task's own code is the part they can't see from the diff;
- if a group completed, whether it works end-to-end.

Point at the Record without reproducing it. Don't list files touched, don't narrate the build, and don't name what runs next.

**If tests are red, that is what you report** — what fails and what the code would need to do. Not a finished run.
