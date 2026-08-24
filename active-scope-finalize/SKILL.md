---
name: active-scope-finalize
description: Close out a delivered active scope — reconcile the codebase against the project PRD, put every contradiction to the operator as a choice between changing the PRD and fixing the code, apply what they choose and get the tests covering them green, fold the delivered work into the project PRD as complete/partial/not started per feature and per functional requirement, hand over what deploying the scope takes — env vars, migrations, third-party configuration — then wipe docs/active-scope/. The last phase of a scope, and the only thing that leaves a durable trace that its work happened. Runs once per scope, after its criteria are met. Trigger on "finalize the scope", "close out the scope", "the scope is done", "reconcile the code with the prd", "wrap up this scope".
---

# Active-scope finalize

Close out the delivered scope. This is Phase 6, it runs once per scope, and it does four things **in this order and never out of it**:

1. **Reconcile** — find where the codebase and `docs/project/prd.md` now disagree, and let the operator settle each one.
2. **Fold** — record, per feature and per functional requirement, what is now `complete`, `partial`, or `not started`.
3. **Hand over** — collect what deploying this scope takes, from documents that are about to be deleted.
4. **Wipe** — delete `docs/active-scope/prd.md` and `implementation-plan.md`.

**The wipe is what makes the other three load-bearing.** Once it runs, the scope's PRD and plan are gone for good — the codebase and the project PRD's Delivery status table are the entire record of what was built and what is left (`dev-system` § *The scope cycle*). A scope wiped without a fold-back loses its only durable trace, so **the wipe is always the last act, and it does not run if anything above it is unsettled.**

> Part of the **dev system** — see the `dev-system` skill for the pipeline, the artifact map, the refinement rule, references, question rules, and the principles that hold across every phase.

## Working conventions

