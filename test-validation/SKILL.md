---
name: test-validation
description: Hunt false positives in a ticket's tests — check every test against the ticket's acceptance criteria and back against the PRD, find tests that pass without proving the behavior they claim, fix them, and record the count in the ticket's metrics. A separate pass from implementation, run by someone who didn't write the tests. Runs once per ticket, after ticket-implementation. Trigger on "validate the tests", "false positive check", "check the tests against the prd".
---
# Test validation

Runs once per ticket, after `ticket-implementation` leaves the suite green. This is Phase 9.

**Green tests are a claim, not a result.** A test that passes without exercising the behavior it names is worse than no test: it certifies the criterion as met and stops anyone looking again. The phase that wrote the test is the worst possible phase to check it, because it would have to find its own reasoning wrong — so this is a separate pass, run against the requirements rather than against the code.

Two directions, in order: **tests → criteria**, then **criteria → PRD**. The second is what catches a ticket that satisfies its own doc while missing what the product actually asked for.

> Part of the **dev system** — see the `dev-system` skill for the pipeline, references, question rules, metrics, and what goes in the chat.

## Working conventions

`<epic>` means `docs/epics/epic-<name>/`. Read the ticket doc `<epic>/stories/<story>/<NN>-<ticket>.md`, the tests it names, the code under them, and the PRD sections the ticket's plan entry references — `<epic>/prd.md` and `docs/project/prd.md`.

Fixes go into the test files. The count goes into the ticket doc's `## Metrics`.

## 1. Run the suite yourself

Don't take the previous phase's word for it. Run it, and note anything skipped, filtered, or excluded by config — a `.skip`, a `test.only` narrowing the run, a path excluded in the runner config, a criterion whose test exists but never executes. **A test that doesn't run is a false positive with extra steps.**

## 2. Tests → criteria: is each one actually proving its criterion?

Take every acceptance criterion in the ticket doc and the test named on it. For each, the question is: **would this test fail if the behavior were removed?** Where you're unsure, find out — break the behavior, run the test, put it back. A test you can't make fail is a test that proves nothing.

The recurring shapes:

- **Asserting the mock.** The test stubs the thing under test and then checks the stub was called. It proves the test's own wiring.
- **Asserting existence.** Checks a function is defined, a field is present, a component renders — never that it does the right thing with the right input.
- **Tautology.** The expected value is computed by the same code path being tested, so any behavior passes.
- **Happy path only, criterion says more.** The criterion names a failure, empty, or permission case; the test only walks the success path.
- **Assertion-free.** Runs code, catches no exception, passes. Common in setup-heavy integration tests.
- **Over-mocked integration.** Every boundary stubbed, so the seams the criterion is actually about are never exercised.
- **Passes on the wrong reason.** Right outcome, wrong cause — the assertion would hold even if the feature were bypassed entirely.

For each finding: name the criterion, the test, and **what change to the code would leave it passing.** That last part is the proof it's a false positive; without it you have a style opinion.

## 3. Criteria → PRD: does passing everything mean the requirement is met?

Now go the other way, against the PRD sections the ticket references. **The ticket doc is not the authority here — the PRD is.**

- **A requirement the criteria narrowed.** The PRD says one thing, the ticket's criteria say a smaller version, and the tests prove the smaller version. Every layer is internally consistent and the product requirement isn't met.
- **A requirement no criterion claims.** The ticket references a PRD section, delivers part of it, and nothing tracks the rest. If it belongs to a later ticket, confirm that ticket exists in the plan; if nothing owns it, that's a gap.
- **A deliberate deferral vs. a silent drop.** Check the epic PRD's *Requirements depth* and the ticket's *Out of scope* and *Edge cases*. Something consciously deferred and written down is fine. Something simply absent is the finding.
- **The criterion contradicts the PRD.** A ticket assumption that quietly changed the requirement. Flag it as a contradiction, not a test issue.

## 4. Fix what's yours; ask what isn't

**Fix directly:** a weak test. Rewrite it so it fails when the behavior is removed, and verify that by actually removing it. Add the missing case where a criterion names a path the test skips. Un-skip and repair anything excluded from the run.

**Don't fix silently:** anything that means the *code* is wrong, or the criteria are. A test rewritten to be honest may now fail — that's the correct outcome and it means the ticket is not done. Report it as red, with what the code does and what the criterion asked for.

**Ask, with `AskUserQuestion`**, when a finding needs a scope call rather than a fix — at most 5, options labeled **future-proof** and **cheaper now**:

- a PRD requirement the criteria narrowed: widen the ticket now, or record it as an edge case and track it in a later ticket;
- a requirement nothing owns: add a ticket to the plan, or accept the gap explicitly;
- a criterion that contradicts the PRD: change the code, or change the PRD.

**Never close a finding by weakening a criterion** so the existing test passes. That converts a real gap into a documented one and is the exact failure this phase exists to catch.

## 5. Record the count

Write into the ticket doc's `## Metrics`:

- **Tests rewritten as false positives:** how many tests were rewritten or added because they didn't prove their criterion.
- **Ticket closed:** the real system time, once everything here passes.

Anything you couldn't close goes into the ticket doc's **Edge cases** (a gap the operator accepted) or into the plan as a new ticket (a gap that must be built). Never leave a finding only in chat.

## Checkpoint

```
## Test validation — Ticket <NN> — <title>

- Suite: <n> tests, <n> skipped or excluded — <what, or "none">
- False positives: <criterion> — <test> — <what could break without failing it>
  (or: none found)
- Against the PRD: <requirement the criteria don't reach> (or: covered)
- Fixed: <n> rewritten, <n> added. Suite is <green | red>
```

If the suite is red after honest tests, **that is the result** — say what fails and what the code would need to do. Don't soften it, don't re-list the criteria, and don't name what runs next.

**"None found" with a green suite is a complete validation** — one line, and stop.
