# Teaching Hub — Implementation plan: mind-maps-and-offline

## Status

89/191 criteria met. Groups complete: 1 (The installable app), 2 (Tags), 3 (Recording mind maps), 5 (Downloading).
_Maintained by implementation — see the checkboxes for detail._

---

## 1. The installable app

**Delivers:** a member installs Teaching Hub to their home screen, or from an iOS or Android store build, and it opens standalone and renders its navigation with no connectivity.
**Feature:** active-scope prd 3.4

### 1.1 — Web app manifest and installability

**Delivers:** the browser offers to install the app, and the installed app opens standalone without browser chrome.
**References:** active-scope prd 3.4.1; project architecture § Components & responsibilities (Client — PWA shell); docs/design referencess png/style-guide.md § Color
**Out of scope:** the service worker, and anything that needs one — offline navigation, downloads, push.
**Prerequisites:** anything the operator must do manually.

**Acceptance criteria**

- [X] **1.1.1** The app serves a web app manifest declaring its name, short name, start URL, standalone display mode and theme and background colours drawn from the style guide's surface tokens — verified by `packages/web/tests/integration/manifest.test.ts`
  - a manifest route built from one source of product identity, not a static file duplicating it
- [X] **1.1.2** The manifest declares 192px and 512px icons plus a maskable variant, and every declared icon resolves to a served image of the declared size — verified by `packages/web/tests/integration/manifest.test.ts`
  - the test fetches each declared icon and asserts its dimensions, so a missing or mis-sized icon fails rather than being declared
- [X] **1.1.3** Every member-facing HTML response links the manifest and carries the theme-colour and viewport metadata an installed app needs — verified by `packages/web/tests/integration/manifest.test.ts`
