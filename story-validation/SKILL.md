---
name: story-validation
description: Validate a completed story — check the feature actually works end-to-end across its tickets, check for major contradictions with the epic plan or architecture and propose the cheaper fix, then review the story's sessions for concrete, observable process friction worth fixing. Runs once per story in the dev system, after its last ticket is done. Trigger on "validate this story", "review the story", "consistency check".
---

# Story validation

Runs once per story, after its **last ticket** has been implemented and its manual checks have passed. The per-ticket loop is planning → implementation; this is the checkpoint at the story boundary, and the only place the work is examined as a *feature* rather than as a change.

Validating here rather than per ticket is deliberate: a ticket is too small a window to tell whether the feature works, and the seams between tickets are exactly where a story quietly fails to add up.

## Output principle (applies to every prompt in the loop)

This prompt writes no doc — its report *is* the chat output, which is why it must hold nothing but what the operator wouldn't anticipate: flag **major** issues only. Don't pad it with minor observations, and don't recap the story. **"None found" on all counts is a complete, correct validation** — a few lines and the next ticket. See *What goes in the chat* in the `dev-system` skill.

Two exceptions:

- The **manual-validation checklist** (from the implementation prompt) is exempt from compression.
- A story carrying a **hard-to-reverse decision** gets the space it needs to explain it.

> Part of the **dev system** — see the `dev-system` skill for the full pipeline, the artifact map, and the principles that hold across every phase.

## Working conventions

Artifacts under `docs/`. Read the story's entry in `docs/epic-plan.md`, every ticket doc for it (`docs/tickets/<SS>.*.md`), and reference `docs/epic-architecture.md` and `docs/architecture.md`.

**Reference links.** Write every section reference as a markdown link to the file and line it lives at — `[3.2.4](docs/prd.md#L142)`, `[epic-prd.md § In scope → Auth](docs/epic-prd.md#L34)` — with the visible text left as the plain reference. Resolve the line by finding the heading (`grep -n`); never guess it. See the `dev-system` skill for the full rule.

## What to do

### 1. Feature completeness
Does the story deliver what its **Delivers** line in `docs/epic-plan.md` promised — end to end, as one feature? Each ticket was validated on its own criteria; nobody has yet checked that they add up. Look at the joins:

- A path that works ticket-by-ticket but breaks when walked start to finish.
- Something the plan promised that no ticket's acceptance criteria ever claimed — it fell between tickets rather than being cut.
- An **Edge cases** entry that was tolerable inside one ticket but blocks the feature at story level, because it sits on the story's main path rather than at its margin. Read all the story's Edge cases lists together; that's the view no single ticket had.

**Flag gaps only, not polish.** If the feature works, say so in a line and move on.

### 2. Consistency check
Does the completed story introduce contradictions with the epic plan or the architecture? **Read the tickets' Implementation notes and Edge cases first** — the assumptions recorded there are where implementation departed from what was planned, so that's the likeliest place a contradiction sits, and an edge case left uncovered contradicts the architecture if the architecture actually depended on it being handled. Watch in particular for a major assumption settled in one ticket that a later ticket in the same story then built past. **Flag major contradictions only.** For each, propose the **cheaper fix** — either additional work before continuing, or updating the docs to match reality. Name which is cheaper and why; the operator decides.

### 3. Efficiency review
Review the story's planning and implementation sessions for **concrete, observable friction** — not token counts, which can't be measured reliably across sessions. Look for:

- Any ticket that required **more than two correction rounds.**
- Any ticket that was **much larger than planned**, or that should have been split — that's the granularity knob (Phase 5) reporting back, and it's the most valuable thing this review can catch.
- Any **doc reference that was ambiguous** or sent the work to the wrong place — including a link that pointed at the wrong line because the doc moved underneath it.
- **Anything that got re-read repeatedly** across the story's tickets.

**Suggest major process improvements only** — reductions in complexity or friction that preserve implementation quality. Skip the small wins; a long list of marginal tweaks is noise.

## Output shape

```
## Validation — Story <SS> — <title>

### Feature completeness
- <gap between tickets, or something the plan promised that no ticket delivered>
(or: works end to end)

### Consistency
- <major contradiction, naming the section it contradicts as a link> → cheaper fix: <more work | update docs>, because <reason>
(or: none found)

### Process friction
- <concrete observation, e.g. "ticket 01.03 needed 3 correction rounds because…">
  → suggested improvement: <major change only>
(or: none worth flagging)
```

## Handoff

Keep it lean and major-issues-only. If a gap or a contradiction needs a decision, get it before the next story starts. A completeness gap usually becomes a new ticket appended to this story rather than a note — say which you're proposing. If the fix is to update a doc, make the update (or flag it) so the plan and architecture stay honest as the epic grows.

**Next step.** End with a single sentence naming what runs next, and check `docs/epic-plan.md` to get it right:

- Stories left in the plan → *"Next: Phase 6, `ticket-planning` for Ticket 02.01 — Search index."*
- That was the plan's last story → *"Next: Phase 3, `epic-prd`, to archive this epic and cut the next one."*
- A gap or contradiction above needs deciding first → say that, and name the decision that unblocks the next ticket.

Suggest it; don't run it.
