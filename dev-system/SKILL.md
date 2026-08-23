---
name: dev-system
description: Explain and navigate the dev system — the controlled Claude Code workflow that runs a project from a full-scope PRD and architecture, through an operator-defined active scope, down to targeted implementation of groups, tasks, and individual acceptance criteria. Use it to understand how the phases fit together, to orient when picking work back up ("where are we", "what runs next"), or to start a project on the system. Every other dev-system skill points here for the whole picture. Trigger on "dev system", "how does this workflow work", "where are we in the process", "what phase are we in".
---
# The dev system

Build projects heavily with Claude Code while keeping strong control and awareness over how development is done.

**Control comes from the operator staying engaged at each checkpoint.** The system creates the checkpoints; reading the output carefully and pushing back is what produces the control. Every phase ends by handing control back — none of them roll into the next, and **the operator pulls the next phase themselves.**

This skill is the map. It doesn't produce an artifact of its own — it tells you where you are and what holds true across all of it.

## The vocabulary

One idea applied at four widths: describe the thing, then cut it down until a piece is small enough to build and review in one sitting.

| Level                  | What it is                                                                                                                                                                                                 | Scope        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **Project**      | Everything the project is ever meant to be. Its PRD and architecture are written once, with no phasing and no deferral.                                                                                    | The project  |
| **Active scope** | The features being built right now,**chosen by the operator**. Carries its own PRD, architecture, and implementation plan — each a *more detailed* view of full scope, never a contradicting one. | An increment |
| **Group**        | One feature of the active scope, described end-to-end. The unit that has to work when its last task lands.                                                                                                 | A feature    |
| **Task**         | One reviewable, independently testable piece of a group. Small on purpose. The unit of build.                                                                                                              | A change     |
| **Criterion**    | One observable acceptance criterion of a task. The smallest addressable unit — implementation can be pointed at a single one.                                                                             | A behavior   |

Active scopes repeat until full scope is delivered.

## Artifacts

```
docs/
  project/
    prd.md                    <- full scope, permanent
    architecture.md           <- full scope, permanent
  active-scope/
    prd.md                    <- the current scope, in detail
    architecture.md
    implementation-plan.md    <- groups -> tasks -> acceptance criteria, and their status
  design-references/          <- operator-supplied visual references
```

`docs/` is the default root. Change it in each skill's *Working conventions* block if the project uses somewhere else.

**`docs/active-scope/` holds exactly one scope at a time, and it is wiped when the next one starts.** The delivered work lives in two places instead: the codebase, and `docs/project/prd.md`, into which the delivery status is folded before the wipe. There is no per-scope archive — see *The scope cycle*.

### design-references

Operator-supplied visual references — screenshots, mockups, brand and UI material. **No skill ever writes here.** Read it when the work is visual: the active-scope PRD reads it for what the interface is meant to be, implementation reads it for what to build against. A reference here outranks your own taste, and is cited like any other section (`design-references/checkout-mock.png`). If the folder is empty, that is not a gap to fill by inventing one.

## The pipeline

Each phase writes an artifact the next phase reads. **Every one is triggered by the operator.**

| # | Skill                           | Reads                                            | Writes                                         | Runs                 |
| - | ------------------------------- | ------------------------------------------------ | ---------------------------------------------- | -------------------- |
| 1 | `full-scope-prd`              | —                                               | `docs/project/prd.md`                        | once per project     |
| 2 | `full-scope-architecture`     | project PRD                                      | `docs/project/architecture.md`               | once per project     |
| 3 | `active-scope-prd`            | project docs, the code, design-references        | `docs/active-scope/prd.md`                   | once per scope       |
| 4 | `active-scope-architecture`   | project architecture, active-scope PRD, the code | `docs/active-scope/architecture.md`          | once per scope       |
| 5 | `active-scope-plan`           | both PRDs, both architectures                    | `docs/active-scope/implementation-plan.md`   | once per scope       |
| 6 | `active-scope-implementation` | only the references its target names             | code, tests, and the plan's status and records | many times per scope |

