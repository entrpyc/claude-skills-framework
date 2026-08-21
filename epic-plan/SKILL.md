---
name: epic-plan
description: Break the epic into stories and tickets — each story one feature of the epic, each ticket one reviewable, independently testable unit of behavior carrying specific references to named PRD and architecture sections. Use this after the epic PRD and epic architecture exist, or whenever the user wants to break the epic into build work. Trigger on "epic plan", "break this into stories", "break this into tickets", "plan the build".
---
# Epic plan

Produce `docs/epic-plan.md`: the plan covering the full epic, broken into **stories** and, under each story, **tickets**. This is Phase 5, and it's the plan the iteration cycle (Phases 6–8) walks one ticket at a time.

Two levels, two jobs:

- A **story** is one feature of the epic, described as something a user can do end-to-end. It's the unit the operator validates (Phase 8), so it has to be meaningful on its own — when its last ticket lands, something works that didn't before.
- A **ticket** is one reviewable, independently testable piece of a story. It's the unit that gets planned and built (Phases 6–7), and it is deliberately small.

The plan must be compatible with the epic architecture, carry no bloat and no overengineering, and be understandable as a product — while developed with enough technical judgment that each ticket genuinely contributes to completing its story.

Three rules govern how the plan is generated. Get these right and the rest of the system works; get them wrong and every downstream ticket inherits the mistake.

> Part of the **dev system** — see the `dev-system` skill for the full pipeline, the artifact map, and the principles that hold across every phase.

## Working conventions (shared across the dev system)

Artifacts under `docs/` by default:

- `docs/epic-prd.md`, `docs/epic-architecture.md`, `docs/prd.md`, `docs/architecture.md` — read these
- `docs/epic-plan.md` — this skill
- `docs/tickets/<SS>.<TT>-<slug>.md` — per-ticket working docs, one per ticket in this plan
- `docs/completed-epics/<NN>-<slug>/` — epics already delivered

**Numbering is the wiring.** Stories are `01`, `02`, …; tickets inside a story are `01`, `02`, …; and the ticket doc for story `SS` ticket `TT` is `docs/tickets/<SS>.<TT>-<slug>.md`. Get the numbering right here and every later phase can find its place on the filesystem without being told which epic is running.

Control comes from the operator reviewing this plan closely before any building starts. A weak plan is the most expensive thing to get wrong here, so make it reviewable.

**Reference links.** Write every section reference as a markdown link to the file and line it lives at — `[3.2.4](docs/prd.md#L142)`, `[epic-prd.md § In scope → Auth](docs/epic-prd.md#L34)` — with the visible text left as the plain reference. Resolve the line by finding the heading (`grep -n`); never guess it. See the `dev-system` skill for the full rule.

## Rule 1 — Stories are features, not work packages

Each story maps to a feature in the epic PRD's *In scope — core features*, and reads as something a user can do. Usually that's one story per in-scope feature; splitting a large feature into two stories is fine when each half is independently usable, and merging two tiny features into one story is fine when neither stands alone.

- **A story must end in a working state.** When its last ticket is done, the operator can validate it as a feature — not as a pile of half-wired parts.
- **A story is not a layer.** "The database work" is not a story; "a user can save and reopen a draft" is.
- If you can't say what a story lets someone do that they couldn't before, it isn't a story — it's a ticket that escaped.

## Rule 2 — Ticket granularity (the master knob)

Each ticket is **one reviewable unit of behavior**: testable in isolation, and small enough that its full diff fits in your head. This is the knob that matters most — set it right.

- Too big and the operator can't hold the diff, so review degrades to skimming and control is lost.
- Too small and the plan drowns in ceremony.
- Aim for a ticket that changes one observable behavior, could be tested on its own, and could be described in a sentence.

**Tickets must not introduce huge chunks of work.** A ticket that needs three paragraphs to describe, or that touches every layer at once, is two or more tickets — split it before the plan is presented, not after implementation discovers it. A story with a single enormous ticket is the clearest sign the knob is set wrong.

As a feel for size, not a law: most stories land at two to five tickets. One is fine for a genuinely small feature; past five or six, check whether you're really looking at two stories.

## Rule 3 — Per-ticket references

**Read the PRD and architecture once, during generation.** For each ticket, write the *specific references it needs* — named sections of the epic PRD / epic architecture / full-scope PRD / full-scope architecture, **not whole documents**. Each later iteration then reads only what its ticket points to, which is what keeps ticket planning cheap and focused.

- Reference named sections as links, e.g. "[epic-prd.md § In scope → Auth](docs/epic-prd.md#L34)", not "the PRD".
- Put references on **tickets**, not on stories — the ticket is what Phase 6 reads. A story carries one line naming the epic-PRD feature it delivers, and that's enough.
- After generating the plan, **spot-check a few references** by following them. A lazy or wrong reference propagates to every downstream ticket, so a few minutes here saves the whole chain — and since the links are resolved rather than guessed, following one is a click.

## Method

1. Read the epic PRD and epic architecture in full (and the full-scope docs as needed). This is the one pass where you read broadly.
2. Turn the epic's in-scope features into stories, ordered so the app keeps working as each lands (Rule 1).
3. Break each story into tickets, in build order, each satisfying Rule 2.
4. For each ticket, write what it delivers and the specific references from Rule 3.
5. Keep it high-level and product-legible — a reader should follow the arc of what's being built, not drown in implementation detail. No bloat, no tickets that exist only to be thorough.
6. Spot-check references, then present.

## Structure

```
# <Project> — Epic <NN> plan: <slug>

## Story 01 — <title>
**Delivers:** what a user can do end-to-end once this story is done.
**Feature:** <the epic-PRD feature this story delivers, linked>

### Ticket 01.01 — <title>
**Delivers:** one reviewable unit of behavior — what observably changes.
**References:** <named sections only, each linked to its line — e.g. [epic-architecture.md § Data model (epic)](docs/epic-architecture.md#L61); [epic-prd.md § In scope → X](docs/epic-prd.md#L18)>
**Notes:** <optional — only if this ticket carries a hard-to-reverse decision worth flagging up front>

### Ticket 01.02 — <title>
...

## Story 02 — <title>
...
```

Ticket headings carry the `<SS>.<TT>` number so the ticket doc path is unambiguous: Ticket 01.02 → `docs/tickets/01.02-<slug>.md`.

## Checkpoint

Link the plan and invite pushback specifically on **ticket granularity** — that's the knob most worth arguing about before the build starts — and on the **story split**, since stories are what gets validated and a badly drawn story hides a broken feature behind a green checklist. Confirm the reference spot-check passed. Keep the rest of the chat to what the operator wouldn't anticipate: a ticket that turned out much larger than its neighbours, an ordering forced by a dependency they may not expect, a story that couldn't be made independently validatable and why. Don't list the stories back at them — they're in the plan. (See *What goes in the chat* in the `dev-system` skill.) Once agreed, the iteration cycle walks the plan one ticket at a time, validating at each story boundary.

**Next step.** End the checkpoint with a single sentence naming what runs next, including which ticket it starts on — e.g. *"Next: Phase 6, `ticket-planning` for Ticket 01.01 — Playback shell."* Suggest it; don't run it.
