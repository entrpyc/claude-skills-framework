---
name: active-scope-plan
description: Break the active scope into groups, tasks, and numbered acceptance criteria — each group one feature, each task one reviewable independently testable unit carrying references to named PRD and architecture sections, each criterion an observable behavior addressable on its own so implementation can be pointed at it. Generated interactively with the operator, self-checked for coverage and hollow tasks before it is handed over, and carrying the scope's status for the rest of its life. Runs once per scope, after the active-scope PRD exists. Trigger on "implementation plan", "plan the build", "break this into tasks", "scope plan".
---

# Active-scope plan

Produce `docs/active-scope/implementation-plan.md`: the plan covering the whole active scope, broken into **groups**, then **tasks**, then **numbered acceptance criteria**. This is Phase 4, and it runs once per scope.

Three levels, three jobs:

- A **group** is one feature of the scope, described as something a user can do end-to-end. When its last task lands, something works that didn't before.
- A **task** is one reviewable, independently testable piece of a group. It's deliberately small.
- A **criterion** is one observable behavior, numbered `<group>.<task>.<n>`. **It is the smallest thing implementation can be aimed at**, so it has to stand alone: readable, testable, and unambiguous without the rest of the plan.

Every level is one-to-many: a scope has several groups, a group several tasks, a task several criteria. The numbering carries it — `2.3.1` is group 2, task 3, criterion 1.

**This file outlives the planning phase.** It is also where the scope's status lives — every criterion carries a checkbox, and Phase 5 writes its record back into the task it worked on. Write it knowing it will be edited many times and read many more.

**This phase is interactive.** The plan is the most expensive thing in the system to get wrong, so its shape is agreed with the operator while it's being made, not presented finished for approval.

> Part of the **dev system** — see the `dev-system` skill for the pipeline, the artifact map, references, question rules, and the principles that hold across every phase.

## Working conventions

```
docs/
  project/prd.md                       <- not read here; the scope PRD refines it
  project/architecture.md              <- read in full; the structure tasks build against
  active-scope/prd.md                  <- read in full
  active-scope/implementation-plan.md  <- this skill
  design-references/                   <- read-only; cite where a task builds against one
```

**References** are plain labels — `active-scope prd 3.1.2`, `project architecture § 6 Data model` — never links. Confirm every heading with `grep` before writing it down.

## Rule 1 — Groups are features, not work packages

Each group maps to a feature in `active-scope prd § 3`, and reads as something a user can do. Usually one group per feature; splitting a large feature into two is fine when each half is independently usable, merging two tiny ones is fine when neither stands alone.

- **A group must end in a working state.** When its last task is done, the operator can use the feature — not inspect a pile of half-wired parts.
- **A group is not a layer.** "The database work" is not a group; "a user can save and reopen a draft" is.
- If you can't say what a group lets someone do that they couldn't before, it isn't a group — it's a task that escaped. The one exception is a shared foundation the operator has chosen to give its own group — see Rule 5.

## Rule 2 — Task granularity (the master knob)

Each task is **one reviewable unit of behavior**: testable in isolation, small enough that its full diff fits in your head.

- Too big and the operator can't hold the diff, so review degrades to skimming and control is lost.
- Too small and the plan drowns in ceremony.
- Aim for a task that changes one observable behavior and could be described in a sentence.

**Tasks must not introduce huge chunks of work.** A task that needs three paragraphs to describe, or that touches every layer at once, is two or more tasks. A group with a single enormous task is the clearest sign the knob is set wrong.

As a feel, not a law: most groups land at two to five tasks, most tasks at two to five criteria. Past five or six tasks, check whether you're looking at two groups.

## Rule 3 — Criteria are observable, testable, and self-contained

Implementation can be aimed at a single criterion, which puts more weight on each one than in a plan where the task is the smallest unit.

- **Observable.** A criterion that can be satisfied without anything visibly changing is a hollow criterion. Ask: when this is met, what is different that someone could look at?
- **Test-covered — every criterion, no exceptions.** Each one names the test that proves it, written on the criterion itself — `verified by <test>`. A criterion with no named test does not go in the plan: Phase 5 ticks a box only when that test is green, so an untested criterion can never be marked met. If you cannot name a test that would *fail* when the criterion is not met, the criterion is too vague to implement against — sharpen it, split it, or drop it.
- **Name the cheapest test that can genuinely observe it.** The level you write here is paid for many times over: Phase 5 runs each criterion's test to write it, to break it, and again at the gate, on every run that touches the task. A criterion a unit test could observe should not name an end-to-end one because that was the level you reached for first. Where it truly needs the whole stack — a criterion about three services agreeing, or about what the user sees — that's the right level, and pushing it down would only produce a test that asserts on stubs. **Check the split before you hand the plan over:** if most of a group's criteria only show through its slowest level, say so at the checkpoint, because that is the group's build cost and the operator may want it restructured or the harness made faster first.
- **Self-contained.** Someone handed `2.3.1` alone must know what to build. Not "and the same for the other states" — write the other states as their own criteria.
- **Sub-bullets say how it's achieved** — one line each, plain language, no code. These keep the operator in the loop on *how* without dropping the plan to implementation altitude, so they have to stay short enough to actually read.

