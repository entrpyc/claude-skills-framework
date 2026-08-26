---
name: active-scope-plan
description: Chunk the active scope into steps — groups, tasks, and numbered acceptance criteria — and check every functional requirement in the scope PRD off against the step that covers it, with the test that proves it named. Each group is one feature, each task one reviewable independently testable unit carrying references to named PRD and architecture sections, each criterion an observable behavior addressable on its own so implementation can be pointed at it. Generated interactively with the operator, self-checked for coverage and hollow tasks before it is handed over, and carrying the scope's status for the rest of its life. Runs once per scope, after the active-scope PRD exists. Trigger on "implementation plan", "plan the build", "break this into tasks", "scope plan".
---

# Active-scope plan

Produce `docs/active-scope/implementation-plan.md`. It does two things, and the second is what makes the first accountable:

- **Chunk the scope into steps** — **groups**, then **tasks**, then **numbered acceptance criteria**, each level small enough to build and review in one sitting.
- **Check the scope's functional requirements off against those steps, with test coverage.** Every numbered requirement in `active-scope prd § 3` is assigned to the step that satisfies it and carries the tests that prove it (Rule 7). A requirement no step claims is the scope's most expensive failure, because a plan that never mentioned it can't be seen to be missing it.

This is Phase 4, and it runs once per scope.

Three levels, three jobs:

- A **group** is one feature of the scope, described as something a user can do end-to-end. When its last task lands, something works that didn't before.
- A **task** is one reviewable, independently testable piece of a group. It's deliberately small.
- A **criterion** is one observable behavior, numbered `<group>.<task>.<n>`. **It is the smallest thing implementation can be aimed at**, so it has to stand alone: readable, testable, and unambiguous without the rest of the plan.

Every level is one-to-many: a scope has several groups, a group several tasks, a task several criteria. The numbering carries it — `2.3.1` is group 2, task 3, criterion 1.

**This file outlives the planning phase.** It is also where the scope's status lives — every criterion and every requirement carries a checkbox, and Phase 5 writes its record back into the task it worked on. Write it knowing it will be edited many times and read many more.

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
- If you can't say what a group lets someone do that they couldn't before, it isn't a group — it's a task that escaped. The one exception is a shared foundation the operator has chosen to give its own group — see Rule 5, and note that it can only be Group 1 (Rule 8).
- **Group 1 is not just the first group, it's the foundation** — the fifth of the scope that fixes the shape everything else binds to. See Rule 8 before drafting the split.

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
- **Test-covered — every criterion, no exceptions.** Each one names the test that proves it, written on the criterion itself — `verified by <test>`. A criterion with no named test does not go in the plan: Phase 5 ticks a box only when that test is green, so an untested criterion can never be marked met. **This is also where the requirements' coverage comes from** — Rule 7 reads these names back per requirement, so a vague one weakens a requirement's coverage, not just a criterion's. If you cannot name a test that would *fail* when the criterion is not met, the criterion is too vague to implement against — sharpen it, split it, or drop it.
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

- **Its own group, built first — which means Group 1** (Rule 8). *Future-proof*: one shape agreed once, every consumer built against it. It is a deliberate exception to Rule 1: the group ends in nothing a user can do, so its **Delivers** line names the groups it unblocks instead. Costs a group of review before any feature works, and one exception per scope is the ceiling — a plan with two of these is a plan of layers.
- **Split across the groups that need it** — *cheaper now*. Each group builds the slice it needs; the first consumer sets the shape and later groups extend it. Nothing is built before it's used, and the bill comes if the second consumer needs a different shape.
- **Owned by one feature group, borrowed by the others** — built inside the group with the most demanding use, the rest depend on that task. Every group stays feature-shaped, at the price of coupling the others to that group landing first.

Ask with `AskUserQuestion`, one question per foundation, and **name what depends on it in the question** — the operator can't weigh the placement without knowing who the consumers are.

Whatever they choose, the answer is written into the plan as **Depends on:** lines (Rule 4). A placement that leaves no dependency line hasn't been recorded — Phase 5 can be aimed at any task in any order, so an ordering that lives only in the operator's memory of this conversation does not exist.

## Rule 6 — Per-task references

**Read the active-scope PRD and the project architecture once, here.** For each task, write the *specific references it needs* — named sections, **not whole documents**. Phase 5 then reads only what its target points to, which is what keeps implementation cheap and focused.

- **Behavior comes from `active-scope prd`, structure from `project architecture`, visuals from `design-references/<file>`.** Never cite `project prd` for behavior — the active-scope PRD already refines it, so a project-level citation sends Phase 5 to the vaguer of two answers for the same fact.
- **Phase 3 already pulled the product-side references** into `active-scope prd § 1.4`. Take them from there rather than searching full scope again; what you add here is the architecture, which that document deliberately doesn't carry. A reference the PRD pulled that no task needs is a signal worth a line at the checkpoint — either a feature is missing from the plan, or the scope pulled more than it builds against.
- References go on **tasks**, not groups. A group carries one line naming the active-scope PRD feature it delivers.
- Cite the smallest section that carries the fact — `active-scope prd 3.1.2`, not "the PRD".
- Cite `design-references/<file>` on any task building against a visual reference.

