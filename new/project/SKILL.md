---
name: project
description: Build the project PRD and TDD with the operator — turn what they tell you about the product into numbered functional and non-functional requirements and the technical decisions behind them, refining the features with them, raising feasibility problems and running costs as questions rather than warnings, and resolving each one before it is written down. Produces docs/project/prd.md and docs/project/tdd.md, the single source of truth every later phase refines. Runs once per project. Trigger on "new project", "project prd", "let's define the product", "start a project".
---

# Project

Produce `docs/project/prd.md` and `docs/project/tdd.md` from what the operator tells you about the product. This is step 1 of the dev system, and it runs once per project.

These two documents are the single source of truth. Everything after them refines them, so they describe the **whole** product — no phasing, no deferral, nothing left for later.

## How it runs

1. **Read what the operator gave you.** The product is theirs. Never invent a feature they did not ask for.
2. **Refine it with them** — features and the requirements under them first, then the technical decisions that carry them.
3. **Raise what they cannot see.** These are yours to bring up, and each is a question with options, never a warning to acknowledge:
   - **Feasibility** — a requirement the stack, the budget or the effort will not support as stated.
   - **Maintenance cost** — what the product costs to run and to keep alive once it exists.
   - **Vague requirements** — a requirement that cannot be tested as written, because it does not say what would count as it working. Take it to the operator with the concrete readings it could have.
   - **Contradictions** — two requirements that cannot both hold. Show both, and ask which one stands.
   - **Duplicates** — two requirements that say the same thing in different words. Ask whether they are one requirement, or whether they differ in a way the wording lost.
4. **Write both documents.**
5. **Say where they are in one line, then stop.**

## Asking

Ask with `AskUserQuestion`. Never print a numbered list of questions into chat for the operator to answer in prose.

- At most **5 questions per set**. Ask in one pass rather than trickling.
- Every question carries options, and each option says **what it commits to** — what it makes easy later, what it forecloses.
- Only ask what actually gates the document. Anything you can settle from what the operator already told you is not a question.
- Decide the small things yourself.

Nothing undecided gets written. A document records decisions, never open questions.

## The source of truth

`docs/project/prd.md` and `docs/project/tdd.md` outrank everything, **the codebase included**. The code is the answer to what the software currently does; it is never the answer to what the software is supposed to do.

So when this skill runs on a project that already has code, and the code and the documents disagree, that is a **difference to reconcile, not a fact to write down**. Take it to the operator with two options on the table:

- **Update the document** — what the code does is what the product should do.
- **Change the code** — the requirement or decision holds and the software is wrong. Say in a line how the fix is done, so they can price it.

One of the two actually changes. Never close a difference by picking the side that looks more sensible, and never write a requirement that describes code you have not been told is correct.

## Format

### `docs/project/prd.md` — the what

Every feature and every requirement is prefixed with its status: **📝 not started**, **🔨 partially done**, **✅ done**. This skill writes 📝 on everything — nothing is built yet. Later phases move them.

```markdown
# <Product> — PRD

## 1. Overview
What the product is, who it is for, and the problem it solves. A few paragraphs.

## 2. Features

### 📝 2.1 <Feature name>
One or two lines on what this feature is and why it exists.

**Functional requirements**

- 📝 **2.1.1** <One observable behavior, stated so it can be tested.>
- 📝 **2.1.2** ...

### 📝 2.2 <Feature name>
...

## 3. Non-functional requirements

- 📝 **3.1** <Quality the product has to hold to — performance, security, accessibility, availability.>
- 📝 **3.2** ...
```

### `docs/project/tdd.md` — the how

```markdown
# <Product> — TDD

## 1. Overview
The shape of the system in a few paragraphs — the parts and how they fit.

## 2. Infrastructure
- **2.1** <Where it runs and how it is deployed.>

## 3. Tech stack
- **3.1** <Language, framework, database, and why over the alternative.>

## 4. Services & tools
- **4.1** <Third-party service or tool, what it is for, what it replaces building.>

## 5. Running costs
| Item | Cost | Notes |
| ---- | ---- | ----- |

## 6. Performance requirements
- **6.1** <Target, stated as a number.>
```

## Rules

- **The PRD is what and why. The TDD is how.** A requirement that names a library is in the wrong document.
- **Number everything.** Every requirement and decision is cited by number for the rest of the project's life, so each one stands alone and says one thing.
- **Write what was decided, not what might be.** No alternatives, no "we could", no open questions left in the text.
- **Never invent to fill a gap.** If something is missing, ask.
