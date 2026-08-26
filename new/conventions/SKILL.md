---
name: conventions
description: The rules every dev-system phase follows — how to ask the operator, how documents are numbered and cited, what the status markers mean, how diagrams are written, and what belongs in the chat rather than in an artifact. Read alongside whichever phase skill is running; it writes nothing of its own. Trigger on "dev system conventions", or read it from project, scope, plan, build and finalize.
---
# Conventions

The rules that hold across every phase of the dev system. Each phase skill assumes these — they are not repeated there.

## Asking the operator

Questions are **asked, not printed.** Every phase uses `AskUserQuestion` — never a numbered list in chat the operator has to answer in prose.

Four rules hold for every question set, in every phase:

1. **At most 5 questions per set.** More than that and the extras are not major — decide them yourself. Ask in one pass rather than trickling.
2. **Every question carries options, and two labels always exist:**

   - **future-proof** — costs more now, cheaper to live with as the codebase grows.
   - **cheaper now** — gets the work done fastest.

   More options are welcome without a label. If one option is genuinely both, say so on it and still offer a distinct alternative.
3. **Each option says what it commits to** — what it makes easy later, and what it forecloses.
4. **Only ask what gates the work.** A question you could answer from the docs is reading you skipped.

Nothing undecided is written down. A document records decisions, never open questions.

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
| `scope/tdd.md`   | Decision                   | `1.1`   |
| `scope/plan.md`  | Step                       | `1`     |
|                    | Substep                    | `1.1`   |
|                    | Acceptance criterion       | `1.1.1` |

**Numbers are immutable.** Once written, a number is never reused for something else and never renumbered — every reference in the system points at it, and a requirement that shipped is not deleted to tidy the list. Something new is appended with the next free number under its parent.

## Citing

A reference is a **plain label naming the document and the number** — never a link:

```
project prd 3.2.4
project tdd 2.1
scope prd 3.1.1
scope tdd 1.2
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
- **Features are derived**, never asserted: ✅ only when every requirement under it is ✅, and one 🔨 makes the feature 🔨.
- **Only `finalize` moves a marker**, and only against what the code actually does. `project` writes 📝 on everything, because nothing is built when the PRD is written.
- **Acceptance criteria in the plan use checkboxes instead** — `[ ]` unbuilt, `[x]` met — and only `build` ticks them.

## Diagrams

Hand-write the SVG: self-contained, no external fonts or images, labels as real text, legible on a light and a dark background. Whenever the TDD is written or changed, the SVG is written or changed with it.

## What goes in the chat

**The artifact is the deliverable.** The chat is not a second copy of it, a summary of it, or a report on writing it.

A checkpoint carries only:

- **what the operator would not anticipate** — a constraint hit, a decision that closes off something they assumed was open, a cost, a departure from what was agreed;
- **where the artifact is**, in one line.

Then stop. Never summarize sections you just wrote, recap the request, narrate how you got there, list files touched, or offer what you could do next.

Three things are exempt, because each is an interaction rather than a record: a **dead-end or divergence question** with its options, the **manual steps** the operator has to take after a build, and the **deployment handover** at finalize.

## Never invent

A missing requirement, an ambiguous reference, an unstated assumption — **surface it and ask.** A fabricated answer propagates silently through every phase downstream, and by the time it surfaces it is in the code.

## Checkpoints

Every phase ends by handing control back. **Never roll into the next phase, and never suggest one** — the operator decides what runs next and pulls it themselves.