Phases 1–2 happen once. Phases 3–5 run once per scope. Phase 6 runs as often as the operator points it at something.

## The refinement rule

This is the spine of the system, and phases 3, 4, and 5 all enforce it.

**An active-scope document never contradicts its full-scope counterpart. It refines it.** Every statement in an active-scope doc stands in exactly one of three relationships to full scope:

- **Refines** — it narrows a full-scope statement into something buildable, adding the detail full scope deliberately doesn't carry. It cites its parent by number or label. **This is what nearly every line should be.**
- **Contradicts** — full scope says otherwise. **Never allowed to stand silently.** Either the active-scope doc is wrong and gets fixed, or full scope is out of date and the operator is told. Updating full scope is a separate, deliberate act — never a side effect of scoping.
- **Uncovered** — nothing in full scope is its parent. Either full scope has a gap (raise it) or scope crept in (drop it). **Never invent a full-scope parent to make it resolve.**

The detail test, applied line by line: **if a line could be deleted and its full-scope parent would still carry the same information, delete it and cite the parent instead.** An active-scope doc that reads as a summary of full scope has failed — it is meant to be the more detailed document, not the shorter one.

## References

**No links.** A reference is a plain label naming the document and the section — nothing more:

```
project prd 3.2.4
project architecture § Key technology choices
active-scope prd 5 § Interface detail → Checkout
design-references/checkout-mock.png
```

Line-anchored links rot the moment anything above them shifts, and a stale link reads as checked when it isn't. A label a reader can search for is worth more than a link that lands in the wrong place.

Three rules:

- **Name a section that exists.** Confirm the heading with `grep` before citing it. A reference to a section that isn't there is the same failure a broken link was.
- **Cite the smallest section that carries the fact** — a numbered requirement, not the document.
- **Keep labels stable.** Renaming a heading breaks every reference into it, so rename deliberately and fix what pointed at it.

## Asking the operator

Questions are **asked, not printed.** Use the `AskUserQuestion` tool — never a numbered list in chat that the operator has to answer in prose.

Four rules hold for every question set, in every phase:

1. **At most 5 questions per set.** If you have more, the extras aren't major — decide them yourself and record them as minor. Ask everything in one pass rather than trickling.
2. **Every question carries options, and two labels always exist:**

   - **future-proof** — the option that costs more now and is cheaper to live with as the codebase grows.
   - **cheaper now** — the option that gets this work done fastest.

   More options are welcome without a label. If the same option is genuinely both, say so on it and still offer a distinct alternative.
3. **Each option says what it commits to** in a line — what it makes easy later, and what it forecloses.
4. **Only ask what gates the work.** A question you could answer from the docs isn't a question; it's reading you skipped.

## Major assumptions

An assumption is **anything the work needs that the docs don't settle.** Every phase that makes one classifies it the same way:

**Major** — any one of these is enough:

- it could change the target architecture;
- it produces code later tasks won't anticipate;
- it's user-facing;
- it affects what running the application costs;
- **it gets harder to change as the codebase grows** — a data shape, a boundary, a naming or ownership convention, an interface other code will bind to. Expensive to unpick after twenty files depend on it.

**Minor** — everything else: not covered, but it contradicts nothing, isn't user-facing, isn't cost-impacting, and stays cheap to reverse.

When a call sits on the line, treat it as major. **Major assumptions get asked** (see above); **minor ones are listed, never surfaced.** Never leave an open question inside a written doc — docs record decisions.

## What goes in the chat

**The artifact is the deliverable. The chat is not a second copy of it, a summary of it, or a report on writing it.**

A checkpoint is **at most five lines**, and carries only:

- **What the operator wouldn't anticipate** — a constraint hit, a decision that closes off something they assumed was open, a cost, a departure from what was agreed. This is the main reason to write anything at all.
- **Where the artifact is.**

Then stop. Questions go through `AskUserQuestion`, not into the prose.

