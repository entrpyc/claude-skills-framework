---
name: epic-prd
description: Define the next epic — either the specific feature(s) the operator names, or the ~20% of the *remaining* work that delivers ~80% of the remaining value as a working, scalable app — and capture it as an epic PRD. Repeatable, and identical every run: use it for the first epic when nothing is built yet, and again for every epic after, since it always prioritizes from what isn't done. Use after the project PRD and architecture exist. Trigger on "define the epic", "next epic", "what do we build next", "scope the MVP", "what's the 20%", "epic prd".
---
# Epic PRD

Produce `<epic>/prd.md`: **the next epic — a working increment of the app, cut either to the feature(s) the operator names or to the ~20% of remaining work that delivers ~80% of remaining value.** This is Phase 3, and it is **repeatable** — run it once per epic, for as many epics as the project takes.

This phase also **creates the epic's folder**, `docs/epics/epic-<name>/`, which every later phase of the epic writes into.

## Two ways in, one output

Every invocation produces the same artifact. What differs is only how the epic gets chosen:

- **Operator-directed.** The operator names the feature(s) they want next. Your job is to scope them into a coherent epic — carve out what doesn't belong, and say plainly if what they named isn't yet buildable end-to-end or needs something delivered first.
- **Default — the next 20%.** Nobody named anything, so you cut it:

  > **remaining = full scope − what's already delivered.** Cut the ~20% of *remaining* that carries ~80% of the *remaining* value.

If the operator hasn't named a target, take the default and say so, presenting the cut as the thing to argue with.

The first epic is simply the case where nothing is delivered yet, so remaining is the whole PRD. That's why there is no separate first-run mode: the fourth epic works exactly like the first, only the input differs.

What does shift between epics is what "a working app" means:

- **The first epic** cuts through every layer to produce a working app where there was none.
- **Later epics** are additive and must leave the app working the whole way — still end-to-end, still never a single layer, but now attaching to something that already runs.

