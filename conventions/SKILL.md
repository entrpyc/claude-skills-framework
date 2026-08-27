---
name: conventions
description: The rules every dev-system phase follows — how to ask the operator, how a difference between the documents and the code is reconciled, what makes an assumption major enough to ask about, what the scope's out-of-scope ceiling binds, how the operator's design references are used, how documents are numbered and cited, what the status markers mean, what proving a change green takes, how diagrams are written, and what belongs in the chat rather than in an artifact. Read alongside whichever phase skill is running; it writes nothing of its own. Trigger on "dev system conventions", or read it from every dev-system skill.
---
# Conventions

The rules that hold across every phase of the dev system. Each phase skill assumes these — they are not repeated there.

## Asking the operator

Questions are **asked, not printed.** Every phase uses `AskUserQuestion` — never a numbered list in chat the operator has to answer in prose.

Four rules hold for every question set, in every phase:

1. **At most 4 questions per set** — the tool's ceiling. More than that and the extras are not major — decide them yourself. Ask in one pass rather than trickling.
2. **Every question carries options. Where the choice is a trade-off between building it well and building it fast, two labels exist:**

   - **future-proof** — costs more now, cheaper to live with as the codebase grows.
   - **cheaper now** — gets the work done fastest.

   More options are welcome without a label. If one option is genuinely both, say so on it and still offer a distinct alternative.

   **Where the options are not on that axis, the labels are not forced** — different cuts of the same work, which of two requirements stands, which of several approaches to take. Rule 3 still binds: labelled or not, every option says what it commits to.
3. **Each option says what it commits to** — what it makes easy later, and what it forecloses.
4. **Only ask what gates the work.** A question you could answer from the docs is reading you skipped.

Nothing undecided is written down. A document records decisions, never open questions.

**An empty block a named phase fills later is not an open question** — the plan's *Assumptions*, *Edge cases* and *Manual steps* are a form with an owner, and the phase that owns them is the only one that has the answers. Leave them empty rather than guessing at them.

## Reconciling

`docs/project/prd.md` and `docs/project/tdd.md` are the source of truth **over the codebase too.** The code is evidence of what the software currently does; it is never authority for what the software is supposed to do — *"the code does X"* is a fact about the present, never a reason for X to be correct. The same holds one level down: a scope document refines the project docs, and the plan refines the scope docs.

So a difference between a document and whatever diverged from it — the code, or a document downstream of it — is an **open decision, not a fact to write down.** Whichever phase trips over it puts it to the operator with `AskUserQuestion`, and two options are always on the table:

- **Change what diverged** — the requirement or decision holds and the code, scope or plan is wrong. Say in a line or two **how** the fix is done and where it lands, so they can price it.
- **Update the document** — what diverged is what the product should do. Show it as an edit: what the requirement says now, and what it would say instead.

Four rules:

- **One of the two actually changes.** Never close a difference by picking the side that looks more sensible, by writing it down somewhere and moving on, or by writing the code and letting the document fall behind.
- **The decision is the operator's; recording it is yours.** Whatever they choose is applied in the same run — the code edited, or the document edited, exactly as they chose it. Nothing else in this system notices a document that has fallen behind.
- **Never write a requirement that describes code you have not been told is correct.**
- **Say what is actually true about the trade-off.** The fix is usually **future-proof** and the document edit **cheaper now** — but where a requirement is simply stale, changing it is both the cheap and the correct answer, and dressing that up as a trade-off pushes the operator toward pointless work.

## Major assumptions

An assumption is **anything the work needs that the documents do not settle.** Every phase that makes one classifies it the same way.

**Major** — any one of these is enough:

- it **changes what the product costs** to run or to maintain;
- it is **user-facing** — it changes what someone sees or does;
- it **changes the technical decisions** the TDD carries;
- it **produces code later steps will not anticipate**;
- it is **hard to change later** — a data shape, a boundary, a naming or ownership convention, an interface other code will bind to. Cheap now, expensive once twenty files depend on it.
- it **puts a number in a requirement** — a size, a duration, a count, a rate, a limit, a threshold, a guarantee the code has to hit. A number is what the build is measured against, and **nothing downstream re-checks whether the stack can reach it** — it is discovered by the build failing against it. A number is never minor, however small the change to it looks on the page.

