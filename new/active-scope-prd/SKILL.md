---
name: active-scope-prd
description: Define the active scope with the operator and capture it as a detailed PRD that refines the full-scope PRD without contradicting it. The operator names the features they want; four questions settle the boundary, how deep the requirements go, how far the architecture should reach, and how much interface detail to pin down. Also handles the scope cycle — folding the delivered scope's status back into the project PRD before wiping docs/active-scope/. Runs once per scope, after the project PRD and architecture exist. Trigger on "define the active scope", "next scope", "scope prd", "I want these features in the active scope".
---
# Active-scope PRD

Produce `docs/active-scope/prd.md`: a detailed product description of **the features the operator wants built now**. This is Phase 3, and it runs once per scope.

Two things define it:

- **The operator names the features.** You don't choose the scope for them. Your job is to take what they asked for, put four bounding questions in front of them, and write the document.
- **It refines the full-scope PRD; it never contradicts it.** This is the whole reason the document exists — full scope says what the product is, this says what "done" means for these features *right now*, in enough detail to architect and plan against. See `dev-system` § *The refinement rule*.

Like the full-scope PRD, this is *what* and *why* — never *how*. That's Phase 4.

> Part of the **dev system** — see the `dev-system` skill for the pipeline, the artifact map, the refinement rule, references, question rules, and the principles that hold across every phase.

## Working conventions

```
docs/
  project/prd.md  architecture.md   <- full scope; read, and status-updated by this skill only
  active-scope/                     <- wiped and re-seeded by this run
    prd.md                          <- this skill
    architecture.md                 <- Phase 4
    implementation-plan.md          <- Phase 5
  design-references/                <- read-only, operator-supplied
```

The riskiest thing here is quietly scoping in more than the operator asked for. The second riskiest is wiping a scope whose delivery was never folded back.

**References** are plain labels — `project prd 3.2.4` — never links. Confirm the section exists before citing it.

## Method

### 1. Fold the delivered status back into the project PRD

This is the only durable trace that the finished work happened, so it runs **before** the wipe, never after.

Walk the delivered scope's features to the full-scope requirements they refined, and record the outcome in a **Delivery status** table at the end of `docs/project/prd.md` — appending the section if it isn't there yet:

```
## Delivery status
_Status of the numbered requirements above, updated as each active scope is delivered._

| Requirement | Status | Scope |
|---|---|---|
| 3.1.1–3.1.4 | built | checkout |
| 3.2.1 | partial — guest checkout only; saved cards not built | checkout |
| 5.2 | built | checkout |
```

Three rules:

- **Status only.** Never change what a requirement says while folding, and never delete one because it shipped. The requirement text is full scope's; only the table is yours.
- **`partial` carries what's missing**, in a phrase. A partial marked `built` is the single most expensive error in this system — the missing half then reads as delivered everywhere and nobody ever cuts a scope for it.
- **Truth comes from the plan and the code, not from the scope PRD's intentions.** What the scope claimed it would do is not evidence. Check the plan's checked criteria, and where they're ambiguous, check the code.

**This table is also the answer to "what's left."** Nothing else tracks remaining work, and no document maintains a separate list of it.

Once the table is written, delete `docs/active-scope/prd.md`, `architecture.md`, and `implementation-plan.md`. Leave `docs/design-references/` alone — it belongs to the operator and spans scopes.

### 2. Take stock — briefly

Read `docs/project/prd.md`, including the Delivery status table, and skim what actually exists in the codebase. Two things matter and nothing else does:

- **Claimed is not shipped.** Where the table and the code disagree, the code wins — say so.
- **The missing half of anything marked `partial`** is the easiest thing here to lose, because a partial feature reads as done everywhere else.

This is context for the questions, not a proposal. **Don't produce a recommended scope** — the operator brings that.

### 3. Ask the four bounding questions

One `AskUserQuestion` pass, at most four, options on each with **future-proof** and **cheaper now** always present (see `dev-system` § *Asking the operator*).

| Question                     | What it settles                                                                                                                                                                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Boundary**           | Confirm what's in and what's carved out. The operator named the features; this is where you offer the boundary calls — a half of a feature that could go either way, a dependency their list implies but doesn't name. If their list is unambiguous, this becomes a confirmation rather than a choice. |
| **Requirements depth** | How deep the requirements go: happy path only, or the error, empty, and permission cases specified up front. Deeper here means fewer assumptions in every task downstream.                                                                                                                              |
| **Architecture reach** | How far Phase 4 reaches: the minimum to make these features run, or structure laid now for what's coming.**Phase 4 reads this answer instead of judging for itself**, so it has to be recorded.                                                                                                   |
| **Interface detail**   | How much of the interface this PRD pins down — behavior only, or the specific screens, states, and copy. Say what's in `docs/design-references/` when you ask; if it's empty, that itself is a constraint worth naming.                                                                              |

**A feature the operator asked for that isn't in `docs/project/prd.md` is a gap to raise, not a licence to invent it.** Say so before asking the rest — full scope may be out of date, and updating it is their separate, deliberate act.

### 4. Check the cut holds

Two checks on the operator's answers, and they are the only place you push back:

