# _The member-space scope's reconciliation changed three requirements and added one. 3.3.3 now states_

# Teaching Hub — PRD

## 1. Executive summary

Teaching Hub is a private, member-exclusive platform for a teaching ministry group. It consolidates what is currently scattered across recordings, chat threads and personal notebooks into one place: audio teachings, transcripts, AI-generated summaries and video, interactive mind maps, scripture references, personal study tools and community engagement — all behind a single login.

The product solves a specific problem. A weekly teaching is heard once and then largely lost. Members who miss a session fall out of the thread of a series and have no route back in. Insight that surfaces during a teaching has nowhere to live. Teaching Hub attacks all three: every recording becomes a durable, searchable, cross-referenced artefact; members annotate teachings at the exact moment that matters to them; and members who have fallen behind are diagnosed and routed back to the specific teachings they missed.

The platform is simultaneously an internal content studio. Admins process raw recordings into a consistent sound profile, review AI-generated summaries and metadata before anything publishes, produce short-form video from the teaching library, and distribute externally — teaching series as podcasts on Spotify, video reels to social platforms — without leaving the app.

It is built as a Progressive Web App on a single codebase, reachable from any browser and also listed as an installable app in the Apple App Store and Google Play, so members find it where they already look for apps. It serves roughly 100 members at launch, with all content behind authentication and a weekly content cadence.

| Product name          | Teaching Hub (working title)                                                                                                                              |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product type          | Progressive Web App, distributed via web and app stores                                                                                                   |
| Target audience       | Private ministry group members — 100 at launch, scaling to 1,000+                                                                                        |
| Access model          | Invite-only, login required, all content member-exclusive                                                                                                 |
| Content cadence       | Weekly teaching upload, plus back-catalogue processing                                                                                                    |
| External distribution | Spotify (teaching series as podcasts); Instagram, TikTok and LinkedIn (video reels)                                                                       |
| Core purpose          | A single hub where every teaching becomes durable, searchable and interconnected — and where members engage with it all week rather than hearing it once |

## 3. Features

### 🔨 3.1 Accounts & access

*Everything in the product sits behind this. The group is private by design: there is no public surface and no self-signup.*

| Role        | Description                                                 | Permissions                                                                                                                                                                                                                                                                                                                                   |
| :---------- | :---------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin       | Owner and designated group members who control the platform | Everything a Contributor can do, plus: manage users and roles, review and publish AI summaries and metadata, moderate and pin timestamp notes, author and attach questionnaires, curate Flow Tracker question banks, configure audio processing settings, publish to external platforms, broadcast announcements, close or remove SOS signals |
| Contributor | Trusted members who help produce content                    | Upload recordings, manage series and series artwork, correct transcripts, generate AI videos, generate and edit AI summary drafts, generate and curate recording mind maps                                                                                                                                                                    |
| Member      | Authenticated group members                                 | Stream and download recordings, view published videos and summaries, generate personal mind maps, write timestamp notes, complete questionnaires, use the Flow Tracker, manage Highlights, raise and respond to SOS signals, search the library                                                                                               |

**Functional requirements**

- ✅ **3.1.1** Every user has an individual account identified by email address, with password authentication.
- ✅ **3.1.2** All content in the product requires an authenticated session. There is no anonymous or public view of any recording, video, summary, note or mind map — with the single exception of an explicitly shared mind map link (3.8.13).
- ✅ **3.1.3** New members join by admin invitation only. An admin enters an email address and assigns a role; the invitee receives an invitation and sets their own password to activate the account.
- ✅ **3.1.4** Invitations expire seven days after they are issued, and can be revoked or re-sent by an admin before they are accepted. Re-sending issues a fresh link and restarts the seven days rather than extending the original, so a forgotten invitation cannot be quietly kept alive.
- ✅ **3.1.5** An admin can change any user's role at any time. Permissions are enforced server-side on every request, never only in the interface.
- ✅ **3.1.6** A user can reset a forgotten password through an email-based flow without admin involvement. A reset link is valid for one hour and can be used once, and a second request inside a minute sends no second message. The response to a reset request is identical whether or not the address has an account, so the flow never discloses who is a member.
- ✅ **3.1.7** An admin can deactivate an account, and can reactivate it again later. Deactivation ends that account's sessions and cancels its outstanding reset links immediately rather than at their next expiry, so access stops at the moment the admin presses it. A deactivated account cannot sign in, but its authored content is retained.
- ✅ **3.1.8** A member can permanently delete their own account from within the app, without contacting an admin (5.2.6).
- 🔨 **3.1.9** When an account is deleted, that user's private content is deleted with it: private notes (3.12.3), personal mind maps (3.8.5), questionnaire responses (3.13.8), Flow Tracker sessions (3.14.8) and Highlights (3.15).

