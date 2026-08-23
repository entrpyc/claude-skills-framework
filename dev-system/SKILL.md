---
name: dev-system
description: Explain and navigate the dev system — the controlled Claude Code workflow that runs a project from full-scope PRD, through operator-pulled epics, down to per-ticket implementation and validation. Use it to understand how the phases fit together, to orient when picking work back up ("where are we", "what phase now", "what runs next"), or to start a project on the system. Every other dev-system skill points here for the whole picture. Trigger on "dev system", "how does this workflow work", "where are we in the process", "what phase are we in".
---

# The dev system

Build projects heavily with Claude Code while keeping strong control and awareness over how development is done.

**Control comes from the operator staying engaged at each checkpoint.** The system creates the checkpoints; reading the output carefully and pushing back is what produces the control. Every phase ends by handing control back — none of them roll into the next, and **the operator pulls the next phase themselves.**

This skill is the map. It doesn't produce an artifact of its own — it tells you where you are and what holds true across all of it.

## The vocabulary

One idea applied at four widths: describe the thing, then cut it down until a piece is small enough to build and review in one sitting.

| Level | What it is | Scope |
|---|---|---|
| **Project** | Everything the project is ever meant to be. Its PRD and architecture are written once, with no phasing and no deferral. | The project |
| **Epic** | A working increment of the app, **scoped by the operator** — they say how big, what goes in, how far the architecture reaches, and how deep the requirements go. Carries **its own PRD and architecture**, scoped to the epic. | An increment |
| **Story** | One feature of the epic, described end-to-end. The unit of validation. | A feature |
| **Ticket** | One reviewable, independently testable piece of a story. Small on purpose. The unit of build. | A change |

Epics repeat until full scope is delivered. **Tickets are planned, built, and test-validated one at a time; story validation runs once per completed story.**

## Artifacts

Every level owns a directory, and **nothing ever moves.** A delivered epic is simply one whose stories are all done — there is no archive step.

```
docs/
  project/
    prd.md                        <- full scope, permanent
    architecture.md
  epics/
    epic-core-playback/           <- one folder per epic, kept forever
      prd.md
      architecture.md
      implementation-plan.md      <- stories, each broken into tickets
      stories/
        play-a-track/
          01-audio-element.md     <- ticket docs, numbered in build order
          02-transport-controls.md
    epic-search/
      ...
```

**`<epic>` means `docs/epics/epic-<name>/`** — the folder of the epic being worked on.

Naming: an epic folder is `epic-` plus a slug of its name; a story folder is a slug of the story's name; a ticket file is its number within the story plus a slug of its title. **Order lives in the plan, not in the folder names.**

`docs/` is the default root. Change it in each skill's Working conventions block if the project uses somewhere else.

## The pipeline

Each phase writes an artifact the next phase reads. **Every one is triggered by the operator.**

| # | Skill | Reads | Writes | Runs |
|---|-------|-------|--------|------|
| 1 | `full-scope-prd` | — | `docs/project/prd.md` | once per project |
| 2 | `full-scope-architecture` | project PRD | `docs/project/architecture.md` | once per project |
| 3 | `epic-prd` | project docs, earlier epics | `<epic>/prd.md` | once per epic |
| 4 | `epic-architecture` | project architecture, `<epic>/prd.md` | `<epic>/architecture.md` | once per epic |
| 5 | `epic-plan` | epic + project docs | `<epic>/implementation-plan.md` | once per epic |
| 6 | `plan-validation` | the plan, the epic docs | corrections to the plan | once per epic |
| 7 | `ticket-planning` | only the sections its ticket references | `<epic>/stories/<story>/<NN>-<ticket>.md` | once per ticket |
| 8 | `ticket-implementation` | the ticket's doc | code, tests, Edge cases, Implementation notes, manual checklist | once per ticket |
| 9 | `test-validation` | the ticket's tests, its criteria, the PRDs | test fixes, a verdict | once per ticket |
| 10 | `story-validation` | the plan, the architecture, every ticket doc in the story | `<epic>/implementation-plan.md` § Summary | once per story |

## Three loops

Phases 1–2 happen once. Everything after repeats, nested:

- **Per epic — phases 3–10.** The operator scopes the epic; the system builds it.
- **Per story — phases 7–10.** A story's tickets are built in order; when its last one is done, phase 10 validates the story as a whole.
- **Per ticket — phases 7–9.** Planning → implementation → test validation.

## References

**No links.** A reference is a plain label naming the document and the section — nothing more:

