---
name: story-validation
description: Validate a completed story — check the feature actually works end-to-end across its tickets, check for major contradictions with the epic plan or architecture, roll up the tickets' metrics, and update the implementation plan's Summary with what was built and what remains. Runs once per story in the dev system, after its last ticket is done. Trigger on "validate this story", "review the story", "consistency check".
---
# Story validation

Runs once per story, after its **last ticket** has been implemented, test-validated, and manually checked. This is Phase 10 — the only place the work is examined as a *feature* rather than as a change.

Validating here rather than per ticket is deliberate: a ticket is too small a window to tell whether the feature works, and the seams between tickets are exactly where a story quietly fails to add up.

Four things happen, in order: check the feature is complete, check it doesn't contradict the docs, roll up the metrics, and record what was built in the plan's **Summary**.

> Part of the **dev system** — see the `dev-system` skill for the pipeline, references, metrics, and what goes in the chat.

## Working conventions

`<epic>` means `docs/epics/epic-<name>/`. Read the story's entry in `<epic>/implementation-plan.md`, every ticket doc in `<epic>/stories/<story>/`, and `<epic>/architecture.md` and `docs/project/architecture.md` as needed. The Summary is written into `<epic>/implementation-plan.md`.

## 1. Feature completeness

Does the story deliver what its **Delivers** line promised — end to end, as one feature? Each ticket was validated on its own criteria; nobody has yet checked that they add up. Look at the joins:

- A path that works ticket-by-ticket but breaks when walked start to finish.
- Something the plan promised that no ticket's acceptance criteria ever claimed — it fell between tickets rather than being cut.
- An **Edge cases** entry that was tolerable inside one ticket but blocks the feature at story level, because it sits on the story's main path rather than at its margin. Read all the story's Edge cases lists together; that's the view no single ticket had.

**Flag gaps only, not polish.** If the feature works, say so in a line. What's incomplete but acceptable is what makes a feature *partial* in the Summary below.

## 2. Consistency check

Does the completed story contradict the epic plan or the architecture? **Read the tickets' Implementation notes and Edge cases first** — the assumptions recorded there are where implementation departed from what was planned, and an edge case left uncovered contradicts the architecture if the architecture depended on it being handled. Watch in particular for a major assumption settled in one ticket that a later ticket then built past.

**Flag major contradictions only.** For each, propose the **cheaper fix** — additional work, or updating the docs to match reality. Name which is cheaper and why; the operator decides.

## 3. Roll up the metrics

Read the `## Metrics` block from every ticket in the story and total them. **The measure is acceptance criteria, not effort or elapsed time.**

- **Criteria met first pass across the story** — the sum, as `<n>/<total>`.
- **Where the misses clustered.** One line. Criteria that needed rework in several tickets for the same reason — vague boundaries, an unstated assumption, a reference that didn't carry what the ticket needed — are a planning signal, and naming the pattern is the whole value of collecting the numbers.
- **False positives found** — the story's total from Phase 9. A rising count means tests are being written to pass rather than to prove.

Timestamps give elapsed time per ticket; report it only if something is an outlier worth explaining. **Don't rank tickets by speed** — a fast ticket with three reworked criteria is worse than a slow one with none.

Write the roll-up into the Summary's *Delivery metrics* subsection.

## 4. Update the Summary

Write what this story delivered into `## Summary` at the end of `<epic>/implementation-plan.md`, creating the section if this is the epic's first validated story.

**The Summary is the epic's running record of what exists** — what a reader consults instead of reconstructing the epic from ticket docs, and what the *next* epic's stock-take reads. Write it in the language of what the system now does, not of what work was done.

Most subsections **accumulate**, each story appending. One — *Features still remaining* — is **rewritten in place**, because it states current scope rather than logging history.

- **What was created** — one line per story, from the user's perspective: what someone can now do that they couldn't before. Not files, not modules, not "implemented the X service."
- **Architectural decisions** — the load-bearing calls this story made or settled, each with its one-line why, naming the story it came from. Pull them from the tickets' Implementation notes rather than re-deriving them. Skip what the epic architecture already decided — this records what *building it* decided.
- **Divergences from the project docs** — where the delivered system now differs from `docs/project/prd.md` or `docs/project/architecture.md`, each marked **deliberate** or **forced**, with a line on what would bring them back in line. This is the drift ledger: cheap now, nearly impossible to reconstruct three epics later. *(none)* is a good answer.
- **Delivery metrics** — the roll-up from step 3, one line per story.
- **Features implemented** — every feature the epic has delivered so far, marked **fully** or **partially**, distinguishable at a glance. A feature is *partial* when the main path works but a named piece doesn't exist yet: say what works, what doesn't, and where the rest is tracked. **Never mark a feature fully implemented because its tickets are done** — tickets being done is a fact about the plan, not about the feature.
- **Features still remaining** — what `docs/project/prd.md` describes that the project still doesn't have, including the missing halves of anything partial above. Rewrite each time; it should shrink. It feeds the next `epic-prd` stock-take, so a stale entry here compounds.

## Output shape

Written into `<epic>/implementation-plan.md`:

```
## Summary

### What was created
- **<story title>** — <what a user can now do that they couldn't before>

### Architectural decisions
- <the decision, one line> — <why> (<story it came from>)
(or: none yet)

### Divergences from the project docs
- <what now differs> from <project section> — **deliberate | forced**: <what would bring them back in line>
(or: none)

### Delivery metrics
- **<story title>** — criteria met first pass: <n>/<total>; false positives found: <n>; <the pattern, if there is one>

### Features implemented
- **[full]** <feature> — <one line on what it does>
- **[partial]** <feature> — works: <what works>; missing: <what doesn't>; tracked in: <where>

### Features still remaining
- <feature the project PRD describes and the project still doesn't have>
```

Presented in chat:

```
## Validation — Story: <title>

- Completeness: <gap between tickets, or something the plan promised that no ticket delivered> (or: works end to end)
- Consistency: <major contradiction, naming the section> → cheaper fix: <more work | update docs>, because <reason> (or: none found)
- Metrics: criteria met first pass <n>/<total>; false positives <n>; <the pattern, if there is one>

Summary updated in <epic>/implementation-plan.md.
```

## Checkpoint

Major issues only. **"None found" on both checks is a complete, correct validation** — three lines and stop.

If a gap or contradiction needs a decision, get it before the next story starts; a completeness gap usually becomes a new ticket appended to this story rather than a note, so say which you're proposing. If the fix is to update a doc, make the update so the plan and architecture stay honest as the epic grows.

Don't recap the story, don't restate the Summary you just wrote, and don't name what runs next.
