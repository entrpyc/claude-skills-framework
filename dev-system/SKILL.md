---
name: dev-system
description: Explain and navigate the dev system — the iterative Claude Code workflow that keeps docs/project/prd.md and docs/project/tdd.md as the single source of truth, and delivers the product through operator-defined scopes, plans, and builds that refine and reconcile against them. Use it to understand how the phases fit together, to orient when picking work back up ("where are we", "what runs next"), or to start a project on the system. Every other dev-system skill points here for the whole picture. Trigger on "dev system", "how does this workflow work", "where are we in the process", "what phase are we in".
---
# The dev system

The dev system defines the iterative process of developing a product that the operator and Claude Code follow.

The goal of this system is to define a **single source of truth** — `project/prd` and `project/tdd` — and iterate the implementation by defining a scope of implementation and a plan, refining and reconciling differences along the way to keep the single source of truth accurate.

It eliminates assumptions and hallucinations from Claude by building only upon defined criteria, and reconciling differences by engaging with the operator: asking for a reconciliation protocol — either updating the project requirements, or updating the code implementation.

This skill is the map. It produces no artifact of its own — it tells you where you are and what holds across all of it.

## System structure

```
docs/
  project/
    prd.md          <- the whole project, the what
    tdd.md          <- the whole project, the how
    diagram.svg     <- the system, drawn
  scope/
    prd.md          <- the current scope, the what, refined
    tdd.md          <- the current scope, the how, refined
    diagram.svg     <- what this scope adds, drawn
    plan.md         <- the steps that implement the current scope
  design-references/  <- the operator's visual material; read-only, never wiped
```

### `docs/project`

Full project product requirements and technical decisions.

| File                                     | Contents                                                                                                                                                                         |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/project/prd.md`                                     | Product requirements document. Overview, functional requirements, non-functional requirements. This is the**what** of the project.                                         |
| `docs/project/tdd.md`                                     | Technical decisions document. High level overview, infrastructure, tech stack, services, tools, running cost, performance requirements. This is the**how** of the project. |
| `docs/project/diagram.svg` | The project system, drawn. |

### `docs/scope`

Product requirements, technical decisions, and implementation plan for the specified scope of implementation.

| File                       | Contents                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/scope/prd.md`      | Same as project PRD, but lists only the requirements for this scope, refined and more detailed. Never contradicts the full-scope PRD. |
| `docs/scope/tdd.md`      | Same as project TDD, but lists only the decisions for this scope, refined and more detailed. Never contradicts the full-scope TDD.    |
| `docs/scope/diagram.svg` | What this scope adds, drawn. |
| `docs/scope/plan.md`     | Implementation plan for this scope — and the record of what the build phase assumed and what it left uncovered.                      |

### `docs/design-references`

The operator's visual material — screenshots, mockups, brand and UI assets. **No skill writes here and `finalize` never deletes it.** It is read whenever the work is visual, and a reference in it outranks your own taste. See `conventions` § Design references.

## The source of truth

`docs/project/prd.md`, `docs/project/tdd.md` and `docs/project/diagram.svg` are the single source of truth **over the codebase too** — and every scope, plan and build downstream of them refines them rather than contradicting them.

A difference between the documents and the code is therefore an open decision, not an answer. It goes to the operator, in whatever phase trips over it, with two options: **update the document**, or **change the code**. See `conventions` § Reconciling — the rule and the two options are the same in every phase.

## System flow

Every phase is pulled by the operator. Never chain one into the next.

| # | The operator asks for                         | Call                   |
| - | --------------------------------------------- | ---------------------- |
| 1 | Information about a product                   | the `project` skill  |
| 2 | A scope for specific requirements or features | the `scope` skill    |
| 3 | A plan                                        | the `plan` skill     |
| 4 | Specific steps from the plan to be built      | the `build` skill    |
| 5 | The scope to be finalized                     | the `finalize` skill |

## Skills

The system is five phase skills, plus `conventions`, which all of them read first.

