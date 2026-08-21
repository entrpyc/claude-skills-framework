---
name: dev-system
description: Explain and navigate the dev system — the controlled Claude Code workflow that runs a project from full-scope PRD, through repeatable epics, down to per-ticket implementation. Use it to understand how the phases fit together, to orient when picking work back up ("where are we", "what phase now", "what runs next"), or to start a project on the system. Every other dev-system skill points here for the whole picture. Trigger on "dev system", "how does this workflow work", "where are we in the process", "what phase are we in", "what's the next phase".
---

# The dev system

Build projects heavily with Claude Code while keeping strong control and awareness over how development is done.

**Control comes from the operator staying engaged at each checkpoint.** The system creates the checkpoints; reading the output carefully and pushing back is what produces the control. Every phase below ends by handing control back deliberately — none of them roll straight into the next.

This skill is the map. It doesn't produce an artifact of its own — it tells you where you are, what runs next, and what holds true across all of it.

## The vocabulary

The whole system is one idea applied at four widths: describe the thing, then cut it down until a piece is small enough to build and review in one sitting.

| Level | What it is | Scope |
|---|---|---|
| **Project** | Everything the project is ever meant to be. Its PRD and architecture are written once, with no phasing and no deferral. | The project |
| **Epic** | The ~20% of remaining functionality carrying ~80% of remaining value — or the specific feature(s) the operator names. Carries **its own PRD and its own architecture**, in the same shape as the project's, scoped to the epic. | A working increment of the app |
| **Story** | One feature of the epic, described end-to-end. The unit of validation. | A feature |
| **Ticket** | One reviewable, independently testable piece of a story. Small on purpose. The unit of build. | A change |

Epics repeat until full scope is delivered. Stories break an epic down; tickets break a story down. **Tickets are planned and implemented one at a time; validation runs once per completed story**, not per ticket.

## Artifacts

Every level owns a directory, and **nothing ever moves.** An epic is written where it will live forever, so a delivered epic is simply one whose stories are all done — there is no archive step and no set of canonical paths that get swapped between epics.

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
        resume-where-i-left-off/
          01-position-store.md
    epic-search/                  <- the next epic, cut when the last one finished
      prd.md
      ...
