---
name: epic-architecture
description: Generate the epic architecture — a lean architecture that delivers the current epic's features without overengineering, doesn't contradict the full-scope architecture, and is built so later work can grow it toward full scope. Repeatable per epic, and aware that from the second epic on it is extending a system that already runs: it separates what the epic adds from what it changes, and produces an epic diagram showing both against what stays untouched and what stays deferred. Use after the epic PRD exists. Trigger on "architecture for the epic", "how do we build this epic", "epic architecture".
---
# Epic architecture

Produce `<epic>/architecture.md`: the architecture that guides how the current epic gets implemented. This is Phase 4, and like the epic PRD it runs once per epic.

Four constraints define it:

- **Doesn't contradict** the full-scope architecture (`docs/project/architecture.md`).
- **Extends what already runs without breaking it** — from the second epic on.
- **Delivers the epic's core features without overengineering.**
- **Built so later work can grow it** toward full scope.

The tension is the whole point: lean enough that you're not building for scope you don't have yet, but shaped so full scope plugs in rather than forcing a rewrite.

**From the second epic on, you are not designing on a blank page.** A running system is a harder constraint than a north star, because it is already true. Most of what follows is about telling three things apart: what this epic adds, what it attaches to, and what it changes.

> Part of the **dev system** — see the `dev-system` skill for the full pipeline, the artifact map, and the principles that hold across every phase.

## Working conventions (shared across the dev system)

Artifacts under `docs/` by default:

- `docs/project/architecture.md`, `<epic>/prd.md` — read these
- `docs/epics/` — every epic already cut; the earlier ones' architectures are what already runs
- `<epic>/architecture.md` — this skill
- `<epic>/implementation-plan.md`
- `<epic>/stories/<story>/<NN>-<ticket>.md`

Overengineering is the failure mode here, so make it easy for the operator to spot: for anything beyond the epic's needs, say why it earns its place now.

**Reference links.** Every section reference is a markdown link to the file and the line its heading sits on — `[3.2.4](docs/project/prd.md#L142)` — with the visible text left as the plain reference. Resolve the line with `grep -n`; never guess it. Full rule in the `dev-system` skill.

## Method

1. **Read the inputs — including what already runs.** `docs/project/architecture.md` and `<epic>/prd.md`. From the second epic on, also read each architecture in `docs/epics/`, and lean on two of their sections in particular: **Extension points** (seams earlier epics left for exactly this) and **Deliberately deferred** (structure consciously postponed, which this epic may be the one to finally need).
2. **Locate the epic against what exists.** Before designing anything, sort the epic's work into three kinds, because they carry very different risk:

   - **Adds** — new components standing alongside what runs. The cheap case.
   - **Attaches** — plugs into an extension point an earlier epic left. Check the seam is actually there and actually fits; a seam predicted wrong is far cheaper to find here than in implementation.
   - **Changes** — reshapes something already built: splitting a module, promoting an inline thing to a real component, finally adding a layer that was deferred. **This is where regressions come from,** so it gets named explicitly rather than absorbed into "implementation detail."

   If the epic attaches somewhere no earlier epic anticipated, say so. Either the earlier prediction was wrong or this epic is cutting against the grain — both are worth a moment before proceeding.
