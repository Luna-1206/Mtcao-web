# BACACAY EXPLORER — DIAGRAM REFERENCE (v1.2)

Replaces `05_Bacacay_Explorer_Diagram_Updates.md`. The redraw work is done; this file records what the final diagrams show, what small fixes remain, and how each diagram maps to the build.

Final diagram files (keep them in the repo under `docs/diagrams/`):
- `BACACAY_EXPLORER__USE-CASE_DIAGRAM.jpeg` (final version)
- `MTCAO_Personnel_Flowchart.drawio` / `.png`
- `Tourist_Flowchart.drawio` / `.png`
- `Bacacay-ERD-MTCAO-and-Tourist_FIXED.pdf` (final ERD)

---

## A. Use Case Diagram — final

Final file: `BACACAY_EXPLORER__USE-CASE_DIAGRAM__8_.jpeg` (rename it in the repo). It shows **main goals only**, in the style of the course reference diagrams.

**MTCAO Personnel:** Login (include Verify Credentials; extend Display Login Error; extend Reset Password), View Dashboard, Monitor Tourist Records (include View Tourist Records), Manage Tourism Destination (include Add Destination; Add Destination includes Edit Destination and Archive Destination), View Activity Logs, View Archive (include Restore Record).

**Tourist:** Register, Login, Receive SMS Notification, View Tourism Destination, Manage Itineraries (include Create Itinerary; Create Itinerary includes Edit Itinerary and Delete Itinerary), View Saved Places.

### Intentionally not drawn (kept in flowcharts and the app)
Search/Filter (tourist records, destinations, activity logs), View Destination Information/Details, View Recommended Destinations, View Destination Location/Route, Add Destination to Itinerary, Save Destination, Write Review (stretch), Edit Profile, Logout.

If a panelist asks "where is X on the diagram?", the answer is: "the Use Case Diagram shows the main goals; the step-by-step is in the flowchart."

## B. MTCAO Flowchart — current state

Covers: Login with invalid-credentials error and Forgot password loop; Dashboard with four branches (Monitor tourist records, Manage tourism destinations, View activity logs, View archive); Add/Edit/Archive destination step chains; every branch returns to Dashboard → Logout → End.

Known, accepted gaps (pages that exist in navigation but are not drawn as flows): **About Us**, **Settings/Profile**. They are simple view/edit pages; the Use Case Diagram covers Edit Profile. Add a "Profile" branch only if your adviser asks for it.

## C. Tourist Flowchart — current state

Covers: Register, Login with validity check and Forgot password loop; Manage itineraries (search/create/view/Edit-delete); View tourism destination (search/filter, recommended, GPS/map loop, **Save**, **Write a review (optional)**, add to itinerary, view another destination); Profile branch (Edit profile, Saved places); Logout.

**Accepted gaps (Tourist flowchart):** (1) MTCAO **Hotlines** is a Profile screen item in the app (T-12) but is not drawn; it is a simple read-only list. (2) **Edit / delete itinerary** ends the branch without an arrow back to Dashboard. (3) **Back to destination details** has no outgoing arrow. All of these work in the app; the flowchart shows the main flow only.

Corrections already made: the destination search question now says "search for a **destination**" (the original said itinerary), and Edit/archive itinerary became **Edit / delete itinerary**.

**Late-hour warning (added):** after "Set trip details", a diamond "Is the visit time after the destination's closing time?". No → "Add to itinerary". Yes → diamond "Show safety warning. Do you still want to continue?" → Yes: "Add to itinerary"; No: "Back to destination details" (existing box). The diagram uses Yes/No; the app dialog buttons are labeled **Continue** and **Cancel** (BR-16). Only the Tourist flowchart changed; the ERD and Use Case Diagram did not.

## D. ERD — changes (all applied in the final ERD, v2)

> Applied in `Bacacay-ERD-MTCAO-and-Tourist_FIXED.pdf`: `password` removed, SMS fields added, `saved_count` added, `sms_reminders` renamed `sms_logs`, Firebase Auth note added. `admin_name` on `activity_logs` is now in ERD v2 (16 tables). The "Authentication managed by Firebase Auth" note appears in the PDF version, so keep the PDF as the reference copy.