```

Throughout these skills, **`<epic>` is shorthand for `docs/epics/epic-<name>/`** — the folder of the epic being worked on. So `<epic>/prd.md` is the epic PRD, and `<epic>/stories/<story>/<NN>-<ticket>.md` is a ticket doc.

Naming: an epic folder is `epic-` plus a slug of the epic's name; a story folder is a slug of the story's name, matching what the implementation plan calls it; a ticket file is its number within the story plus a slug of its title. **Order lives in the plan, not in the folder names** — `implementation-plan.md` lists stories in build order, and ticket numbers give the order inside each story.

`docs/` is the default root. If a project uses somewhere else, change it in each skill's Working conventions block and stay consistent — the pipeline connects through these paths.

## The pipeline

Each phase writes an artifact the next phase reads.

| # | Skill | Reads | Writes | Runs |
|---|-------|-------|--------|------|
| 1 | `full-scope-prd` | — | `docs/project/prd.md` | once per project |
| 2 | `full-scope-architecture` | project PRD | `docs/project/architecture.md` | once per project |
| 3 | `epic-prd` | project docs, earlier epics | `<epic>/prd.md` | once per epic |
| 4 | `epic-architecture` | project architecture, `<epic>/prd.md`, earlier epics | `<epic>/architecture.md` | once per epic |
| 5 | `epic-plan` | epic + project docs | `<epic>/implementation-plan.md` | once per epic |
| 6 | `ticket-planning` | only the sections its ticket references | `<epic>/stories/<story>/<NN>-<ticket>.md` | once per ticket |
| 7 | `ticket-implementation` | the ticket's doc | code, tests, the ticket doc's Edge cases + Implementation notes, manual-validation checklist | once per ticket |
| 8 | `story-validation` | the plan, the architecture, every ticket doc in the story folder | validation notes (chat only) | once per story |

## Three loops

Phases 1–2 happen once for the project. Everything after them repeats, nested:

- **Per epic — phases 3–8.** An epic is a working increment of the app. Phase 3 either cuts the next ~20% from what *remains undelivered*, or scopes the feature(s) the operator named — which is why the first epic and the fifth run identically: only the input differs.
- **Per story — phases 6–8.** A story's tickets are planned and built in order; when its last ticket is done, phase 8 validates the story as a whole.
- **Per ticket — phases 6–7.** Every ticket runs **planning → implementation**, in that order, and then the next ticket starts.

When the last story of an epic validates, the loop closes back to phase 3 and the next epic is cut into a new folder beside it.

## Reference links

Every reference to a numbered section or a named heading — in a written artifact and in what you present to the operator — is a markdown link to the file and line it lives at, so it can be opened rather than hunted for:

```
[3.2.4](docs/project/prd.md#L142)
[epic architecture § Data model (epic)](docs/epics/epic-search/architecture.md#L61)
[epic-core-playback § In scope](docs/epics/epic-core-playback/prd.md#L28)
```

Four rules keep them worth trusting:

- **Resolve every link, never guess the line.** Find the heading first (`grep -n "^### 3.2.4" docs/project/prd.md`) and use what it returns. A link to a plausible-looking line is worse than a bare number, because it reads as checked when it isn't.
- **Anchor on the heading line**, not the sentence you're borrowing from. Headings survive edits to the prose beneath them; sentences shift by a line whenever anything above them grows.
- **Keep the visible text the reference itself** — the number or the section name, exactly as you would have written it unlinked. The document has to still read correctly wherever links don't render.
- **Treat them as a snapshot, not a guarantee.** A renumber or a rewrite upstream silently rots every link into it. This is why the PRD phases re-open each reference during their duplicate & reference audit instead of trusting the link text, and why a doc you edit is a reason to re-resolve the links pointing into it.

Paths are relative to the repo root, matching the artifact map above. Because epic folders never move, a link written into one epic still resolves from the next one — which is what makes citing an earlier epic cheap.

## Where am I?

**The artifacts are the state.** Nothing else tracks progress, so orientation is just reading the filesystem. Walk down and stop at the first thing missing:

| If this is missing | You're at |
|---|---|
| `docs/project/prd.md` | Phase 1 — `full-scope-prd` |
| `docs/project/architecture.md` | Phase 2 — `full-scope-architecture` |
| any epic folder with unfinished work | Phase 3 — `epic-prd`, cutting the next epic |
| `<epic>/architecture.md` | Phase 4 — `epic-architecture` |
| `<epic>/implementation-plan.md` | Phase 5 — `epic-plan` |
| nothing — all present | the story/ticket loop, below |

**Finding the active epic.** Epics are cut one at a time, so at most one folder in `docs/epics/` has unfinished work — that's the active one. Every other folder is a delivered epic and is read-only history. If every epic is finished, the next phase is 3.

**Inside the loop.** Take the plan's stories in the order it lists them, and within each story its tickets in number order. Find the first ticket that isn't finished:

- No `<epic>/stories/<story>/<NN>-<ticket>.md` for it → **phase 6**, `ticket-planning`.
- Its ticket doc has acceptance criteria, but the code isn't written or its manual checks haven't passed → **phase 7**, `ticket-implementation`.
- **Every ticket in the story is done and validation hasn't run for it** → **phase 8**, `story-validation` for that story.
- **Every story in the plan is validated** → the epic is done. Go back to **phase 3**; `epic-prd` cuts the next epic into a new folder.

Joining an existing codebase is the same procedure — a repo with code but no `docs/project/prd.md` starts at phase 1, and phase 3's stock-take is what reconciles the docs with what's already built.

**Report where you landed and what runs next — then stop.** Say it in the same shape every phase uses to close: one sentence, e.g. *"Next: Phase 4, `epic-architecture`, since the epic PRD is written but its architecture isn't."* Advancing a phase is the operator's call. Auto-running the next phase is exactly the skimming risk the checkpoints exist to prevent.

## What goes in the chat

**The artifact is the deliverable; the chat is not a second copy of it.** Every phase writes a doc (or code) the operator reads for themselves, so chat output stays minimal and carries only what reading the artifact wouldn't give them:

- **What they wouldn't anticipate.** Something the work discovered — a constraint hit, a decision that closes off what they probably assumed was open, a cost or a dependency that surprises, a place the doc had to depart from what was agreed. **This is the main reason to write anything at all**, and it's what the operator is scanning your message for.
- **Questions that gate the work** — major assumptions, dead-end options — as short numbered questions, each carrying a suggested answer.
- **Where the artifact is**, as a link, and **the one sentence naming what runs next.**

Everything else belongs in the doc. Don't summarize the sections you just wrote, don't recap the operator's own request back at them, don't narrate how you got there, and don't repeat a decision in chat merely because it's important — if it's important it's already written down, and a pointer to it is enough. When nothing surprising came up, a checkpoint of two lines is the correct output, not a lazy one.

Two exceptions, both from the ticket loop: the **manual-validation checklist** (phase 7) is chat output by nature — it's a list of actions for the operator, not a record — and is never compressed; and a **hard-to-reverse decision** gets whatever space it needs, since that's the unanticipated thing itself.

## Principles that hold across every phase

1. **Checkpoints, not deliveries.** Every phase ends by presenting its work, naming the open questions and assumptions, and handing control back. Never roll from one phase into the next unprompted — and always close with **one sentence naming what runs next**, so the operator knows where the pipeline stands without it advancing on its own.

2. **Altitude discipline.** Each phase works at one level. A PRD — project or epic — is *what and why*, never *how*. An architecture is structure and load-bearing choices, not detailed design. The implementation plan is product-legible stories and tickets, not implementation. Writing below your altitude pre-empts a decision the next phase should be making on its own terms — which is the most common way this system degrades.

3. **The doc holds the work; the chat holds only what would otherwise be missed** — see *What goes in the chat* above. Output stays small and high-impact so nothing gets skimmed and the operator always has a real chance to respond, with the two exceptions named there.

4. **Never invent to paper over a gap.** A missing requirement, an ambiguous reference, an unstated assumption — surface it and ask. A fabricated answer propagates silently through every phase downstream.

5. **Ticket granularity is the master knob.** It's set in phase 5, and it decides whether review is real or theatre: a ticket should change one observable behavior, be testable on its own, and have a diff that fits in your head. **A ticket carrying a huge chunk of work is a planning failure, not a big ticket** — split it. Per-ticket references keep each iteration reading narrowly, and a lazy reference propagates to every ticket that inherits it, so they're worth spot-checking.

6. **Anti-bloat, including here.** No ticket, abstraction, or section that exists only to be thorough. That applies to these skills too — if one feels heavy for your project, trim it. In implementation (phase 7) it hardens into a rule: **prefer under-achieving to over-engineering** — write the least code that satisfies the acceptance criteria, and record every edge that leaves uncovered in the ticket doc's **Edge cases** rather than coding around it. Thin code plus a visible list of gaps is reviewable; thorough code isn't.
