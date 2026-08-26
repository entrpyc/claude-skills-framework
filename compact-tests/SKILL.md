---
name: compact-tests
description: Split the test suite in two — locally only one happy-path test per acceptance criterion runs, and only where the criterion traces up to a functional requirement in docs/project/prd.md; everything else moves to a suite that runs on the GitHub pipeline and never on the operator's machine. Nothing is deleted, no source code and no test file changes. Runs only on a green suite, never to reach green, and reports what stopped being checked locally. Read by finalize, which runs it over the scope's tests before wiping the plan, and pulled directly whenever the operator aims it at a slow suite. Trigger on "compact the tests", "the suite is too slow", "trim the test suite", "cut the edge case tests", "leave only happy path tests", "move the slow tests to CI".
---
# Compact tests

Split the suite in two along one line:

- **Local** — one happy-path test per acceptance criterion, covering a **functional** requirement of `docs/project/prd.md`. Nothing else. This is what runs while the operator is waiting.
- **CI** — everything else, *plus* all of the above. Runs on the GitHub pipeline, and **never on the operator's machine.**

Nothing is deleted and no test is rewritten. What changes is **where** a test runs, and therefore **when** a failure is found.

The local suite exists to answer one question while someone waits on it: *does the product still do what it is required to do?* Every test that answers a different question — a boundary, an error branch, a second case of a behavior already covered — was being paid for on every local run, and answers it on the pipeline for free.

> **Read the `conventions` skill before anything below.**

**`finalize` runs this over every scope, at its step 4** — while the scope is green and `docs/scope/plan.md` still exists, because that plan is the only record of which test proves which criterion. Pulled on its own it works the same way, on whatever the operator aims it at.

## This is not a way to reach green

`conventions` § Reaching green forbids weakening a test, a criterion or a requirement to reach green, and that rule is untouched by this one. Three bounds keep them from ever meeting:

- **The suite must be green before this skill runs.** A red test is a result, not a candidate — report it and change nothing.
- **Nothing is deleted, and no source code is touched.** A test that changes behavior when it moves has been edited; that is a failed move, not a compaction.
- **The operator picks.** Nothing moves that they did not choose.

Every test that existed before this runs still runs on every push afterwards. What is traded away is how early a failure surfaces, never whether it does.

## How it runs

1. **Green first, and measure.** Run the whole suite. Red anywhere — stop, report it, change nothing. Green: record the wall clock and the per-file timings. The timings are the only reason this skill exists, so they order everything the operator is shown.
2. **Trace every test to a project requirement.** For each test, answer one question: **which functional requirement in `docs/project/prd.md` § 2 does this ultimately prove?**

   The chain is one the system already maintains (`conventions` § Citing): the test is named by an acceptance criterion in `docs/scope/plan.md`, the criterion references a scope PRD requirement, and that requirement names its project PRD parent. Where the plan is gone — `finalize` wipes it — trace from the code the test exercises to the requirement that code implements.

   Two kinds of test come out of this with no chain, and they are the bulk of what moves to the pipeline:

   - **No parent at all** — it proves something real about the code that no requirement asks for.
   - **A non-functional parent** — it lands on `docs/project/prd.md` § 3 rather than § 2. **Name these separately when you ask.** A performance, security or accessibility guarantee that only runs on the pipeline is found broken after the push rather than before it, and that is a different decision from deferring a boundary case.
3. **Pick the one test that stays local, per criterion.** Group what is left by the acceptance criterion it proves. **Exactly one stays local.**

   - **The happy path wins** — the test that runs the behavior as it is meant to be used: valid input, everything present, nothing failing.
   - Where two are both happy path at different levels, **keep the cheaper one local** — unless the expensive one is the only place the pieces actually meet. An integration seam is not provable at unit level, and keeping a unit test in its place proves the halves and not the join.
   - Where none is a happy path, keep the cheapest and **say the criterion has no happy-path proof.** That is a hole in the tests, not a result of this skill, and it was there before.
   - **A criterion never drops to zero local tests.** If following the rules would empty one, the rules stop.
4. **Put the split to the operator** — `AskUserQuestion`, ordered by seconds saved, **grouped and never enumerated.** Each group says what it is, how many tests, how many seconds it gives back locally, and **what is no longer caught before a push.** Say what the local suite drops to in total. Whatever they exclude stays local.
5. **Move them, and wire the pipeline in the same run.** Two halves, and the second is what makes the first safe.

   **The split** uses the grouping the project's runner already has — a `vitest` or `jest` project, a `playwright` project, a directory the default config excludes, a tag. Never invent a mechanism the repo does not already use. When you are done:

   - the **default local command runs the happy-path tests only**, and nothing the operator types by habit reaches the moved ones;
   - **one named command runs the moved tests**, because the pipeline has to call something;
   - **no test file was edited.** If a test fails because it moved, the harness is wrong — fix the harness, never the assertion.

   **The pipeline** is not a follow-up. A moved test with nothing running it is a deleted test with extra steps. In `.github/workflows/`:

   - **Extend the workflow that already runs tests** if there is one — add a job to it. Create a workflow only when none exists.
   - **The pipeline runs everything** — the happy-path suite and the moved suite both. Full coverage lives there now, so it can never be the smaller run.
   - **On `push` and on `pull_request`**, so the moved tests gate a merge rather than trail it.
   - **The job fails the build when the moved suite is red.** A `continue-on-error` on this job turns the whole split into deletion.
6. **Prove both halves, and report two numbers.** Run the local command — green, and its new wall clock against the old one. Run the moved suite's command **by hand, once** — green, and note what it costs. That is the last time it runs on this machine, and it is how you prove the pipeline has something that works to call.

   **A red moved suite is a failed move** — restore everything and report. Do not fix it forward.
7. **Hand over the push.** The workflow cannot be proved from here. Tell the operator that **the first push is its verification** — name the workflow file and the job, and say what they will see if it is wrong. The command that runs the moved tests goes into `package.json` and wherever the project documents its tests — **not** into `docs/scope/plan.md`, which `finalize` deletes.

## Rules

- **Green before, green after, both halves.** This skill never runs on red and never leaves red.
- **Move, never delete.** The git history is not a test suite.
- **One local test per criterion; every test on the pipeline.**
- **No source code changes, and no test file changes.**
- **A criterion never drops to zero local tests**, whatever it costs in seconds.
- **No pipeline, no move.** The workflow lands in the same run as the split. Moving tests out of the local suite and leaving the pipeline to a later session is how coverage disappears quietly.
- **The pipeline is the larger run, always.** The moment it runs a subset, the moved tests are owned by nobody.
- **Say what stopped being caught before a push**, grouped, one line each. The operator is trading feedback latency for local speed and has to see both halves.

## What goes in the chat

Per `conventions` § What goes in the chat:

- **the two numbers** — the local suite before and after, and what the moved suite costs on the pipeline;
- **what is no longer caught locally**, grouped, one line each;
- **the workflow file and job that now own the moved tests**, and that the first push is what verifies them.

Then stop. Not the file list, not the reasoning, not what could be compacted next.
