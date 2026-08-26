---
name: compact-tests
description: Cut the default test suite down to what proves the product works — one test per acceptance criterion, the happy path where there is one, and only where the criterion traces up to a functional requirement in docs/project/prd.md. Everything else moves to an on-demand suite that one named command still runs; nothing is deleted and no source code changes. Runs only on a green suite, never to reach green, and reports what stopped being checked on every run. Trigger on "compact the tests", "the suite is too slow", "trim the test suite", "cut the edge case tests", "leave only happy path tests".
---
# Compact tests

Move everything out of the default suite that is not **one happy-path test per acceptance criterion, covering a functional requirement of `docs/project/prd.md`.** What comes out is not deleted — it moves to a suite one named command still runs.

The default suite exists to answer one question on every run: *does the product still do what it is required to do?* Every test that answers a different question — a boundary, an error branch, a second case of a behavior already covered — is paid for on every run and answers it again in the on-demand suite for free.

> **Read the `conventions` skill before anything below.**

## This is not a way to reach green

`conventions` § Reaching green forbids weakening a test, a criterion or a requirement to reach green, and that rule is untouched by this one. Three bounds keep them from ever meeting:

- **The suite must be green before this skill runs.** A red test is a result, not a candidate — report it and change nothing.
- **Nothing is deleted, and no source code is touched.** A test that changes behavior when it moves has been edited; that is a failed move, not a compaction.
- **The operator picks.** Nothing moves that they did not choose.

A moved test is still a test. What this skill trades away is **when** a failure is found, never **whether**.

## How it runs

1. **Green first, and measure.** Run the target suite. Red anywhere — stop, report it, change nothing. Green: record the wall clock and the per-file timings. The timings are the only reason this skill exists, so they order everything the operator is shown.
2. **Trace every test to a project requirement.** For each test, answer one question: **which functional requirement in `docs/project/prd.md` § 2 does this ultimately prove?**

   The chain is one the system already maintains (`conventions` § Citing): the test is named by an acceptance criterion in `docs/scope/plan.md`, the criterion references a scope PRD requirement, and that requirement names its project PRD parent. Where the plan is gone — `finalize` wipes it — trace from the code the test exercises to the requirement that code implements.

   Two kinds of test come out of this with no chain, and they are the bulk of what moves:

   - **No parent at all** — it proves something real about the code that no requirement asks for.
   - **A non-functional parent** — it lands on `docs/project/prd.md` § 3 rather than § 2. **Name these separately when you ask.** Moving one means a performance, security or accessibility guarantee stops being checked on every run, and that is a different decision from moving a boundary case.
3. **Pick the one keeper per criterion.** Group what is left by the acceptance criterion it proves. **Exactly one test stays.**

   - **The happy path wins** — the test that runs the behavior as it is meant to be used: valid input, everything present, nothing failing.
   - Where two are both happy path at different levels, **keep the cheaper one** — unless the expensive one is the only place the pieces actually meet. An integration seam is not provable at unit level, and keeping a unit test in its place proves the halves and not the join.
   - Where none is a happy path, keep the cheapest and **say the criterion has no happy-path proof.** That is a hole in the tests, not a result of this skill, and it was there before.
   - **A criterion never drops to zero tests.** If following the rules would empty one, the rules stop.
4. **Put the move list to the operator** — `AskUserQuestion`, ordered by seconds saved, **grouped and never enumerated.** Each group says what it is, how many tests, how many seconds it gives back, and **what stops being checked on every run.** Say what the suite drops to in total. Whatever they exclude stays where it is.
5. **Move them.** Use the grouping the project's runner already has — a `vitest`/`jest` project, a `playwright` project, a directory the config excludes, an npm script. Never invent a mechanism that the repo does not already use.

   Three things have to be true when you are done:

   - the default suite **no longer runs them**;
   - **one named command runs all of them**, and you have run it and seen it green;
   - **no test file was edited.** If a test fails because it moved, the harness is wrong — fix the harness, never the assertion.
6. **Re-run both, and report two numbers.** The default suite green, with its new wall clock against the old one. The on-demand suite green. **A red on-demand suite is a failed move** — restore everything and report, do not fix it forward.
7. **Hand over the command, durably.** The command that runs the moved tests goes into the repo — a script in `package.json`, and a line wherever the project documents its tests — **and into the chat.** Not into `docs/scope/plan.md`: `finalize` deletes that, and the command has to outlive the scope.

## Rules

- **Green before, green after, both suites.** This skill never runs on red and never leaves red.
- **Move, never delete.** The git history is not a test suite.
- **One test per criterion, one command for the rest.**
- **No source code changes, and no test file changes.**
- **A criterion never drops to zero tests**, whatever it costs in seconds.
- **Say what stopped being checked**, grouped, one line each — the operator is trading coverage for time and has to see both halves.
- **Rot is the real cost, and it is stated rather than hidden.** A suite nobody runs will be red the first time somebody does, for reasons nobody remembers. Recommend running the on-demand suite at `finalize`, before the scope closes, and say so when you hand the command over.

## What goes in the chat

Per `conventions` § What goes in the chat:

- **the two numbers** — the default suite before and after, and what the on-demand suite costs on its own;
- **what stopped being checked** on every run, grouped, one line each;
- **the command** that runs the moved tests.

Then stop. Not the file list, not the reasoning, not what could be compacted next.
