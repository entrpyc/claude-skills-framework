---
name: ticket-planning
description: Plan a single ticket — pull only the sections that ticket references, resolve major assumptions with the operator interactively before writing, and produce a ticket doc with goal, out of scope, user prerequisites, test-covered acceptance criteria, user steps, assumptions, and a metrics block. Use this as the first step of the per-ticket loop in the dev system. Trigger on "plan this ticket", "requirements for ticket N", "let's start the next ticket".
---

# Ticket planning

First of the three phases run for each ticket: **planning → implementation → test validation.** This one establishes what "done" means, before any code is written.

> Part of the **dev system** — see the `dev-system` skill for the pipeline, references, question rules, major-assumption rules, metrics, and what goes in the chat.

## Working conventions

`<epic>` means `docs/epics/epic-<name>/`. The ticket doc is `<epic>/stories/<story>/<NN>-<ticket>.md`, where `<story>` is the slug of the story's title and `<NN>` is the ticket's number within it, both from `<epic>/implementation-plan.md`. Ticket 02 of "Resume where I left off" → `<epic>/stories/resume-where-i-left-off/02-restore-on-load.md`.

## What to do

1. **Stamp the start.** Take the real system time (`date`) and hold it for the `## Metrics` block — *Planning started*.

2. **Pull only the referenced sections named by this ticket** in `<epic>/implementation-plan.md` — not all the docs. The whole point of per-ticket references is that you read narrowly. Read the ticket's **story** heading too: one line, and it tells you the feature this ticket is a piece of.

   Also read the epic PRD's *Requirements depth*. It tells you whether an unspecified case is an oversight to raise or a deferral you're expected to assume through.

3. **Find the assumptions and classify each one** — major vs minor, by the rules in `dev-system` § *Major assumptions*. Note especially the last major test: **anything that gets harder to change as the codebase grows** — a data shape, a boundary, a name other code will bind to. Those look small at ticket scale and are the expensive ones.

4. **Ask the major ones with `AskUserQuestion`, before writing the doc.** At most 5. Every question carries options with **future-proof** and **cheaper now** labels, each saying in a line what it commits to:

   > *Token expiry mid-session isn't specified.*
   > — **future-proof:** refresh-token flow with a shared interceptor. Every future call inherits it; ~half a day now.
   > — **cheaper now:** bounce to login on any 401. Ships today; every future call that needs silent refresh has to be revisited.
   > — Refresh once inline, then bounce. No shared plumbing, no re-login for the common case.

   Answers become ordinary content of the doc — acceptance criteria, out-of-scope lines, prerequisites — and the assumption is recorded as settled under **Assumptions → Major**. Minor assumptions are **not** brought to the operator; they're just listed. **Never leave an open question inside the doc.**

5. **Write the ticket doc** in the shape below.

6. **Every acceptance criterion must be covered by a test.** Name the test on the criterion line. If you can't name one that would fail when the criterion isn't met, the criterion is too vague to implement against — sharpen or split it.

   Write criteria that are **observable**. A criterion that can be satisfied without anything visibly changing is what Phase 9 hunts for as a false positive; the cheapest place to prevent it is here.

7. **Give every acceptance criterion sub-bullets for how it's achieved** — one line each, plain language, no code. These keep the operator in the loop on *how*, so they must stay short enough to actually read.

8. **Keep out of scope sharp.** It's the anti-overengineering lever: name what a reasonable implementer might reach for here that isn't wanted. **The rest of the story is the most common one** — work belonging to a later ticket reads as natural to pull in, and naming it out of scope is what keeps the ticket small.

9. **Separate the two kinds of manual work.** *User prerequisites* block the start of implementation (an account, a key, a service wired up). *User steps* come after the code is done (deploy, flip a flag, publish). Both list only things Claude genuinely can't do itself. Implementation revisits the user steps once it knows what the code actually needs, so write your best guess and expect it to be corrected.

10. **Leave Edge cases and Implementation notes empty, and open the Metrics block.** Implementation and test validation fill them. What you already know belongs in **Assumptions** or **Out of scope**, not there.

    Worth carrying while you write the criteria: implementation builds **the least code that satisfies the acceptance criteria** and logs every unhandled edge rather than coding around it. A criterion with vague boundaries doesn't produce careful handling — it produces a longer Edge cases list. Pin down whatever genuinely must be handled.

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

## User prerequisites
- <what the operator must wire, configure, or provide before implementation starts>
(or: none)

## Acceptance criteria
- <criterion the implementation must meet> — verified by <test>
  - <how it's achieved — short>
  - <how it's achieved — short>

## User steps
- <what the operator does after implementation to finalize the work>
(or: none)

## Assumptions

### Major (confirmed with the operator)
- <the decision, one line>
(or: none)

### Minor
- <the decision, one line>
(or: none)

## Edge cases
_Filled in during implementation — leave empty here._

## Implementation notes
_Filled in during implementation — leave empty here._

## Metrics
- Planning started: <YYYY-MM-DD HH:MM>
- Implementation started:
- Ticket closed:
- Criteria met first pass:
- Criteria needing rework:
- Tests rewritten as false positives:
```

Keep every assumption to one plain line — the section is a scan, not a design record.

## Checkpoint

Link to the ticket doc. Then only what the operator wouldn't anticipate — a constraint the referenced sections turned out to impose, a prerequisite they don't have yet, a criterion that couldn't be made testable and why.

Don't walk through the criteria you wrote, don't recap the ticket, and don't name what runs next. **Work does not start until the major-assumption answers are in and the doc is approved.**