```
docs/
  project/prd.md                       <- read in full; the Delivery status table is written here
  project/architecture.md              <- read only where a contradiction is architectural
  active-scope/prd.md                  <- read: what this scope claimed
  active-scope/implementation-plan.md  <- read: what was claimed done, and the Records
                                          both deleted at the end
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
- Cover it with a test that would fail if the fix weren't there, and **break the code on purpose to confirm that test goes red** (§ 7 there). A green test is a claim until you've seen it fail.
- **Run what the fix touches — not the suite.** Its own test, plus the tests over the code paths it changed and anything that binds to what you edited. **Don't run the full suite here.** Phase 5 already gated it, every fix in this phase is bounded to under a task's worth of work, and a full run per fix is the most expensive way in the system to re-establish something already established. Never `.skip` anything to get green, and never report a test you didn't run.

**The exit condition is that every settled fix is green on the tests that cover it**, and that you have looked at what else reaches the code you changed rather than assuming nothing does. Red means the work is still in progress — keep going, don't fold, don't wipe, and don't report the run as finished. There are exactly two ways out of red:

- **Fix it** — the normal case, and the one to exhaust first.
- **Go back to the operator** — when the fix turns out bigger than the option promised, or green would need a design change they didn't agree to. Say what it actually costs and offer the defer (§ 4's third option), then act on their answer. This is `active-scope-implementation` § 5 in miniature: put it as a question, don't pick the way out yourself.

**The full suite is the operator's, not this phase's.** Where you landed any code fix at all, say so in the checkpoint as the one thing to run before the work is accepted — a narrow pass is narrow evidence, and it's theirs to price, not yours to skip silently.

**Never weaken a test, a requirement, or a criterion to reach green.** That converts a real failure into a documented one, and the whole point of this phase is the opposite.

**PRD edits** — this is the **only** place in the system licensed to change what a project requirement says, and it happens solely on an operator's answer here. Two rules:

- **Numbering is immutable.** Never renumber, and never delete a requirement because it shipped or was dropped — every reference in the system points at numbers. A new requirement is appended with the next free number under its feature.
- **Edit the requirement, not its neighbours.** Tidying the surrounding text turns a recorded decision into an untracked rewrite.

**Nothing below this step starts until every settled fix and PRD edit has landed, green on the tests that cover it.** A fold or a wipe over a red test leaves the docs describing something that doesn't run — and the scope documents that would have explained it are the ones about to be deleted.

### 6. Fold the status into the project PRD

The fold is **two writes, and both are mandatory**: a marker on every requirement line where the requirement is stated, and the summary table at the end. They are one judgment written twice — a marker that disagrees with its table row is a bug, not a nuance. Skipping the markers is the common failure: the table is easy to write and easy to leave as the only record, and then the requirement a reader is actually looking at says nothing about whether it exists.

**Markers on the requirement lines**

`docs/project/prd.md` carries a status marker on each requirement, and on each feature heading:

| Marker | Status | Means |
|---|---|---|
| ✅ | `complete` | Met and observable in the running code. |
| 🔨 | `partial` | Some of it is met. The rest is named in the table's *Missing* column. |
| 📝 | `not started` | None of it is met. |

- **Match the file's existing convention exactly** — the same character, in the same position on the line, as the markers already there. Only where the PRD has none anywhere does the placement become yours: put it at the front of the line, before the requirement number, and use it uniformly.
- **Every requirement carries one, not just this scope's.** A line with no marker is ambiguous — it reads as untracked rather than unbuilt. Requirements nothing has touched get 📝.
- **Feature headings are derived**, the same rule as the table: ✅ only when every requirement under it is ✅, and one 🔨 makes the feature 🔨.
- **The marker is the only thing that changes.** Adding or updating one never rewords the requirement, never renumbers it, and never touches the line's neighbours. The single exception is an edit the operator settled in step 5.
- **Never downgrade quietly** — a ✅ from an earlier scope that is now 🔨 gets changed *and* named in the checkpoint.

Then write the table.

**The summary table**

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

**Then count the project, once.** Across **every** functional requirement in the project PRD — all features, not just this scope's — count the ones now `complete` and divide by the total. `partial` and `not started` requirements count as not done; a requirement is never half-counted. Round to a whole percent and carry the raw counts, and count requirements only — feature rows are derived, so counting them too would double-count the same work. This number goes in the checkpoint as a single line.

### 7. Collect what deploying this scope takes

**The app is already deployed and running. This scope's code changes what it needs to run correctly, and nothing else in the system tells the operator what those changes are.** Every task's *Record* carries an **Operator steps** line, and `implementation-plan.md` — the only place they exist — is deleted in the next step. Gather them now or they are gone.

Sweep three sources, in this order:

- **Every task's *Operator steps*** in the plan, including tasks from earlier runs of this scope. These are the ones already known.
- **The step-5 fixes**, which were written after those Records and can have introduced their own.
- **The scope's diff**, for what nobody wrote down: a new variable read from the environment, a migration file, a new process or scheduled job, a dependency needing something installed on the host, a third-party credential or callback the code now expects.

Then merge them into **one ordered list the operator can execute top to bottom.** De-duplicate — three tasks needing the same variable is one step — and drop anything already done in an earlier run, since some steps were needed to build and are already live.

Each step carries three things and stays one line where it can:

- **The exact thing to do** — the real variable name, the real command, the real setting. `Set STRIPE_WEBHOOK_SECRET in production` is a step; "configure the payment env vars" is a note that will be got wrong.
- **When, relative to the deploy** — before the new code goes live, after, or either. A migration that the old code can't run against and a variable the new code reads at boot are both ordering failures, and they fail in production, not in tests.
- **What breaks without it** — in what the operator would observe, the same as an edge case. This is what lets them decide whether to deploy at all tonight.

Cover, where the scope touched them: environment variables and secrets (added, changed, removed — say which environments); database migrations and backfills; new processes, workers, queues, or scheduled jobs that must be started or registered; third-party configuration the code now depends on — keys, webhooks, callback and redirect URLs, permissions, DNS; runtime and build changes such as a new system dependency or a changed language version; feature flags to flip; and anything that must be seeded before a user hits it.

Two rules. **Nothing invented** — every step traces to a Record, a step-5 fix, or the diff; a plausible-sounding deployment step the code doesn't need is worse than none, because the operator will run it. And **say "none" out loud** when the scope genuinely needs nothing: silence reads as an omission, and the operator has no way to tell the difference.

**Where a step is irreversible or takes the app down** — a destructive migration, a rename that breaks in-flight requests, a credential rotation — say that on the step. It's theirs to sequence, but only if they know.

The list goes in the checkpoint, where the operator acts on it. It is not written into `docs/project/prd.md`: that document is what the product is meant to be, not how this release gets rolled out.

### 8. Wipe `docs/active-scope/`

Preconditions, all of them: every contradiction settled, every settled code fix landed and green on the tests that cover it, the table written and checked, **and the deployment steps collected** — this is the last moment they exist. Then delete `prd.md` and `implementation-plan.md`.

Leave `docs/design-references/` alone — it belongs to the operator and spans scopes. If `docs/active-scope/` holds anything else, leave it and name it in the checkpoint; it isn't yours.

The next scope starts when the operator pulls `active-scope-prd` themselves. **Don't suggest it.**

## Checkpoint

Point at the Delivery status table, then give the project's progress as **one line and nothing more** — the percent of the project PRD's functional requirements now `complete`, with the counts behind it:

```
Project: 68% of functional requirements complete (34 of 50).
```

One line, whatever the number. No per-feature breakdown, no comparison to where the scope started, no comment on whether it's good progress — the table underneath already carries the detail.

Then only what the operator wouldn't anticipate:

- **every requirement whose text changed**, quoted — this is the one phase that can change what the product is meant to be, and it should never be discovered later;
- **everything marked `partial`, and what's missing from each** — the most expensive thing here to lose;
- anything downgraded from a previous scope's `complete`;
- contradictions deferred rather than fixed, and what the operator lives with meanwhile;
- pre-existing drift found outside the boundary, in a line — noted, not fixed here;
- work the plan claimed done that the code doesn't do, said plainly;
- **if any code fix landed: that the full suite hasn't been run, and which tests were.** One line. It's the only verification this phase leaves to them, so it can't be the line that gets trimmed.

Don't list the features back at them, don't recap what the scope built, and don't name what runs next.

## Deployment handover

Step 7's list, printed after the lines above. **Exempt from the five-line cap** — like phase 5's manual-validation checklist, it's an interaction rather than a record, and it is the only copy that will exist once the wipe runs.

```
## To deploy this scope

The app is already running; these are the changes it needs around it.

### Before the new code goes live
1. <exact action> — without it: <what the operator would see>
2. <exact action> — without it: <what the operator would see>

### After
1. <exact action> — without it: <what the operator would see>

### Either order
- <exact action> — without it: <what the operator would see>

<!-- or, when the scope needs nothing: -->
Nothing to do — this scope needs no environment, migration, or configuration change.
```

Mark any step that is destructive or takes the app down. Keep the ordering headings only where they have entries.