## Rule 7 — Every step checks off functional requirements, with test coverage

The scope's functional requirements are what the plan is accountable for; groups, tasks and criteria are only how it gets there. So **the mapping between them is written down, not left to be reconstructed** — in two places, and they have to agree.

**On each task**, a *Requirements* block naming every `active-scope prd § 3` requirement that step satisfies, with the criteria that satisfy it:

```
**Requirements**
- [ ] **3.1.2** — met by 1.1.1, 1.1.2
- [ ] **3.1.3** — met by 1.1.3
```

- **A requirement goes on the step that finishes it**, not on every step that brushes past it. Where two steps genuinely each deliver part of one requirement, list it on both and say which part — a requirement half-covered twice and finished nowhere is the exact gap this rule exists to close.
- **Its box is ticked when every criterion under it is checked and the tests naming it are green**, by Phase 5 in the same pass that ticks the criteria. Nothing else ticks it: a requirement is met when the tests covering it pass, not when the step is over.
- **Test coverage is per requirement, and it comes from the criteria.** Every criterion already names the test that proves it (Rule 3), so a requirement's coverage is the tests on the criteria listed against it. **Read it as a set once you've written it:** if none of those tests would fail with the requirement unimplemented, the requirement is uncovered no matter how many criteria point at it.
- **A step covering no requirement is a step to justify.** Shared foundations (Rule 5) are the legitimate case, and they say so: `**Requirements:** none — foundation for 2.1, 3.1`. Anything else that covers nothing is work the scope didn't ask for.
- **Never invent a requirement number**, and never stretch one to fit. A step that delivers something `active-scope prd § 3` doesn't ask for is scope creep against the hard limit (`active-scope prd § 7`) — cut it, or take it to the operator.

**And once at the top of the plan**, the *Requirements coverage* table: every numbered requirement in the scope PRD, the step that covers it, and its box. That table is the plan's answer to *what does this scope still owe*, in one place, without reading every group — and it's where Phase 6 starts when it walks the claims against the code.

## Rule 8 — Group 1 is the foundation, and it's about a fifth of the scope

The operator's attention is the scarcest thing in this system, and it is not spent evenly across a scope. **The plan decides where it goes**, and it goes to the front.

So order the plan to front-load the shape: **Group 1 carries the work every later group binds to — roughly the first fifth of the scope's tasks — and every group after it extends that shape rather than setting a new one.** The operator stays close through Group 1, where a wrong shape is cheap to change and ruinous to discover late. What follows is refinement over decisions already made, which is the part Phase 5 can carry with far less of them in the loop.

What belongs in Group 1 is whatever later code binds to and can't cheaply be moved afterwards:

- the **data shapes** the scope's features read and write;
- the **module and service boundaries** — what owns what, what calls what;
- the **names other code will bind to** — a route, an event, a table, an exported type;
- **one path that goes end to end**, however thin, proving the pieces actually meet;
- the **conventions later groups copy without thinking** — how errors surface, how input is validated, how a request is authorized.

Three rules keep it from turning into a layer:

- **Prefer the thinnest end-to-end slice of the most foundational feature.** Rule 1 still holds: Group 1 should end in something a user can do, even if it is one path with everything around it unbuilt. A skeleton that runs proves the boundaries meet; a pile of parts that never touch proves nothing and finds out at the end of the scope.
- **A pure foundation group is allowed here, and only here.** Where the operator places a shared foundation in its own group (Rule 5), that group **is** Group 1, and its *Delivers* line names the groups it unblocks. One per scope is the ceiling.
- **About a fifth, as a feel and not a law.** If Group 1 is half the plan it isn't a foundation, it's the scope — re-cut it and let a later group take whatever sets no shape. If it's one small task, the shape-setting work is probably hiding in Group 3; go and find it.

**Every later group says what it inherits.** Each one after Group 1 carries a line naming the shape it builds on (see *Structure*). That line is what makes a group quietly inventing its own shape visible here, as a paragraph, instead of three groups later as a rewrite.

## Method

The interactive part is steps 2 and 4. Everywhere else, decide and move.

