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
    diagram.svg     <- the tdd's system diagram, drawn
  scope/
    prd.md          <- the current scope, the what, refined
    tdd.md          <- the current scope, the how, refined
    diagram.svg     <- the scope tdd's diagram, drawn
    plan.md         <- the steps that implement the current scope
```

### `docs/project`

Full project product requirements and technical decisions.

| File | Contents |
| ---- | -------- |
| `docs/project/prd.md` | Product requirements document. Overview, functional requirements, non-functional requirements. This is the **what** of the project. |
| `docs/project/tdd.md` | Technical decisions document. High level overview, infrastructure, tech stack, services, tools, running cost, performance requirements. This is the **how** of the project. |
| `docs/project/diagram.svg` | The system diagram from the project TDD, drawn as SVG. Always matches it. |

### `docs/scope`

Product requirements, technical decisions, and implementation plan for the specified scope of implementation.

| File | Contents |
| ---- | -------- |
| `docs/scope/prd.md` | Same as project PRD, but lists only the requirements for this scope, refined and more detailed. Never contradicts the full-scope PRD. |
| `docs/scope/tdd.md` | Same as project TDD, but lists only the decisions for this scope, refined and more detailed. Never contradicts the full-scope TDD. |
| `docs/scope/diagram.svg` | The diagram from the scope TDD, drawn as SVG. Always matches it. |
| `docs/scope/plan.md` | Implementation plan for this scope. |

## The source of truth

`docs/project/prd.md` and `docs/project/tdd.md`, `docs/project/diagram.svg` are the single source of truth **over the codebase too**. The code is evidence of what the software currently does. It is never authority for what the software is supposed to do — "the code does X" is a fact about the present, never a reason for X to be correct.

A difference between the code and the project documents is therefore an open decision, not an answer. It is never closed by picking the side that looks more sensible. It goes to the operator, in whatever phase trips over it, with two options: **update the document**, or **change the code** — and one of the two actually changes.

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

The system is five skills. Each one is a phase; each writes what the next one reads.

| Skill        | Does                                                                         | Reads                                       | Writes                                           | Runs                 |
| ------------ | ---------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------ | -------------------- |
| `project`  | Captures the full product with the operator                                  | —                                          | `docs/project/prd.md`, `docs/project/tdd.md`, `docs/project/diagram.svg` | once per project     |
| `scope`    | Defines the slice to build now, refining the project docs                    | project PRD, project TDD                    | `docs/scope/prd.md`, `docs/scope/tdd.md`, `docs/scope/diagram.svg`     | once per scope       |
| `plan`     | Breaks the scope into implementable steps                                    | scope PRD, scope TDD                        | `docs/scope/plan.md`                           | once per scope       |
| `build`    | Writes the code for the steps the operator points at                         | the plan, and the references its steps name | code, and the plan's status                      | many times per scope |
| `finalize` | Reconciles the code against the project docs, folds the scope back into them | the code, the project docs, the scope docs  | project doc updates; clears `docs/scope/`      | once per scope       |

`dev-system` — this skill — is the map over them. It writes nothing.

## Where am I?

The artifacts are the state. Read the filesystem and stop at the first thing missing.

| If this is missing                               | You are at                                                   |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `docs/project/prd.md`, `docs/project/tdd.md`, `docs/project/diagram.svg` | Step 1 —`project`                                         |
| `docs/scope/prd.md`, `docs/scope/tdd.md`, `docs/scope/diagram.svg`     | Step 2 —`scope`                                           |
| `docs/scope/diagram.svg` | The diagram from the scope TDD, drawn as SVG. Always matches it. |
| `docs/scope/plan.md`                           | Step 3 —`plan`                                            |
| nothing — all five present                      | Step 4 —`build`, on whatever steps the operator points at |
| nothing — and the plan is complete              | Step 5 —`finalize`                                        |

Report where you landed in one line, then stop. **Never pick the next step to build yourself** — the operator chooses what runs next and pulls it themselves.

## Legend

| Term                             | Meaning                                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **operator**               | The user performing the prompts. Executes user-only operations, controls the system steps.                                                      |
| **claude**                 | Claude Code. Executes the skills the operator pulls, writes the documents and the code.                                                         |
| **skill**                  | One phase of the system —`project`, `scope`, `plan`, `build`, `finalize` — pulled by the operator, never chained automatically.     |
| **project**                | The full product: everything it is ever meant to be.                                                                                            |
| **scope**                  | The slice of the project being implemented right now, chosen by the operator.                                                                   |
| **prd**                    | Product requirements document — the **what**.                                                                                             |
| **tdd**                    | Technical decisions document — the **how**.                                                                                               |
| **plan**                   | The steps that implement the current scope.                                                                                                     |
| **single source of truth** | `project/prd.md` and `project/tdd.md` — what the product is and how it is built. Everything else is downstream of them.                    |
| **refining**               | Restating something from the project docs in more detail for a scope, without contradicting it.                                                 |
| **reconciling**            | Resolving a difference between the documents and the code by asking the operator which side changes — the requirements, or the implementation. |
| **folding**                | Closing out a scope by carrying its delivered state back into the project documents.                                                            |