### 🔨 3.2 Audio recordings & playback

*Every teaching exists first as a recording. Every other content type in this product — transcript, summary, mind map, video, cross-reference, search result — is derived from it.*

**Functional requirements**

- 🔨 **3.2.1** Admins and Contributors upload teaching recordings as audio files, accepting MP3, M4A, AAC, WAV and FLAC up to 200 MB per file — which covers a 90-minute teaching as a compressed export, and covers the lossless formats only for shorter recordings. The browser sends the bytes straight to media storage under a short-lived, single-purpose upload grant rather than through the application, and the recording is created only once the stored object has been checked against the same limits the screen stated before the file was chosen.
- ✅ **3.2.2** A recording is not visible to members until an admin explicitly publishes it (see 4.17.3).
- ✅ **3.2.3** Members stream any published recording.
- ✅ **3.2.4** Playback speed is adjustable across 0.5x, 0.75x, 1x, 1.25x, 1.5x and 2x. The chosen speed is a property of the account rather than of the session, so it persists across recordings and across every device that user signs in from.
- ✅ **3.2.5** Playback position is tracked per user per recording, and playback resumes from the last position on any device that user signs in from. The position is written while listening rather than only on leaving — at most once every ten seconds — and a position under five seconds is not stored at all, so opening a teaching and closing it again leaves no resume point behind.
- 🔨 **3.2.6** Audio continues playing when the app is backgrounded or the device is locked, with transport controls available from the device lock screen and notification area.
- ✅ **3.2.7** Each user has a listening history recording which teachings they played, when, and how far through they got.
- 📝 **3.2.8** A recording is marked completed for a user once they reach the end, and completed teachings are visually distinguishable when browsing.
- ✅ **3.2.9** Members can scrub to any position in a recording, and can jump ten seconds backwards or forwards from the transport controls.
- 📝 **3.2.10** Admins and Contributors can replace the audio file on an existing recording. This re-runs processing (3.4) and transcription (3.5) while preserving the recording's notes, metadata and member progress.

### 📝 3.3 Reflective questionnaires

*Questionnaires move members from passive listening into meditation, personal application and spiritual practice. They are contemplative tools, not assessments.*

**Functional requirements**

- 📝 **3.3.1** Each recording can have one admin-curated reflective questionnaire attached to it.
- 📝 **3.3.2** Questionnaires are created and managed by admins only.
- 📝 **3.3.3** Questions are written manually by the admin. There is no AI generation of questionnaire content.
- 📝 **3.3.4** Three question types are supported: open reflection, multiple choice, and scripture reference prompts.

## 4. Data & metadata definitions

*What data exists in the product and who owns each field. Conceptual — this describes ownership and provenance, not storage.*

### 4.1 User account

| Field                    | Set by                 | Notes                                                                     |
| :----------------------- | :--------------------- | :------------------------------------------------------------------------ |
| Email address            | User-set at invitation | Identity and login (3.1.1)                                                |
| Display name             | User-set               | Shown on public notes and SOS signals (3.1.12)                            |
| Avatar                   | User-set               | Optional                                                                  |
| Role                     | Admin-set              | Admin, Contributor or Member (3.1)                                        |
| Status                   | Admin-set              | Invited, active or deactivated; deactivation is reversible (3.1.7)        |
| Notification preferences | User-set               | Per event category (3.17.13)                                              |
| Preferred playback speed | User-set               | One of the six steps at 3.2.4, applied to every recording on every device |
| Password                 | User-set               | Held only as a hash; reset, never recovered (3.1.6, 3.1.13)               |
| Date joined              | Auto-set               | On invitation acceptance                                                  |

### 4.2 Recording

