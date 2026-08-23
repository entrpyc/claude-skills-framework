---
name: epic-plan
description: Break the epic into stories and tickets — each story one feature of the epic, each ticket one reviewable, independently testable unit of behavior carrying specific references to named PRD and architecture sections — generated interactively with the operator, plus a background-research list naming the technical knowledge and skills needed to review the epic's work. Use this after the epic PRD and epic architecture exist. Trigger on "epic plan", "implementation plan", "break this into stories", "break this into tickets", "plan the build".
---
# Epic plan

Produce `<epic>/implementation-plan.md`: the plan covering the full epic, broken into **stories** and, under each story, **tickets**. This is Phase 5. Phase 6, `plan-validation`, checks it before any code is written.

Two levels, two jobs:

- A **story** is one feature of the epic, described as something a user can do end-to-end. It's the unit the operator validates (Phase 10), so it has to be meaningful on its own — when its last ticket lands, something works that didn't before.
- A **ticket** is one reviewable, independently testable piece of a story. It's the unit that gets planned and built, and it is deliberately small.

**This phase is interactive.** The plan is the most expensive thing in the system to get wrong, so the shape of it is agreed with the operator while it's being made, not presented finished for approval.

> Part of the **dev system** — see the `dev-system` skill for the pipeline, the artifact map, references, question rules, and the principles that hold across every phase.

## Working conventions

`<epic>` means `docs/epics/epic-<name>/`. Within it:

- `<epic>/prd.md`, `<epic>/architecture.md` — read these, plus `docs/project/prd.md` and `docs/project/architecture.md` as needed
- `<epic>/implementation-plan.md` — this skill
- `<epic>/stories/<story>/<NN>-<ticket>.md` — per-ticket working docs

**The plan is what names the folders.** A story's folder is the slug of its title; a ticket's file is its number within the story plus the slug of its title:

```
## Story — Resume where I left off        ->  <epic>/stories/resume-where-i-left-off/
### Ticket 01 — Position store            ->  <epic>/stories/resume-where-i-left-off/01-position-store.md
### Ticket 02 — Restore on load           ->  <epic>/stories/resume-where-i-left-off/02-restore-on-load.md
```

**Order lives in this document, not in the folder names.** Keep titles short enough to make a readable slug, and don't renumber a ticket once its doc exists.

## Rule 1 — Stories are features, not work packages

Each story maps to a feature in the epic PRD's *In scope — core features*, and reads as something a user can do. Usually one story per in-scope feature; splitting a large feature into two is fine when each half is independently usable, merging two tiny ones is fine when neither stands alone.

- **A story must end in a working state.** When its last ticket is done, the operator validates it as a feature — not as a pile of half-wired parts.
- **A story is not a layer.** "The database work" is not a story; "a user can save and reopen a draft" is.
- If you can't say what a story lets someone do that they couldn't before, it isn't a story — it's a ticket that escaped.

## Rule 2 — Ticket granularity (the master knob)

Each ticket is **one reviewable unit of behavior**: testable in isolation, small enough that its full diff fits in your head.

- Too big and the operator can't hold the diff, so review degrades to skimming and control is lost.
- Too small and the plan drowns in ceremony.
- Aim for a ticket that changes one observable behavior, could be tested on its own, and could be described in a sentence.

**Tickets must not introduce huge chunks of work.** A ticket that needs three paragraphs to describe, or that touches every layer at once, is two or more tickets. A story with a single enormous ticket is the clearest sign the knob is set wrong.

As a feel, not a law: most stories land at two to five tickets. Past five or six, check whether you're looking at two stories.

## Rule 3 — Per-ticket references

**Read the PRD and architecture once, during generation.** For each ticket, write the *specific references it needs* — named sections, **not whole documents**. Each later iteration then reads only what its ticket points to, which is what keeps ticket planning cheap.

- Reference named sections as plain labels — `epic prd § In scope → Auth`, not "the PRD", and not a link.
- Put references on **tickets**, not stories — the ticket is what Phase 7 reads. A story carries one line naming the epic-PRD feature it delivers.
- Confirm every section you cite exists (`grep` the heading) before writing it down.

## Method

The interactive part is steps 2 and 4. Everywhere else, decide and move.

1. **Read** the epic PRD and epic architecture in full, and the project docs as needed. This is the one pass where you read broadly. Note the epic PRD's *Scope decisions* and *Requirements depth* — they bound how much the plan is allowed to assume.

2. **Agree the story split before writing tickets.** Draft the stories from the epic's in-scope features and put the genuinely contestable calls to the operator with `AskUserQuestion` — at most 5, options labeled **future-proof** and **cheaper now**. Worth asking about:

   - a feature that could be one story or two, where the split changes what gets validated;
   - build order, where one order keeps the app working and another gets a risky piece proven earlier;
   - a feature the epic PRD names that has no clean end-to-end story.

   If the split is obvious, don't manufacture a question. Skip to step 3.

3. **Break each story into tickets**, in build order, each satisfying Rule 2.

4. **Put the granularity calls to the operator.** One `AskUserQuestion` pass, at most 5, on the tickets where the knob is genuinely ambiguous — a ticket that could be one or three, a piece of scaffolding that could be its own ticket or fold into the first real one. Each option says what it costs in review effort. **Ask about tickets you're unsure of, not about every ticket.**

5. **Write the references** for each ticket (Rule 3).

6. **Write the Background to research list** — see below. It comes last in the writing, first in the document.

7. **Keep it high-level and product-legible.** A reader should follow the arc of what's being built, not drown in implementation detail.

## Structure

```
# <Project> — Epic plan: <name>

## Background to research
A plain list of the technical knowledge and skills the operator needs to
review this epic's work. One line each, nothing more — see below.

## Story — <title>
**Delivers:** what a user can do end-to-end once this story is done.
**Feature:** <the epic-PRD feature this story delivers>

### Ticket 01 — <title>
**Delivers:** one reviewable unit of behavior — what observably changes.
**References:** <named sections only, as plain labels — e.g. epic architecture
§ Data model (epic); epic prd § In scope → Search>
**Notes:** <optional — only if this ticket carries a hard-to-reverse decision>

### Ticket 02 — <title>
...

## Story — <title>
...

## Summary
Left out here — `story-validation` appends this section as each story
completes, and it becomes the epic's record of what actually exists.
```

Story and ticket titles are what the folders get named after.

**Don't write the Summary.** It records what was *delivered*, which nothing knows yet at planning time.

## Background to research

**Control depends on the operator understanding what they're reviewing.** This section names the technical knowledge and skills this epic's work sits in, **as a plain list**.

```
## Background to research
- Server-sent events
- Postgres advisory locks
- Optimistic UI updates and rollback
- Cursor-based pagination
```

That's the whole shape. One topic per line, no explanation, no source, no depth rating, no "needed for". **If the operator wants detail on an entry, they'll ask.** Anything more is padding they have to read past.

Three rules:

1. **Only what this epic adds.** Something an earlier epic already used doesn't come back unless this epic uses it in a genuinely new way — in which case name the new part. The list should shrink as the project goes.
2. **Scope each entry to what the review needs.** "Postgres advisory locks" is an entry; "Postgres" is not.
3. **Write it after the tickets exist**, so you're naming what the plan actually leans on. **An empty list is a real result** — say so rather than manufacturing entries.

## Checkpoint

Link to the plan. Then only what the operator wouldn't anticipate: a ticket that came out much larger than its neighbours, an ordering forced by a dependency they wouldn't expect, a story that couldn't be made independently validatable and why.

Don't list the stories back at them — they're in the plan — and don't name what runs next.