1. **Read** `docs/active-scope/prd.md` and `docs/project/architecture.md` in full. Those two are the whole reading list — `docs/project/prd.md` is not read here, and nothing in the plan cites it. Three parts of the PRD do specific work before you draft anything:

   - **§ 3 the functional requirements** — the list the plan is accountable for. **Write them out first, as the coverage table's rows, before there are any tasks to put in it.** Starting from the requirements and finding steps for them is what makes coverage a property of the plan; starting from tasks and checking coverage afterwards is what makes it a thing you discover at the end of the scope.
   - **§ 1.2 requirements depth** — how much the plan is allowed to leave to assumption.
   - **§ 7 the hard limit** — the ceiling. **No group, task, or criterion may cover what it excludes**, and the plan is not the place that raises it. Something the scope plainly needs that § 7 excludes goes to the operator as a question, and the PRD is what changes.

2. **Agree the group split and the placement of shared foundations before writing tasks.** Draft the groups from the PRD's features, then walk the draft for anything two or more groups stand on (Rule 5). Both calls go to the operator in **one** `AskUserQuestion` pass — at most 5 questions in total, options labeled **future-proof** and **cheaper now**. Worth asking about:

   - **which feature's thin end-to-end slice becomes Group 1** (Rule 8), where more than one could carry the shape — this is the group the operator will be closest to, so it's their call, not yours;
   - a feature that could be one group or two, where the split changes what gets validated;
   - build order, where one order keeps the app working and another gets a risky piece proven earlier;
   - a feature the PRD names that has no clean end-to-end group;
   - **each shared foundation** — its own group, split across the groups that need it, or owned by one group and borrowed by the rest (Rule 5) — naming its consumers in the question.

   If the five slots don't cover everything, foundations go first. A group boundary that turns out wrong is re-cut on paper; a foundation placed wrong is found when the second consumer is already built against it. If the split is obvious and nothing is shared, don't manufacture a question. Skip to step 3.

3. **Break each group into tasks**, in build order, each satisfying Rule 2, then write each task's criteria under Rule 3 and its dependencies under Rule 4 — including the dependency lines the foundation placements agreed in step 2 imply.

4. **Put the granularity calls to the operator.** One `AskUserQuestion` pass, at most 5, on the tasks where the knob is genuinely ambiguous — a task that could be one or three, a piece of scaffolding that could be its own task or fold into the first real one. Each option says what it costs in review effort. **Ask about tasks you're unsure of, not about every task.**

5. **Write the references** for each task (Rule 6).

6. **Write the check-off** (Rule 7): the *Requirements* block on every task, then the *Requirements coverage* table from those blocks. Building the table from the blocks rather than in parallel is what keeps the two agreeing — a requirement that lands in the table without a step is one you invented a home for.

7. **Self-check the plan** — see below. This is not optional and it is not a formality.

8. **Keep it product-legible.** A reader should follow the arc of what's being built, not drown in implementation detail.

## Self-check

Nothing else validates this plan before code gets written, so the check happens here — **as a separate pass, in a different posture.** Read the finished draft as if someone else wrote it and you have to find the flaw. Fix what you find; raise what needs the operator.

**Coverage — nothing dropped, nothing invented.** The check-off (Rule 7) is what's being checked here, and it is read in both directions. **Down:** every numbered functional requirement in `active-scope prd § 3` appears exactly once in the coverage table, against a real step — a requirement no step claims is the failure that survives to the end of the scope, because a plan that never mentioned something can't be seen to be missing it. **Up:** every task's *Requirements* block resolves to a requirement that exists, and every step covering none says why. A step delivering something the PRD doesn't ask for is scope creep against the hard limit — name it and propose cutting it.

**Coverage is claimed by tests, not by placement.** For each requirement, read the tests named on the criteria listed against it and ask whether one of them would fail if the requirement were unimplemented. A requirement whose criteria are all satisfiable with it absent is uncovered, and it is uncovered in the way that's hardest to see later — the boxes tick, the table fills, and nothing proves the behavior.

**The hard limit holds.** Walk `active-scope prd § 7` against the groups and tasks. Anything the plan builds that § 7 excludes comes out — or goes to the operator, if it turns out the scope can't be delivered without it. This is the check that keeps the plan the size the scope was agreed at.

**Every criterion names a test.** Walk the checkboxes and check each one carries a named test that would fail if the behavior were absent. A criterion whose test is the task title restated, or a whole task sharing one vague test, is the same gap — Phase 5 has nothing to break in step 7 and the box gets ticked on a claim.

**References resolve.** `grep` every heading you cited, in the file you named. Check two things: the section exists, and it carries the fact the task needs it for. A reference pointing at a real section that doesn't say the thing is worse than a missing one, because Phase 5 will read it, find nothing, and assume instead. **Check all of them, not a sample.**

**Hollow tasks.** A hollow task is one that will look done without delivering what it claims. Four shapes:

