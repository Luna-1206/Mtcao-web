# BACACAY EXPLORER — FULL PROJECT CONTEXT (v1.2)

Where the project stands, so anyone (or any AI assistant) can pick it up without re-explaining. Last updated: October 13, 2026.

## 1. Project Overview

Bacacay Explorer is a tourism system for Bacacay, Albay, with two apps on one Firebase backend:

- **MTCAO Personnel:** website only, React + Vite, Firebase. For the Municipal Tourism office.
- **Tourist:** mobile app only, Flutter, Firebase. For visitors and locals.

**Target:** the course requires 80% completion now; 100% is welcome. Tiers are in `02`.

## 2. Stack

- Web: React + Vite, Firebase JS SDK, Leaflet/OpenStreetMap
- Mobile: Flutter, FlutterFire, `flutter_map`, `geolocator`
- Backend: Firebase Auth, Cloud Firestore, Cloud Storage, Cloud Functions (SMS) — **Blaze plan required**
- SMS gateway: Semaphore (Philippines)
- No separate Node/Express server

## 3. Existing Artifacts

| Artifact | Status |
|---|---|
| Use Case Diagram | **Final** (main goals only) |
| Flowchart: MTCAO Personnel | Done (final, editable `.drawio`) |
| Flowchart: Tourist | Done (final, editable `.drawio`), includes the late-hour warning |
| ERD, 16 tables | Final (v2). Includes `admin_name` on `activity_logs`. PDF: `Bacacay-ERD-MTCAO-and-Tourist_FIXED.pdf`; Lucidchart copy done. The ERD table `admin` maps to the Firestore collection `admins` (`03` §4) |
| UI prototype, MTCAO web (HTML) | Done; forgot-password and Archive/Restore fixes to confirm (`05` §E) |
| UI prototype, Tourist mobile (HTML) | Done; forgot-password, save button, delete label to confirm |
| Documentation set (this folder) + `CLAUDE.md` | Done (v1.2) |
| Firebase project / repositories | Not yet created |

## 4. Use Case Summary (final diagram, main goals only)

**MTCAO Personnel:** Login (includes Verify Credentials; extended by Display Login Error and Reset Password), View Dashboard, Monitor Tourist Records (includes View Tourist Records), Manage Tourism Destination (includes Add Destination, which includes Edit Destination and Archive Destination), View Activity Logs, View Archive (includes Restore Record).

**Tourist:** Register, Login, Receive SMS Notification, View Tourism Destination, Manage Itineraries (includes Create Itinerary, which includes Edit Itinerary and Delete Itinerary), View Saved Places.

Search/filter, details, route, add to itinerary, save, review, profile, and logout are covered by the flowcharts and the feature list. See `01` §4.3.

## 5. Decisions Made

(This list has its own numbering. `01` §10 has a separate list of resolved decisions; the two are not the same.)

1. Platform split: MTCAO web-only, Tourist mobile-only.
2. One Firebase backend; no custom server.
3. Destinations are archived with Restore, never deleted.
4. MTCAO sets each destination's map location and transport/route options; the tourist app only reads them.
5. The tourist app uses device GPS and shows distance plus MTCAO-managed boarding points and fares.
6. Light, tourism-themed palette; sidebar unchanged.
7. Documentation is delivered as separate files.
8. Password reset uses the Firebase reset-email link.
9. MTCAO accounts are created manually by developers.
10. OpenStreetMap-based maps (Leaflet, flutter_map).
11. Itinerary "Delete" is a soft delete labeled Delete itinerary.
12. Archive page covers destinations only in MVP.
13. Recommended = filtered results sorted by `savedCount`.
14. Tourist User ID shown = last 6 characters of UID.
15. **SMS notifications are Tier 1** (course requirement) and are limited to what the panel recommended: a welcome SMS after registration, and "don't miss out" SMS at 7 and 30 days of inactivity (reset when the tourist is active again). Mandatory: no toggle, no test button. Semaphore gateway; consent collected at registration.
16. **Use Case Diagram shows main goals only**, like the course reference diagrams. Sub-steps live in the flowcharts; nothing is removed from the system.
17. **Include style follows the reference:** Add Destination → Edit/Archive; Create Itinerary → Edit/Delete.
18. **Late-hour warning is advisory only** (BR-16): shown when a visit time is after the destination's closing time, with Continue / Cancel. Early visits are allowed. No new data fields. ERD and Use Case Diagram unchanged.

## 6. Open Items

| Item | Owner | Action |
|---|---|---|
| **Enable Blaze + budget alert** (needed for Storage and SMS functions) | You | Before build step 1. See `03` §10 |
| **SMS gateway account** (Semaphore sign-up, top-up credits, sender name) | You | Do this now; custom sender names can take days. Default sender works for the demo |
| Confirm SMS wording and consent line with your adviser | You | Templates are in `03` §6.6; consent wording in `01` BR-14 |
| Prototype fixes | You | `05` §E |
| Confirm assumed decisions 12–15 | You | Tell Claude Code if any should change |

Nothing else blocks coding. Items above can run in parallel with Tier 1.

## 7. Known Inconsistencies (resolved)

- ERD `password` columns: removed; credentials live in Firebase Auth only.
- ERD is relational; implementation is Firestore. Mapping is in `03` §4.
- Tourist Home counts ("0 itineraries", "5 places to see") were static prototype values; they must come from live data.
- Dashboard "Overview" filter has no ERD field beyond `registered_at`; treat it as a date filter on that field.
- Tourist flowchart said "search for an itinerary" in the destination branch; corrected to "destination".
- "Archive/Delete Itinerary" vs "Delete Itinerary": unified as Delete Itinerary (soft delete).
- Use Case Diagram was much more detailed than the course reference; simplified to main goals. Details stay in the flowcharts.
- Admin could not archive tourists under the old rules; rules in `03` §5 now allow admin updates to `isArchived`/`archivedAt` only.
- Recommended destinations had no data source (saves live under each tourist); `savedCount` on the destination fixes this.
- Docs said the ERD had 17 tables; the final ERD has 16. Docs corrected.
- `admin_name` on `activity_logs` was listed as missing; it is in ERD v2. Docs corrected.
- ERD table `admin` (singular) vs Firestore collection `admins`: kept as is, mapped in `03` §4.
- Tourist flowchart gaps (Hotlines, Edit / delete itinerary, Back to destination details) are accepted and listed in `05` §C.

## 8. Next Steps

1. Create the Firebase project on Blaze with a budget alert, and open the SMS gateway account (§6).
2. Create the two repositories; copy `docs/` (this folder, diagrams, prototypes) into each; put `CLAUDE.md` in each repo root.
3. Seed categories and transport modes; create the first admin.
4. Build in the order listed in `02`.
5. Prepare the 80% demo with the acceptance checklist.

## 9. Document Index

| File | Purpose |
|---|---|
| `CLAUDE.md` | Short instructions Claude Code reads automatically at the start of every session |
| `01_Bacacay_Explorer_PRD.md` | What the system does: users, use cases, features, flows, business rules |
| `02_Bacacay_Explorer_MVP_Scope.md` | Tiers for 80% and stretch, build order, acceptance checks |
| `03_Bacacay_Explorer_System_Context.md` | Architecture, Firestore mapping, rules, feature logic, billing |
| `04_Bacacay_Explorer_Project_Context.md` | This file: status, decisions, open items |
| `05_Bacacay_Explorer_Diagram_Reference.md` | Final diagram state, remaining label fixes, diagram-to-code mapping |

END OF CONTEXT.
