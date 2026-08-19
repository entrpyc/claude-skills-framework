---
name: dev-system
description: Explain and navigate the dev system — the controlled Claude Code workflow that runs a project from full-scope PRD, through repeatable vertical slices, down to per-step implementation. Use it to understand how the phases fit together, to orient when picking work back up ("where are we", "what phase now", "what runs next"), or to start a project on the system. Every other dev-system skill points here for the whole picture. Trigger on "dev system", "how does this workflow work", "where are we in the process", "what phase are we in", "what's the next phase".
---

# The dev system

Build projects heavily with Claude Code while keeping strong control and awareness over how development is done.

**Control comes from the operator staying engaged at each checkpoint.** The system creates the checkpoints; reading the output carefully and pushing back is what produces the control. Every phase below ends by handing control back deliberately — none of them roll straight into the next.

This skill is the map. It doesn't produce an artifact of its own — it tells you where you are, what runs next, and what holds true across all of it.

## The pipeline

Each phase writes an artifact the next phase reads.

| # | Skill | Reads | Writes | Runs |
|---|-------|-------|--------|------|
| 1 | `full-scope-prd` | — | `docs/prd.md` | once per project |
| 2 | `full-scope-architecture` | `prd.md` | `docs/architecture.md` | once per project |
| 3 | `vertical-slice-prd` | `prd.md`, `architecture.md`, `completed-slices/` | `docs/slice-prd.md` | once per slice |
| 4 | `vertical-slice-architecture` | `architecture.md`, `slice-prd.md`, `completed-slices/` | `docs/slice-architecture.md` | once per slice |
| 5 | `implementation-plan` | slice + full-scope docs | `docs/implementation-plan.md` | once per slice |
| 6 | `step-planning` | only the sections its step references | `docs/steps/<NN>-<slug>.md` | once per step |
| 7 | `step-implementation` | the step's plan | code, tests, manual-validation checklist | once per step |
| 8 | `step-validation` | plan, architecture | validation notes | once per step |

## Two loops

Phases 1–2 happen once for the project. Everything after them repeats:

- **Per slice — phases 3–8.** A slice is a working increment of the app. Phase 3 always cuts the next ~20% from what *remains undelivered*, which is why slice 01 and slice 05 run identically: only the input differs.
- **Per step — phases 6–8.** Inside a slice, every step of the implementation plan runs **planning → implementation → validation**, in that order.

When the last step of a slice validates, the loop closes back to phase 3 and the next slice is cut.

## Artifacts

The **active slice** always sits at the canonical paths, which is what lets phases 4–8 stay slice-agnostic — they never need to know which slice is running. Completed slices are archived whole when the next one starts.

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

`docs/` is the default. If a project uses somewhere else, change it in each skill's Working conventions block and stay consistent — the pipeline connects through these paths.

## Reference links

Every reference to a numbered section or a named heading — in a written artifact and in what you present to the operator — is a markdown link to the file and line it lives at, so it can be opened rather than hunted for:

```
[3.2.4](docs/prd.md#L142)
[slice-architecture.md § Data model (slice)](docs/slice-architecture.md#L61)
[completed-slices/01 § In scope](docs/completed-slices/01-core-playback/prd.md#L28)
```

Four rules keep them worth trusting:

- **Resolve every link, never guess the line.** Find the heading first (`grep -n "^### 3.2.4" docs/prd.md`) and use what it returns. A link to a plausible-looking line is worse than a bare number, because it reads as checked when it isn't.
- **Anchor on the heading line**, not the sentence you're borrowing from. Headings survive edits to the prose beneath them; sentences shift by a line whenever anything above them grows.
- **Keep the visible text the reference itself** — the number or the section name, exactly as you would have written it unlinked. The document has to still read correctly wherever links don't render.
- **Treat them as a snapshot, not a guarantee.** A renumber or a rewrite upstream silently rots every link into it. This is why the PRD phases re-open each reference during their duplicate & reference audit instead of trusting the link text, and why a doc you edit is a reason to re-resolve the links pointing into it.

Paths are relative to the repo root, matching the artifact map above.

## Where am I?

**The artifacts are the state.** Nothing else tracks progress, so orientation is just reading the filesystem. Walk down and stop at the first thing missing:

| If this is missing | You're at |
|---|---|
| `docs/prd.md` | Phase 1 — `full-scope-prd` |
| `docs/architecture.md` | Phase 2 — `full-scope-architecture` |
| `docs/slice-prd.md` | Phase 3 — `vertical-slice-prd` |
| `docs/slice-architecture.md` | Phase 4 — `vertical-slice-architecture` |
| `docs/implementation-plan.md` | Phase 5 — `implementation-plan` |
| nothing — all present | the step loop, below |

**Inside the step loop.** Take the implementation plan's steps in order and find the first one not finished:

- No `docs/steps/<NN>-<slug>.md` for it → **phase 6**, `step-planning`.
- Its step doc has requirements, but the code isn't written or its manual checks haven't passed → **phase 7**, `step-implementation`.
- Code done and manual checks passed, no validation notes → **phase 8**, `step-validation`.
- **Every step in the plan is finished** → the slice is done. Go back to **phase 3**; `vertical-slice-prd` archives this slice into `docs/completed-slices/` and cuts the next one.

Joining an existing codebase is the same procedure — a repo with code but no `docs/prd.md` starts at phase 1, and phase 3's stock-take is what reconciles the docs with what's already built.

**Report where you landed and what runs next — then stop.** Say it in the same shape every phase uses to close: one sentence, e.g. *"Next: Phase 4, `vertical-slice-architecture`, since the slice PRD is written but its architecture isn't."* Advancing a phase is the operator's call. Auto-running the next phase is exactly the skimming risk the checkpoints exist to prevent.

## Principles that hold across every phase

1. **Checkpoints, not deliveries.** Every phase ends by presenting its work, naming the open questions and assumptions, and handing control back. Never roll from one phase into the next unprompted — and always close with **one sentence naming what runs next**, so the operator knows where the pipeline stands without it advancing on its own.

2. **Altitude discipline.** Each phase works at one level. The PRD is *what and why*, never *how*. The architecture is structure and load-bearing choices, not detailed design. The plan is product-legible steps, not implementation. Writing below your altitude pre-empts a decision the next phase should be making on its own terms — which is the most common way this system degrades.

3. **Small, high-impact output**, so nothing gets skimmed and the operator always has a real chance to respond. Two exceptions: the **manual-validation checklist is never compressed**, and a **hard-to-reverse decision gets the space it needs** to explain itself.

4. **Never invent to paper over a gap.** A missing requirement, an ambiguous reference, an unstated assumption — surface it and ask. A fabricated answer propagates silently through every phase downstream.

5. **The plan is the master knob.** Step granularity (phase 5) determines whether review is real or theatre: a step should change one observable behavior, be testable on its own, and have a diff that fits in your head. Per-step references keep each iteration reading narrowly — and a lazy reference propagates to every step that inherits it, so they're worth spot-checking.

6. **Anti-bloat, including here.** No step, abstraction, or section that exists only to be thorough. That applies to these skills too — if one feels heavy for your project, trim it.
