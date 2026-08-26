# Teaching Hub — Active scope: mind-maps-and-offline

_Defined: 2026-08-25_

## 1. Scope decisions

**1.1 What's in**

- **Tags and the shared taxonomy** — the entity, its review path, and the two full-scope requirements waiting on it (project prd 4.7, 3.7.1, 3.15.2).
- **Recording mind maps** — generated per recording, admin-curated, member-visible (project prd 3.8.1–3.8.4).
- **Personal mind maps** — member-generated private study maps, with the shareable link (project prd 3.8.5–3.8.13).
- **The installable app** — web app manifest, service worker, and the Capacitor store shell (project prd 5.1, 5.2.1–5.2.2).
- **Downloads and offline** — downloading, managing downloads, offline presentation, and the offline write outbox (project prd 3.18).
- **Push notifications and preferences** — device-level delivery on both routes, with per-category preferences (project prd 3.17.1, 3.17.13, 3.17.14).

## 2. What this scope delivers

A member installs Teaching Hub as an app on their phone, downloads a whole series before a flight, and listens through it with no connectivity — the summary, scripture references, tags, mind map and their own notes all readable offline, notes written mid-flight syncing the moment signal returns. Every teaching now carries a visual map of what it covers, curated by an admin before anyone sees it, with each concept linking to the moment in the audio where it is taught; and any member can generate their own private map from a teaching, keep a library of them, and share one by link if they choose. When a new teaching publishes or someone replies to their note, the phone tells them — and they control which of those reach the device.

- **As a member, I can** install the app from my home screen or an app store build, download recordings and whole series, listen and read offline, write notes offline that sync later, see and open a teaching's mind map, generate and keep my own private mind maps, share one by link, pin a topic to my Highlights, and choose which notifications reach my device.
- **As an admin, I can** review and correct the tags and the mind map a teaching's pipeline drafted, before either reaches a member; curate a map by renaming, removing and re-parenting its nodes; and manage the tag taxonomy the whole library shares.
- **As an operator, I can** build and install the iOS and Android store packages from the same web build, and configure the push credentials each delivery route needs.

## 3. Features

### 3.1 Tags and the shared taxonomy

_Refines: project prd 4.7, 3.7.1, 3.15.2_

**Functional requirements**

