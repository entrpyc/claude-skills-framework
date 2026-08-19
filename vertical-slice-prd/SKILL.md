---
name: vertical-slice-prd
description: Define the next vertical slice — the ~20% of the *remaining* work that delivers ~80% of the remaining value as a working, scalable app — and capture it as a slice PRD. Repeatable, and identical every run: use it for the first slice when nothing is built yet, and again for every slice after, since it always prioritizes from what isn't done. Use after the full-scope PRD and architecture exist. Trigger on "define the slice", "next slice", "what do we build next", "scope the MVP", "what's the 20%", "vertical slice prd".
---
# Vertical slice PRD

Produce `docs/slice-prd.md`: **the next ~20% of the remaining work that delivers ~80% of the remaining value.** This is Phase 3, and it is **repeatable** — run it once per slice, for as many slices as the project takes.

## One rule, every run

Every invocation does the same thing:

> **remaining = full scope − what's already delivered.** Cut the ~20% of *remaining* that carries ~80% of the *remaining* value.

The first slice is simply the case where nothing is delivered yet, so remaining is the whole PRD. That's why there is no separate first-run mode: slice 04 works exactly like slice 01, only the input differs.

What does shift between slices is what "a working app" means:

- **Slice 01** cuts through every layer to produce a working app where there was none.
- **Later slices** are additive and must leave the app working the whole way — still end-to-end, still never a single layer, but now attaching to something that already runs.

