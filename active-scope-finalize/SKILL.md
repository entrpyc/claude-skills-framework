---
name: active-scope-finalize
description: Close out a delivered active scope — reconcile the codebase against the project PRD, put every contradiction to the operator as a choice between changing the PRD and fixing the code, apply what they choose and get the full test suite green, fold the delivered work into the project PRD as complete/partial/not started per feature and per functional requirement, then wipe docs/active-scope/. The last phase of a scope, and the only thing that leaves a durable trace that its work happened. Runs once per scope, after its criteria are met. Trigger on "finalize the scope", "close out the scope", "the scope is done", "reconcile the code with the prd", "wrap up this scope".
---

# Active-scope finalize

Close out the delivered scope. This is Phase 6, it runs once per scope, and it does three things **in this order and never out of it**:

1. **Reconcile** — find where the codebase and `docs/project/prd.md` now disagree, and let the operator settle each one.
2. **Fold** — record, per feature and per functional requirement, what is now `complete`, `partial`, or `not started`.
3. **Wipe** — delete `docs/active-scope/prd.md`, `architecture.md`, and `implementation-plan.md`.

**The wipe is what makes the other two load-bearing.** Once it runs, the scope's PRD, architecture, and plan are gone for good — the codebase and the project PRD's Delivery status table are the entire record of what was built and what is left (`dev-system` § *The scope cycle*). A scope wiped without a fold-back loses its only durable trace, so **the wipe is always the last act, and it does not run if anything above it is unsettled.**

> Part of the **dev system** — see the `dev-system` skill for the pipeline, the artifact map, the refinement rule, references, question rules, and the principles that hold across every phase.

## Working conventions

```
docs/
  project/prd.md                       <- read in full; the Delivery status table is written here
  project/architecture.md              <- read only where a contradiction is architectural
  active-scope/prd.md                  <- read: what this scope claimed
  active-scope/implementation-plan.md  <- read: what was claimed done, and the Records
  active-scope/architecture.md         <- read where a contradiction is architectural
                                          all three deleted at the end
  design-references/                   <- never read, never written, never deleted here
```

The riskiest thing here is marking something `complete` that is `partial` — it reads as delivered everywhere afterwards and nobody ever cuts a scope for the missing half. The second riskiest is wiping before the table is written. The third is quietly picking a side on a contradiction instead of asking.

**This phase is where `dev-system` § *The source of truth* gets enforced, so hold its distinction exactly.** `docs/project/prd.md` is the truth about what the product is meant to be. The code is evidence of what it currently does — a checked criterion is a claim, and the code is what settles it — and it is never an argument that a requirement is wrong. **The operator is the only one who decides which side changes.** You bring the disagreement and the two options; you don't bring a verdict.

## What counts as a contradiction

Bound the sweep, or it becomes an audit of the whole codebase. It covers exactly two things: **the code this scope wrote or changed**, and **the requirements `docs/active-scope/prd.md` claimed to refine**. Anything outside that is pre-existing drift — note it in the checkpoint, don't resolve it here.

Inside that boundary, three findings, and only the first two are contradictions:

- **Contradicts** — the code does something a project-PRD requirement says otherwise about. A different limit, a state that can't be reached, an extra step in a flow, different user-facing wording, a rule enforced somewhere the requirement doesn't put it. **This is the one that gets asked.**
- **Undocumented** — the code does something user-visible that no requirement covers. Scope that crept in and landed. Also asked: it either becomes a requirement or it comes out.
- **Unbuilt** — a requirement this scope claimed, that the code doesn't satisfy. **Not a contradiction, and not a question** — it's a status result, and step 6 records it as `partial` or `not started`. Don't put it in front of the operator twice.

Internal structure, naming, and design that no requirement speaks to are not contradictions. A PRD is *what and why*; code diverging from the architecture is a note for the checkpoint, not a finding here.

## Method

### 1. Check the scope is actually delivered

Read the *Status* line and the checkboxes in `docs/active-scope/implementation-plan.md`.