- **3.1.1** A tag has a name of 1–40 characters, unique case-insensitively across the whole product. Creating a tag whose name differs from an existing one only by case or surrounding whitespace resolves to the existing tag rather than creating a second. (refines 4.7)
- **3.1.2** Tags are one shared taxonomy. Applying a tag to a recording applies the same tag row that any other recording carries, so renaming it once renames it everywhere. (refines 4.7)
- **3.1.3** Only an admin creates, renames or deletes a tag. Deleting a tag removes it from every recording carrying it and from every Highlight entry that pinned it (3.1.11), and the deletion screen states how many of each will be affected before it is confirmed. (uncovered — 4.7 states only that admins create tags)
- **3.1.4** The draft-generation step suggests tags for a recording from its transcript, targeting 3–6 and never producing more than 12. A suggestion whose name matches an existing tag resolves to it; a suggestion that does not becomes a new tag only at the moment an admin accepts it, so the pipeline cannot grow the taxonomy on its own. (refines 4.7, 4.17.1)
- **3.1.5** Suggested tags reach the admin as a review item of kind `tags`, carrying the same provenance every AI artefact carries. (refines 4.17.6, 4.17.5)
- **3.1.6** In the review form an admin accepts, edits, removes or adds each tag individually, and can approve a recording whose tag list is empty. An empty accepted list is a reviewed fact, distinct from an unreviewed item. (refines 4.17.2, mirrors 3.7.8)
- **3.1.7** A recording carries at most 12 tags. The review form refuses a thirteenth and says so rather than silently dropping it. (refines 4.7)
- **3.1.8** Accepted tags appear on the recording page for members, on published recordings only. An unpublished recording's tags are visible to admins alone. (refines 3.2.2, §6 Security)
- **3.1.9** Selecting a tag opens a tag view listing every published recording carrying it, newest first, using the same ordering and row treatment as the date-ordered library. (uncovered — full scope's tag consumers, 3.9 and 3.10, are both outside this scope)
- **3.1.10** The date-ordered library can be filtered to one tag. The filter narrows the existing ordering and never regroups it. (uncovered — see 3.1.9; consistent with 3.3.10)
- **3.1.11** A member can pin a tag on a recording to their Highlights, capturing the topic rather than the whole teaching. The entry names the tag and the recording, and playing it opens that recording at its start with the tag shown — a topic has no single timestamp, and the entry does not invent one. (refines 3.15.2, 3.15.7)
- **3.1.12** A tag can be pinned once per recording per member. Pinning the same tag on a second recording is a separate entry. (refines 3.15.2)
- **3.1.13** Scripture reference drafting takes the recording's tags as a second input alongside the transcript: within one pipeline run the tags are drafted first and passed forward; a re-run of scripture drafting alone uses the admin-accepted tags where the tag review is complete, and the drafted ones where it is not. (refines 3.7.1)
- **3.1.14** A recording with no tags shows no tag row at all, rather than an empty one. (refines 3.3.9's treatment of absent optional data)


## 5. Interface detail

To the depth set at 1.3. No design reference covers any of these; the style guide governs.

**Tags on the recording page** — a row of tag chips beneath the summary, alongside the scripture references (3.7.5's placement). Absent entirely when the recording has none (3.1.14). Each chip is a link to the tag view; a secondary control on the chip pins it to Highlights (3.1.11).

**Tag view** — the date-ordered library filtered to one tag, using the same rows as `pages/dashboard.png`, with the tag named in the header and a control to clear the filter. Empty state: the tag exists but no published recording carries it.

**Tag management (admin)** — a list of every tag with the count of recordings carrying it, and create, rename and delete. Delete confirms with the counts it will affect (3.1.3).

**Tag review (admin)** — inside the existing review form, alongside summary and scripture references: the suggested tags as removable chips, an add control that autocompletes against the taxonomy and offers creating a new tag, and the 12-tag ceiling stated when reached (3.1.6, 3.1.7).

**Recording mind map (member)** — a collapsed tree on the recording page beneath the mind map heading, root's children expanded, each node expandable. Nodes carrying a timestamp show it and seek the docked player on selection (3.2.10). States: absent when no approved map exists (3.2.11); a loading skeleton while the map loads on a slow connection; an inline failure message that does not take the rest of the recording page down with it.

## 6. Non-functional requirements

| Category            | Requirement                                                                                                                                                                                          | Refines                          |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------- |
| Availability        | A downloaded recording plays through a complete listening session with no connectivity and no degradation. Push, tag suggestion and map generation failing never blocks listening.                   | §6 Availability                 |
| Offline capability  | Offline is a first-class mode: the app opens, navigates and plays downloaded content with the network off from launch, not only after an online start.                                               | §6 Offline capability, 3.4.2    |
| Privacy             | Personal mind maps and their share tokens are never readable by another member or by an admin through any surface, including admin tooling. A shared map is reachable only by its token.             | §6 Privacy, 3.3.10              |
| Security            | The shared-map route is the only unauthenticated route this scope adds, and it joins the enumerated unauthenticated surface rather than arriving by convention. It returns one map and nothing else. | §6 Security, 3.1.2              |
| Performance         | A mind map with 40 nodes renders and responds to expand and collapse without visible lag on a mid-range phone.                                                                                       | §6 Performance                  |
| Processing latency  | Tag and mind map generation fit inside the existing few-hours pipeline budget rather than extending it.                                                                                              | §6 Processing latency           |
| Cost accountability | Both new generation steps record their spend against the recording, and personal map generation records its spend against the member's request. The provider mock switch covers both.                | §6 Cost accountability, 3.19.13 |
| Storage             | Downloads are the one thing this product stores on a member's device. Nothing server-side changes about permanent retention.                                                                         | §6 Storage                      |
| Accessibility       | The mind map tree is navigable by keyboard and readable by a screen reader as a tree, not only as a visual layout. Download and offline states are conveyed in text, not by colour alone.            | §6 Accessibility                |
| API-first           | Downloads, sync and push registration are API operations the store builds and the browser PWA call identically.                                                                                      | §6 API-first, 5.2.2             |

## 7. Out of scope

- **Semantic search and cross-referencing (3.9, 3.10)** — tags are built here as a taxonomy with its own browse surface; their use as a similarity and search input waits for the layer that consumes them.
- **Pinning a segment range (3.15.2's second half)** — a Highlight is still a single position or a tag, never a range.
- **The Contributor role** — mind map curation and every other capability in this scope is Admin-only, because the role does not exist in the product.
- **Personal mind maps from a video (3.8.5)** — videos are excluded from the project.
- **Native background audio and lock-screen transport (3.2.6)** — the store shell makes it possible; wiring it is a separate change, and the Media Session route keeps working on all three delivery routes meanwhile.
- **Store submission and listing (5.2.3, 5.2.8)** — this scope produces installable store builds. Listings, screenshots, privacy policy, age rating and the review cycle are not attempted here.
- **Email as a notification channel** — full scope has two channels, push and in-app (§7). Nothing here adds a third.
- **Downloading videos, questionnaires or Flow Tracker content** — none of it exists.
- **Sync conflict resolution beyond 3.6.6** — deliberately left where project architecture § Open questions carried forward already holds it.
- **A server-side record of what a member has downloaded** — downloads are device state; making them server state would create a member-behaviour record full scope never asks for.
- **Tag merging** — an admin renames and deletes; merging two tags into one is not offered.
