# The dev system

The dev system defines the iterative process of developing a product that the operator and Claude Code follow.

The goal of this system is to define a **single source of truth** — `project/prd` and `project/tdd` — and iterate the implementation by defining a scope of implementation and a plan, refining and reconciling differences along the way to keep the single source of truth accurate.

It eliminates assumptions and hallucinations from Claude by building only upon defined criteria, and reconciling differences by engaging with the operator: asking for a reconciliation approach — either updating the project requirements, or updating the code implementation.

## System structure

### `docs/project`

Contains full project product requirements and technical decisions.

| File                    | Contents                                                                                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/project/prd.md` | Product requirements document. Overview, functional requirements, non-functional requirements. This is the**what** of the project.                                         |
| `docs/project/tdd.md` | Technical decisions document. High level overview, infrastructure, tech stack, services, tools, running cost, performance requirements. This is the**how** of the project. |

### `docs/scope`

Contains product requirements, technical decisions, and implementation plan for the specified scope of implementation.

| File                   | Contents                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/scope/prd.md`  | Same as project PRD, but lists only the requirements for this scope, refined and more detailed. Never contradicts the full-scope PRD. |
| `docs/scope/tdd.md`  | Same as project TDD, but lists only the decisions for this scope, refined and more detailed. Never contradicts the full-scope TDD.    |
| `docs/scope/plan.md` | Implementation plan for this scope.                                                                                                   |

## System flow

| # | The operator asks for                         | Claude calls           | Produces                                  |
| - | --------------------------------------------- | ---------------------- | ----------------------------------------- |
| 1 | Information about a product                   | the `project` skill  | `project/prd.md` and `project/tdd.md` |
| 2 | A scope for specific requirements or features | the `scope` skill    | `scope/prd.md` and `scope/tdd.md`     |
| 3 | A plan                                        | the `plan` skill     | `scope/plan.md`                         |
| 4 | Specific steps from the plan to be built      | the `build` skill    | the code fulfilling the steps asked for   |
| 5 | The scope to be finalized                     | the `finalize` skill | the current scope, folded                 |

## Legend

| Term                             | Meaning                                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **operator**               | The user performing the prompts. Executes user-only operations, controls the system steps.                                                      |
| **claude**                 | Claude Code. Executes the skills the operator pulls, writes the documents and the code.                                                         |
| **skill**                  | One phase of the system —`project`, `scope`, `plan`, `build`, `finalize` — pulled by the operator, never chained automatically.     |
| **project**                | The full product: everything it is ever meant to be.                                                                                            |
| **scope**                  | The slice of the project being implemented right now, chosen by the operator.                                                                   |
| **prd**                    | Product requirements document — the **what**.                                                                                           |
| **tdd**                    | Technical decisions document — the**how**.                                                                                               |
| **plan**                   | The steps that implement the current scope.                                                                                                     |
| **single source of truth** | `project/prd.md` and `project/tdd.md` — what the product is and how it is built. Everything else is downstream of them.                    |
| **refining**               | Restating something from the project docs in more detail for a scope, without contradicting it.                                                 |
| **reconciling**            | Resolving a difference between the documents and the code by asking the operator which side changes — the requirements, or the implementation. |
| **folding**                | Closing out a scope by carrying its delivered state back into the project documents.                                                            |