| Skill         | Does                                                                         | Reads                                       | Writes                                                                         | Runs                 |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ | -------------------- |
| `project`        | Captures the full product with the operator                                  | the existing code, where there is any       | `docs/project/prd.md`, `docs/project/tdd.md`, `docs/project/diagram.svg` | once per project     |
| `scope`          | Defines the slice to build now, refining the project docs                    | project PRD, project TDD, design references | `docs/scope/prd.md`, `docs/scope/tdd.md`, `docs/scope/diagram.svg`, and the project doc edits the operator chooses | once per scope       |
| `plan`           | Breaks the scope into implementable steps                                    | scope PRD, scope TDD, design references     | `docs/scope/plan.md`, and the scope PRD edits the operator chooses           | once per scope       |
| `build`          | Writes the code for the steps the operator points at                         | the plan, and the references its steps name | code; the plan's status, assumptions, edge cases and manual steps; and the scope PRD edits the operator chooses | many times per scope |
| `finalize`       | Reconciles the code against the project docs, folds the scope back into them | the code, the project docs, the scope docs  | the code fixes the operator chooses; project doc updates; clears `docs/scope/` | once per scope       |
| `conventions` | The rules every phase follows — asking, reconciling, major assumptions, the ceiling, design references, reference numbers, citing, status markers, reaching green, diagrams, chat | — | nothing | read by every phase |
| `refine-dev-system` | Refines the skills themselves against how they actually ran | past session transcripts, the skill files | its findings, and the skill edits the operator chooses | whenever the operator pulls it |
| `session-analyze` | Explains where the session running right now spent its wall clock, and which rule caused each step | this session's transcript, the skills it invoked | nothing — it reports in the chat | whenever the operator pulls it |

Four skills sit alongside the five phases, and none of them delivers a scope: **`conventions`** — the rules every phase follows, read before any of them run — **`dev-system`**, this skill, the map over the whole thing, **`session-analyze`**, which explains where one run's time went and what ordered it, and **`refine-dev-system`**, which turns many past runs into edits to the skills. The last is the only one that changes anything — the skills themselves, never the product.

## Where am I?

The artifacts are the state. Read the filesystem and stop at the first thing missing.

| If this is missing                                                             | You are at                                                       |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `docs/project/prd.md`, `docs/project/tdd.md`, `docs/project/diagram.svg` | Step 1 —`project`                                             |
| `docs/scope/prd.md`, `docs/scope/tdd.md`, `docs/scope/diagram.svg`       | Step 2 —`scope`                                               |
| `docs/scope/plan.md`                                                         | Step 3 —`plan`                                                |
| nothing — all five present                                                    | Step 4 —`build`, on whatever steps the operator points at     |
| nothing — and the plan is complete                                            | Step 5 —`finalize`                                            |

Report where you landed in one line, then stop. **Never pick the next step to build yourself** — the operator chooses what runs next and pulls it themselves.

## Legend

| Term                             | Meaning                                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **operator**               | The user performing the prompts. Executes user-only operations, controls the system steps.                                                      |
| **claude**                 | Claude Code. Executes the skills the operator pulls, writes the documents and the code.                                                         |
| **skill** | One phase of the system — `project`, `scope`, `plan`, `build`, `finalize` — pulled by the operator, never chained automatically. `conventions` and `dev-system` are read, not pulled; `session-analyze` and `refine-dev-system` are pulled, but sit outside the flow. |
| **project**                | The full product: everything it is ever meant to be.                                                                                            |
| **scope**                  | The slice of the project being implemented right now, chosen by the operator.                                                                   |
| **prd**                    | Product requirements document — the**what**.                                                                                             |
| **tdd**                    | Technical decisions document — the**how**.                                                                                               |
| **plan**                   | The steps that implement the current scope.                                                                                                     |
| **single source of truth** | `project/prd.md` and `project/tdd.md` — what the product is and how it is built. Everything else is downstream of them.                    |
| **refining**               | Restating something from the project docs in more detail for a scope, without contradicting it.                                                 |
| **reconciling**            | Resolving a difference between the documents and the code by asking the operator which side changes — the requirements, or the implementation. |
| **folding**                | Closing out a scope by carrying its delivered state back into the project documents.                                                            |