Like the full-scope PRD, this describes *what* and *why* for the slice — not *how* (that's the slice architecture, Phase 4).

> Part of the **dev system** — see the `dev-system` skill for the full pipeline, the artifact map, and the principles that hold across every phase.

## Working conventions (shared across the dev system)

The **active slice** always lives at the canonical paths, so every downstream skill reads the same place no matter which slice is running:

- `docs/prd.md`, `docs/architecture.md` — full scope. Read these; they are never overwritten by a slice.
- `docs/slice-prd.md` — the active slice (this skill)
- `docs/slice-architecture.md`, `docs/implementation-plan.md`, `docs/steps/<NN>-<slug>.md` — the rest of the active slice's working set
- `docs/completed-slices/<NN>-<slug>/` — slices already delivered, archived whole

When a slice finishes, its four artifacts move together into `docs/completed-slices/<NN>-<slug>/`, freeing the canonical paths for the next one:

```
docs/
  prd.md  architecture.md          <- full scope, permanent
  slice-prd.md                     <- the active slice
  slice-architecture.md
  implementation-plan.md
  steps/<NN>-<slug>.md
  completed-slices/
    01-core-playback/              <- archived when the next slice starts
      prd.md  architecture.md  implementation-plan.md  steps/
    02-search/
```

Control comes from the operator reviewing each checkpoint. The riskiest thing here is quietly scoping in too much — so make the in/out line loud and easy to argue with.

**Reference links.** Write every section reference as a markdown link to the file and line it lives at — `[3.2.4](docs/prd.md#L142)`, `[slice-prd.md § In scope → Auth](docs/slice-prd.md#L34)` — with the visible text left as the plain reference. Resolve the line by finding the heading (`grep -n`); never guess it. See the `dev-system` skill for the full rule.

## Method

1. **Take stock.** Establish what is already delivered before cutting anything.
   - Read `docs/completed-slices/`. The highest number there plus one is this slice's number — or `01` if that directory is empty or absent.
   - If the canonical paths still hold a completed slice, **archive it first**: move `slice-prd.md`, `slice-architecture.md`, `implementation-plan.md`, and `steps/` into `docs/completed-slices/<NN>-<slug>/`, so this run starts clean.
   - **Scoped is not shipped.** Check what actually landed, not just what the last slice PRD claimed. Anything scoped but never delivered goes back into the remaining pool as a candidate for this slice.
   - If nothing exists at all, the stock-take is simply "nothing delivered" and remaining is the full PRD. Say so and move on — don't special-case it.
2. **Confirm the stock-take before cutting.** Present what you believe is done and what remains, and get it confirmed. Everything downstream rests on this being right, and it's the one input you can't derive from the documents alone.
3. **Read `docs/prd.md` and `docs/architecture.md`.** You're selecting from full scope, not inventing new scope.
4. **Re-rank against reality.** From slice 02 on, what the last slice taught you can change what matters most — a feature that looked essential may have been answered another way, and a deferred one may have become urgent. The PRD's original ordering is an input, not a queue to drain in order. Where you depart from it, say so and why.
5. **Find the spine of this slice.** The smallest set of remaining features that together form a coherent, usable increment — a real end-to-end path, not a pile of disconnected pieces. A vertical slice cuts through every layer for a narrow set of features rather than building one whole layer.
6. **Apply 80/20 honestly, to what remains.** Keep what delivers most of the remaining value; defer the rest. When tempted to include something "while we're here," that's the signal to defer it.
7. **Check it's scalable, not a dead end.** The slice must be buildable so later work grows it toward full scope — not a throwaway that gets rewritten. If your cut forces a rewrite later, recut.
8. **Write what still remains after this slice.** Each major thing left out, with a phrase on how it attaches later. This is the direct input to the *next* invocation, so it's worth writing properly rather than as an afterthought.
9. **Audit the finished slice PRD for duplicates and mis-pointed references.** A slice PRD sits between two documents it doesn't own — `docs/prd.md` and the archive — so it degrades in two ways: it **restates a fact full scope or a completed slice already defines** (the copies drift, and the slice becomes the accidental source of truth), or it **points somewhere that no longer says what it assumes** — a PRD section renumbered since, or a "still remaining" entry naming something an earlier slice actually delivered. Do this as a real pass over the written draft, not from memory: open every section you cited and check it carries the fact you borrowed. Report what you find in the audit table below and let the operator choose the owner.

## Structure

```
# <Project> — Slice <NN> PRD: <slug>

## Builds on
What already exists that this slice attaches to. For slice 01: "nothing —
this is the first slice." A line or two; the detail lives in the archive.

## What the slice is
The working app this slice delivers, in a paragraph — what a user can do
end-to-end once it's built that they couldn't before.

## In scope — core features
The 20% of what remains that carries the 80%. Each: what it does, and why
it's in the spine of this slice.

## Still remaining after this slice
Everything in full scope still not built, each with a phrase on how it
attaches later. This is the next invocation's input — keep it current.

## Slice flows
The end-to-end path(s) this slice makes real.

## Rationale
Why this cut — why these features are the spine *now*, and what the last
slice (if any) changed about the priority order.
```

## Duplicate & reference audit

Run this over the finished slice PRD and present the table with it. The default owner is almost always **not** this document — a slice PRD earns its keep by citing full scope, not by re-describing it.

```
| Fact | Defined at | Also defined at | Recommended owner |
|------|-----------|-----------------|-------------------|
| Playback resumes at last position | [prd.md 3.2.4](docs/prd.md#L142)                                    | [slice-prd.md § In scope → Player](docs/slice-prd.md#L18)                     | [prd.md 3.2.4](docs/prd.md#L142) — slice should cite it |
| Free tier upload cap              | [completed-slices/01 § In scope](docs/completed-slices/01-core-playback/prd.md#L28) | [slice-prd.md § Still remaining](docs/slice-prd.md#L31) | slice 01 — already delivered, drop from remaining |
| Offline sync semantics            | —                                                                   | [slice-prd.md § Slice flows](docs/slice-prd.md#L44) → cites [prd.md 5.3](docs/prd.md#L260) | nothing defines it — ask |
```

Three kinds of row, same columns:

- **Duplicate definition** — this slice restates what full scope or a completed slice already defines. *Recommended owner* is that upstream section; the slice keeps a reference instead of a copy.
- **Mis-pointed reference** — a citation that resolves nowhere, or to a section that doesn't carry the fact. Put the true home in *Defined at* and the bad citation in *Also defined at* as `<citing section> → cites <target>`.
- **Stale remaining entry** — something listed in "Still remaining after this slice" that an earlier slice already delivered, or that this slice now takes in. It feeds the next invocation directly, so a wrong entry there is the one that compounds.

Where nothing owns the fact, write `—` in *Defined at* and say so in *Recommended owner*. That's a gap to raise — **never invent the definition**, and never quietly promote the slice PRD to owner of something full scope should define.

An empty table is a real result. Say "none found" rather than manufacturing rows.

## Checkpoint

Present the slice with the duplicate & reference audit table, and invite pushback on two things specifically: the **stock-take** (is this genuinely what's done?) and the **in-scope / still-remaining boundary**. Confirm the operator agrees the cut is both minimal and non-throwaway before moving to the slice architecture.

If taking stock revealed that `docs/prd.md` no longer describes what the project is becoming, say so here rather than quietly slicing against a stale document. Updating full scope is a separate, deliberate act.

**Next step.** End the checkpoint with a single sentence naming what runs next — e.g. *"Next: Phase 4, `vertical-slice-architecture`, to design how slice NN gets built without contradicting the north star."* Suggest it; don't run it.
