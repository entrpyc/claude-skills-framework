---
name: ticket-planning
description: Plan a single ticket — pull only the sections that ticket references, resolve major assumptions with the operator before writing, and produce a ticket doc with goal, out of scope, user prerequisites, test-covered acceptance criteria, user steps, and the assumptions made. Use this as the first half of the per-ticket loop in the dev system. Trigger on "plan this ticket", "requirements for ticket N", "let's start the next ticket".
---

# Ticket planning

First of the two prompts run for each ticket of the epic plan: **planning → implementation.** This one establishes what "done" means for the ticket, before any code is written. When the last ticket of a story lands, `story-validation` runs once over the whole story.

## Output principle (applies to every prompt in the loop)

**The ticket doc is the deliverable; chat is not a second copy of it.** Say the minimum: what the operator wouldn't anticipate from reading the doc, the major-assumption questions, a link to the doc, and the one sentence naming what runs next. Don't walk through the criteria you wrote or recap the ticket back at them — nothing surprising to report is a two-line checkpoint, and that's correct output. See *What goes in the chat* in the `dev-system` skill.

Two exceptions:

- The **manual-validation checklist** is exempt from compression — always complete and specific (that checklist is produced in the implementation prompt).
- A ticket carrying a **hard-to-reverse decision** gets the space it needs to explain that decision.

> Part of the **dev system** — see the `dev-system` skill for the full pipeline, the artifact map, and the principles that hold across every phase.

## Working conventions

`<epic>` means `docs/epics/epic-<name>/` — the folder of the epic being built. Per-ticket work goes in `<epic>/stories/<story>/<NN>-<ticket>.md`, where `<story>` is the slug of the story's title and `<NN>` is the ticket's number within that story, both taken from `<epic>/implementation-plan.md`. Ticket 02 of "Resume where I left off" → `<epic>/stories/resume-where-i-left-off/02-restore-on-load.md`.

Control comes from the operator answering the major-assumption questions and reviewing this plan before implementation starts.

**Reference links.** Write every section reference as a markdown link to the file and line it lives at — `[3.2.4](docs/project/prd.md#L142)`, `[epic prd § In scope → Auth](docs/epics/epic-search/prd.md#L34)` — with the visible text left as the plain reference. Resolve the line by finding the heading (`grep -n`); never guess it. See the `dev-system` skill for the full rule.

## What to do

1. **Pull only the referenced sections named by this ticket** in `<epic>/implementation-plan.md` — not all the docs. The whole point of per-ticket references is that you read narrowly here. Read the ticket's **story** heading too: it's one line, and it's what tells you the feature this ticket is a piece of.

2. **Find the assumptions and classify each one.** An assumption is **anything this ticket needs that the PRD doesn't describe**, and that you would otherwise decide on your own while planning. Sort every one into:

   - **Major** — it could change the target architecture, produce code later tickets won't anticipate, is user-facing, or affects what running the application costs.
   - **Minor** — not fully covered by the PRD, but it doesn't contradict the target architecture, isn't user-facing, and isn't cost-impacting.

   When a call sits on the line, treat it as major. The cost of asking is one question; the cost of a wrong silent major is rework in every ticket after it.

3. **Ask the major ones — before writing the doc.** Put them to the operator as a short numbered set of questions, and **carry a suggested approach with every question** so they can confirm in one word instead of designing from scratch:

   > 1. The PRD doesn't say what happens when the token expires mid-session. **Suggested:** silently refresh once, then bounce to login if that fails. OK?

   Ask everything in one pass rather than trickling questions out. Answers become ordinary content of the doc — acceptance criteria, out-of-scope lines, prerequisites — and the assumption itself is recorded as settled under **Assumptions → Major**. Minor assumptions are **not** brought to the operator; they're just listed. **Never leave an open question inside the doc** — the written ticket doc records decisions, not things still hanging.

4. **Write the ticket doc** in the shape below, once the major assumptions are answered.

5. **Every acceptance criterion must be covered by a test.** Name the test on the criterion line — if you can't name one that would fail when the criterion isn't met, the criterion is too vague to implement against; sharpen it or split it until it is testable.

6. **Give every acceptance criterion its sub-bullets for how it's achieved** — one line each, plain language, no code. These exist to keep the operator in the loop on *how* the thing gets built, so they must stay short enough to actually read.

7. **Keep out of scope sharp.** It's the anti-overengineering lever: name the things a reasonable implementer might reach for on this ticket that are explicitly not wanted. **The rest of the story is the most common one** — work that belongs to a later ticket of the same story reads as natural to pull in here, and naming it as out of scope is what keeps the ticket small.

8. **Separate the two kinds of manual work.** *User prerequisites* block the start of implementation (an account, a key, a service wired up). *User steps* come after the code is done (deploy, flip a flag, publish). Both list only things Claude genuinely can't do itself.

9. **Leave the Edge cases and Implementation notes sections empty.** Both hold what's learned only once code meets reality, and `ticket-implementation` is what fills them. Planning writes the headings and nothing under them — what you already know at planning time belongs in **Assumptions** or **Out of scope**, not there.

   Knowing what these become is worth carrying while you write the criteria, though: implementation is instructed to build **the least code that satisfies the acceptance criteria** and to log every unhandled edge rather than code around it. So a criterion that leaves its boundaries vague doesn't produce careful handling — it produces a longer Edge cases list. Pin down in the criteria whatever genuinely must be handled.

## Output shape

Write to `<epic>/stories/<story>/<NN>-<ticket>.md`:

```
# Ticket <NN> — <title>
_Story: <story title>_

## Goal
<one or two sentences on what this ticket delivers>

- As a user I want to be able to <x>
- As a user I want to be able to <y>

## Out of scope
- <thing this ticket explicitly does not implement>
...

## User prerequisites
- <what the operator must wire, configure, or provide before implementation starts>
(or: none)

## Acceptance criteria
- <criterion the implementation must meet for the goal to be fully met> — verified by <test>
  - <how it's achieved — short>
  - <how it's achieved — short>
...

## User steps
- <what the operator does after implementation to finalize the work>
(or: none)

## Assumptions

### Major (confirmed with the operator)
- <the decision, one line>
...
(or: none)

### Minor
- <the decision, one line>
...
(or: none)

## Edge cases
_Filled in during implementation — leave empty here._

## Implementation notes
_Filled in during implementation — leave empty here._
```

Keep every assumption to one plain line — the section is a scan, not a design record.

## Handoff

Keep the prose tight (output principle). The major-assumption questions come first and gate everything: **work does not start until they're answered and the ticket doc is approved.**

**Next step.** End with a single sentence naming what runs next and what gates it — e.g. *"Next: Phase 7, `ticket-implementation` for Ticket 02 — Restore on load, once the ticket doc above is approved and its user prerequisites are done."* Suggest it; don't run it.