- **End-to-end, not one layer.** A scope cuts through every layer for a narrow set of features. If what they picked is a layer ("the database work"), say so — nothing will be validatable when it lands.
- **Not a dead end.** The scope must be buildable so later work grows it toward full scope. If the cut forces a rewrite later, say which decision does it and what the alternative is.

Raise either as a single line, then proceed with what they chose.

### 5. Write it

Name the scope — a short slug for what it delivers, `checkout`, `offline-sync`, never its position in a queue. Write `docs/active-scope/prd.md` in the shape below.

**Every functional requirement names its full-scope parent.** Writing that parent is what makes the refinement rule enforceable rather than aspirational, and it's what the audit in step 7 checks. A requirement with no parent is a finding, not a formatting gap.

Number everything, so Phase 5 can cite `active-scope prd 3.1.2` on a single task.

### 6. Run the refinement audit

Do this as a real pass over the written draft — open every full-scope section you cited and check it says what you claim. See *Refinement audit* below.

## Structure

```
# <Project> — Active scope: <name>

_Defined: <YYYY-MM-DD>_

## 1. Scope decisions
The four answers, one line each — boundary, requirements depth, architecture
reach, interface detail. This is what the scope was defined against, and what
a later reader checks drift against. Phase 4 reads 1.3; Phase 5 reads 1.2.

1.1 What's in — the features, one line each, each naming its full-scope parent
1.2 Requirements depth
1.3 Architecture reach
1.4 Interface detail

## 2. What this scope delivers
A paragraph: what a user can do end-to-end once this is built that they
couldn't before. If you can't write it without "and then later", the scope
isn't end-to-end.

Then a bullet list, one line per person the scope changes something for —
"As a user, I can …", "As an operator, I can …", and whoever else this scope
actually touches (an admin, a support agent, a downstream service). Each line
is a capability that exists only once this scope lands, in that role's own
words. A role whose day is unchanged by this scope doesn't get a line, and
neither does a capability that already works today.

## 3. Features
One numbered subsection per feature (3.1, 3.2, …). Each becomes a group in
the implementation plan, so write them as things a user can do. For each:
- _Refines: <full-scope parent, e.g. project prd 3.2>_
- **Functional requirements** — numbered (3.1.1, 3.1.2, …), each concrete
  enough that a test could be written against it, and each ending in the
  parent it refines: `(refines 3.2.1)`.
- A requirement with no parent gets `(uncovered)` and goes in the audit.

The detail test applies to every line: if full scope already says it, cite it
instead of restating it. This document earns its place by being *more*
specific — real limits, real states, real numbers.

## 4. Data detail
The entities this scope touches: the fields it actually needs, who sets each,
and which are new versus already existing. Refines the full-scope data
section — conceptual, not schemas.

## 5. Interface detail            (include when the scope has UI)
What the user sees and does, per feature — screens, states, empty and error
presentation, to the depth set in 1.4. Cite `design-references/<file>` where
one covers it. This is interface *behavior*, not visual design.

## 6. Non-functional requirements
Table — Category | Requirement | Refines. Only the ones this scope must
actually meet now. A full-scope NFR this scope isn't held to goes in 7.

## 7. Out of scope
What a reader would reasonably expect here and isn't getting, each with a
phrase on why. This is the anti-scope-creep lever — the more specific it is,
the smaller the plan stays.
```

**Don't maintain a "still remaining" list.** The Delivery status table in `docs/project/prd.md` is the only record of what's left; a second copy here would be wiped with the scope and wrong before then.

## Refinement audit

Run this over the finished draft and present the table with it. One row per statement whose relationship to full scope isn't a clean refinement — **clean refinements don't get rows.**

```
| Active-scope statement | Full-scope parent | Relationship | Action |
|---|---|---|---|
| 3.1.4 Cart holds 50 items max | project prd 3.2.1 says 100 | contradicts | full scope is older — ask which holds |
| 3.3.2 Guest checkout | — | uncovered | nothing in full scope allows it — ask |
| 5.1 Order states listed | project prd 4.2 defines them | duplicate | cite 4.2, delete the copy |
| 6 "Fast page loads" | project prd 6 | not a refinement | no more specific than its parent — pin a number or drop |
```

Four kinds of row:

- **Contradicts** — full scope says otherwise. Never resolve it by picking a side. Either fix this document or tell the operator full scope needs updating.
- **Uncovered** — no parent exists. Either full scope has a gap or scope crept in. **Never invent the parent.**
- **Duplicate** — this document restates what full scope already defines. Replace with a reference; the copy will drift.
- **Not a refinement** — a line that has a parent and adds nothing to it. Either make it more specific or delete it. This is the most common row and the easiest to wave through.

Where nothing owns the fact, write `—` in *Full-scope parent*. An empty table is a real result — say "none found" rather than manufacturing rows.

## Checkpoint

Link to the PRD and the audit table. Beyond that, only what the operator wouldn't anticipate:

- what the stock-take turned up that they'd be surprised by — work they thought was done and isn't, or the reverse;
- anything step 5 flagged;
- **whether a fold-back marked anything `partial`**, and what's missing from it.

If the stock-take revealed `docs/project/prd.md` no longer describes what the project is becoming, say so in a line. Updating full scope is a separate, deliberate act.

Don't summarize the features back at them, and don't name what runs next.
