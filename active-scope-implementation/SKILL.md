---
name: active-scope-implementation
description: Implement whatever the operator points at — one or more groups, tasks, or individual acceptance criteria from the active-scope implementation plan. Reads only the references its target names, writes the least code that satisfies the criteria, logs what it doesn't cover as edge cases, confirms major assumptions with the operator, aborts and re-plans on a dead end, checks its own tests for false positives with a deliberate-break pass, writes the result back into the plan, and hands over a manual-validation checklist. Runs as often as the operator aims it. Trigger on "implement 2.3", "build group 1", "implement these criteria", "go ahead and code it".
---

# Active-scope implementation

Build what the operator aims you at. This is Phase 5, and unlike every phase before it, it runs many times per scope and **the operator chooses the target each time.**

The target is one or more of:

- a **group** — `Group 2`, meaning every unchecked criterion in it;
- a **task** — `Task 2.3`, meaning every unchecked criterion in it;
- specific **criteria** — `2.3.1`, `2.3.1 and 2.4.2`.

**The criteria are the brief and the ceiling.** They already exist, they were agreed, and they are not yours to widen, narrow, or reinterpret. Everything below serves that.

> Part of the **dev system** — see the `dev-system` skill for the pipeline, references, question rules, major-assumption rules, and what goes in the chat.

## Working conventions

