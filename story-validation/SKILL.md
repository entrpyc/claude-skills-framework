---
name: story-validation
description: Validate a completed story — check the feature actually works end-to-end across its tickets, check for major contradictions with the epic plan or architecture, update the implementation plan's Summary with what was built and what remains, then quiz the operator on the codebase to confirm they're still in the loop. Runs once per story in the dev system, after its last ticket is done. Trigger on "validate this story", "review the story", "consistency check".
---
# Story validation

Runs once per story, after its **last ticket** has been implemented and its manual checks have passed. The per-ticket loop is planning → implementation; this is the checkpoint at the story boundary, and the only place the work is examined as a *feature* rather than as a change.

Validating here rather than per ticket is deliberate: a ticket is too small a window to tell whether the feature works, and the seams between tickets are exactly where a story quietly fails to add up.

Four things happen, in order: check the feature is complete, check it doesn't contradict the docs, record what was built in the plan's **Summary**, and **quiz the operator** to confirm they can still explain the system they own.

## Output principle

The **Summary** is this phase's written deliverable; everything else is chat, and chat carries only what the operator wouldn't anticipate: flag **major** issues only. Don't pad it with minor observations, don't recap the story, and don't restate the Summary you just wrote. **"None found" on both checks is a complete, correct validation** — a few lines, the quiz, and the next ticket. Two things escape that compression: the **quiz**, which is an interaction rather than a record, and a **hard-to-reverse decision**, which gets the space it needs. See *What goes in the chat* in the `dev-system` skill.

> Part of the **dev system** — see the `dev-system` skill for the full pipeline, the artifact map, and the principles that hold across every phase.

## Working conventions

`<epic>` means `docs/epics/epic-<name>/` — the folder of the epic being built. Read the story's entry in `<epic>/implementation-plan.md`, every ticket doc in its folder (`<epic>/stories/<story>/`), and reference `<epic>/architecture.md` and `docs/project/architecture.md`. The Summary is written into `<epic>/implementation-plan.md`.

**Reference links.** Every section reference is a markdown link to the file and the line its heading sits on — `[3.2.4](docs/project/prd.md#L142)` — with the visible text left as the plain reference. Resolve the line with `grep -n`; never guess it. Full rule in the `dev-system` skill.

## What to do

### 1. Feature completeness
Does the story deliver what its **Delivers** line in `<epic>/implementation-plan.md` promised — end to end, as one feature? Each ticket was validated on its own criteria; nobody has yet checked that they add up. Look at the joins:

- A path that works ticket-by-ticket but breaks when walked start to finish.
- Something the plan promised that no ticket's acceptance criteria ever claimed — it fell between tickets rather than being cut.
- An **Edge cases** entry that was tolerable inside one ticket but blocks the feature at story level, because it sits on the story's main path rather than at its margin. Read all the story's Edge cases lists together; that's the view no single ticket had.

**Flag gaps only, not polish.** If the feature works, say so in a line and move on. What's incomplete but acceptable is what makes a feature *partial* in the Summary below, so this check feeds straight into it.

### 2. Consistency check
Does the completed story introduce contradictions with the epic plan or the architecture? **Read the tickets' Implementation notes and Edge cases first** — the assumptions recorded there are where implementation departed from what was planned, so that's the likeliest place a contradiction sits, and an edge case left uncovered contradicts the architecture if the architecture actually depended on it being handled. Watch in particular for a major assumption settled in one ticket that a later ticket in the same story then built past. **Flag major contradictions only.** For each, propose the **cheaper fix** — either additional work before continuing, or updating the docs to match reality. Name which is cheaper and why; the operator decides.

### 3. Update the Summary
Write what this story delivered into `## Summary` at the end of `<epic>/implementation-plan.md`, creating the section if this is the epic's first validated story.

**The Summary is the epic's running record of what exists** — what a reader consults instead of reconstructing the epic out of ticket docs, and what the *next* epic's stock-take reads to know what's already delivered. So write it in the language of what the system now does, not of what work was done.

Four of its subsections **accumulate**, each story appending to them. One — *Features still remaining* — is **rewritten in place** every time, because it states current scope rather than logging history.

