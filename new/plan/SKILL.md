---
name: plan
description: Split the implementation of the current scope into sequential steps and capture them as docs/scope/plan.md — each step covering named scope PRD requirements and scope TDD decisions, ordered so nothing depends on a step that comes after it, and carrying acceptance criteria that are each a single testable unit. Runs once per scope, after the scope PRD and TDD exist. Trigger on "plan the scope", "implementation plan", "break this into steps", "scope plan".
---

# Plan

Produce `docs/scope/plan.md` — the implementation of the current scope, split into **sequential steps**. This is step 3 of the dev system, and it runs once per scope.

The plan carries the scope's status for the rest of its life: the build phase checks its acceptance criteria off, and the scope is delivered when they are all checked.

## How it runs

1. **Pull the scope.** Read `docs/scope/prd.md` and `docs/scope/tdd.md`. They are the only source for what the plan covers — the plan adds no requirement of its own.
2. **Decide the steps.** One step per feature of the scope, then split each step into substeps small enough to build and review in one sitting. Every substep names the scope requirements and decisions it covers, and every requirement in the scope PRD is covered by exactly one substep.

   **Step 1 is the foundation, and it is chosen differently from the rest.** It is the 20% of the scope that carries 80% of its impact — the spine the other steps hang off: the data, the boundaries, the path through the system that everything else extends. The test is what the operator gets from building it by hand: **after step 1 they should understand how the code works.** Every step after it builds on that spine and refines it.

3. **Verify the order.** Walk the substeps in order and check that each one can be built with only what the substeps before it put in place. **Nothing may depend on a substep that comes after it.** If something does, reorder — and if reordering cannot fix it, the substeps are cut wrong: split or merge them.
4. **Verify the acceptance criteria.** Each criterion is **one observable behavior, testable on its own**. If a criterion needs the word "and", it is two criteria. If it cannot be tested without knowing how it was built, it is written at the wrong level.
5. **Write the plan**, then say where it is in one line and stop.

## Format

Three levels: a **step** is one feature of the scope, a **substep** is one reviewable, independently testable piece of it, and an **acceptance criterion** is one observable behavior of a substep.

References are plain labels, never links: `scope prd 3.1.1`, `scope tdd 1.2`.

Every criterion is a checkbox — `[ ]` unbuilt, `[x]` met. This skill writes them all unchecked; the build phase checks them off and keeps *Status* current.

```markdown
# <Product> — Implementation plan: <scope name>

## Status

0/<n> criteria met.
_Maintained by the build phase — see the checkboxes for detail._

---

## 1. <Step name> (Foundation)

**Delivers:** what exists at the end of this step that did not exist before, in one sentence. For step 1, this is the spine — building it by hand shows how the code works.
**Feature:** scope prd 3.1

### 1.1 — <Substep name>

**Delivers:** what this substep puts in place, in one sentence.
**References:** scope prd 3.1.1, 3.1.2; scope tdd 1.2
**Out of scope:** what this substep deliberately leaves to a later one.
**Prerequisites:** anything the operator has to do by hand first — an account, a key, a service enabled. Omit when there are none.

**Acceptance criteria**

- [ ] **1.1.1** <One observable behavior, testable on its own.> — verified by `<test file>`
- [ ] **1.1.2** <...> — verified by `<test file>`

### 1.2 — <Substep name>

...

## 2. <Step name>

**Delivers:** ...
**Feature:** scope prd 3.2

### 2.1 — <Substep name>

...
```

## Rules

- **Step 1 is the foundation.** The 20% of the scope that carries 80% of its impact, and the step that teaches the codebase to whoever builds it. Everything after it builds on that spine — if step 1 could be dropped and the rest would still stand, it is not the foundation.
- **Substeps are sequential.** Their order is the build order, across steps as well as inside one. A reader should be able to start at 1.1 and never need something that has not been built yet.
- **A substep is one unit of work, not a phase.** Reviewable on its own, testable on its own. If it carries a large chunk of work, it is cut wrong — split it.
- **Cover everything once.** Every requirement in the scope PRD appears in some substep's *References*. A requirement covered nowhere is a hole; one covered in two substeps is a boundary in the wrong place.
- **Name the test.** Every acceptance criterion says what verifies it. A criterion with no test named is one nobody can check off honestly.
- **Never invent.** A substep that implements something the scope docs do not ask for does not belong in the plan.