**Minor** — everything else: not covered, but it contradicts nothing, is not user-facing, is not cost-impacting, and stays cheap to reverse.

**Major assumptions are asked** — with `AskUserQuestion`, before anything is built on them. **Minor ones are decided without asking.** When a call sits on the line, treat it as major.

**Every assumption is written down, major and minor alike**, in the phase's assumptions record — `scope prd § 6` for the scope, the substep's *Assumptions* block in the plan for a build. The classification decides whether the operator is **asked**, never whether they can **find it**: an assumption nobody recorded is indistinguishable later from something the documents actually said, which is how a decision Claude made ends up being read as a requirement.

## The ceiling

`docs/scope/prd.md` § 5 *Out of scope* is the ceiling on everything downstream of it. **`plan` may not plan what it excludes and `build` may not build it** — however close the work sits to it, and however cheap it looks once you are already in the file. A substep covering something § 5 excludes is scope creep with a number on it.

**Only the operator raises the ceiling.** Something the scope plainly cannot be delivered without goes to them with `AskUserQuestion`, and what changes is `docs/scope/prd.md` — never the plan or the code quietly covering more. Raising it is theirs; **editing § 5 to record what they chose is yours, in the same run.**

## Design references

`docs/design-references/` holds the operator's visual material — screenshots, mockups, brand and UI assets.

- **No skill ever writes here, and finalize never deletes it.** It belongs to the operator and it spans scopes.
- **Read it whenever the work is visual.** `scope` reads it for what the interface is meant to be, `plan` names the file on each substep that builds a surface, `build` reads the files its target names.
- **A reference here outranks your own taste.** Where a mockup covers the surface being built, the mockup is the requirement.
- **Cite it by filename**, like any other reference: `design-references/checkout-mock.png`.
- **An empty folder is not a gap to fill by inventing one.** It means the interface is unspecified — that is a question for the operator, not a licence to design.

## Reference numbers

Everything in the system is addressed by number, so the numbers are the interface between the phases.

| Document           | Level                      | Number    |
| ------------------ | -------------------------- | --------- |
| `project/prd.md` | Feature                    | `2.1`   |
|                    | Functional requirement     | `2.1.1` |
|                    | Non-functional requirement | `3.1`   |
| `project/tdd.md` | Decision, per section      | `3.1`   |
| `scope/prd.md`   | Feature                    | `3.1`   |
|                    | Functional requirement     | `3.1.1` |
|                    | Non-functional requirement | `4.1`   |
| `scope/tdd.md`   | Decision                   | `1.1`   |
|                    | Data entity                | `2.1`   |
| `scope/plan.md`  | Step                       | `1`     |
|                    | Substep                    | `1.1`   |
|                    | Acceptance criterion       | `1.1.1` |

**Everything a later phase cites is numbered, and the *Overview* section of a project document is the one thing that is not.** It is prose, it makes no decision of its own, and it is never cited — cite the numbered requirement or decision that carries the fact instead. Every other section numbers its items, the running-cost table included.

**Numbers are immutable.** Once written, a number is never reused for something else and never renumbered — every reference in the system points at it, and a requirement that shipped is not deleted to tidy the list. Something new is appended with the next free number under its parent.

## Citing

A reference is a **plain label naming the document and the number** — never a link:

```
project prd 2.1.1
project tdd 2.1
scope prd 3.1.1
scope tdd 1.2
design-references/checkout-mock.png
```

Line-anchored links rot the moment anything above them shifts, and a stale link reads as checked when it is not.

Three rules:

- **Cite something that exists.** Confirm it before writing it down. A reference to a number that is not there is the same failure a broken link was.
- **Cite the smallest thing that carries the fact** — a numbered requirement, not the document.
- **Cite the parent, never invent one.** A scope requirement or decision names the project requirement or decision it refines. One with no parent is uncovered — raise it.