| Field                | Set by                       | Notes                                                                                                                                                                 |
| :------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title                | Admin-set                    | Confirmed at upload                                                                                                                                                   |
| Description          | AI-suggested, admin-editable | 1–3 sentences from the transcript                                                                                                                                    |
| Topics / tags        | AI-suggested, admin-editable | Admin can add or remove (4.7)                                                                                                                                         |
| Scripture references | AI-suggested, admin-editable | Structured citations (3.7.3)                                                                                                                                          |
| Date recorded        | Admin-set                    | Primary sort key (3.3.1)                                                                                                                                              |
| Series               | Admin-set                    | Optional (3.3.9)                                                                                                                                                      |
| Duration             | Not stored                   | Read from the media by the player at playback time. Nothing inspects the file on upload, so no list shows a running time and no progress is expressed as a percentage |
| Publication status   | Admin-set                    | Draft or published (3.2.2, 3.2.11)                                                                                                                                    |
| Original audio       | Auto-retained                | Unmodified upload, held in object storage that is never publicly addressable and reachable only through a signed URL (3.4.9, 3.2.13)                                  |
| Processed audio      | Auto-generated               | Output of 3.4. Until that step exists, the original is what is streamed                                                                                               |

## 5. Platform & distribution

### 5.1 Progressive Web App

| Capability         | Requirement                                                                             | Notes                                                        |
| :----------------- | :-------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| Installable        | Add to home screen on iOS and Android                                                   | Behaves as an app once installed                             |
| Offline support    | Downloaded recordings and their attached content available with no connectivity         | Full requirements at 3.18                                    |
| Background audio   | Playback continues when backgrounded or the device is locked, with lock-screen controls | Critical for mobile listening (3.2.6)                        |
| Push notifications | Device-level delivery when the app is closed                                            | Event model at 3.17                                          |
| Responsive design  | Usable on phone, tablet and desktop from one codebase                                   | Admin work is desktop-weighted; member use is phone-weighted |
| Media handling     | Large audio upload, streaming playback, video playback                                  | 3.2, 3.11                                                    |
| Local storage      | Downloaded media and pending offline writes held on device                              | 3.18.11, 3.18.14                                             |

### 5.2 App store distribution

*The product remains a single PWA codebase. The app stores are a distribution channel for it, not a second platform — there is no separate native application.*

- **5.2.1** The PWA is packaged and listed in the Apple App Store and Google Play, so members can find and install it the way they install any other app.
- **5.2.2** Store builds and the browser-delivered PWA serve the same product from the same codebase. A feature never exists in one and not the other.
- **5.2.3** Store listings carry the product's name, icon, screenshots, description and category, and a privacy policy covering the data described in section 4.
- **5.2.4** Content updates and feature releases reach members through the web layer without requiring a store review cycle for every change.
- **5.2.5** Push notifications (3.17.1) function in the store-distributed builds as well as in the browser PWA.
- **5.2.6** Both stores require in-app account deletion of any app that offers account creation, which is what makes 3.1.8 a compliance requirement rather than a convenience.
- **5.2.7** The product involves no payments, subscriptions or in-app purchases, so neither store's commerce rules apply to it.
- **5.2.8** Age rating and content declarations reflect the product's religious content and its member-generated notes and SOS messages.

### 5.3 External content platforms

*How each external channel behaves. The admin-facing publishing capability is specified at 3.20.*

- **5.3.1** **Spotify.** Teaching series are distributed as podcasts: a series maps to a feed, a recording maps to an episode. The feed draws its title, description and artwork from series metadata (4.3), and episodes carry the processed audio (3.4.10) with the recording's title, description and date. Series metadata is podcast-shaped from creation (3.3.7).
- **5.3.2** Series cover artwork must satisfy podcast artwork requirements — square, high resolution — from the point external distribution exists. In-app artwork (3.3.3) is not held to it, so a series given artwork before a feed is published may need new artwork when one is.
- **5.3.3** **Instagram, TikTok and LinkedIn.** Generated reels (3.11.1.1) are published as short-form video. Each platform imposes its own duration limits, aspect ratio and caption conventions, which is what makes the per-platform publishing choices at 3.20.5 necessary.
- **5.3.4** Video style presets (3.11.2) are defined so that generated output meets the aspect ratio and duration expectations of the target platforms rather than being reformatted afterwards.
- **5.3.5** Every external platform is publish-only. No comments, followers or engagement data are pulled back into the product.

## 6. Non-functional requirements