```
docs/
  active-scope/implementation-plan.md  <- read the target; write status and Record back
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

If the target list is large enough that its diff won't fit in the operator's head, say so before you start. That's the granularity knob showing up late, and it's cheaper to split the run than to hand over an unreviewable diff.

### 2. Confirm prerequisites, then build

The target's tasks list *Prerequisites* — operator-side things that must exist first. **Assume they're done**; the operator didn't aim you here otherwise. Only stop if one turns out to be genuinely missing in practice.

Then implement. No permission-asking and no clarifying questions, *unless* the work needs a major architectural decision changed — that's step 4 or step 5.

### 3. Prefer under-achieving to over-engineering

**Write the least code that satisfies the acceptance criteria.** The criteria are the ceiling, not the floor. An edge the criteria don't name is not yours to handle: no defensive branch for input that shouldn't occur, no retry or fallback nobody asked for, no configuration knob with one caller, no abstraction placed for a second use case that doesn't exist. When you catch yourself adding code "just in case," **delete it and write one line in Edge cases instead.**

The bar: *would the criteria's tests still pass without this code?* If yes, it doesn't belong here. Thin code the operator can hold in their head plus a visible list of what it doesn't cover beats thorough code nobody reviews.

**The pull is strongest toward the rest of the group.** A neighbouring task is *already planned* — building part of it now doesn't save work, it moves an unreviewed diff into this run and checks nothing. Leave it. Where a task's *Out of scope* names it, that's the plan telling you in advance.

Two things this does not license: **don't skip a criterion**, and **don't leave the code broken on the path the criteria do cover.** Under-achieving is about the unnamed edges, never the named centre.

### 4. Record assumptions; ask the major ones

An assumption here is anything the code needed that the plan didn't settle — it only showed up because implementation hit reality. Classify by `dev-system` § *Major assumptions*, and watch the growth test in particular: a data shape, a module boundary, a name other code will bind to. Those are cheap now and expensive three scopes from now.

**Ask the major ones with `AskUserQuestion` before you build on them** — at most 5, options labeled **future-proof** and **cheaper now**, batched rather than trickled. Write the answer into the task's *Record* as settled. **Minor assumptions are not surfaced**; just list them. Never leave an open question in the plan.

A major assumption that invalidates the planned approach isn't an assumption any more — that's step 5.

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

### 7. Break your own tests on purpose — before the suite

**Green tests are a claim, not a result.** A test that passes without exercising the behavior it names is worse than no test: it certifies the criterion as met and stops anyone looking again.

Checking your own work is the weakest form of this check — you'd have to find your own reasoning wrong — so don't do it by reasoning. Do it mechanically: **for each targeted criterion, break the behavior in the code, run its test, and confirm it fails. Then put the code back.** A test you cannot make fail proves nothing, and this pass is the only thing standing between a hollow test and a checked box.

**This runs before the full-suite gate, and that ordering is the point.** It is the step most likely to change the code, so putting it first means the expensive run happens once instead of once per rewrite.

Four things keep it cheap. None of them reduce what gets checked:

- **Run narrow.** A break check asserts exactly one thing — this criterion's test goes red. Run that test alone. Step 8's never-narrow rule is about the gate; it does not apply here, and paying a full suite to read one test's colour is pure waste.
- **Batch the breaks.** Break several independent behaviors at once and run their tests in one go: if every corresponding test goes red and no other test's result moves, all of them passed. Bisect only what's ambiguous — a test that should have gone red and didn't, or an unrelated one that moved.
- **An observed red already counts.** A test written before its code and watched fail on the behavior's genuine absence **is** the break, and repeating it buys nothing. Credit it only where you actually saw it red for the right reason — having written the test first is not the same as having watched it fail.
- **Restore mechanically, not by hand.** Revert with the VCS — `git stash` or `git checkout -- <file>` — and end the step with the diff back to what it was before the first break. Hand-editing a break back out is how a deliberate break ships.

The shapes that survive a reasoning-based check and die to a deliberate break:

- **Asserting the mock** — the test stubs the thing under test, then checks the stub was called.
- **Asserting existence** — a function is defined, a field is present, a component renders. Never that it does the right thing.
- **Tautology** — the expected value comes from the same code path being tested.
- **Happy path only** — the criterion names a failure, empty, or permission case; the test walks only the success path.
- **Assertion-free** — runs code, throws nothing, passes.
- **Passes on the wrong reason** — right outcome, wrong cause; the assertion holds even if the feature is bypassed.

Rewrite what fails this pass, and verify the rewrite by breaking the code again — narrowly, same as above. Count them for the *Record*.

**Never close a finding by weakening a criterion so the existing test passes.** That converts a real gap into a documented one and defeats the point of the pass. If an honest test is now red, the criterion is not met — report it red.

### 8. Reach green — the whole suite, once

With the code settled by step 7: every targeted criterion implemented, covered by the test named on it, **and the full suite run and green.** Not the tests you wrote; all of them. **Work is not done until the tests pass** — a failing, skipped, or never-run test means the run is still in progress.

**This is the gate, so it is the one run that is never narrowed.** Never disable or `.skip` a test to get green, never narrow the run to make it pass, and never report a test as passing without running it. Note anything skipped or excluded by config — **a test that doesn't run is a false positive with extra steps.**

**Once per target, not once per criterion.** If it comes back red, fix and re-run; where the fix changes a criterion's behavior, redo that one criterion's break check narrowly rather than repeating step 7 wholesale.

### 9. Write the result back into the plan

`docs/active-scope/implementation-plan.md` is the scope's status, so leaving it stale is leaving the system without a state.

- **Tick each criterion you actually met** — `- [ ]` → `- [x]`. Only criteria whose test is green and survived step 7.
- **Fill the task's Record** in the shape below.
- **Update the Status line** at the top: the new `<n>/<total>`, and any group now complete.
- **Correct the plan where reality diverged** — a criterion reworded after step 5, a dependency discovered, a prerequisite the plan missed. Note the change in *Notes* so the edit isn't silent.

### 10. If your run completes a group, check the feature works

When the last unchecked criterion in a group gets ticked, the group is claimed as a working feature — and **nothing else in this system ever checks that.** Individually-passing tasks that were never wired together is the most common way a scope ends up half-built.

Before reporting, do a short end-to-end pass: walk the group's *Delivers* line as a user would, using the real application, not the tests. Read the group's edge cases together — an edge that's tolerable per task can be a broken feature in aggregate.

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
- if a group completed, whether it works end-to-end.

Point at the Record without reproducing it. Don't list files touched, don't narrate the build, and don't name what runs next.

**If tests are red, that is what you report** — what fails and what the code would need to do. Not a finished run.