## Status markers

Every feature and requirement in `docs/project/prd.md` carries one:

| Marker | Means                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------ |
| 📝     | **Not started** — none of it is built.                                                                |
| 🔨     | **Partially done** — some of it is built. What is missing is listed beneath it, one line per blocker. |
| ✅     | **Done** — met and observable in the running code.                                                    |

- **Every requirement carries one.** A line with no marker reads as untracked rather than unbuilt.
- **Features are derived**, never asserted: ✅ only when every requirement under it is ✅, 📝 only when every requirement under it is 📝, and **everything in between is 🔨.** One ✅ beside one 📝 is a partially done feature as surely as a single 🔨 is.
- **Only `finalize` moves a marker**, and only against what the code actually does. `project` writes 📝 on everything, because nothing is built when the PRD is written.
- **Acceptance criteria in the plan use checkboxes instead** — `[ ]` unbuilt, `[x]` met — and only `build` ticks them.

## Reaching green

Every phase that writes code proves it the same way.

- **Never weaken a test, a criterion, or a requirement to reach green.** That turns a real gap into a documented one, which is the opposite of the point. If an honest test is red, the work is not done — report it red.
- **Always take the narrowest run that covers the change, and never the full suite.** **The full suite belongs to the pipeline** — nothing here runs it, whatever it would cover. Which tests the narrow run is, the phase says: for `build` it is exactly the tests its acceptance criteria name (`build` § How it runs 5). A broader local run proves nothing the coverage does not already prove, and every phase that writes code pays for it in full.
- **An assertion never compares against the code's own exported constant.** Pin the literal. An assertion that reads its expectation out of the module under test agrees with whatever that module holds, including the wrong value — so it goes green on the bug instead of catching it.
- **A red that predates your change is reported, not triaged.** Before diagnosing a failure in a file your change does not touch, find out whether it was already failing — `git log` and `git diff` over the test and over what it exercises, or run it against a copy of the committed file set aside. If it was red in the committed tree, say so in one line and carry on. It is not part of proving this change, and whether it gets fixed is the operator's call, not a detour inside a build.
- **Never `git stash` to isolate a run.** Under `core.autocrlf` it rewrites the line endings of every file it touches, and it destroys the working tree you are trying to measure. Re-run against the tree as it stands, or copy the file aside.

## Writing files

**A file written whole — a spec, a document, a new module — is written with `Write`, and a change inside an existing one with `Edit`.** A shell heredoc cannot carry backticks, dollar signs or nested quotes through without mangling them, so on the files these phases produce it fails and the write is paid for twice. Shell keeps what shell is for: running the tests, git, and looking around the codebase.

## Diagrams

Hand-write the SVG: self-contained, no external fonts or images, labels as real text, legible on a light and a dark background. Whenever the TDD is written or changed, the SVG is written or changed with it.

## What goes in the chat

**The artifact is the deliverable.** The chat is not a second copy of it, a summary of it, or a report on writing it.

A checkpoint carries only:

- **what the operator would not anticipate** — a constraint hit, a decision that closes off something they assumed was open, a cost, a departure from what was agreed;
- **where the artifact is**, in one line.

Then stop. Never summarize sections you just wrote, recap the request, narrate how you got there, list files touched, or offer what you could do next.

Four things are exempt. Three are interactions rather than records: a **dead-end or divergence question** with its options, the **manual steps** the operator has to take after a build, and the **deployment handover** at finalize. The fourth is **`session-analyze`'s report**, which is exempt for the opposite reason — that phase writes no artifact, so the report in the chat *is* the deliverable rather than a second copy of one.

## Never invent

A missing requirement, an ambiguous reference, an unstated assumption — **surface it and ask.** A fabricated answer propagates silently through every phase downstream, and by the time it surfaces it is in the code.

## Checkpoints

Every phase ends by handing control back. **Never roll into the next phase, and never suggest one** — the operator decides what runs next and pulls it themselves.
