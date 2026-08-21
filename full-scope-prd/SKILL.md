---
name: full-scope-prd
description: Generate a full-scope PRD (product requirements document) — a detailed, numbered product description of an entire project's vision, features, data, and non-functional requirements, laid out with metadata tables and per-feature functional requirements that cross-reference each other by number, plus a short technical-feasibility section validating the product is buildable. Use ONLY when the user explicitly says "PRD" — e.g. "write the PRD", "generate a PRD", "draft a PRD for this project", "flesh out the PRD", "PRD for X". Do NOT trigger on requests to spec, define, describe, or plan a project that don't use the word "PRD". If the PRD is scoped to an epic or MVP rather than the whole project, use epic-prd instead.
---
# Full-scope PRD

Produce `docs/project/prd.md`: a detailed description of the whole project. This is Phase 1 of the dev system and the source of truth every later phase reads. It describes *what* the project is and *why* — not *how* it's built (that's the architecture phase).

**This document covers full scope.** Everything the project is meant to be belongs here, described in full. There is no deferral, no phasing, no "later" in this document — cutting scope down to what gets built first is the epic's job (Phase 3), and it can only cut well if this document is complete.

> Part of the **dev system** — see the `dev-system` skill for the full pipeline, the artifact map, and the principles that hold across every phase.

## Working conventions (shared across the dev system)

Artifacts live under `docs/` by default and this skill writes `docs/project/prd.md`. If the project uses a different location, change it here and stay consistent. The full artifact map is in the `dev-system` skill.

Surface real decisions and open questions plainly, and **never invent a requirement to paper over a gap** — ask instead.

**Reference links.** Every section reference is a markdown link to the file and the line its heading sits on — `[3.2.4](docs/project/prd.md#L142)` — with the visible text left as the plain reference. Resolve the line with `grep -n`; never guess it. Full rule in the `dev-system` skill.

## Method

1. **Read what exists.** If any brief, notes, or partial spec is in the repo or conversation, start from it rather than a blank page.
2. **Interview for the gaps.** Ask the operator only about things you genuinely can't infer — vision, who it's for, what problem it kills, hard constraints. Batch questions; don't drip one at a time.
3. **Write a product description, not a design.** This document stays on the product side of the line. Describe what the product does, for whom, and why. If you catch yourself specifying database schemas, frameworks, libraries, APIs, or file layout, stop — that belongs to the architecture phase. (The data-definitions section describes *what data exists and who sets it*, conceptually — not table structures.) The one deliberate exception is the technical feasibility section, and it has its own tight limit — see step 6.
4. **Be clear and specific.** Product-level does not mean vague. Every statement should be concrete enough that two readers would agree on what it means and the next phase can build a structure to support it. "User can X so that Y" beats "great UX." Name real behaviors, real limits, real numbers where they're known — and where they aren't, say so instead of hedging.
5. **Make features concrete enough to architect against.** Each feature gets a **Functional requirements** list of specific capabilities, detailed enough that the architecture phase can design directly from it without guessing.
6. **Answer "is this actually buildable?" — and stop there.** The technical section exists to validate that the product described is possible, and to sketch at a high level how it works. Name the moving pieces and how they connect, and call out anything genuinely hard, uncertain, or dependent on something outside your control. Do **not** design it: no schemas, no file layout, no interface definitions, no library-by-library breakdown, no chosen implementation for something that has several viable ones. If a reader could start coding from what you wrote, you went too far — that detail is the architecture phase's job (Phase 2), and writing it here pre-empts a decision that phase should make on its own terms. A paragraph plus a short list is usually the right size.
7. **Cross-reference by number, and link every number.** Features and functional requirements refer to each other by their section number — "extends [3.2.1](docs/project/prd.md#L118)", "consumes the metadata defined in [4.3](docs/project/prd.md#L214)" — rather than by restating them. Every part of the document is numbered so this works; use it to keep the document non-repetitive and to make relationships between features explicit. The link makes a reference followable instead of a scavenger hunt, and resolving it is also how you catch a number that has drifted.
8. **Audit the finished draft for duplicates and mis-pointed references.** A numbered, cross-referenced document fails in exactly the two ways the audit section below defines, and both are cheap to fix now and expensive later. Do this as a real pass over the written draft, not from memory: read every cross-reference and open the section it names. Report what you find in the audit table, and let the operator choose the owner — collapsing a duplicate on your own can silently drop a nuance only one copy carried.

## Structure

Model `docs/project/prd.md` on the numbered format below. It's a skeleton — keep the spine, drop sections that don't apply to the project, and renumber so numbering stays contiguous. Cross-references use the final numbers as they end up in the written document. Prefer tables for anything that's fundamentally a grid (roles, permissions, capabilities, non-functional requirements).

