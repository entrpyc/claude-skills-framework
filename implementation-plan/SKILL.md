---
name: implementation-plan
description: Generate a step-by-step implementation plan for the vertical slice, where each step is one reviewable, independently testable unit of behavior and carries specific per-step references to named PRD and architecture sections. Use this after the slice PRD and slice architecture exist, or whenever the user wants to break the slice into build steps. Trigger on "implementation plan", "break this into steps", "plan the build".
---
# Implementation plan

Produce `docs/implementation-plan.md`: a high-level plan covering the full vertical slice. This is Phase 5, and it's the plan the iteration cycle (Phases 6–8) walks step by step.

The plan must be compatible with the slice architecture, carry no bloat and no overengineering, and be understandable as a product — while developed with enough technical judgment that each step genuinely contributes to completing the slice.

Two rules govern how the plan is generated. Get these right and the rest of the system works; get them wrong and every downstream step inherits the mistake.

> Part of the **dev system** — see the `dev-system` skill for the full pipeline, the artifact map, and the principles that hold across every phase.

## Working conventions (shared across the dev system)

Artifacts under `docs/` by default:

- `docs/slice-prd.md`, `docs/slice-architecture.md`, `docs/prd.md`, `docs/architecture.md` — read these
- `docs/implementation-plan.md` — this skill
- `docs/steps/<NN>-<slug>.md`
- `docs/completed-slices/<NN>-<slug>/` — slices already delivered

Control comes from the operator reviewing this plan closely before any building starts. A weak plan is the most expensive thing to get wrong here, so make it reviewable.

**Reference links.** Write every section reference as a markdown link to the file and line it lives at — `[3.2.4](docs/prd.md#L142)`, `[slice-prd.md § In scope → Auth](docs/slice-prd.md#L34)` — with the visible text left as the plain reference. Resolve the line by finding the heading (`grep -n`); never guess it. See the `dev-system` skill for the full rule.

## Rule 1 — Step granularity (the master knob)

Each step is **one reviewable unit of behavior**: testable in isolation, and small enough that its full diff fits in your head. This is the knob that matters most — set it right.

- Too big and the operator can't hold the diff, so review degrades to skimming and control is lost.
- Too small and the plan drowns in ceremony.
- Aim for a step that changes one observable behavior, could be tested on its own, and could be described in a sentence.

## Rule 2 — Per-step references

**Read the PRD and architecture once, during generation.** For each step, write the *specific references it needs* — named sections of the PRD / slice PRD / architecture / slice architecture, **not whole documents**. Each later iteration then reads only what its step points to, which is what keeps step planning cheap and focused.

- Reference named sections as links, e.g. "[slice-prd.md § In scope → Auth](docs/slice-prd.md#L34)", not "the PRD".
- After generating the plan, **spot-check a few references** by following them. A lazy or wrong reference propagates to every downstream step, so a few minutes here saves the whole chain — and since the links are resolved rather than guessed, following one is a click.

## Method

1. Read the slice PRD and slice architecture in full (and the full-scope docs as needed). This is the one pass where you read broadly.
2. Order the slice's work into steps, each satisfying Rule 1.
3. For each step, write what it delivers and the specific references from Rule 2.
4. Keep it high-level and product-legible — a reader should follow the arc of what's being built, not drown in implementation detail. No bloat, no steps that exist only to be thorough.
5. Spot-check references, then present.

## Step template

```
### Step <N> — <title>
**Delivers:** one reviewable unit of behavior — what observably changes.
**References:** <named sections only, each linked to its line — e.g. [slice-architecture.md § Data model (slice)](docs/slice-architecture.md#L61); [slice-prd.md § In scope → X](docs/slice-prd.md#L18)>
**Notes:** <optional — only if this step carries a hard-to-reverse decision worth flagging up front>
```

## Checkpoint

Link the plan and invite pushback specifically on **step granularity** — that's the knob most worth arguing about before the build starts. Confirm the reference spot-check passed. Keep the rest of the chat to what the operator wouldn't anticipate: a step that turned out much larger than its neighbours, an ordering forced by a dependency they may not expect. Don't list the steps back at them — they're in the plan. (See *What goes in the chat* in the `dev-system` skill.) Once agreed, the iteration cycle (step-planning → step-implementation → step-validation) walks the plan one step at a time.

**Next step.** End the checkpoint with a single sentence naming what runs next, including which step it starts on — e.g. *"Next: Phase 6, `step-planning` for Step 1 — Playback shell."* Suggest it; don't run it.
