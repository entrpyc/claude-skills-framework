---
name: finalize
description: Close out a delivered scope — reconcile the code this scope wrote against the requirements it claimed and put every divergence to the operator as a choice between changing the code and updating the docs, move each project requirement's status to ✅ 🔨 or 📝 against what the code actually does, never downgrading a previous scope's ✅ without saying so, sweep the plan and the diff for what deploying the scope takes, hand that over, and only then wipe docs/scope/. The only phase that leaves a durable trace the scope's work happened. Runs once per scope, after its criteria are met. Trigger on "finalize the scope", "close out the scope", "the scope is done", "wrap up this scope".
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

   **Never downgrade quietly.** A ✅ from an earlier scope that this scope's work has broken or taken a piece back out of gets moved to 🔨 — **and named in the checkpoint.** A marker that walks backwards without anyone being told is a regression the system has recorded and nobody has read.

   This is a status update. **Never change what a requirement says here, never renumber, and never delete a requirement because it shipped** — every reference in the system points at numbers. The only edits to requirement text are the ones the operator chose in step 1.

3. **Sweep the deployment steps — before the wipe, because two of the three sources are about to be deleted.** The app is already running; this scope's code changes what it needs around it, and nothing else in the system tells the operator what those changes are.

   Sweep three sources, in this order:

   - **`docs/scope/plan.md`** — every substep's *Prerequisites* block and every substep's *Manual steps* block, including substeps built in earlier runs.
   - **The fixes applied in step 1**, which came after those and can have introduced their own.
   - **The scope's diff**, for what nobody wrote down: a new variable read from the environment, a migration file, a new process or scheduled job, a dependency needing something installed on the host, a third-party credential or callback the code now expects.

   Cover, wherever the scope touched them:

   | Category | What to look for |
   | -------- | ---------------- |
   | Environment and secrets | Variables added, changed or removed — and **which environments**. |
   | Data | Migrations, backfills, anything that must be seeded before a user hits it. |
   | Processes | New workers, queues, or scheduled jobs to start or register. |
   | Third party | Keys, webhooks, callback and redirect URLs, permissions, DNS. |
   | Runtime and build | A new system dependency, a changed language or runtime version. |
   | Flags | Feature flags to flip, and in what order. |

   Then **merge them into one ordered list the operator can execute top to bottom.** De-duplicate — three substeps needing the same variable is one step — and drop anything already done in an earlier run, since some steps were needed to build and are already live.

   Each step carries three things and stays one line where it can: **the exact thing to do** — the real variable name, the real command, the real setting, never "configure the payment env vars"; **when, relative to the deploy** — before the new code goes live, after, or either; and **what breaks without it**, in what the operator would observe.

   Two rules. **Nothing invented** — every step traces to a prerequisite, a step-1 fix, or the diff; a plausible-sounding step the code does not need is worse than none, because the operator will run it. And **say "none" out loud** when the scope genuinely needs nothing: silence reads as an omission, and they have no way to tell the difference.

   **Mark any step that is irreversible or takes the app down** — a destructive migration, a rename that breaks in-flight requests, a credential rotation. Sequencing it is theirs, but only if they know.

   The list goes in the chat in full (see *Deployment handover* below). It is never written into `docs/project/prd.md` — that document is what the product is meant to be, not how this release gets rolled out.

4. **Wipe the scope.** Delete everything in `docs/scope/`. Only after steps 1, 2 and 3 are done — this is the last moment the plan exists. **Leave `docs/design-references/` alone**; it belongs to the operator and spans scopes.

5. **Report the progress**, in one line, measured against `docs/project/prd.md`:

   ```
   Project: 68% of functional requirements complete (34 of 50).
   ```

   Complete means ✅. Count 🔨 and 📝 alike as not complete. Count requirements only — feature rows are derived from them.

## Rules

- **Never close a divergence yourself.** Not by picking the side that looks more sensible, and not by writing it down somewhere and moving on. One of the two sides actually changes, and the operator picks which.
- **Stay inside the boundary.** Pre-existing drift is named at the end, never fixed here.
- **The wipe is last.** A scope wiped before the fold-back loses the only durable trace its work happened — and a scope wiped before the deployment sweep takes the prerequisites with it.
- **Status is not a rewrite.** Requirements are not deleted because they shipped, not renumbered, and not tidied while you are in there.
- **Say what is left.** Every 🔨 carries what is still missing from it. A partial requirement with no blocker listed reads as done to whoever comes next.
- **Never downgrade quietly.** A previous scope's ✅ that is now 🔨 is changed and said out loud.
- **Never weaken a test or a requirement to reach green.** A red test means the fix is not finished.


## Deployment handover

Step 3's list, printed after the progress line. Exempt from what `conventions` keeps out of the chat — like the manual steps after a build, it is an interaction rather than a record, and it is the only copy that will exist once the wipe runs.

```markdown
## To deploy this scope

The app is already running; these are the changes it needs around it.

### Before the new code goes live
1. <exact action> — without it: <what the operator would see>

### After
1. <exact action> — without it: <what the operator would see>

### Either order
- <exact action> — without it: <what the operator would see>

<!-- or, when the scope needs nothing: -->
Nothing to do — this scope needs no environment, migration, or configuration change.
```

Keep the ordering headings only where they have entries, and mark any step that is destructive or takes the app down.

## Asking

Question sets follow `conventions` § Asking the operator. One caveat specific to this phase: the code fix is usually **future-proof** and the doc edit **cheaper now**, but say what is actually true — when a requirement is simply stale, changing it is both the cheap and the correct answer, and dressing that up as a trade-off pushes the operator toward pointless work.
