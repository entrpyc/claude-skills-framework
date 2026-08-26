---
name: finalize
description: Close out a delivered scope — reconcile the codebase against the project PRD and TDD and put every divergence to the operator as a choice between changing the code and updating the docs, move each project requirement's status to ✅ 🔨 or 📝 against what the code actually does, wipe docs/scope/, and hand over what deploying the scope takes. The only phase that leaves a durable trace the scope's work happened. Runs once per scope, after its criteria are met. Trigger on "finalize the scope", "close out the scope", "the scope is done", "wrap up this scope".
---

# Finalize

Close out the delivered scope. This is step 5 of the dev system, it runs once per scope, and it is the last thing that happens before `docs/scope/` is gone.

The scope docs are wiped here. What survives is the codebase and `docs/project/prd.md` — so the reconciling and the status update happen **before** the wipe, never after.

## How it runs

1. **Reconcile.** Read the codebase against `docs/project/prd.md` and `docs/project/tdd.md` and find where they diverge — a requirement the code contradicts, a decision the code did not follow, behavior the code has that no requirement asks for. Every divergence goes to the operator with `AskUserQuestion`. Options always include:
   - **Change the code** — the requirement or decision holds and the software is wrong. Say in a line how the fix is done, so they can price it.
   - **Update the docs** — what the code does is what the product should do. Show it as an edit: what the requirement says now, and what it would say instead.
   - Whatever else fits.

   Apply whatever they choose, and get the tests covering it green. **A requirement nothing has built yet is not a divergence** — that is status, and step 2 carries it.
2. **Update the statuses.** Set the prefix on every project PRD feature and requirement the scope touched, against what the code actually does: **✅ done**, **🔨 partially done**, **📝 not started**. Under each 🔨, name what is still missing. This is a status update — **never change what a requirement says** here; the only edits to requirement text are the ones the operator chose in step 1.
3. **Wipe the scope.** Delete everything in `docs/scope/`. Only after steps 1 and 2 are written.
4. **Hand over the deployment.** Say what the operator has to do for the delivered scope to run: infrastructure to provision or change, environment variables to set, migrations to run, third-party services to configure, keys to rotate. This exists nowhere else once the scope is wiped, so it goes in the chat in full.
5. **Report the progress**, in one line, measured against `docs/project/prd.md`:

   ```
   Project: 68% of functional requirements complete (34 of 50).
   ```

   Complete means ✅. Count 🔨 and 📝 alike as not complete.

## Rules

- **Never close a divergence yourself.** Not by picking the side that looks more sensible, and not by writing it down somewhere and moving on. One of the two sides actually changes, and the operator picks which.
- **The wipe is last.** A scope wiped before the fold-back loses the only durable trace its work happened.
- **Status is not a rewrite.** Requirements are not deleted because they shipped, and their text is not tidied while you are in there.
- **Say what is left.** Every 🔨 carries what is still missing from it. A partial requirement with no blocker listed reads as done to whoever comes next.
