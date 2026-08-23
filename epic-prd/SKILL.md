---
name: epic-prd
description: Scope the next epic with the operator and capture it as an epic PRD. The operator pulls this phase and decides the epic — four questions settle scope size, what goes in, how far the architecture reaches, and how deep the requirements go — and the doc is written from those answers. Repeatable, once per epic. Use after the project PRD and architecture exist. Trigger on "define the epic", "next epic", "scope the epic", "epic prd".
---
# Epic PRD

Produce `<epic>/prd.md`: the next epic, **scoped by the operator**. This is Phase 3, and it runs once per epic.

**The operator pulls this phase and decides what the epic is.** You don't cut it for them. Your job is to put four scoping questions in front of them, then write a clean epic PRD from the answers.

This phase also **creates the epic's folder**, `docs/epics/epic-<name>/`.

Like the project PRD, this describes *what* and *why* for the epic — not *how* (Phase 4).

> Part of the **dev system** — see the `dev-system` skill for the pipeline, the artifact map, references, question rules, and the principles that hold across every phase.

## Working conventions

Every epic owns a folder that **never moves**: this run creates one, and nothing later relocates or renames it.

```
docs/
  project/prd.md  architecture.md   <- full scope; read, never rewritten by an epic
  epics/
    epic-core-playback/             <- an earlier epic, kept forever
    epic-search/                    <- the epic this run creates
      prd.md                        <- this skill
      architecture.md               <- Phase 4
      implementation-plan.md        <- Phase 5
      stories/<story>/<NN>-<ticket>.md
```

`<epic>` means `docs/epics/epic-<name>/`. The name is a slug of the epic's name, chosen here and used for the rest of its life.

The riskiest thing here is quietly scoping in more than the operator asked for.

## Method

### 1. Take stock — briefly

Read `docs/epics/`. For each epic already cut, read `implementation-plan.md` § *Summary* — that's the record of what actually exists. Two things matter and nothing else does:

- **Scoped is not shipped.** An epic's `prd.md` § *In scope* says what it claimed; the Summary says what landed. Where they disagree, the Summary wins.
- **The missing half of anything marked partial** is the easiest thing in this system to lose, because a partial feature reads as done everywhere else.

If `docs/epics/` is empty, stock is "nothing delivered." An epic with no Summary hasn't validated a story yet — check the code, not the docs.

This is context for the questions, not a proposal. **Don't produce a recommended cut.**

### 2. Ask the four scoping questions

One `AskUserQuestion` pass, four questions, options on each with **future-proof** and **cheaper now** always present (see *Asking the operator* in `dev-system`). These four are the phase:

| Question | What it settles |
|---|---|
| **Scope size** | How big is this epic — a single feature, a thin end-to-end slice, or a substantial increment? Options should be concrete about roughly how many stories that implies. |
| **What goes in** | Which features from full scope. Offer the candidates the stock-take surfaced — unfinished work, partial halves, and the obvious next features — and let them pick. |
| **Architecture scope** | How far the epic's architecture reaches: the minimum to make these features run, or structure laid now for what's coming. This is the future-proof / cheaper-now axis at its sharpest. |
| **Requirements scope** | How deep the requirements go: happy path only, or the error, empty, and permission cases specified up front. Deeper here means fewer assumptions in every ticket downstream. |

If the operator already named the epic in their prompt, the *what goes in* question confirms the boundary rather than asking from scratch — offer what you'd carve out as options.

**A target that isn't in `docs/project/prd.md` is a gap to raise, not a licence to invent it.** Say so before asking the rest.

### 3. Check the cut holds

Two checks on the operator's answers, and they are the only place you push back:

- **End-to-end, not one layer.** An epic cuts through every layer for a narrow set of features. If what they picked is a layer ("the database work"), say so.
- **Not a dead end.** The epic must be buildable so later work grows it toward full scope. If the cut forces a rewrite later, say which decision does it and what the alternative is.

Raise either as a single line, then proceed with what they chose.

### 4. Write it

Name the epic — a short slug for what it delivers, `epic-search`, `epic-offline-sync`, never its position in a queue. Create `docs/epics/epic-<name>/` and write `prd.md`.

Write *Still remaining after this epic* properly: it's the direct input to the next invocation's stock-take.

### 5. Audit for duplicates and mis-pointed references

An epic PRD sits between documents it doesn't own, so it degrades in three ways. Do this as a real pass over the written draft — open every section you cited and check it carries the fact you borrowed.

## Structure

```
# <Project> — Epic: <name>

## Scope decisions
The four answers from the scoping questions, one line each — size, what goes
in, how far the architecture reaches, how deep the requirements go. This is
what the epic was scoped against, and what a later reader checks drift against.

## Builds on
What already exists that this epic attaches to, naming the epics it follows.
For the first epic: "nothing — this is the first epic."

## What the epic is
The working app this epic delivers, in a paragraph — what a user can do
end-to-end once it's built that they couldn't before.

## In scope — core features
The features that form this epic's spine. Each: what it does, and why it's in
the spine. Each becomes a story in the implementation plan, so write them as
things a user can do, not as work packages.

## Requirements depth
What the requirements cover and what they deliberately leave to ticket-level
assumptions, from the requirements-scope answer. Ticket planning reads this to
know whether an unspecified case is an oversight or a deliberate deferral.

## Still remaining after this epic
Everything in full scope still not built, each with a phrase on how it attaches
later. This is the next invocation's input — keep it current.

## Epic flows
The end-to-end path(s) this epic makes real.

## Rationale
Why this cut, in the operator's terms. Name anything you carved out and why,
and anything you flagged in step 3.
```

## Duplicate & reference audit

Run this over the finished epic PRD and present the table with it. The default owner is almost always **not** this document — an epic PRD earns its keep by citing the project docs, not re-describing them. References are plain labels, no links.

```
| Fact | Defined at | Also defined at | Recommended owner |
|------|-----------|-----------------|-------------------|
| Playback resumes at last position | project prd 3.2.4 | epic prd § In scope → Player | project prd 3.2.4 — epic should cite it |
| Free tier upload cap | epic-core-playback prd § In scope | epic prd § Still remaining | epic-core-playback — already delivered, drop from remaining |
| Offline sync semantics | — | epic prd § Epic flows → cites project prd 5.3 | nothing defines it — ask |
```

Three kinds of row:

- **Duplicate definition** — this epic restates what the project docs or an earlier epic already define. The epic keeps a reference, not a copy.
- **Mis-pointed reference** — a citation naming a section that doesn't exist or doesn't carry the fact. Put the true home in *Defined at* and the bad citation in *Also defined at* as `<citing section> → cites <target>`.
- **Stale remaining entry** — something in "Still remaining" that an earlier epic already delivered, or that this epic now takes in. It feeds the next invocation directly, so a wrong entry there compounds.

Where nothing owns the fact, write `—` in *Defined at*. That's a gap to raise — **never invent the definition**, and never quietly promote the epic PRD to owner of something the project PRD should define.

An empty table is a real result. Say "none found" rather than manufacturing rows.

## Checkpoint

Link to the epic PRD and the audit table. Beyond that, only what the stock-take turned up that the operator wouldn't anticipate — work they thought was done and isn't, or the reverse — and anything step 3 flagged.

If the stock-take revealed `docs/project/prd.md` no longer describes what the project is becoming, say so in a line. Updating full scope is a separate, deliberate act.

Don't summarize the epic's features back at them, and don't name what runs next.
