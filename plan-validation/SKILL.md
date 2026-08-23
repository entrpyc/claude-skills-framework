---
name: plan-validation
description: Validate the epic implementation plan before any code is written — check it covers the epic PRD with nothing dropped and nothing invented, check every reference resolves, check ticket granularity and story independence, surface the plan's major assumptions to the operator as questions, and hunt false positives (tickets that look done-able but don't actually deliver what they claim). Runs once per epic, after epic-plan. Trigger on "validate the plan", "check the implementation plan", "plan review".
---
# Plan validation

Runs once per epic, after `epic-plan` writes `<epic>/implementation-plan.md` and before any ticket is planned. This is Phase 6.

**A plan is not validated by the person who wrote it while writing it.** Generation optimizes for a coherent-looking document; this phase optimizes for finding what's wrong with it. Separate pass, separate posture: come at the plan as if someone else wrote it and you have to find the flaw.

Four checks, then a fix pass. The plan is corrected in place — this phase edits `<epic>/implementation-plan.md`, it doesn't write a report file.

> Part of the **dev system** — see the `dev-system` skill for the pipeline, references, question rules, major-assumption rules, and the principles that hold across every phase.

## Working conventions

`<epic>` means `docs/epics/epic-<name>/`. Read `<epic>/implementation-plan.md`, `<epic>/prd.md`, `<epic>/architecture.md`, and `docs/project/prd.md` / `docs/project/architecture.md` where the plan cites them. Corrections go into the plan.

## 1. Coverage — nothing dropped, nothing invented

Walk the epic PRD's *In scope — core features* against the plan's stories, both directions:

- **Dropped** — a feature, or a functional requirement inside one, that no story delivers and no ticket's *Delivers* line claims. This is the failure that survives all the way to story validation, because a plan that never mentioned something can't be seen to be missing it.
- **Invented** — a story or ticket delivering something the epic PRD doesn't ask for. Scope crept in during planning. Name it and propose cutting it; the operator decides.
- **Out of altitude** — a ticket that specifies *how* rather than *what*. The plan is product-legible; implementation detail here pre-empts ticket planning.

Check the epic PRD's *Requirements depth* too: if it says error and permission cases are specified up front, a plan that only covers happy paths is under-covered, not lean.

## 2. References resolve

Every reference on every ticket. **Open each one** — `grep` the heading in the file it names — and check two things:

- the section exists;
- it carries the fact the ticket needs it for.

A reference pointing at a real section that doesn't say the thing is worse than a missing one, because ticket planning will read it, find nothing, and assume instead. **Check all of them, not a sample** — this is the cheapest place in the system to catch it, and every downstream ticket inherits a bad reference.

Fix what you can (right section, right label); raise what you can't.

## 3. Granularity and story independence

Against Rules 1 and 2 in `epic-plan`:

- **A ticket that isn't one reviewable unit of behavior.** Signals: it needs three paragraphs to describe, touches every layer, has an "and" in its title doing real work, or is the only ticket in a non-trivial story. Propose the split, with the seam.
- **A ticket that isn't independently testable.** If you can't name a test that would fail without it, it isn't a ticket — it's half of one.
- **A story that doesn't end in a working state.** Walk its tickets in order and ask what a user can do when the last one lands. If the answer is "nothing yet, the next story finishes it," the story boundary is wrong and story validation will pass a broken feature.
- **A dependency the order violates** — ticket 03 needing something ticket 05 builds.

## 4. False positives in the plan

**A false positive is a ticket that will look done without delivering what it claims.** The test-level version of this is Phase 9's job; this is the plan-level version, and it's the more expensive one because the ticket is written before anyone notices.

Where they hide:

- **Acceptance-criteria bait.** The *Delivers* line promises user-visible behavior, but everything it names could be satisfied by a change nobody can observe — a module that exists, a field that's stored, a function that returns. Ask: when this ticket is done, what is different that someone could look at? If there's no answer, the ticket will close green and deliver nothing.
- **The last-mile gap.** A story where every ticket builds a piece and none of them wires the pieces together. Extremely common, and it always surfaces at story validation instead of here.
- **Untestable by construction.** A ticket whose behavior only shows up through something the plan defers to a later story — so any test written for it will assert on a stub.
- **Delivers restating the title.** "Ticket 02 — Session store. Delivers: a session store." That's not a claim, so nothing can fail it.

For each, name the ticket and what would let it pass without delivering. Fix by sharpening the *Delivers* line into an observable claim, or by moving the wiring into a ticket that owns it.

## 5. Ask the plan's major assumptions

The plan makes assumptions the epic PRD and architecture don't settle — a boundary, a data shape, an ordering, a convention every later ticket will bind to. **These are the ones that get harder to change as the codebase grows**, which is exactly why they're caught here rather than mid-ticket.

One `AskUserQuestion` pass, **at most 5**, options carrying **future-proof** and **cheaper now**. Each option says what it commits the epic to.

Only ask what the plan genuinely rests on. An assumption confined to one ticket belongs to that ticket's planning, not here. Minor ones aren't surfaced.

Write each answer into the plan where it belongs — a ticket's *Notes*, a story's *Delivers*, a sharpened reference — not into a list of decisions. **Never leave an open question in the plan.**

## 6. Fix, and say what changed

Apply the corrections to `<epic>/implementation-plan.md` directly: split tickets, reorder, sharpen *Delivers* lines, fix references, add a missing ticket for dropped coverage, cut invented scope the operator agreed to cut.

Two things you don't do on your own: **cutting scope** the operator hasn't agreed to cut, and **restructuring a story boundary** — both change what gets validated, so propose and let them decide.

**Stamp the plan.** Once the fixes are in, write a line directly under the plan's title:

```
# <Project> — Epic plan: <name>
_Validated: <YYYY-MM-DD>_
```

That line is the only filesystem signal this phase ran, and it's what tells anyone picking the work back up that ticket planning is safe to start. An unstamped plan is an unvalidated plan.

## Checkpoint

```
## Plan validation — <epic>

- Coverage: <what was dropped or invented, one line each — or "complete">
- References: <n> checked, <what was wrong — or "all resolve">
- Granularity: <tickets split or reordered — or "holds">
- False positives: <ticket and what would let it pass hollow — or "none found">

Plan updated in place. Unresolved: <what needs the operator's decision — or nothing>
```

That's the whole output. **"None found" on every line is a complete, correct validation** — say it in one line and stop. Don't re-list the plan, don't restate the fixes in prose, and don't name what runs next.