## Rule 4 — Dependencies are explicit

Because the operator can point Phase 5 at any group, task, or criterion in any order, **an order that only exists in the document's layout does not exist.** Where a task genuinely can't be built before another, write `**Depends on:** <task number>` on it. Where it doesn't, say nothing — a plan full of defensive dependencies is a plan with no real ones.

This is the one thing a reader can't reconstruct from the plan later, and it's what stops Phase 5 building against something that isn't there.

## Rule 5 — Shared foundations are placed by the operator

Some of what the scope needs is depended on by **more than one group** — an auth layer, a data model, a client for an external service, a shared component, a validation convention. Rule 1 says groups are features, so a shared piece has no obvious home, and where it lands changes the build order, what is reviewable, and what gets rewritten if the shape is wrong. **That call belongs to the operator.**

Find them before writing tasks. Walk the drafted groups and name anything two or more of them stand on. **If only one group depends on it, it isn't a shared foundation** — it's a task inside that group, and there's nothing to ask.

For each one, three placements, each with a real cost:

- **Its own group, built first** — *future-proof*. One shape agreed once, every consumer built against it. It is a deliberate exception to Rule 1: the group ends in nothing a user can do, so its **Delivers** line names the groups it unblocks instead. Costs a group of review before any feature works, and one exception per scope is the ceiling — a plan with two of these is a plan of layers.
- **Split across the groups that need it** — *cheaper now*. Each group builds the slice it needs; the first consumer sets the shape and later groups extend it. Nothing is built before it's used, and the bill comes if the second consumer needs a different shape.
- **Owned by one feature group, borrowed by the others** — built inside the group with the most demanding use, the rest depend on that task. Every group stays feature-shaped, at the price of coupling the others to that group landing first.

Ask with `AskUserQuestion`, one question per foundation, and **name what depends on it in the question** — the operator can't weigh the placement without knowing who the consumers are.

Whatever they choose, the answer is written into the plan as **Depends on:** lines (Rule 4). A placement that leaves no dependency line hasn't been recorded — Phase 5 can be aimed at any task in any order, so an ordering that lives only in the operator's memory of this conversation does not exist.

## Rule 6 — Per-task references

**Read the active-scope PRD and the project architecture once, here.** For each task, write the *specific references it needs* — named sections, **not whole documents**. Phase 5 then reads only what its target points to, which is what keeps implementation cheap and focused.

- **Behavior comes from `active-scope prd`, structure from `project architecture`, visuals from `design-references/<file>`.** Never cite `project prd` for behavior — the active-scope PRD already refines it, so a project-level citation sends Phase 5 to the vaguer of two answers for the same fact.
- References go on **tasks**, not groups. A group carries one line naming the active-scope PRD feature it delivers.
- Cite the smallest section that carries the fact — `active-scope prd 3.1.2`, not "the PRD".
- Cite `design-references/<file>` on any task building against a visual reference.

## Method

The interactive part is steps 2 and 4. Everywhere else, decide and move.

1. **Read** `docs/active-scope/prd.md` and `docs/project/architecture.md` in full. Those two are the whole reading list — `docs/project/prd.md` is not read here, and nothing in the plan cites it. Note the PRD's *Requirements depth* (§ 1.2) — it bounds how much the plan is allowed to leave to assumption.

2. **Agree the group split and the placement of shared foundations before writing tasks.** Draft the groups from the PRD's features, then walk the draft for anything two or more groups stand on (Rule 5). Both calls go to the operator in **one** `AskUserQuestion` pass — at most 5 questions in total, options labeled **future-proof** and **cheaper now**. Worth asking about:

   - a feature that could be one group or two, where the split changes what gets validated;
   - build order, where one order keeps the app working and another gets a risky piece proven earlier;
   - a feature the PRD names that has no clean end-to-end group;
   - **each shared foundation** — its own group, split across the groups that need it, or owned by one group and borrowed by the rest (Rule 5) — naming its consumers in the question.

   If the five slots don't cover everything, foundations go first. A group boundary that turns out wrong is re-cut on paper; a foundation placed wrong is found when the second consumer is already built against it. If the split is obvious and nothing is shared, don't manufacture a question. Skip to step 3.

3. **Break each group into tasks**, in build order, each satisfying Rule 2, then write each task's criteria under Rule 3 and its dependencies under Rule 4 — including the dependency lines the foundation placements agreed in step 2 imply.