- **Nothing observable.** The *Delivers* line promises user-visible behavior, but every criterion under it could be satisfied by a change nobody can see — a module that exists, a field that's stored, a function that returns.
- **The last-mile gap.** A group where every task builds a piece and none of them wires the pieces together. Extremely common, and it always surfaces at the end of the scope instead of here.
- **Untestable by construction.** A task whose behavior only shows through something the plan defers, so any test written for it asserts on a stub.
- **Delivers restating the title.** "Task 2.1 — Session store. Delivers: a session store." That's not a claim, so nothing can fail it.

**Shared foundations landed where the operator put them.** Take each foundation from step 2 and check the plan does what they chose, and that **every consuming group carries a `Depends on:` line to the task that builds it**. A foundation with no dependency lines is the same failure as no decision at all — Phase 5 can be aimed at any task in any order, so it will build the second consumer against a shape that isn't there yet. If a foundation surfaced only while writing the tasks, it was never asked about: go back and ask before handing over.

**Foundation is front-loaded.** Read every group after Group 1 for shape it *introduces* rather than inherits: a second data shape for the same thing, a new module boundary, a name other code will bind to, its own convention for errors or permissions. Each one is either work that belongs in Group 1 or an admission the foundation was cut too thin — both are re-cuts, cheap here and expensive once the operator has reviewed Group 1 and stepped back. Check the share while you're there: roughly a fifth of the tasks, and if it's badly off, say so at the checkpoint with what you'd move.

**Granularity and group independence.** Against Rules 1 and 2: a task needing three paragraphs, or with an "and" in its title doing real work, or the only task in a non-trivial group. A group whose last task lands and still leaves nothing usable. A dependency the order violates.

Three things you don't fix on your own: **cutting scope** the operator hasn't agreed to cut, **restructuring a group boundary**, and **moving a shared foundation** out of the placement they chose. All three change what gets validated and when. Propose and let them decide.

## Structure

```
# <Project> — Implementation plan: <scope name>

_Planned: <YYYY-MM-DD>_

## Status
<n>/<total> criteria met. <n>/<total> requirements met.
Groups complete: <list, or none>.
_Maintained by implementation — see the checkboxes for detail._

## Requirements coverage
Every functional requirement in active-scope prd § 3, and the step that
covers it. Ticked by implementation when the requirement's criteria are all
checked and the tests naming it are green.

| Requirement | Covered by | Met |
|---|---|---|
| 3.1.1 | Task 1.1 | [ ] |
| 3.1.2 | Task 1.1, Task 1.3 (the expired case) | [ ] |
| 3.2.1 | Task 2.1 | [ ] |

_Every requirement in the PRD appears here exactly once. A requirement with_
_no step is a hole in the plan, not a blank in the table._

## Group 1 — <title>            (the foundation — Rule 8)
**Delivers:** what a user can do end-to-end once this group is done, however
thin the path. For a pure foundation group: the groups it unblocks.
**Feature:** <the active-scope PRD feature this delivers, e.g. active-scope prd 3.1>
**Fixes for the scope:** <the shapes, boundaries, names and conventions every
later group binds to — one line>

### Task 1.1 — <title>
**Delivers:** one reviewable unit of behavior — what observably changes.
**References:** <named sections only, as plain labels>
**Out of scope:** <what a reasonable implementer would reach for here that
isn't wanted — most often the rest of the group>
**Prerequisites:** <what the operator must wire, configure, or provide before
this can be built — or: none>
**Depends on:** <task number, only where the order is real — otherwise omit>

**Requirements**
- [ ] **3.1.2** — met by 1.1.1, 1.1.2
- [ ] **3.1.3** — met by 1.1.3
<or, for a shared foundation: **Requirements:** none — foundation for 2.1, 3.1>

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
**Delivers:** ...
**Feature:** ...
**Builds on:** <what Group 1 fixed that this group takes as-is — one line.
Anything it has to invent instead belongs in Group 1.>
...
```

Three things to leave alone at planning time: **Status** starts at `0/<total>` on both counts, every **checkbox** starts unticked — the requirement boxes included, however certain a step is to cover one — and every **Record** stays empty. What you already know belongs in *Out of scope*, *Prerequisites*, or a criterion — not in a section another phase owns.

## Checkpoint

Link to the plan. Then the self-check result in at most three lines — what coverage, references, and hollow-task checks turned up, or "clean" for each. **Coverage is the one that always gets a number:** how many of the scope PRD's functional requirements are checked off against a step, out of the total. Anything short of all of them is named, requirement by requirement, with why.

Then **what Group 1 fixes for the scope and what share of the plan it is** — one line. That's the group they'll be closest to, and its size is how much of the scope they're choosing to stay hands-on for.

Then only what the operator wouldn't anticipate: a task that came out much larger than its neighbours, a dependency they wouldn't expect, a group that couldn't be made independently usable and why, a requirement the hard limit forced you to leave uncovered, shape a later group had to invent that you'd move into Group 1.

Don't list the groups back at them — they're in the plan — and don't name what runs next.
