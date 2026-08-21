---
name: epic-plan
description: Break the epic into stories and tickets — each story one feature of the epic, each ticket one reviewable, independently testable unit of behavior carrying specific references to named PRD and architecture sections — plus a background-research list naming what the operator should learn to be able to review the epic's work. Use this after the epic PRD and epic architecture exist, or whenever the user wants to break the epic into build work. Trigger on "epic plan", "implementation plan", "break this into stories", "break this into tickets", "plan the build".
---
# Epic plan

Produce `<epic>/implementation-plan.md`: the plan covering the full epic, broken into **stories** and, under each story, **tickets**. This is Phase 5, and it's the plan the iteration cycle (Phases 6–8) walks one ticket at a time.

Two levels, two jobs:

- A **story** is one feature of the epic, described as something a user can do end-to-end. It's the unit the operator validates (Phase 8), so it has to be meaningful on its own — when its last ticket lands, something works that didn't before.
- A **ticket** is one reviewable, independently testable piece of a story. It's the unit that gets planned and built (Phases 6–7), and it is deliberately small.

The plan must be compatible with the epic architecture, carry no bloat and no overengineering, and be understandable as a product — while developed with enough technical judgment that each ticket genuinely contributes to completing its story.

Three rules govern how the plan is generated. Get these right and the rest of the system works; get them wrong and every downstream ticket inherits the mistake.

> Part of the **dev system** — see the `dev-system` skill for the full pipeline, the artifact map, and the principles that hold across every phase.

## Working conventions (shared across the dev system)

`<epic>` means `docs/epics/epic-<name>/` — the folder of the epic being planned. Within it:

- `<epic>/prd.md`, `<epic>/architecture.md` — read these, plus `docs/project/prd.md` and `docs/project/architecture.md` as needed
- `<epic>/implementation-plan.md` — this skill
- `<epic>/stories/<story>/<NN>-<ticket>.md` — per-ticket working docs, one per ticket in this plan
- `docs/epics/` — the other epics, kept in place as the record of what already runs

**The plan is what names the folders.** A story's folder is the slug of its title, and a ticket's file is its number within the story plus the slug of its title:

```
## Story — Resume where I left off        ->  <epic>/stories/resume-where-i-left-off/
### Ticket 01 — Position store            ->  <epic>/stories/resume-where-i-left-off/01-position-store.md
### Ticket 02 — Restore on load           ->  <epic>/stories/resume-where-i-left-off/02-restore-on-load.md
```

**Order lives in this document, not in the folder names.** Stories are built in the order the plan lists them; tickets are built in their number order inside a story. Keep titles short enough to make a readable slug, and don't renumber a ticket once its doc exists.

Control comes from the operator reviewing this plan closely before any building starts. A weak plan is the most expensive thing to get wrong here, so make it reviewable.

**Reference links.** Every section reference is a markdown link to the file and the line its heading sits on — `[3.2.4](docs/project/prd.md#L142)` — with the visible text left as the plain reference. Resolve the line with `grep -n`; never guess it. Full rule in the `dev-system` skill.

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

**Read the PRD and architecture once, during generation.** For each ticket, write the *specific references it needs* — named sections of the epic PRD / epic architecture / project PRD / project architecture, **not whole documents**. Each later iteration then reads only what its ticket points to, which is what keeps ticket planning cheap and focused.

- Reference named sections as links, e.g. "[epic prd § In scope → Auth](docs/epics/epic-search/prd.md#L34)", not "the PRD".
- Put references on **tickets**, not on stories — the ticket is what Phase 6 reads. A story carries one line naming the epic-PRD feature it delivers, and that's enough.
- After generating the plan, **spot-check a few references** by following them. A lazy or wrong reference propagates to every downstream ticket, so a few minutes here saves the whole chain — and since the links are resolved rather than guessed, following one is a click.

## Method

1. Read the epic PRD and epic architecture in full (and the project docs as needed). This is the one pass where you read broadly.
2. Turn the epic's in-scope features into stories, ordered so the app keeps working as each lands (Rule 1).
3. Break each story into tickets, in build order, each satisfying Rule 2.
4. For each ticket, write what it delivers and the specific references from Rule 3.
5. Write the **Background to research** list from what the tickets actually lean on — see the section below. It comes last in the writing, first in the document.
6. Keep it high-level and product-legible — a reader should follow the arc of what's being built, not drown in implementation detail. No bloat, no tickets that exist only to be thorough.
7. Spot-check references, then present.

## Structure

```
# <Project> — Epic plan: <name>

## Background to research
Technologies, services, methodologies, and concepts this epic introduces
that the operator should learn in order to review its work. One entry per
topic — see the section of the same name below for the rules and shape.

## Story — <title>
**Delivers:** what a user can do end-to-end once this story is done.
**Feature:** <the epic-PRD feature this story delivers, linked>

### Ticket 01 — <title>
**Delivers:** one reviewable unit of behavior — what observably changes.
**References:** <named sections only, each linked to its line — e.g. [epic architecture § Data model (epic)](docs/epics/epic-search/architecture.md#L61); [epic prd § In scope → X](docs/epics/epic-search/prd.md#L18)>
**Notes:** <optional — only if this ticket carries a hard-to-reverse decision worth flagging up front>

### Ticket 02 — <title>
...

## Story — <title>
...

## Summary
Left out here — `story-validation` (Phase 8) appends this section as each
story completes, and it becomes the epic's record of what actually exists.
```

