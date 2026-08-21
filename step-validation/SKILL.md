---
name: step-validation
description: Validate a completed step — check for major contradictions with the implementation plan or architecture and propose the cheaper fix, then review the session for concrete, observable process friction worth fixing. Use this as the third of three prompts per step in the dev-system iteration cycle. Trigger on "validate this step", "review the step", "consistency check".
---

# Step validation

Third and last of the three prompts per step: planning → implementation → **validation.** The step's code is done and its manual checks have passed. This prompt looks backward — at consistency and at process — before moving on.

## Output principle (applies to all three step prompts)

Default to **small, high-impact output**. Two exceptions:

- The **manual-validation checklist** (from the implementation prompt) is exempt from compression.
- A step carrying a **hard-to-reverse decision** gets the space it needs to explain it.

Here that means: flag **major** issues only. Don't pad the report with minor observations — that's exactly the skimming risk the principle guards against.

> Part of the **dev system** — see the `dev-system` skill for the full pipeline, the artifact map, and the principles that hold across every phase.

## Working conventions

Artifacts under `docs/`. Reference `docs/implementation-plan.md`, `docs/architecture.md`, `docs/slice-architecture.md`.

**Reference links.** Write every section reference as a markdown link to the file and line it lives at — `[3.2.4](docs/prd.md#L142)`, `[slice-prd.md § In scope → Auth](docs/slice-prd.md#L34)` — with the visible text left as the plain reference. Resolve the line by finding the heading (`grep -n`); never guess it. See the `dev-system` skill for the full rule.

## What to do

### 1. Consistency check
Does the completed work introduce contradictions with the implementation plan or the architecture? **Read the step doc's Implementation notes first** — the assumptions recorded there are where implementation departed from what was planned, so that's the likeliest place a contradiction sits. **Flag major contradictions only.** For each, propose the **cheaper fix** — either additional work before continuing, or updating the docs to match reality. Name which is cheaper and why; the operator decides.

### 2. Efficiency review
Review the planning and implementation sessions for **concrete, observable friction** — not token counts, which can't be measured reliably across sessions. Look for:

- Any step that required **more than two correction rounds.**
- Any **doc reference that was ambiguous** or sent the work to the wrong place — including a link that pointed at the wrong line because the doc moved underneath it.
- **Anything that got re-read repeatedly.**

**Suggest major process improvements only** — reductions in complexity or friction that preserve implementation quality. Skip the small wins; a long list of marginal tweaks is noise.

## Output shape

```
## Validation — Step <N>

### Consistency
- <major contradiction, naming the section it contradicts as a link> → cheaper fix: <more work | update docs>, because <reason>
(or: none found)

### Process friction
- <concrete observation, e.g. "step needed 3 correction rounds because…">
  → suggested improvement: <major change only>
(or: none worth flagging)
```

## Handoff

Keep it lean and major-issues-only. If a contradiction needs a decision, get it before the next step starts. If the fix is to update a doc, make the update (or flag it) so the plan and architecture stay honest as the slice grows.

**Next step.** End with a single sentence naming what runs next, and check the implementation plan to get it right:

- Steps left in the plan → *"Next: Phase 6, `step-planning` for Step 4 — Search index."*
- That was the plan's last step → *"Next: Phase 3, `vertical-slice-prd`, to archive this slice and cut the next one."*
- A contradiction above needs deciding first → say that, and name the decision that unblocks the next step.

Suggest it; don't run it.
