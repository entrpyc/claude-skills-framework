---
name: scope
description: Define one scope of implementation with the operator and capture it as docs/scope/prd.md and docs/scope/tdd.md — pulling the project requirements the operator's ask covers, settling their dependencies, pulling the technical decisions that carry them, refining both into scope-level detail, and reconciling every divergence from the project docs before anything is written. Takes a broad ask about what to add, change or remove, or specific requirements and features named from the project PRD. Runs once per scope. Trigger on "next scope", "define the scope", "scope prd", "let's build these features".
---

# Scope

Produce `docs/scope/prd.md` and `docs/scope/tdd.md` — the requirements and technical decisions for **what is being built now**. This is step 2 of the dev system, and it runs once per scope.

The operator's ask comes in two shapes, and both land in the same place: a broad request about something to add, change or remove, or specific requirements or features named out of the project PRD.

> **Read the `conventions` skill before anything below.** It carries the rules every phase follows, and they are not repeated here.

## How it runs

1. **Pull the requirements.** Read `docs/project/prd.md` and pull the requirements the ask covers. A broad ask is mapped onto the requirements that carry it. Anything the ask needs that no requirement covers is a divergence — hold it for step 5.
2. **Settle the dependencies.** Follow the `Depends on:` line of every pulled requirement, and of what those depend on in turn. Anything not already in the scope and not already built goes to the operator with `AskUserQuestion`. Options always include:
   - **Pull the dependencies in** — the scope grows to cover them.
   - **Drop the blocked requirement** — it leaves the scope and waits for a later one.
   - Whatever else fits — a thinner version of the dependency, a stub, a different cut.
3. **Pull the technical decisions.** Read `docs/project/tdd.md` and pull the decisions the scope's requirements rest on.

   **Where the scope puts anything in front of a user, read `docs/design-references/` in the same pass** — see `conventions` § Design references. What a mockup covers is what the requirement says, cited by filename; what it does not cover is unspecified interface, and that is a question in step 6, never something you design.
4. **Refine.** Against those decisions, restate each pulled requirement in the detail this scope needs to build it — what it does exactly, what its states are, what happens at its edges. **Refining means more detail, never different meaning.** Each refined requirement cites the project requirement it came from.
5. **Reconcile the divergences.** Anything in the refined set that the project docs do not support — a contradiction, or something they never covered — goes to the operator per `conventions` § Reconciling. Here the two sides are **update the project docs**, and the scope stands, or **change the scope requirement** to match what they say.
6. **Confirm the major decisions.** Refining makes decisions the project docs never made. Classify each one by `conventions` § Major assumptions, ask the major ones before writing them down, decide the minor ones yourself — and **record both kinds in § 6 Assumptions.**
7. **Write both documents**, then say where they are in one line and stop.

## Format

References follow `conventions` § Citing — plain labels: `project prd 2.1.1`, `project tdd 2.1`.

### `docs/scope/prd.md`

```markdown
# <Product> — Scope: <short-name>

## 1. What's in

- **<Area>** — one line on what it covers. (project prd 2.2, 2.4.1–2.4.5)
- **<Area>** — ... (project prd 2.6)

## 2. What this scope delivers

A paragraph describing what exists at the end of it that did not exist before.

- **As a <role>, I can** <the things this scope puts in their hands>.

## 3. Features

### 3.1 <Feature name>

_Refines: project prd 2.2_

**Functional requirements**

- **3.1.1** <The requirement, in this scope's detail.> (refines 2.2.1)
- **3.1.2** <...> (refines 2.2.2)

## 4. Non-functional requirements

| # | Category | Requirement | Refines |
| :- | :------- | :---------- | :------ |
| **4.1** | <Performance, security, availability…> | <What it has to hold to here.> | project prd 3.1 |

## 5. Out of scope

The ceiling on everything downstream: `plan` may not plan it and `build` may not build it, and only the operator raises it (`conventions` § The ceiling). Write each line as **what a reader would reasonably expect here, plus why it is not coming** — specific enough that someone can tell which side of the line their idea falls on. *"Saved cards — a later scope; this one takes a card per purchase"* is a limit. *"Advanced payment features"* is not.

- **<Thing>** — why it is not here, and what it waits for.

## 6. Assumptions

**Every assumption this scope makes that the project docs did not settle — major and minor alike.** Write each one as settled, marked **major** or **minor**, and the major ones with the trigger that made them major (`conventions` § Major assumptions).

- **<The assumption, as a decision.>** — major, hard to change later: <what will bind to it>. Confirmed.
- **<The assumption, as a decision.>** — major, user-facing: <what someone sees or does differently>. Confirmed.
- **<The assumption, as a decision.>** — major, cost: <what it adds to running or maintaining the product>. Confirmed.
- **<The assumption, as a decision.>** — minor.
- **<The assumption, as a decision.>** — minor.
```

### `docs/scope/tdd.md`

```markdown
# <Product> — Scope: <short-name> — TDD

## 1. Decisions

- **1.1** <The decision, in this scope's detail.> (refines project tdd 3.1)
- **1.2** <A decision this scope has to make that the project TDD leaves open.> (refines project tdd 2.1)

## 2. Data

**2.1 <Entity>** _(new)_ — what it holds and who sets it.

**2.2 <Entity>** _(existing, extended)_ — what this scope adds to it.
```

### `docs/scope/diagram.svg`

What this scope adds and where it attaches to what already exists, drawn — written whenever the scope TDD is, per `conventions` § Diagrams.

## Rules

- **Refine, never contradict.** A scope document says the same thing as its project parent, in more detail. If it says something different, that is step 5, not a sentence you write.
- **Cite the parent.** Every refined requirement and decision names the project requirement or decision it came from. A requirement with no parent is uncovered — raise it, never invent a parent to make it resolve.
- **More detail, not less.** If a line could be deleted and the project doc would still carry the same information, delete it and cite the parent instead. A scope PRD that reads as a summary of the project PRD has failed.
- **Never widen the scope yourself.** What is in is the operator's decision, settled in steps 2, 5 and 6. Everything you leave out goes in *Out of scope* so it is visible.