```
project prd 3.2.4
epic architecture § Data model (epic)
epic-core-playback prd § In scope
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
   - **cheaper now** — the option that gets this ticket done fastest.

   More options are welcome without a label. If the same option is genuinely both, say so on it and still offer a distinct alternative.
3. **Each option says what it commits to** in a line — what it makes easy later, and what it forecloses.
4. **Only ask what gates the work.** A question you could answer from the docs isn't a question; it's reading you skipped.

## Major assumptions

An assumption is **anything the work needs that the docs don't settle.** Every phase that makes one classifies it the same way:

**Major** — any one of these is enough:
- it could change the target architecture;
- it produces code later tickets won't anticipate;
- it's user-facing;
- it affects what running the application costs;
- **it gets harder to change as the codebase grows** — a data shape, a boundary, a naming or ownership convention, an interface other code will bind to. Cheap to decide once, expensive to unpick after twenty files depend on it.

**Minor** — everything else: not covered, but it contradicts nothing, isn't user-facing, isn't cost-impacting, and stays cheap to reverse.

When a call sits on the line, treat it as major. **Major assumptions get asked** (see above); **minor ones are listed, never surfaced.** Never leave an open question inside a written doc — docs record decisions.

## Metrics

Every ticket doc carries a `## Metrics` block. **Performance is measured against acceptance criteria, not against effort.**

```
## Metrics
- Planning started: <YYYY-MM-DD HH:MM>
- Implementation started: <YYYY-MM-DD HH:MM>
- Ticket closed: <YYYY-MM-DD HH:MM>
- Criteria met first pass: <n>/<total>
- Criteria needing rework: <n> — <which, one phrase each>
- Tests rewritten as false positives: <n>
```

Each phase stamps its own line as it starts, taking the real system time. Ticket planning creates the block; implementation and test validation fill the rest; story validation reads them across the story. A ticket that repeatedly misses criteria on the first pass is a planning signal, not a coding one.

## What goes in the chat

**The artifact is the deliverable. The chat is not a second copy of it, a summary of it, or a report on writing it.**

A checkpoint is **at most five lines**, and carries only:

- **What the operator wouldn't anticipate** — a constraint hit, a decision that closes off something they assumed was open, a cost, a departure from what was agreed. This is the main reason to write anything at all.
- **Where the artifact is.**

Then stop. Questions go through `AskUserQuestion`, not into the prose.

Never: summarize sections you just wrote, recap the request back, narrate how you got there, list files touched, restate a decision because it's important (it's written down — point at it), or add a closing offer of what you could do next.

**Nothing surprising to report is a one-line checkpoint, and that is the correct output.**

Three things are exempt from the five-line cap, because each is an interaction rather than a record: the **manual-validation checklist** (phase 8), a **hard-to-reverse decision**, and a **dead-end abort** with its options.

## Principles that hold across every phase

1. **Checkpoints, not deliveries.** Every phase ends by presenting its work, naming what's open, and handing control back. Never roll into the next phase, and **don't suggest one** — the operator decides what runs next and pulls it themselves.

2. **Altitude discipline.** Each phase works at one level. A PRD is *what and why*, never *how*. An architecture is structure and load-bearing choices, not detailed design. The implementation plan is product-legible stories and tickets, not implementation. Writing below your altitude pre-empts a decision the next phase should be making.

3. **The doc holds the work; the chat holds only what would otherwise be missed** — see above. This is the rule most often eroded.

4. **Never invent to paper over a gap.** A missing requirement, an ambiguous reference, an unstated assumption — surface it and ask. A fabricated answer propagates silently through every phase downstream.

5. **Ticket granularity is the master knob.** Set in phase 5, checked in phase 6. A ticket should change one observable behavior, be testable on its own, and have a diff that fits in your head. **A ticket carrying a huge chunk of work is a planning failure, not a big ticket** — split it.

6. **Anti-bloat, including here.** No ticket, abstraction, or section that exists only to be thorough. In implementation it hardens into a rule: **prefer under-achieving to over-engineering** — write the least code that satisfies the acceptance criteria, and record every edge it leaves uncovered in **Edge cases** rather than coding around it. Thin code plus a visible list of gaps is reviewable; thorough code isn't.

7. **Assumptions and edge cases are the record.** They are what makes thin code safe and what makes a fast loop reviewable. Never drop one to keep a doc tidy.

## Where am I?

**The artifacts are the state.** Orientation is reading the filesystem. Stop at the first thing missing:

| If this is missing | You're at |
|---|---|
| `docs/project/prd.md` | Phase 1 — `full-scope-prd` |
| `docs/project/architecture.md` | Phase 2 — `full-scope-architecture` |
| any epic folder with unfinished work | Phase 3 — `epic-prd` |
| `<epic>/architecture.md` | Phase 4 — `epic-architecture` |
| `<epic>/implementation-plan.md` | Phase 5 — `epic-plan` |
| the plan's `_Validated:_` stamp | Phase 6 — `plan-validation` |
| nothing — all present | the ticket loop, below |

**The active epic** is the one folder in `docs/epics/` with unfinished work; every other is read-only history.

**Inside the loop.** Take the plan's stories in order, and within each story its tickets in number order. Find the first unfinished ticket:

- No ticket doc → **phase 7**, `ticket-planning`.
- Doc exists, code isn't written or its manual checks haven't passed → **phase 8**, `ticket-implementation`.
- Code done, `## Metrics` has no false-positive line → **phase 9**, `test-validation`.
- Every ticket in the story done and the plan's `## Summary` doesn't cover it → **phase 10**, `story-validation`.
- Every story validated → the epic is done; the operator decides whether to cut another.

Joining an existing codebase is the same procedure — a repo with code but no `docs/project/prd.md` starts at phase 1.

**Report where you landed in one line, then stop.**