```
# <Project> — PRD

| Platform     | <e.g. PWA / web / mobile / API>    |
| Target Users | <initial count → scale>            |

## 1. Executive summary
2–4 paragraphs: what this is, who it serves, what it consolidates or does,
and the launch posture (platform, initial scale, what ships first).

## 2. Product overview
A compact metadata table. Rows as relevant:
Product name · Product type · Target audience · Access model ·
Content cadence · External distribution · Core purpose.

## 3. Features
One numbered subsection per feature (3.1, 3.2, …). For each:
- An optional one-line *italic framing* — why the feature exists or where it
  sits relative to the others.
- **Functional requirements** — a numbered list of concrete capabilities, so
  each one can be referenced individually (3.2.1, 3.2.2, …).
- For complex features, nest further (3.4.1.1, …) for types, workflows, or
  step-by-step flows.
- Reference related features and requirements by linked number rather than
  restating them.

Anything the product does is a feature here — including accounts, roles,
permissions, and access control. If the product has roles, they belong in
the feature that owns them (e.g. an "Accounts & access" feature whose
requirements define each role, what it can do, and how a user gets it), not
in a section of their own. Use a Role | Description | Permissions table
inside that feature when it's genuinely a grid.

## 4. Data / metadata definitions       (include whenever there are core entities)
Per entity (Recording, User, Video, …): the fields it carries, who sets each
(admin-set / AI-suggested / auto-extracted / user-set), and any population
workflow. Conceptual — what data exists and who owns it, not schemas.

## 5. Platform & distribution            (include if platform/channels matter)
Capability table(s) — Capability | Requirement | Notes. External platforms
and their publishing rules.

## 6. Non-functional requirements
Table: Category | Requirement. Cover the ones that apply — scalability,
performance, storage, availability, security, audio/media quality, API-first,
content integrity.

## 7. Technical feasibility & high-level approach
Short. Its job is to show the product described above can actually be built,
and to sketch how — not to design it.
- **How it works, in outline.** A paragraph, or a handful of bullets: the
  major moving pieces, what each is responsible for, and how they connect
  end-to-end. Enough that a technical reader nods; not enough to build from.
- **What makes it possible.** The capabilities the product leans on and any
  external service, platform, or device feature it depends on — named, with
  a line on why it's the thing that makes 3.x work.
- **Hard parts & unknowns.** Anything genuinely risky, unproven, or outside
  your control — rate limits, latency budgets, offline behavior, licensing,
  a capability that may not exist. Say plainly which of these would change
  the product if it turns out badly.
- **Deliberately not decided here.** One line naming the choices left to the
  architecture phase, so nobody reads this section as settled.
```

## Duplicate & reference audit

Run this over the finished draft and present the table with the PRD.

```
| Fact | Defined at | Also defined at | Recommended owner |
|------|-----------|-----------------|-------------------|
| Free tier caps uploads at 10/month | [3.2.4](docs/project/prd.md#L142) | [6 Non-functional](docs/project/prd.md#L318)                      | [3.2.4](docs/project/prd.md#L142) — 6 should cite it |
| "Draft" status semantics           | [4.1](docs/project/prd.md#L201)   | [3.5.2](docs/project/prd.md#L176)                                 | [4.1](docs/project/prd.md#L201) — data definitions own status |
| Retention window                   | —                         | [3.7.1](docs/project/prd.md#L188) → cites [6.2](docs/project/prd.md#L322) | nothing defines it — ask |
```

Two kinds of row, same columns:

- **Duplicate definition** — the same fact stated twice. *Defined at* is the more natural home, *Also defined at* is the copy, and *Recommended owner* names the one section that keeps it, with the other becoming a numbered reference.
- **Mis-pointed reference** — a cross-reference that resolves nowhere, or to a section that doesn't carry the fact. Put the true home in *Defined at* and the bad citation in *Also defined at* as `<citing section> → cites <target>`.

Where nothing in the document actually owns the fact, write `—` in *Defined at* and say so in *Recommended owner*. That's a gap to ask the operator about — **never invent the missing definition** to make the table resolve.

An empty table is a real result. Say "none found" rather than manufacturing rows.

## Checkpoint

The PRD is a checkpoint, not a delivery — and the checkpoint is a link plus what the operator wouldn't anticipate, not a tour of the document they're about to read. Keep the chat minimal: the audit table, the open questions, any assumption you had to make, anything the research turned up that changes what they thought they were building. Everything else is in the PRD. Then hand control back for review before treating it as settled. (See *What goes in the chat* in the `dev-system` skill.) A fact the audit found no owner for is an open question — put it in front of the operator, not in the document. Don't roll straight into architecture — that's a separate, deliberate step.

**Next step.** End the checkpoint with a single sentence naming what runs next — e.g. *"Next: Phase 2, `full-scope-architecture`, to turn this into a north-star technical standard — once you're happy with the PRD above."* Suggest it; don't run it.
