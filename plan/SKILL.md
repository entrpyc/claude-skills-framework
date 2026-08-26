---
name: plan
description: Split the implementation of the current scope into sequential steps and capture them as docs/scope/plan.md — each step covering named scope PRD requirements and scope TDD decisions, ordered so nothing depends on a step that comes after it, and carrying acceptance criteria that are each a single testable unit. Runs once per scope, after the scope PRD and TDD exist. Trigger on "plan the scope", "implementation plan", "break this into steps", "scope plan".
---

# Plan

Produce `docs/scope/plan.md` — the implementation of the current scope, split into **sequential steps**. This is step 3 of the dev system, and it runs once per scope.

The plan carries the scope's status for the rest of its life: the build phase checks its acceptance criteria off, and the scope is delivered when they are all checked.

> **Read the `conventions` skill before anything below.** It carries the rules every phase follows, and they are not repeated here.

## How it runs

1. **Pull the scope.** Read `docs/scope/prd.md` and `docs/scope/tdd.md`. They are the only source for what the plan covers — the plan adds no requirement of its own. Three sections do specific work before you draft anything:

   - **§ 3 the functional requirements** — the list the plan is accountable for. Every one of them is covered by exactly one substep.
   - **§ 4 the non-functional requirements** — accountable the same way, but they constrain rather than deliver: each one is named in the *References* of every substep it binds, and at least one acceptance criterion somewhere tests it. A scope NFR no criterion tests is a requirement nothing will ever check.
   - **§ 5 Out of scope — the ceiling** (`conventions` § The ceiling). No step, substep or criterion may cover what it excludes, and **the plan is not what raises it.** A plan that covers what § 5 still excludes is the one outcome that is not allowed.

   Where the scope has a user interface, read `docs/design-references/` for the surfaces it puts in front of someone — see `conventions` § Design references — and name the file on each substep that builds against it.
2. **Decide the steps.** One step per feature of the scope, then split each step into substeps small enough to build and review in one sitting. Every substep names the scope requirements and decisions it covers, and every functional requirement in the scope PRD is covered by exactly one substep.

   **Step 1 is the foundation, and it is chosen differently from the rest.** It is the 20% of the scope that carries 80% of its impact — the spine the other steps hang off. The test is what the operator gets from building it by hand: **after step 1 they should understand how the code works.** Every step after it builds on that spine and refines it.

   What belongs in it is whatever later code binds to and cannot cheaply be moved afterwards:

   - the **data shapes** the scope's features read and write;
   - the **boundaries** — what owns what, what calls what;
   - the **names other code will bind to** — a route, an event, a table, an exported type;
   - **one path that runs end to end**, however thin, proving the pieces actually meet;
   - the **conventions later steps copy without thinking** — how errors surface, how input is validated, how a request is authorized.

   Three guards keep it from turning into a layer:

   - **The thinnest end-to-end slice, never a layer.** "The backend", "the database work", "the API" is not step 1 — it proves nothing meets, and it finds that out at the end of the scope. Step 1 ends in something a user can do, even if it is one path with everything around it unbuilt.
   - **About a fifth of the plan's substeps, as a feel and not a law.** If step 1 is half the plan it is not a foundation, it is the scope — re-cut and let a later step take whatever sets no shape. If it is a single substep, the shape-setting work is hiding in step 3; go and find it.
   - **Every later step says what it inherits.** Each one carries a **Builds on:** line naming the shape step 1 fixed that it takes as-is. A step that cannot write that line is inventing its own shape, and that belongs in the foundation.

3. **Verify the order.** Walk the substeps in order and check that each one can be built with only what the substeps before it put in place. **Nothing may depend on a substep that comes after it.** If something does, reorder — and if reordering cannot fix it, the substeps are cut wrong: split or merge them.
4. **Verify the foundation.** Read every step after step 1 for shape it **introduces** rather than inherits — a second data shape for something step 1 already models, a boundary step 1 does not have, a name other code will bind to, its own convention for errors or permissions. Each one is either work that belongs in step 1 or an admission step 1 was cut too thin. Both are re-cuts, cheap here and expensive once code exists. Check the share while you are there.
5. **Verify the ceiling holds.** Walk `docs/scope/prd.md` § 5 against the steps and substeps. Anything the plan builds that § 5 excludes comes out — or goes to the operator, if the scope genuinely cannot be delivered without it. This is the check that keeps the plan the size the scope was agreed at.
6. **Verify the acceptance criteria.** Each criterion is **one observable behavior, testable on its own**. If a criterion needs the word "and", it is two criteria. If it cannot be tested without knowing how it was built, it is written at the wrong level. Name the test that verifies it, and check that the test would fail if the behavior were absent.
7. **Write the plan**, then say where it is in one line and stop.

