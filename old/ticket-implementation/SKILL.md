---
name: ticket-implementation
description: Implement a single planned ticket — write the least code that satisfies the acceptance criteria and log what it doesn't cover in the ticket doc's Edge cases, abort-and-replan if the approach turns out to be a dead end, record what implementation revealed in Implementation notes (confirming major assumptions with the operator, listing minor ones), update the ticket's user steps to match what the code actually needs, and produce a complete manual-validation checklist. Use this as the second step of the per-ticket loop in the dev system. Trigger on "implement this ticket", "build ticket N", "go ahead and code it".
---

# Ticket implementation

Second of the three phases per ticket: planning → **implementation** → test validation. The ticket's goal, out-of-scope list, user prerequisites, acceptance criteria, and user steps already exist from planning (`<epic>/stories/<story>/<NN>-<ticket>.md`).

The ticket doc's **user prerequisites are assumed done** — the operator doesn't trigger this until they are. Start building; only stop if one turns out to be missing in practice.

> Part of the **dev system** — see the `dev-system` skill for the pipeline, references, question rules, major-assumption rules, metrics, and what goes in the chat.

## Working conventions

`<epic>` means `docs/epics/epic-<name>/`. Per-ticket doc: `<epic>/stories/<story>/<NN>-<ticket>.md`.

## What to do

1. **Stamp the start.** Take the real system time and write it into the ticket doc's `## Metrics` block as *Implementation started*.

2. **Implement.** No permission-asking or clarifying questions — *unless* the work requires changing a major architectural decision. The acceptance criteria and the out-of-scope list are your brief; build to them and don't reach past them.

3. **Prefer under-achieving to over-engineering — write the least code that satisfies the acceptance criteria.** The criteria are the ceiling, not the floor. An edge case the criteria don't name is not yours to handle: no defensive branch for input that shouldn't occur, no retry or fallback nobody asked for, no configuration knob with one caller, no abstraction placed for a second use case that doesn't exist. When you catch yourself adding code "just in case," **delete it and write one line in Edge cases instead.**

   The bar: *would the ticket's tests still pass without this code?* If yes, it doesn't belong here. Thin code the operator can hold in their head plus a visible list of what it doesn't cover beats thorough code nobody reviews. **What's left uncovered is not lost; it's written down** (step 4), which is what makes under-achieving safe rather than sloppy.

   The pull is strongest toward the rest of the story. A later ticket is *already planned* — building part of it now doesn't save work, it moves an unreviewed diff into this ticket. Leave it.

   Two things this does not license: **don't skip an acceptance criterion**, and **don't leave the code broken on the path the criteria do cover.** Under-achieving is about the unnamed edges, never the named centre.

4. **Write every uncovered case into the ticket doc's Edge cases section** — one line each, plain language, naming what isn't handled and what the operator would see if it happened. This is where the "just in case" code went instead of into the codebase. It's an attention list, not a backlog: an entry that genuinely must be handled becomes a criterion in a later ticket, the rest stay as known, accepted gaps.

   > - Concurrent edits to the same record: last write wins silently — no conflict detection. Two people editing at once will lose one set of changes.
   > - Upload larger than the browser can buffer will fail with a generic error, not a size message.

   If an edge case belongs to a *later* ticket, still list it — `story-validation` reads these across the whole story, so an edge left here is seen at feature level even when no single ticket owned it.

5. **Abort and re-plan on a dead end — as a question, with options.** If the planned approach can't satisfy the acceptance criteria without a major architectural change, **stop.** Do not force tests green on a broken approach and do not pick the way out on your own.

   Put it to the operator with `AskUserQuestion`: two to four concrete approaches, each one line on what it changes and what it costs (scope, rework, blast radius), with **future-proof** and **cheaper now** labeled. Name which you'd pick and why. Wait for the choice before writing more code.

   > *The planned in-process queue can't hold ordering across restarts, which criterion 3 requires.*
   > — **future-proof:** durable queue. Ordering survives anything; new infra, ~1 extra ticket, a running cost.
   > — **cheaper now:** drop the restart guarantee from this ticket and re-plan it as its own ticket in this story.
   > — Persist order in the existing DB table. No new infra; slower at scale, and the scale ceiling becomes an edge case.

   (This lives here, not in validation, because a dead end only reveals itself when the approach hits reality.)