Story and ticket titles are what the folders get named after, so write them as titles a slug survives — see *Working conventions* above.

**Don't write the Summary.** It's listed above so the plan's final shape is visible, but it records what was *delivered*, which nothing knows yet at planning time. Phase 8 opens it after the first story is validated.

## Background to research

**Control depends on the operator understanding what they're reviewing.** A plan they can't evaluate produces approval by default, which is the failure this whole system exists to prevent — so the plan names the gaps in their knowledge that this epic's work will sit in. This section is written **for the operator**, and it's the one part of the document that asks something of them before building starts.

What belongs in it — anything this epic leans on that can't be assumed known from what's already been built:

- **Technologies** the epic introduces — a runtime, a datastore, a protocol, a language feature the code will now depend on.
- **Third-party software and services** it pulls in — a library, an API, a hosted service, including its pricing or rate-limit model where that shapes the design.
- **Methodologies and practices** the work assumes — an approach to testing, a migration strategy, a deployment model, a security practice.
- **Patterns and concepts** the architecture picked — what a queue actually guarantees, what eventual consistency costs, why a structure was chosen over the obvious one.

Four rules keep it worth reading:

1. **Only what this epic adds.** Something an earlier epic already used and the operator has already reviewed doesn't come back — unless this epic uses it in a way it wasn't used before, in which case name only the new part. The list should shrink as the project goes; a long one late in a project usually means it's being padded. Use the repo as the signal: a library already in the dependency list and worked with across earlier epics isn't news.
2. **Scope each entry to what the review needs, not to the subject.** "How Postgres advisory locks behave when a connection drops" is an entry; "learn Postgres" is not. The test is whether reading it would let the operator look at the resulting diff and tell whether it's right.
3. **Say which depth is needed**, because the two cost very different amounts of their time:
   - *Recognize* — enough to follow the diff and know what the code is doing.
   - *Judge* — enough to push back on the choice itself. Reserve it for hard-to-reverse decisions and anything expensive to get wrong.
4. **Name real sources; never invent one.** Point at the official documentation, the project's README, the specification — by name. **Don't fabricate a URL, a title, or a chapter**: a named source they can search for beats a precise-looking link that doesn't exist. If you don't know where the good explanation lives, say what to search for instead.

One entry per line, in the shape below — it's a scan, not a syllabus:

```
- **<topic>** — <what it is, one line>. **Needed for:** <the story or ticket that uses it>. **Understand:** <the specific thing, at review depth>. **Depth:** recognize | judge. **Source:** <named source, or what to search for>.
```

> - **Server-sent events** — a one-way HTTP stream the server pushes to a client. **Needed for:** Story — Live results, Ticket 02. **Understand:** how reconnection and event IDs work, and why this was picked over WebSockets. **Depth:** judge — it's the hardest choice in this epic to reverse. **Source:** the MDN page on EventSource.
> - **`pg_advisory_lock`** — Postgres session-scoped locking, used to serialize index writes. **Needed for:** Story — Search, Ticket 03. **Understand:** that the lock dies with the connection, and what that means if a worker crashes mid-write. **Depth:** recognize. **Source:** the Postgres docs on advisory locks.

Write this **after** the tickets exist, so you're naming what the plan actually leans on rather than what the epic sounded like it would. If the operator already knows an entry, they strike it — that's cheaper than guessing at what they know. **An empty list is a real result** when an epic introduces nothing new; say so rather than manufacturing entries.

## Checkpoint

Two things in this plan ask something of the operator before building starts, and both belong in the checkpoint: **the research list** — point at it, say roughly how much reading it represents, and flag any entry marked *judge*, since that's where they'll need to be able to argue with a choice rather than just follow it — and **the granularity of the work**.

Link the plan and invite pushback specifically on **ticket granularity** — that's the knob most worth arguing about before the build starts — and on the **story split**, since stories are what gets validated and a badly drawn story hides a broken feature behind a green checklist. Confirm the reference spot-check passed. Keep the rest of the chat to what the operator wouldn't anticipate: a ticket that turned out much larger than its neighbours, an ordering forced by a dependency they may not expect, a story that couldn't be made independently validatable and why. Don't list the stories back at them — they're in the plan. (See *What goes in the chat* in the `dev-system` skill.) Once agreed, the iteration cycle walks the plan one ticket at a time, validating at each story boundary.

**Next step.** End the checkpoint with a single sentence naming what runs next, including which ticket it starts on — e.g. *"Next: Phase 6, `ticket-planning` for Ticket 01 of Play a track — Audio element."* Suggest it; don't run it.