| Category            | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scalability         | Supports 100 members at launch and scales to 1,000+ without re-architecture. Content volume grows unbounded: weekly additions plus the full back catalogue.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Performance         | Audio streaming begins within 2 seconds of pressing play. Search returns results within 2 seconds. Video plays smoothly at target resolutions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Processing latency  | The automated pipeline (3.21.2.1) completes within a few hours of upload, so a recording uploaded after a session is reviewable the same day.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Storage             | Permanent retention of original and processed audio, transcripts, generated videos, mind maps, notes and all member-generated content. Nothing expires. The single exception is a member deleting their own account (3.1.9, 3.1.15), which is the one place this product removes member content permanently.                                                                                                                                                                                                                                                                                                                                                    |
| Availability        | Downloaded content remains fully usable during any outage. Degradation is graceful: a failure in AI generation or external publishing never blocks listening.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Security            | Authentication required for all content. Role-based access enforced server-side. Media storage is not publicly addressable. Every authorisation decision is evaluated in one place, against an actor, an action and a resource, and denies by default — a capability nobody wrote a rule for is refused rather than permitted. The unauthenticated surface is an enumerated list of routes rather than a convention, and no entry on it returns content. Passwords are held only as hashes; sessions are server-side and revocable on the spot; media is reached only through short-lived signed URLs issued after the authorisation check has already passed. |
| Privacy             | Private member content — private notes, personal mind maps, questionnaire responses, Flow Tracker sessions, Highlights — is never visible to other members or to admins, and never surfaces in another member's search results (3.10.9).                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Audio quality       | One consistent sound profile across the entire library, with output suitable for both in-app playback and podcast distribution.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Offline capability  | Offline is a first-class mode, not a fallback. Members can complete a full listening session with no connectivity and sync cleanly on return.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| API-first           | The product's capabilities are exposed through an API layer rather than being embedded in the interface, so store-packaged builds, the browser PWA and external publishing all work against the same contract.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Content integrity   | AI-generated content accurately reflects the teaching it derives from. Every AI output passes an admin review gate before any member sees it (4.17.3).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Auditability        | External publishes (3.20.8) and admin actions on member content (3.12.10, 3.16.11) are logged with actor and timestamp. Every request and every pipeline job carries one correlation id through the application, the worker and the logs, so a single action is followable end to end across both processes.                                                                                                                                                                                                                                                                                                                                                    |
| Operability         | The product answers a health check that reflects a real database round-trip and is readable without a session, so monitoring never needs a credential. Both processes are supervised, start on boot and restart on failure. Logs are structured and carry the correlation id of the request or job that produced them.                                                                                                                                                                                                                                                                                                                                          |
| Durability          | The database is backed up nightly with continuous write-ahead archiving to object storage held separately from the media bucket, and a restore is proven by drill rather than assumed. An unverified backup is not a backup.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Cost accountability | Every provider call records what it spent — model, billed quantity, cost and the provider's request id — against the job that made it, so running cost is measured rather than estimated. A single switch puts every external provider into a local mock, so no development or test run can reach a paid one by accident.                                                                                                                                                                                                                                                                                                                                     |
| Accessibility       | Text is legible at increased system font sizes, controls are reachable by keyboard on desktop, and media controls carry accessible labels.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

## 7. Technical feasibility & high-level approach

*This section exists to show the product above can be built and to sketch how. It deliberately stops short of designing it.*

**How it works, in outline.** A recording enters the system through an upload from an admin or contributor and lands in durable media storage. From there an asynchronous processing chain runs: clean and normalise the audio, transcribe it into timestamped segments, then fan out to the derived artefacts — summary, scripture references, tags, mind map — each produced as a draft. Segment text is additionally turned into a semantic representation that supports both similarity matching between teachings and meaning-based search. Everything generated waits at an admin review gate; only on approval does content become member-visible. Members reach the product through a web application that also serves as an installable PWA, packaged for the two app stores from the same codebase. That application talks to a backend API which owns access control, playback progress, notes, questionnaires and every other piece of member state, and pushes events out through a notification service. Offline works because the client keeps its own copy of downloaded media and any writes made while disconnected, reconciling with the server when connectivity returns. Video generation and external publishing run as their own asynchronous jobs, triggered by an admin and reported back through the same notification path.

**What makes it possible.**