| Change | Detail |
|---|---|
| Remove `password` | From `admin` and `tourists`. Add the note "Authentication managed by Firebase Auth" |
| Admin role | No role column; admin = existence of an `admins/{uid}` document (ERD table `admin`) |
| Keep `is_archived`, `archived_at` | On destinations (and optionally tourists, itineraries) |
| Keep `activity_logs` | Backs View Activity Logs. Includes `admin_name` (denormalized), applied in ERD v2 |
| Keep `saved_destinations`, `reviews`, `review_photos` | Back Save Destination and Write Review |
| Add `saved_count` (and optionally `average_rating`) to `destinations` | Backs Recommended Destinations (Resolved Decision 11 in `01` §10) |
| Optional: `last_login_at` on `admin` | For the Activity Logs page |
| `tourists`: remove `sms_enabled`; add `last_active_at`, `welcome_sms_sent_at`, `inactive_7_sent_at`, `inactive_30_sent_at` | Backs Receive SMS Notification |
| `sms_reminders` → rename `sms_logs` (type: welcome / inactive_7d / inactive_30d) | Log of sent messages |

## E. HTML Prototype Fixes (status: confirm)

### MTCAO web prototype
- Forgot password: one email step + "Check your email" screen. Remove the 6-digit code screens and "Demo only. Your code is…" text.
- Manage Destination: row action reads **Archive** and uses the "Are you sure?" dialog.
- Archive page: **Restore** button per row with confirm dialog.
- Activity Logs: record Restore actions too.

### Tourist mobile prototype
- Forgot password: same simplification.
- Destination Details: bookmark/save button.
- Itineraries: "Delete itinerary" wherever the action appears.
- Add to Itinerary: a late-hour warning dialog ("It may not be safe at this hour. Do you still want to continue?", **Continue** / **Cancel**) when the visit time is after the destination's closing time (BR-16).
- Profile: **remove** the SMS notifications toggle and the "Test SMS reminders (demo)" button (SMS is mandatory and automatic). Register: add the required SMS consent checkbox.

> The prototypes are **visual references only**. Claude Code should copy layout, colors, labels, and copy from them, but not their logic (they are static HTML).

## F. Diagram → Build Traceability

| Diagram element | Built as |
|---|---|
| MTCAO branches (4) | Web routes: Tourist List, Manage Destination, Activity Logs, Archive |
| Add/Edit chain | `DestinationForm` (details) + `MapPicker` (location) + `RouteEditor` (transport) + `logAction` |
| Archive / Restore | `isArchived` flag + `ConfirmDialog` + `logAction` |
| Forgot password loop | `sendPasswordResetEmail` + "Check your email" screen |
| Tourist View Saved Places / Save | `tourists/{uid}/saved/{destId}` + `destinations/{id}.savedCount`; reviews (stretch) in `destinations/{id}/reviews/{id}` |
| Tourist Profile branch | Profile screen: Edit profile, Saved places, Hotlines |
| Late-hour warning (Tourist flowchart) | `visitTime` vs `timeTo` check + `ConfirmDialog` in the add-to-itinerary form (`03` §6.8) |
| Receive SMS Notification | `functions/` (`onTouristCreated`, `sendInactivityReminders`, `sendSms`) + `lastActiveAt` updates + `smsLogs` collection |

## G. Final Consistency Checklist

- [x] Use Case Diagram redrawn (A1/A2 items)
- [x] MTCAO flowchart redrawn
- [x] Tourist flowchart redrawn
- [x] Use Case Diagram final (main goals only, SMS line added)
- [x] Tourist flowchart: "SMS notifications (on / off)" box already removed from the Profile branch
- [x] Tourist flowchart: late-hour warning diamonds added (see §C)
- [x] ERD: password columns removed, Firebase Auth note, `saved_count`, SMS fields (PDF version)
- [ ] Web prototype: forgot password, Archive/Restore updated
- [ ] Mobile prototype: forgot password, save button, delete label updated
- [ ] Every table in the ERD is used by at least one use case