If criteria are unchecked, **don't refuse and don't finalize silently.** Say how many and which groups, and ask (`AskUserQuestion`) whether to implement the remainder first — Phase 5, a separate run — or finalize now and fold the unbuilt criteria as `partial` / `not started`. Abandoning the rest is a legitimate answer; making that call by accident is not.

### 2. Read what was claimed, then read what runs

`docs/active-scope/prd.md` for what this scope said it would deliver, and the plan's checked criteria and *Records* for what implementation says it did — the *Edge cases* and *Reworked* entries are where the gap between claim and code usually shows first. Then read the code that backs each one.

**Verify, don't trust.** Walk each checked criterion to the code that satisfies it. A criterion whose behavior you can't find in the code is unbuilt no matter what its box says — say so rather than folding a claim.

### 3. Find the contradictions

Work through the project PRD's requirements inside the boundary above, and write the findings as one table. **Clean matches don't get rows.**

```
| Finding | Project PRD | What the code does | Kind |
|---|---|---|---|
| Cart item cap | 3.2.1 — max 100 items | rejects at 50 | contradicts |
| Guest checkout | — | fully implemented and reachable | undocumented |
| Refund from order page | 4.1.3 — initiated from order detail | only from the admin list | contradicts |
| Saved cards | 3.2.4 | not implemented | unbuilt — status, not a question |
```

An empty table is a real result. Say "none found" rather than manufacturing rows.

### 4. Put every contradiction to the operator

**One question per contradiction**, `AskUserQuestion`, at most 5 per pass, most expensive-to-live-with first; more than five means more than one pass, batched rather than trickled. Never resolve one yourself, and never resolve one by leaving it out.

This is the reconciliation `dev-system` § *The source of truth* requires, asked systematically instead of opportunistically — so every question carries at least its two options:

- **Fix the code to match the PRD** — and **one or two sentences on how the fix is done**, naming the place it lands. *"Raise the cap constant in the cart validator from 50 to 100, and update the message the user sees when they hit it."* An option that just says "fix the code" is a blank cheque the operator can't price; the how is the option.
- **Update the project PRD to match the code** — quoting the edit: what the requirement says now, and what it would say instead. This changes what the product is meant to be, so it is shown as an edit, not as a direction.

A third option where it applies, and it often does:

- **Leave it and record the requirement as `partial`** — for when the code fix is real work. **A fix that needs its own task is not a fix.** If it exceeds roughly one task's worth of work (`active-scope-plan` Rule 2 — one reviewable behavior, a diff that fits in your head), say so on the option and offer the defer instead; it becomes a later scope's work, with the gap visible in the table meanwhile.

Label per `dev-system` § *Asking the operator* — usually the code fix is **future-proof** and the PRD edit **cheaper now**, but say what's actually true: when the requirement is simply stale, changing it is both the cheap and the correct answer, and dressing it up as a trade-off pushes the operator toward pointless work.

For an **undocumented** finding the two options are: add it to the project PRD as a numbered requirement, or take the code out — with the same one-to-two-sentence how on the removal.

### 5. Apply what they settled

**Code fixes — every one they chose gets built, and this step is not finished until the tests are green.** An answer of "fix the code" is not a note for later; the fix lands here, in this run.

For each one:

- Write the least code that satisfies the requirement, exactly as in `active-scope-implementation` § 3 — the requirement is the ceiling, and the edges it doesn't name are not yours to handle.
- Cover it with a test that would fail if the fix weren't there, and **break the code on purpose to confirm that test goes red** (§ 8 there). A green test is a claim until you've seen it fail.
- **Run the full suite, not the tests you touched.** Never narrow the run, never `.skip` anything to get green, and never report a suite you didn't run.

**The exit condition is a green full suite.** Red means the work is still in progress — keep going, don't fold, don't wipe, and don't report the run as finished. There are exactly two ways out of a red suite:

- **Fix it** — the normal case, and the one to exhaust first.
- **Go back to the operator** — when the fix turns out bigger than the option promised, or a green suite would need a design change they didn't agree to. Say what it actually costs and offer the defer (§ 4's third option), then act on their answer. This is `active-scope-implementation` § 5 in miniature: put it as a question, don't pick the way out yourself.