- Speech-to-text with word- or segment-level timestamps — the single capability everything downstream depends on (3.5). **Deepgram**'s pre-recorded API on the English Nova-3 model is what fills it today, behind a one-file adapter, with the provider handed a short-lived signed location to fetch the audio from rather than the bytes themselves.
- A general-purpose language model for summarisation, tagging, scripture identification, mind map extraction and video script assembly (3.6, 3.7, 3.8, 3.11.3.1). **MiniMax M3**, over its Anthropic-compatible endpoint, fills it today behind the same shape of adapter; structured output is taken as a forced tool call, and a model that answers in prose instead fails the step visibly rather than writing something nobody asked for.
- Semantic similarity over text segments, which is what makes cross-referencing (3.9) and meaning-based search (3.10) the same underlying capability rather than two separate builds.
- Generative video with text-to-speech, for reels and summary videos (3.11).
- Audio processing capable of noise reduction, clarity enhancement and loudness normalisation as a repeatable profile (3.4).
- Transactional email delivery, for the two flows that cannot complete without it: invitation (3.1.3) and password reset (3.1.6). **Resend**, sent over SMTP so the provider is configuration rather than code. It is named here because the choice is settled and consequence-free: no notification in 3.17 uses email — both channels there are push (3.17.1) and in-app (3.17.2) — so email volume never grows with content or activity, only with new accounts. Dozens of messages a month at 100 members and at 1,000, which sits inside Resend's free tier at both ends.
- Web platform capabilities the PWA leans on directly: service workers and local storage for offline (3.18), background audio with lock-screen controls (3.2.6), and web push (3.17.1).
- External dependencies outside our control: Spotify's podcast ingestion, the Instagram, TikTok and LinkedIn publishing APIs (3.20), a source of Bible verse text (3.7.4), and the Apple and Google app store review processes (5.2).

**Hard parts & unknowns.**

- **App store acceptance.** Apple applies a minimum-functionality standard to web-wrapped applications. Rejection would not affect the product itself but would remove a distribution channel the product currently assumes, so 5.2 carries real risk.
- **Push notifications across delivery routes.** Web push on iOS behaves differently from push in a store-packaged build, and the two may not be reachable through one mechanism. If they are not, 3.17.1 costs more than it appears to.
- **Generative video quality, cost and turnaround.** This is the least proven capability in the product. If output quality or per-video cost disappoints, 3.11 changes shape — the feature survives but the workflow around it may need to lean far harder on manual selection.
- **Offline storage limits on mobile.** Browser-managed storage can be evicted under pressure and is capped on iOS. "Download all" for a long series (3.18.6) may collide with that ceiling, which would force a cap or an eviction policy the product does not currently describe.
- **Bible text licensing.** Displaying full verse text (3.7.4) is a licensing question, not a technical one, and it differs sharply by translation. **Answered for the translation the product runs on**: a free-use source and one configured translation (3.7.9), with verses rendered inline. It re-opens only if the ministry wants a translation that is not free to use — most of the well-known ones are not — which would be a licensing negotiation before it is a code change.
- **Cross-referencing cold start.** Similarity between teachings (3.9) is only as useful as the library is large. Early on it will surface little, and the feature will look weaker than it is until the back catalogue is processed (3.21.3).
- **Transcription accuracy on ministry-specific language.** Names, places and theological terminology are where speech-to-text degrades, and every downstream artefact inherits that error. The admin correction path (3.5.5) is a genuine requirement, not a convenience.
- **Cost at back-catalogue scale.** Running years of recordings through transcription, summarisation and embedding is a one-off cost concentrated in a short window (3.21.3.3), and needs to be sized before committing.

**Since settled, and recorded here because the product now runs on them.** Speech-to-text is Deepgram Nova-3 and drafting is MiniMax M3, both named above; transactional email is Resend over SMTP. Media is held in S3-compatible object storage that is never publicly addressable, written by the browser under a presigned upload grant and read only through a short-lived signed URL. The application, its API and the job orchestration are one codebase plus a single worker process, and the job ledger is itself the queue — there is no broker, which is what makes enqueueing a step transactional with the write that caused it and makes the status view at 3.19.4 one query rather than a log read. Persistence is a single PostgreSQL database with pgvector installed but not yet enabled, so cross-referencing and search (3.9, 3.10) can be built on the datastore that already holds the content and its access rules. Each of these sits behind a narrow adapter, which is what keeps replacing one of them a one-file change rather than a re-architecture.

**Still deliberately not decided here.** Which embedding, video and text-to-speech providers are used; how the PWA is packaged for the two app stores; whether search needs infrastructure beyond the datastore above; and how offline synchronisation resolves conflicts. Each of these has several viable answers, and they belong to the architecture phase of the epic that first needs one.

_that artwork is optional and falls back to a placeholder. 5.3.2 now applies the square,
high-resolution podcast constraint from the point external distribution exists rather than to what
an admin uploads today. §6 Storage now carves out account deletion from permanent retention. 3.1.15
is new, and names the account-derived data that deletion removes alongside 3.1.9's private content.
3.15.7 was settled the other way — the code changed, and a Highlights entry now starts playing._