- **What was created** — one line per story, from the user's perspective: what someone can now do that they couldn't before. Not files, not modules, not "implemented the X service."
- **Architectural decisions** — the load-bearing calls this story made or settled, each with its one-line why, naming the story it came from. Pull them from the tickets' Implementation notes rather than re-deriving them; a major assumption confirmed with the operator mid-ticket is exactly this. Skip what the epic architecture already decided — this records what *building it* decided.
- **Divergences from the project docs** — where the delivered system now differs from `docs/project/prd.md` or `docs/project/architecture.md`, each marked **deliberate** or **forced**, with a line on what would bring them back in line. This is the drift ledger: cheap to write now, nearly impossible to reconstruct three epics later. *(none)* is a good answer.
- **Features implemented** — every feature the epic has delivered so far, each marked **fully** or **partially**, and the two must be distinguishable at a glance. A feature is *partial* when the main path works but a named piece of it doesn't exist yet: say what works, what doesn't, and where the rest is tracked. **Never mark a feature fully implemented because its tickets are done** — tickets being done is a fact about the plan, not about the feature.
- **Features still remaining** — what `docs/project/prd.md` describes that the project still doesn't have, including the missing halves of anything partial above. Rewrite the list each time; it should shrink. It feeds the next `epic-prd` stock-take directly, so a stale entry here is the one that compounds.

### 4. Quiz the operator
**Control is only real if the operator can still explain the system they own.** Tickets are small and the loop is fast, which makes it easy to approve a run of checklists and end up unable to say how the thing actually works. This is the check on that — and the story boundary is where it belongs, because there's finally a whole feature to ask about.

**Ask three to five questions**, drawn from what this story actually changed, mixing the kinds:

- **Where** — which part of the code handles a behavior they signed off on.
- **Why** — why an approach was chosen over the obvious alternative. Best drawn from a major assumption confirmed during a ticket.
- **What breaks** — what a user would see in a case the story's Edge cases say isn't handled.
- **What changed for the user** — the shape of the feature as someone using it meets it, when the story had a real interface.

Rules that keep it honest and worth their time:

- **Ask what the code can answer, not what the doc restates.** A question whose answer is a sentence in the Summary you just wrote is a reading test, not a knowledge check.
- **No trivia, no trick questions.** Function names, line counts, and exact syntax prove nothing. Ask about behavior, structure, and reasoning.
- **One line per question**, answerable in a sentence or two.
- **Grade honestly.** If an answer is wrong or half-right, say so plainly and give the correct picture in a line or two, with a link to the file or section that shows it. **Never wave a wrong answer through as "close enough"** — a false pass is worse than no quiz at all, because it certifies a gap as understanding.
- **A gap is a finding, not a failure.** When an answer shows the thread was lost, the fix is the explanation you just gave — plus, if the gap is background rather than specific, a pointer back to the epic plan's *Background to research* entry, or a new entry proposed for it.
- **It doesn't block.** If the operator would rather skip, note it and move on; whether to spend the time is their call, and asking twice makes it theatre.

## Output shape

Written into `<epic>/implementation-plan.md`:

```
## Summary

### What was created
- **<story title>** — <what a user can now do that they couldn't before>
...

### Architectural decisions
- <the decision, one line> — <why> (<story it came from>)
...
(or: none yet)

### Divergences from the project docs
- <what now differs> from <project section, linked> — **deliberate | forced**: <what would bring them back in line>
...
(or: none)

### Features implemented
- **[full]** <feature> — <one line on what it does>
- **[partial]** <feature> — works: <what works>; missing: <what doesn't>; tracked in: <where>
...

### Features still remaining
- <feature the project PRD describes and the project still doesn't have, linked>
...
```

Presented in chat:

```
## Validation — Story: <title>

### Feature completeness
- <gap between tickets, or something the plan promised that no ticket delivered>
(or: works end to end)

### Consistency
- <major contradiction, naming the section it contradicts as a link> → cheaper fix: <more work | update docs>, because <reason>
(or: none found)

Summary updated: <link to the plan's Summary section>

### Quiz — <story title>
1. <question>
2. <question>
3. <question>

Answer what you can; say skip for any you'd rather not.
```

## Handoff

Keep the report lean and major-issues-only. If a gap or a contradiction needs a decision, get it before the next story starts. A completeness gap usually becomes a new ticket appended to this story rather than a note — say which you're proposing. If the fix is to update a doc, make the update (or flag it) so the plan and architecture stay honest as the epic grows.

Then wait for the quiz answers, mark them honestly, and only then name what runs next.

**Next step.** End with a single sentence naming what runs next, and check `<epic>/implementation-plan.md` to get it right:

- Stories left in the plan → *"Next: Phase 6, `ticket-planning` for Ticket 01 of Search — Index writer."*
- That was the plan's last story → *"Next: Phase 3, `epic-prd`, to cut the next epic."*
- A gap or contradiction above needs deciding first → say that, and name the decision that unblocks the next ticket.

Suggest it; don't run it.