Never: summarize sections you just wrote, recap the request back, narrate how you got there, list files touched, restate a decision because it's important (it's written down — point at it), or add a closing offer of what you could do next.

Three things are exempt from the five-line cap, because each is an interaction rather than a record: the **manual-validation checklist** (phase 6), a **hard-to-reverse decision**, and a **dead-end abort** with its options.

## The scope cycle

A scope is delivered when every acceptance criterion in `docs/active-scope/implementation-plan.md` is checked. Starting the next one is a deliberate act by the operator, and `active-scope-prd` handles it in one move: **fold the delivered status back into `docs/project/prd.md`, then wipe `docs/active-scope/` and write the new PRD.**

Folding back means marking, on the full-scope requirements the finished scope refined, that they are now built — nothing more. **It is a status update, not a rewrite:** never change what a full-scope requirement says while folding, and never delete one because it shipped.

The cost of this design is that a delivered scope's PRD, architecture, and plan are gone once wiped. That is accepted: **the code is the record of what was built, and `docs/project/prd.md` is the record of what is left.** It also makes the fold-back load-bearing — a scope wiped without folding back loses the only durable trace that its work happened, so **the wipe never runs first.**

## Principles that hold across every phase

1. **Checkpoints, not deliveries.** Every phase ends by presenting its work, naming what's open, and handing control back. Never roll into the next phase, and **don't suggest one** — the operator decides what runs next and pulls it themselves.
2. **Refine, never contradict.** See *The refinement rule*. A contradiction found anywhere — in a doc, in a plan, in code — is raised, not resolved by quietly picking a side.
3. **Altitude discipline.** Each phase works at one level. A PRD is *what and why*, never *how*. An architecture is structure and load-bearing choices, not detailed design. The implementation plan is product-legible groups and tasks, not implementation. Writing below your altitude pre-empts a decision the next phase should be making.
4. **The doc holds the work; the chat holds only what would otherwise be missed** — see above. This is the rule most often eroded.
5. **Never invent to paper over a gap.** A missing requirement, an ambiguous reference, an unstated assumption — surface it and ask. A fabricated answer propagates silently through every phase downstream.
6. **Task granularity is the master knob.** Set in phase 5. A task should change one observable behavior, be testable on its own, and have a diff that fits in your head. **A task carrying a huge chunk of work is a planning failure, not a big task** — split it.
7. **Anti-bloat, including here.** No task, abstraction, or section that exists only to be thorough. In implementation it hardens into a rule: **prefer under-achieving to over-engineering** — write the least code that satisfies the acceptance criteria, and record every edge it leaves uncovered in the task's **Edge cases** rather than coding around it. Thin code plus a visible list of gaps is reviewable; thorough code isn't.
8. **Assumptions and edge cases are the record.** They are what makes thin code safe and what makes a fast loop reviewable. Never drop one to keep a doc tidy.

## Where am I?

**The artifacts are the state.** Orientation is reading the filesystem. Stop at the first thing missing:

| If this is missing                           | You're at                                                                     |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| `docs/project/prd.md`                      | Phase 1 —`full-scope-prd`                                                  |
| `docs/project/architecture.md`             | Phase 2 —`full-scope-architecture`                                         |
| `docs/active-scope/prd.md`                 | Phase 3 —`active-scope-prd`                                                |
| `docs/active-scope/architecture.md`        | Phase 4 —`active-scope-architecture`                                       |
| `docs/active-scope/implementation-plan.md` | Phase 5 —`active-scope-plan`                                               |
| nothing — all three present                 | Phase 6 —`active-scope-implementation`, on whatever the operator points at |

If every criterion in the plan is checked, the scope is delivered and the operator decides whether to define the next one.

**Never pick the next implementation target yourself.** Phase 6 is aimed by the operator at a group, a task, or specific criteria. When asked where things stand, report the first group with unchecked criteria and stop — choosing what to build next is theirs, not a recommendation to volunteer.

Joining an existing codebase is the same procedure — a repo with code but no `docs/project/prd.md` starts at phase 1.

**Report where you landed in one line, then stop.**