Like the project PRD, this describes *what* and *why* for the epic — not *how* (that's the epic architecture, Phase 4).

> Part of the **dev system** — see the `dev-system` skill for the full pipeline, the artifact map, and the principles that hold across every phase.

## Working conventions (shared across the dev system)

Every epic owns a folder that **never moves**: this run creates one, and nothing later relocates, archives, or renames it.

```
docs/
  project/
    prd.md  architecture.md          <- full scope, permanent; read, never rewritten by an epic
  epics/
    epic-core-playback/              <- an earlier epic, kept forever
      prd.md  architecture.md  implementation-plan.md  stories/
    epic-search/                     <- the epic this run creates
      prd.md                         <- this skill
      architecture.md                <- Phase 4
      implementation-plan.md         <- Phase 5
      stories/<story>/<NN>-<ticket>.md
```

`<epic>` throughout means `docs/epics/epic-<name>/` — the folder of the epic being worked on. The name is a slug of the epic's name, chosen here and used for the rest of its life.

The riskiest thing here is quietly scoping in too much — so make the in/out line loud and easy for the operator to argue with.

**Reference links.** Every section reference is a markdown link to the file and the line its heading sits on — `[3.2.4](docs/project/prd.md#L142)` — with the visible text left as the plain reference. Resolve the line with `grep -n`; never guess it. Full rule in the `dev-system` skill.

## Method

1. **Take stock.** Establish what is already delivered before scoping anything.
   - List `docs/epics/`. Every folder there is an epic already cut. For each, **read `implementation-plan.md` § *Summary*** — story validation writes it as stories complete, so it's the record of what actually exists: what was created, what's fully implemented, what's only partial, and what the project still lacks. Its *Features still remaining* list is the closest thing to a ready-made input for this phase.
   - **Scoped is not shipped.** An epic's `prd.md` § *In scope* says what it claimed; the Summary says what landed. Where they disagree, the Summary wins. Anything scoped but never delivered goes back into the remaining pool as a candidate for this epic — as does **the missing half of anything the Summary marks partial**, which is the easiest thing in this system to lose track of, since a partial feature reads as done in every other document.
   - An epic with no Summary is one that hasn't validated a story yet; treat it as unfinished and check the code rather than the docs.
   - If `docs/epics/` is empty or absent, the stock-take is simply "nothing delivered" and remaining is the full PRD. Say so and move on — don't special-case it.
2. **Confirm the stock-take before scoping.** Present what you believe is done and what remains, and get it confirmed. Everything downstream rests on this being right, and it's the one input you can't derive from the documents alone.
3. **Read `docs/project/prd.md` and `docs/project/architecture.md`.** You're selecting from full scope, not inventing new scope. If the operator named a target feature, find it in full scope — **a target that isn't described there is a gap to raise, not a licence to invent it.**
4. **Re-rank against reality.** From the second epic on, what the last epic taught you can change what matters most — a feature that looked essential may have been answered another way, and a deferred one may have become urgent. The PRD's original ordering is an input, not a queue to drain in order. Where you depart from it, say so and why. (Operator-directed epics skip the ranking, but not this check: if what they named depends on something not yet built, that dependency is the thing to raise before writing.)
5. **Find the spine of this epic.** The smallest set of features that together form a coherent, usable increment — a real end-to-end path, not a pile of disconnected pieces. An epic cuts through every layer for a narrow set of features rather than building one whole layer.
6. **Apply 80/20 honestly, to what remains.** Keep what delivers most of the remaining value; defer the rest. When tempted to include something "while we're here," that's the signal to defer it. For an operator-directed epic the same lever applies inward: keep the named feature's spine, defer its trimmings.
7. **Check it's scalable, not a dead end.** The epic must be buildable so later work grows it toward full scope — not a throwaway that gets rewritten. If your cut forces a rewrite later, recut.
8. **Name the epic and create its folder.** A short slug naming what the epic delivers — `epic-search`, `epic-offline-sync` — not its position in the queue. Create `docs/epics/epic-<name>/` and write `prd.md` into it.
9. **Write what still remains after this epic.** Each major thing left out, with a phrase on how it attaches later. This is the direct input to the *next* invocation, so it's worth writing properly rather than as an afterthought.
10. **Audit the finished epic PRD for duplicates and mis-pointed references.** An epic PRD sits between documents it doesn't own — `docs/project/prd.md` and the earlier epics — so it degrades in the three ways the audit section below defines. Do this as a real pass over the written draft, not from memory: open every section you cited and check it carries the fact you borrowed. Report what you find in the audit table and let the operator choose the owner.

## Structure

```
# <Project> — Epic: <name>

## Builds on
What already exists that this epic attaches to, naming the epics it follows.
For the first epic: "nothing — this is the first epic." A line or two; the
detail lives in those epics' own folders.

## What the epic is
The working app this epic delivers, in a paragraph — what a user can do
end-to-end once it's built that they couldn't before.

## In scope — core features
The features that form this epic's spine. Each: what it does, and why it's
in the spine. Each of these becomes a story in the implementation plan
(Phase 5), so write them as things a user can do, not as work packages.

## Still remaining after this epic
Everything in full scope still not built, each with a phrase on how it
attaches later. This is the next invocation's input — keep it current.

## Epic flows
The end-to-end path(s) this epic makes real.

## Rationale
Why this cut — why these features are the spine *now*, and what the last
epic (if any) changed about the priority order. If the operator named the
target, say that, and name anything you carved out of it and why.
```

## Duplicate & reference audit

Run this over the finished epic PRD and present the table with it. The default owner is almost always **not** this document — an epic PRD earns its keep by citing the project docs, not by re-describing them.

```
| Fact | Defined at | Also defined at | Recommended owner |
|------|-----------|-----------------|-------------------|
| Playback resumes at last position | [prd 3.2.4](docs/project/prd.md#L142)                            | [epic prd § In scope → Player](docs/epics/epic-search/prd.md#L18)      | [prd 3.2.4](docs/project/prd.md#L142) — epic should cite it |
| Free tier upload cap              | [epic-core-playback § In scope](docs/epics/epic-core-playback/prd.md#L28) | [epic prd § Still remaining](docs/epics/epic-search/prd.md#L31) | epic-core-playback — already delivered, drop from remaining |
| Offline sync semantics            | —                                                                | [epic prd § Epic flows](docs/epics/epic-search/prd.md#L44) → cites [prd 5.3](docs/project/prd.md#L260) | nothing defines it — ask |
```

Three kinds of row, same columns:

- **Duplicate definition** — this epic restates what the project docs or an earlier epic already define. *Recommended owner* is that upstream section; the epic keeps a reference instead of a copy.
- **Mis-pointed reference** — a citation that resolves nowhere, or to a section that doesn't carry the fact. Put the true home in *Defined at* and the bad citation in *Also defined at* as `<citing section> → cites <target>`.
- **Stale remaining entry** — something listed in "Still remaining after this epic" that an earlier epic already delivered, or that this epic now takes in. It feeds the next invocation directly, so a wrong entry there is the one that compounds.

Where nothing owns the fact, write `—` in *Defined at* and say so in *Recommended owner*. That's a gap to raise — **never invent the definition**, and never quietly promote the epic PRD to owner of something the project PRD should define.

An empty table is a real result. Say "none found" rather than manufacturing rows.

## Checkpoint

Link the epic PRD, keep the chat minimal — the audit table, plus anything the stock-take turned up that the operator wouldn't anticipate (work they thought was done and isn't, or the reverse) — and invite pushback on two things specifically: the **stock-take** (is this genuinely what's done?) and the **in-scope / still-remaining boundary**. Confirm the operator agrees the epic is both minimal and non-throwaway before moving to the epic architecture.

If taking stock revealed that `docs/project/prd.md` no longer describes what the project is becoming, say so here rather than quietly scoping against a stale document. Updating full scope is a separate, deliberate act.

Don't summarize the epic's features back at them — they're in the doc. (See *What goes in the chat* in the `dev-system` skill.)

**Next step.** End the checkpoint with a single sentence naming what runs next — e.g. *"Next: Phase 4, `epic-architecture`, to design how epic-search gets built without contradicting the north star."* Suggest it; don't run it.
