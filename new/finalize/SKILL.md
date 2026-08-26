---
name: finalize
description: Close out a delivered scope — reconcile the code this scope wrote against the requirements it claimed and put every divergence to the operator as a choice between changing the code and updating the docs, move each project requirement's status to ✅ 🔨 or 📝 against what the code actually does, wipe docs/scope/, and hand over what deploying the scope takes. The only phase that leaves a durable trace the scope's work happened. Runs once per scope, after its criteria are met. Trigger on "finalize the scope", "close out the scope", "the scope is done", "wrap up this scope".
---

# Finalize

Close out the delivered scope. This is step 5 of the dev system, it runs once per scope, and it is the last thing that happens before `docs/scope/` is gone.

The scope docs are wiped here. What survives is the codebase and `docs/project/prd.md` — so the reconciling and the status update happen **before** the wipe, never after.

> **Read the `conventions` skill before anything below.** It carries the rules every phase follows — asking the operator, reference numbers and citing, status markers, diagrams, and what goes in the chat.

## The sweep is bounded

This phase is not an audit of the codebase. It covers exactly two things:

- **the code this scope wrote or changed**, and
- **the requirements `docs/scope/prd.md` claimed** to refine.

Anything outside that pair is pre-existing drift. **Name it in a line at the end and leave it** — resolving it here turns a close-out into an open-ended review, and it is not what the operator asked for.

Inside the boundary there are three findings, and only the first two are questions:

| Finding | What it is | What happens |
| ------- | ---------- | ------------ |
| **Contradicts** | The code does something a project requirement or decision says otherwise about — a different limit, an unreachable state, an extra step, different wording. | Asked in step 1. |
| **Undocumented** | The code does something user-visible that no requirement covers. Scope that crept in and landed. | Asked in step 1 — it becomes a requirement or it comes out. |
| **Unbuilt** | A requirement the scope claimed that the code does not satisfy. | **Not a question.** It is status, and step 2 records it. Never put it to the operator twice. |

Internal structure, naming, and anything no requirement speaks to are not findings.

## How it runs

1. **Reconcile.** Read the code inside the boundary against `docs/project/prd.md` and `docs/project/tdd.md`, and **verify rather than trust** — walk each checked criterion in the plan to the code that satisfies it. A criterion whose behavior is not in the code is unbuilt whatever its box says.

   Every contradiction and every undocumented finding goes to the operator with `AskUserQuestion`, most expensive to live with first. Options always include:
   - **Change the code** — the requirement or decision holds and the software is wrong. Say in a line or two **how** the fix is done and where it lands, so they can price it. Usually the **future-proof** option.
   - **Update the docs** — what the code does is what the product should do. Show it as an edit: what the requirement says now, and what it would say instead. Usually the **cheaper now** option.
   - **Leave it and record the requirement as 🔨** — where the fix is more than one substep's worth of work. Say so on the option rather than promising a fix that needs its own scope.

   Apply whatever they choose, and get the tests covering it green — proved the same way `build` proves any test.

2. **Update the statuses.** Set the marker on every project PRD feature and requirement against what the code actually does, per `conventions` § Status markers. Under each 🔨, list what is still missing — one line per blocker, in what the operator would observe. **This is the only phase that moves a marker.**

   This is a status update. **Never change what a requirement says here, never renumber, and never delete a requirement because it shipped** — every reference in the system points at numbers. The only edits to requirement text are the ones the operator chose in step 1.

3. **Wipe the scope.** Delete everything in `docs/scope/`. Only after steps 1 and 2 are written.

4. **Hand over the deployment.** Say what the operator has to do for the delivered scope to run: infrastructure to provision or change, environment variables to set, migrations to run, third-party services to configure, keys to rotate. Each step says **the exact thing to do**, **when it happens relative to the deploy**, and **what breaks without it**. Nothing invented — every step traces to the code. Say "none" out loud when the scope needs nothing; silence reads as an omission. This exists nowhere else once the scope is wiped, so it goes in the chat in full.

5. **Report the progress**, in one line, measured against `docs/project/prd.md`:

   ```
   Project: 68% of functional requirements complete (34 of 50).
   ```

   Complete means ✅. Count 🔨 and 📝 alike as not complete. Count requirements only — feature rows are derived from them.

## Rules

- **Never close a divergence yourself.** Not by picking the side that looks more sensible, and not by writing it down somewhere and moving on. One of the two sides actually changes, and the operator picks which.
- **Stay inside the boundary.** Pre-existing drift is named at the end, never fixed here.
- **The wipe is last.** A scope wiped before the fold-back loses the only durable trace its work happened.
- **Status is not a rewrite.** Requirements are not deleted because they shipped, not renumbered, and not tidied while you are in there.
- **Say what is left.** Every 🔨 carries what is still missing from it. A partial requirement with no blocker listed reads as done to whoever comes next.
- **Never weaken a test or a requirement to reach green.** A red test means the fix is not finished.


## Asking

Question sets follow `conventions` § Asking the operator. One caveat specific to this phase: the code fix is usually **future-proof** and the doc edit **cheaper now**, but say what is actually true — when a requirement is simply stale, changing it is both the cheap and the correct answer, and dressing that up as a trade-off pushes the operator toward pointless work.