6. **Record every assumption you make while building, in the ticket doc's Implementation notes.** An assumption here is anything the code needed that the ticket doc didn't settle — it only showed up because implementation hit reality. Classify by the rules in `dev-system` § *Major assumptions*, and watch the growth test in particular: a data shape, a module boundary, a name other code will bind to. Those are cheap now and expensive in three epics.

   **Ask the major ones with `AskUserQuestion`, before you build on them** — at most 5, labeled options, batched rather than trickled. Write the answer into Implementation notes as settled; never leave an open question in the doc. **Minor assumptions are not surfaced**; just list them.

   A major assumption that invalidates the planned approach isn't an assumption any more — that's the dead end in step 5.

   Implementation notes also carry anything else worth forwarding: a constraint the code hit, a deviation from the plan, something the next ticket needs to know. Leave the section as planning wrote it if nothing came up.

7. **Reach "done."** Every acceptance criterion implemented, covered by tests, **the full test suite run and green**. **Work is not done until the tests pass** — a failing, skipped, or never-run test means the ticket is still in progress. Never present the ticket as finished with red tests, never disable or `.skip` a test to get green, and never report a test as passing without running it.

   Checking your own tests against the criteria for false positives is **not** this phase's job — Phase 9, `test-validation`, does it as a separate pass against the PRD. Write honest tests and hand them over.

8. **Re-check the user steps.** Planning wrote them before the code existed; now you know what the code actually needs. Go back to the ticket doc's *User steps* and correct it:

   - a step that's no longer needed because the code handles it → remove it;
   - a step the implementation created — a migration to run, an env var to set, a bucket to create, a flag to flip → add it, specific enough to follow without guessing;
   - a step whose details changed — the actual variable name, the actual command → correct it.

   **Do the same for user prerequisites** if implementation revealed one that was missing. This is the section the operator acts on, so a stale step here is a broken deploy, not a documentation nit.

9. **Fill in the metrics.** In the ticket doc's `## Metrics`: *Criteria met first pass* (how many acceptance criteria were satisfied without rework once you first ran the suite, over the total) and *Criteria needing rework* (which ones, one phrase each on what was wrong). Be honest — this measures the plan's quality more than the code's, and a flattered number teaches nothing.

10. **Output the manual-validation checklist** — one check per acceptance criterion with a note on what to look for, plus the ticket doc's user steps as you just corrected them. This checklist **relays what planning established — it doesn't invent criteria.**

## Edge cases shape

Replaces the empty section planning left in the ticket doc:

```
## Edge cases
- <what isn't handled> — <what the operator would see if it happened>
(or: none)
```

One line each. Write what the operator would *observe*, not the internal reason — "loses one set of changes silently" is useful where "no optimistic-locking check" is not.

## Implementation notes shape

```
## Implementation notes

### Assumptions — major (confirmed with the operator)
- <the decision, one line>
(or: none)

### Assumptions — minor
- <the decision, one line>
(or: none)

### Other notes
- <what implementation revealed that the next ticket or the docs should know>
(or: none)
```

One plain line per entry — a scan, not a design record.

## Manual-validation checklist shape

Exempt from compression: complete and specific.

```
## Manual validation — Ticket <NN> — <title>

### Acceptance criteria checks
- <criterion> — what to look for: <note>

### User steps (if any)
1. <specific action the operator takes to finalize the work>

Mark the ticket done only after every check above passes.
```

## Checkpoint

Present the checklist and wait. Beyond it, at most a few lines: what the code hit that the plan didn't foresee, and **whether the user steps changed** — if you added or removed one, say which in a line, because that's the part they act on. Point at the Edge cases list without reproducing it.

Don't list files touched, don't narrate the build, and don't name what runs next. If tests are still failing, that is what you report — not a finished ticket.