4. **Put the granularity calls to the operator.** One `AskUserQuestion` pass, at most 5, on the tasks where the knob is genuinely ambiguous — a task that could be one or three, a piece of scaffolding that could be its own task or fold into the first real one. Each option says what it costs in review effort. **Ask about tasks you're unsure of, not about every task.**

5. **Write the references** for each task (Rule 6).

6. **Self-check the plan** — see below. This is not optional and it is not a formality.

7. **Keep it product-legible.** A reader should follow the arc of what's being built, not drown in implementation detail.

## Self-check

Nothing else validates this plan before code gets written, so the check happens here — **as a separate pass, in a different posture.** Read the finished draft as if someone else wrote it and you have to find the flaw. Fix what you find; raise what needs the operator.

**Coverage — nothing dropped, nothing invented.** Walk every numbered functional requirement in `active-scope prd § 3` against the criteria, both directions. A requirement no criterion claims is the failure that survives to the end of the scope, because a plan that never mentioned something can't be seen to be missing it. A criterion delivering something the PRD doesn't ask for is scope creep — name it and propose cutting it.

**Every criterion names a test.** Walk the checkboxes and check each one carries a named test that would fail if the behavior were absent. A criterion whose test is the task title restated, or a whole task sharing one vague test, is the same gap — Phase 5 has nothing to break in step 7 and the box gets ticked on a claim.

**References resolve.** `grep` every heading you cited, in the file you named. Check two things: the section exists, and it carries the fact the task needs it for. A reference pointing at a real section that doesn't say the thing is worse than a missing one, because Phase 5 will read it, find nothing, and assume instead. **Check all of them, not a sample.**

**Hollow tasks.** A hollow task is one that will look done without delivering what it claims. Four shapes:

- **Nothing observable.** The *Delivers* line promises user-visible behavior, but every criterion under it could be satisfied by a change nobody can see — a module that exists, a field that's stored, a function that returns.
- **The last-mile gap.** A group where every task builds a piece and none of them wires the pieces together. Extremely common, and it always surfaces at the end of the scope instead of here.
- **Untestable by construction.** A task whose behavior only shows through something the plan defers, so any test written for it asserts on a stub.
- **Delivers restating the title.** "Task 2.1 — Session store. Delivers: a session store." That's not a claim, so nothing can fail it.

**Shared foundations landed where the operator put them.** Take each foundation from step 2 and check the plan does what they chose, and that **every consuming group carries a `Depends on:` line to the task that builds it**. A foundation with no dependency lines is the same failure as no decision at all — Phase 5 can be aimed at any task in any order, so it will build the second consumer against a shape that isn't there yet. If a foundation surfaced only while writing the tasks, it was never asked about: go back and ask before handing over.

**Granularity and group independence.** Against Rules 1 and 2: a task needing three paragraphs, or with an "and" in its title doing real work, or the only task in a non-trivial group. A group whose last task lands and still leaves nothing usable. A dependency the order violates.

Three things you don't fix on your own: **cutting scope** the operator hasn't agreed to cut, **restructuring a group boundary**, and **moving a shared foundation** out of the placement they chose. All three change what gets validated and when. Propose and let them decide.

## Structure

```
# <Project> — Implementation plan: <scope name>

_Planned: <YYYY-MM-DD>_

## Status
<n>/<total> criteria met. Groups complete: <list, or none>.
_Maintained by implementation — see the checkboxes for detail._

## Group 1 — <title>
**Delivers:** what a user can do end-to-end once this group is done.
**Feature:** <the active-scope PRD feature this delivers, e.g. active-scope prd 3.1>

### Task 1.1 — <title>
**Delivers:** one reviewable unit of behavior — what observably changes.
**References:** <named sections only, as plain labels>
**Out of scope:** <what a reasonable implementer would reach for here that
isn't wanted — most often the rest of the group>
**Prerequisites:** <what the operator must wire, configure, or provide before
this can be built — or: none>
**Depends on:** <task number, only where the order is real — otherwise omit>

**Acceptance criteria**
- [ ] **1.1.1** <observable criterion> — verified by `<test>`
  - <how it's achieved — short>
  - <how it's achieved — short>
- [ ] **1.1.2** <observable criterion> — verified by `<test>`
  - <how it's achieved — short>

**Record**
_Filled during implementation — leave empty here._

### Task 1.2 — <title>
...

## Group 2 — <title>
...
```

Two things to leave alone at planning time: **Status** starts at `0/<total>`, and every **Record** stays empty. What you already know belongs in *Out of scope*, *Prerequisites*, or a criterion — not in a section another phase owns.

## Checkpoint

Link to the plan. Then the self-check result in at most three lines — what coverage, references, and hollow-task checks turned up, or "clean" for each. Then only what the operator wouldn't anticipate: a task that came out much larger than its neighbours, a dependency they wouldn't expect, a group that couldn't be made independently usable and why.

Don't list the groups back at them — they're in the plan — and don't name what runs next.
