---
name: scope
description: Define one scope of implementation with the operator and capture it as docs/scope/prd.md and docs/scope/tdd.md — pulling the project requirements the operator's ask covers, settling their dependencies, pulling the technical decisions that carry them, refining both into scope-level detail, and reconciling every divergence from the project docs before anything is written. Takes a broad ask about what to add, change or remove, or specific requirements and features named from the project PRD. Runs once per scope. Trigger on "next scope", "define the scope", "scope prd", "let's build these features".
---

# Scope

Produce `docs/scope/prd.md` and `docs/scope/tdd.md` — the requirements and technical decisions for **what is being built now**. This is step 2 of the dev system, and it runs once per scope.

The operator's ask comes in two shapes, and both land in the same place: a broad request about something to add, change or remove, or specific requirements or features named out of the project PRD.

## How it runs

1. **Pull the requirements.** Read `docs/project/prd.md` and pull the requirements the ask covers. A broad ask is mapped onto the requirements that carry it. Anything the ask needs that no requirement covers is a divergence — hold it for step 5.
2. **Settle the dependencies.** Follow the `Depends on:` line of every pulled requirement, and of what those depend on in turn. Anything not already in the scope and not already built goes to the operator with `AskUserQuestion`. Options always include:
   - **Pull the dependencies in** — the scope grows to cover them.
   - **Drop the blocked requirement** — it leaves the scope and waits for a later one.
   - Whatever else fits — a thinner version of the dependency, a stub, a different cut.
3. **Pull the technical decisions.** Read `docs/project/tdd.md` and pull the decisions the scope's requirements rest on.
4. **Refine.** Against those decisions, restate each pulled requirement in the detail this scope needs to build it — what it does exactly, what its states are, what happens at its edges. **Refining means more detail, never different meaning.** Each refined requirement cites the project requirement it came from.
5. **Reconcile the divergences.** Anything in the refined set that the project docs do not support — a contradiction, or something they never covered — goes to the operator with `AskUserQuestion`. Options always include:
   - **Update the project docs** — the project PRD or TDD is what changes, and the scope stands.
   - **Change the scope** — the project docs hold, and the scope requirement is fixed to match.
   - Whatever else fits.
6. **Confirm the major decisions.** Refining makes decisions the project docs never made. Put every **major** one to the operator with `AskUserQuestion` before it is written down. A decision is major if any one of these holds:
   - it **changes what the product costs** to run or to maintain;
   - it is **user-facing** — it changes what someone sees or does;
   - it is **hard to change later** — a data shape, a boundary, an interface other code will bind to.

   Everything else is minor: decide it yourself and move on. When a decision sits on the line, treat it as major. **Every major decision, once confirmed, is written into § 6 Edge cases** — that section is the record of what this scope decided that the project docs did not.
7. **Write both documents**, then say where they are in one line and stop.

## Asking

Ask with `AskUserQuestion`. Never print a numbered list of questions into chat for the operator to answer in prose.

- At most **5 questions per set**. Ask in one pass rather than trickling.
- Every question carries options, and each option says **what it commits to** — what it pulls into the scope, what it leaves for later.
- Only ask what actually gates the document. Decide the small things yourself.

Nothing undecided gets written. A document records decisions, never open questions.

## Format

References to the project docs are plain labels, never links: `project prd 3.2.4`, `project tdd 2.1`.

### `docs/scope/prd.md`

```markdown
# <Product> — Scope: <short-name>

## 1. What's in

- **<Area>** — one line on what it covers. (project prd 3.2, 3.4.1–3.4.5)
- **<Area>** — ... (project prd 4.1)

## 2. What this scope delivers

A paragraph describing what exists at the end of it that did not exist before.

- **As a <role>, I can** <the things this scope puts in their hands>.

## 3. Features

### 3.1 <Feature name>

_Refines: project prd 3.2_

**Functional requirements**

- **3.1.1** <The requirement, in this scope's detail.> (refines 3.2.1)
- **3.1.2** <...> (refines 3.2.2)

## 4. Non-functional requirements

| Category | Requirement | Refines |
| :------- | :---------- | :------ |
| <Performance, security, availability…> | <What it has to hold to here.> | project prd 4.1 |

## 5. Out of scope

- **<Thing>** — why it is not here, and what it waits for.

## 6. Edge cases

Every assumption this scope makes that the project docs did not settle, and that is **hard to change later, changes what the product costs, changes the project architecture, or is user-facing**. These are the ones confirmed with the operator in step 6 — write each one as settled, with the test it trips.

- **<The assumption, as a decision.>** — hard to change later: <what will bind to it>. Confirmed.
- **<The assumption, as a decision.>** — user-facing: <what someone sees or does differently>. Confirmed.
- **<The assumption, as a decision.>** — cost: <what it adds to running or maintaining the product>. Confirmed.
```

### `docs/scope/tdd.md`

````markdown
# <Product> — Scope: <short-name> — TDD

## 1. Decisions

- **1.1** <The decision, in this scope's detail.> (refines project tdd 4.1)
- **1.2** <A decision this scope has to make that the project TDD leaves open.> (refines project tdd 3.1)

## 2. Data

**<Entity>** _(new)_ — what it holds and who sets it.

**<Entity>** _(existing, extended)_ — what this scope adds to it.

## 3. Diagram

```mermaid
flowchart TB
    ...what this scope adds, and where it attaches to what already exists...
```
````

### `docs/scope/diagram.svg`

Whenever you write the scope TDD, write the diagram beside it as `docs/scope/diagram.svg` — **the same parts and the same connections** as the mermaid block in section 3. Hand-write the SVG: self-contained, no external fonts or images, labels as real text, and legible on a light and a dark background. If the mermaid diagram changes, this file changes with it.

## Rules

- **Refine, never contradict.** A scope document says the same thing as its project parent, in more detail. If it says something different, that is step 5, not a sentence you write.
- **Cite the parent.** Every refined requirement and decision names the project requirement or decision it came from. A requirement with no parent is uncovered — raise it, never invent a parent to make it resolve.
- **More detail, not less.** If a line could be deleted and the project doc would still carry the same information, delete it and cite the parent instead. A scope PRD that reads as a summary of the project PRD has failed.
- **Never widen the scope yourself.** What is in is the operator's decision, settled in steps 2, 5 and 6. Everything you leave out goes in *Out of scope* so it is visible.