**Never weaken a test, a requirement, or a criterion to reach green.** That converts a real failure into a documented one, and the whole point of this phase is the opposite.

**PRD edits** — this is the **only** place in the system licensed to change what a project requirement says, and it happens solely on an operator's answer here. Two rules:

- **Numbering is immutable.** Never renumber, and never delete a requirement because it shipped or was dropped — every reference in the system points at numbers. A new requirement is appended with the next free number under its feature.
- **Edit the requirement, not its neighbours.** Tidying the surrounding text turns a recorded decision into an untracked rewrite.

**Nothing below this step starts until the suite is green and every settled fix and PRD edit has landed.** A fold or a wipe over a red suite leaves the docs describing something that doesn't run — and the scope documents that would have explained it are the ones about to be deleted.

### 6. Fold the status into the project PRD

Record, in a **Delivery status** table at the end of `docs/project/prd.md` — appending the section if it isn't there yet:

```
## Delivery status
_Per feature and functional requirement. Written by active-scope-finalize, once per delivered scope._
_This table is the only record of what is left to build._

| Requirement | Status | Scope | Missing |
|---|---|---|---|
| **3.1 Cart** | complete | checkout | |
| 3.1.1–3.1.4 | complete | checkout | |
| **3.2 Payment** | partial | checkout | saved cards |
| 3.2.1–3.2.3 | complete | checkout | |
| 3.2.4 | not started | — | |
| **4.1 Refunds** | not started | — | |
```

Three statuses and nothing else:

| Status | Means |
|---|---|
| `complete` | Every functional requirement under it is met and observable in the running code. |
| `partial` | Some are met. **The missing part is named**, in a phrase, in the *Missing* column. |
| `not started` | None are met. |

Six rules:

- **A feature is derived, never asserted.** It is `complete` only when every requirement under it is `complete`; one `partial` requirement makes the feature `partial`. Don't round up.
- **`partial` always names what's missing.** A partial marked `complete` is the single most expensive error in this system — the missing half then reads as delivered everywhere and nobody ever cuts a scope for it.
- **Every feature in the project PRD gets a row**, including untouched ones — that is what makes this table the answer to "what's left". Requirements get their own rows individually or as contiguous ranges sharing a status; a feature that is entirely `not started` needs no requirement rows under it.
- **Evidence is the code**, not the plan's checkboxes and not what the scope PRD intended. Where a claim and the code disagree, believe the code and write the status it supports — say so plainly rather than folding the claim. **That is evidence about what exists, never authority about what's right**; a behavior that contradicts a requirement was settled in step 4, and its outcome — not your reading of the code — is what the row records.
- **Status only.** The requirement text is full scope's; only this table is yours. The single exception is an edit the operator settled in step 5.
- **Never downgrade quietly.** If something a previous scope marked `complete` is now `partial` — a regression, or a step-5 fix that took a piece back out — change it and put it in the checkpoint.

Then read the table back against the project PRD's feature list and confirm every feature appears exactly once.

### 7. Wipe `docs/active-scope/`

Preconditions, all of them: every contradiction settled, every settled code fix landed with the suite green, the table written and checked. Then delete `prd.md`, `architecture.md`, and `implementation-plan.md`.

Leave `docs/design-references/` alone — it belongs to the operator and spans scopes. If `docs/active-scope/` holds anything else, leave it and name it in the checkpoint; it isn't yours.

The next scope starts when the operator pulls `active-scope-prd` themselves. **Don't suggest it.**

## Checkpoint

Point at the Delivery status table. Then only what the operator wouldn't anticipate:

- **every requirement whose text changed**, quoted — this is the one phase that can change what the product is meant to be, and it should never be discovered later;
- **everything marked `partial`, and what's missing from each** — the most expensive thing here to lose;
- anything downgraded from a previous scope's `complete`;
- contradictions deferred rather than fixed, and what the operator lives with meanwhile;
- pre-existing drift found outside the boundary, in a line — noted, not fixed here;
- work the plan claimed done that the code doesn't do, said plainly.

Don't list the features back at them, don't recap what the scope built, and don't name what runs next.