3. **Simplify to the epic.** Drop or stub anything the epic's features don't require. Fewer moving parts is the goal, not fidelity to the full design.
4. **Stay compatible in both directions.** Don't make a choice the full-scope architecture would have to undo, *and* don't make one that fights what's already running. When the two disagree — the north star says one thing, the code that exists says another — **reality wins for this epic, and you flag the drift** rather than quietly pretending it isn't there. The north star is a north star; by the third epic some divergence is expected and healthy. What isn't healthy is nobody noticing.
5. **Mark the extension points.** Where deferred features will later attach (from the epic PRD's "Still remaining after this epic"), leave a clear seam — a note on where and how full scope plugs in. This is what makes the epic growable instead of throwaway, and it is what the *next* epic's step 2 will read.
6. **Draw the epic.** One mermaid flowchart, same base conventions as the full-scope diagram — subgraphs by deployment boundary, weighted edges, explicit `fill`/`stroke`/`color` on every class. What differs is the axis you colour on: an epic diagram colours by **what this epic does to each component**, since the subgraphs already carry what kind of thing it is. Four states, straight out of step 2:

   - **Adds** — new in this epic.
   - **Changes** — already there, reshaped here. The category worth staring at.
   - **Untouched** — already running, not affected. Muted. For the first epic there is none, and the diagram degrades to a plain one.
   - **Deferred** — the seams from step 5, as dashed ghosts. Drawing what you are *not* building is what makes it easy to keep not building it.

   Underneath, write **one line naming what it proves.** For an epic that's usually restraint: what a reader should notice is how much of the north star isn't there. If your epic diagram has as many boxes as the full-scope one, you didn't scope it — go back to step 3.
7. **Resist overengineering.** No abstraction, layer, or generality that the epic's features don't currently need. If you're adding it "for later," a marked extension point is enough — build it later.

## Structure

```
# <Project> — Epic architecture: <name>

## Overview
The epic's structure in a paragraph. Deliberately smaller than the north star.

## Builds on
What already runs that this epic attaches to, and which extension point from
an earlier epic it lands on. For the first epic: "nothing — first epic." If it
attaches where nothing anticipated it, say so; that's a signal, not a detail.

## Epic diagram
One mermaid flowchart — see Diagram conventions below. One line underneath
naming what it proves, plus a legend for the four states.

## Components for the epic
Only the parts the epic needs, and what each owns. New components only.

## Changes to existing structure
Anything already built that this epic modifies, splits, promotes, or
replaces — kept separate from what it adds, because the risk is different.
**Empty is a good answer.** Each entry: what changes, why the epic can't
proceed without it, and what could regress.

## Data model (epic)
The entities the epic touches, conceptually — marking which are new and
which already exist and are being extended.

## Key choices
The picks for the epic, each with a one-line why — a note where it matches
the full-scope architecture, and a note where a decision from an earlier
epic constrained it.

## Divergence from the north star
Where this epic knowingly differs from `docs/project/architecture.md`, and whether
that's the epic bending or the north star being out of date. Omit if none.

## Extension points
Where deferred features attach later. The seams that keep this growable, and
what the next epic will read.

## Deliberately deferred
Structure intentionally not built yet, so nobody adds it by reflex.
```

## Diagram conventions

The base conventions are the full-scope architecture's: mermaid, subgraphs for deployment boundaries, `[( )]` cylinders for anything that stores state, weighted edges (plain for the normal path, `==>` for high-volume, `-.->` for scheduled or occasional), and `fill`/`stroke`/`color` set together on every class so labels survive both themes.

The addition is the four build-states from method step 2:

```mermaid
flowchart TB
    subgraph client["Client"]
        App["<this epic's UI>"]
    end

    subgraph host["<deployment unit>"]
        Web["<service this epic adds>"]
        Auth["<earlier epic, reshaped here>"]
        PG[("<earlier epic, untouched>")]
        Worker["<deferred: background processing>"]
    end

    App --> Web
    App --> Auth
    Web --> PG
    Web -. "later" .-> Worker

    classDef adds    fill:#e1f5ee,stroke:#0f6e56,color:#085041
    classDef changes fill:#faece7,stroke:#993c1d,color:#712b13
    classDef kept    fill:#f1efe8,stroke:#5f5e5a,color:#444441
    classDef defer   fill:#fbfbfa,stroke:#9a9894,color:#75736e,stroke-dasharray:4 4
    class App,Web adds
    class Auth changes
    class PG kept
    class Worker defer
```

Four classes on **one** axis — what this epic does to the thing. Don't also colour-code component type; a diagram carrying two axes stops being readable, and the subgraphs already handle the second one. Put a one-line legend under the diagram naming the four shades.

## Checkpoint

Link the epic architecture, keep the chat minimal, and put the operator's attention on two things: **what this epic changes in existing structure** — the additive parts are cheap, the changes are where regressions live — and where you resisted building ahead, which the diagram's ghost nodes show at a glance. Confirm it doesn't fight the north star, or that any divergence is deliberate and named. Beyond those, say only what the doc wouldn't tell them — no component-by-component walkthrough. Get agreement before generating the epic plan. (See *What goes in the chat* in the `dev-system` skill.)

**Next step.** End the checkpoint with a single sentence naming what runs next — e.g. *"Next: Phase 5, `epic-plan`, to break this epic into stories and reviewable tickets."* Suggest it; don't run it.