## Format

Three levels: a **step** is one feature of the scope, a **substep** is one reviewable, independently testable piece of it, and an **acceptance criterion** is one observable behavior of a substep.

References follow `conventions` § Citing — plain labels: `scope prd 3.1.1`, `scope tdd 1.2`.

Every criterion is a checkbox — `[ ]` unbuilt, `[x]` met. This skill writes them all unchecked; the build phase checks them off and keeps *Status* current.

Every substep carries three empty blocks — **Assumptions**, **Edge cases** and **Manual steps**: what the build phase decided that nothing settled for it, what its code does not handle, and what the operator has to do by hand for its code to run. **Leave all three empty here.** The build phase owns them, and what you already know belongs in *Prerequisites*, in *Out of scope*, or in a criterion, not in a section another phase writes.

```markdown
# <Product> — Implementation plan: <scope name>

## Status

0/<n> criteria met.
_Maintained by the build phase — see the checkboxes for detail._

---

## 1. <Step name> (Foundation)

**Delivers:** what exists at the end of this step that did not exist before, in one sentence. For step 1, this is the spine — building it by hand shows how the code works.
**Feature:** scope prd 3.1
**Fixes for the scope:** the shapes, boundaries, names and conventions every later step binds to — one line. Step 1 only.

### 1.1 — <Substep name>

**Delivers:** what this substep puts in place, in one sentence.
**References:** scope prd 3.1.1, 3.1.2, 4.1; scope tdd 1.2, 2.1; design-references/<file>
**Out of scope:** what this substep deliberately leaves to a later one.
**Prerequisites:** anything the operator has to do by hand first — an account, a key, a service enabled. Omit when there are none.

**Acceptance criteria**

- [ ] **1.1.1** <One observable behavior, testable on its own.> — verified by `<test file>`
- [ ] **1.1.2** <...> — verified by `<test file>`

**Assumptions**
_Written by the build phase — leave empty here._

**Edge cases**
_Written by the build phase — leave empty here._

**Manual steps**
_Written by the build phase — leave empty here._

### 1.2 — <Substep name>

...

## 2. <Step name>

**Delivers:** ...
**Feature:** scope prd 3.2
**Builds on:** what step 1 fixed that this step takes as-is — one line. Every step after the foundation carries it.

### 2.1 — <Substep name>

...
```

## Rules

- **Step 1 is the foundation.** The 20% of the scope that carries 80% of its impact, and the step that teaches the codebase to whoever builds it. It is the thinnest end-to-end slice, never a layer — "the backend" is not a foundation. About a fifth of the plan's substeps. If step 1 could be dropped and the rest would still stand, it is not the foundation.
- **Every step after the foundation carries a `Builds on:` line.** It names the shape step 1 fixed that the step takes as-is. A step that cannot write one is inventing its own shape — that work belongs in step 1, or step 1 was cut too thin.
- **Substeps are sequential.** Their order is the build order, across steps as well as inside one. A reader should be able to start at 1.1 and never need something that has not been built yet.
- **A substep is one unit of work, not a phase.** Reviewable on its own, testable on its own. If it carries a large chunk of work, it is cut wrong — split it.
- **Cover everything once.** Every functional requirement in the scope PRD appears in exactly one substep's *References*. One covered nowhere is a hole; one covered in two substeps is a boundary in the wrong place. Non-functional requirements are the exception — they appear wherever they bind, and are covered when a criterion tests them.
- **Nothing in `Out of scope` gets planned** — `conventions` § The ceiling.
- **Cite the design reference on every substep that builds a surface**, so the build phase reads it instead of inventing the interface.
- **Name the test, and name one that could fail.** Every acceptance criterion says what verifies it. If you cannot name a test that would go **red** with the behavior absent, the criterion is too vague to build against — sharpen it, split it, or drop it. The build phase writes that test before the code and watches it fail, so a criterion no test can be red for cannot be built against.
