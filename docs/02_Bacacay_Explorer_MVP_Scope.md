# MVP SCOPE — Bacacay Explorer (v1.2)

**Goal:** Reach the required **80%** first with the smallest feature set that makes the core loop work, then continue to 100% with the stretch items.

**Core loop:** MTCAO adds a destination → tourist sees it in the app → tourist views location/route → tourist adds it to an itinerary.

Requirement IDs (W-x, T-x) and use case IDs (UC-…) refer to `01_Bacacay_Explorer_PRD.md` §4. The Use Case Diagram shows only main goals; "not on diagram" features are still built (see `01` §4.3).

---

## TIER 1 — MUST HAVE (the 80%)

### MTCAO Personnel Web
| # | Feature | Req | Use case |
|---|---|---|---|
| 1 | Login (email/password), logout, invalid-credentials error, admin check | W-1 | UC-W01 |
| 2 | Dashboard: registered tourists count, registered destinations count, destinations table | W-3 | UC-W03 |
| 3 | Manage Destination: list, search/filter (category, status), Add, Edit, Archive with confirm | W-5 | UC-W05 |
| 4 | Destination form: name, category, status, description, available time, cost, activities, ≥1 photo, map pin | W-6, W-7 | UC-W05 |
| 5 | Route/transport: mode, starting point, stopping point, fare | W-8 | UC-W05 |
| 6 | Tourist List with date-registered filter | W-4 | UC-W04 |
| 7 | Profile: view/edit name, position, email, photo | W-11 | not on diagram |
| 8 | Activity log **writing** on every add/edit/archive (the page itself is Tier 2) | BR-2 | — |

### Tourist Mobile App
| # | Feature | Req | Use case |
|---|---|---|---|
| 1 | Register, Login, Logout | T-2, T-3, T-12 | UC-T01, UC-T02 |
| 2 | Home: greeting, Popular Destinations, shortcuts | T-4 | — |
| 3 | Tourism Destinations: list, search, filter by time/budget/activity | T-5 | UC-T04 |
| 4 | Destination Details: photos, description, hours, cost, activities | T-6 | UC-T04 |
| 5 | Location/Route: pin, GPS, distance, transport options with boarding point and fare | T-7 | UC-T04 |
| 6 | Itineraries: create (name + budget), list, details, add destination with date/time/activity/cost/notes, **late-hour safety warning** (visit time after closing time; Continue / Cancel, BR-16), **Delete itinerary** | T-8, T-9 | UC-T05 |
| 7 | Profile: view/edit profile, logout, MTCAO hotlines | T-12 | not on diagram |
| 8 | **SMS notifications:** welcome SMS after registration; "don't miss out" SMS after 7 and 30 days of inactivity (mandatory, no toggle) | T-11 | UC-T07 |

---

## TIER 2 — SHOULD HAVE (toward 90%)

- Web: **Activity Logs** page with filter (UC-W06).
- Web: **Archive** page with **Restore Record** (UC-W07).
- Web: Filter Manage Destination by available time range.
- Web: **Reset Password** via Firebase email link (UC-W02).
- Web: About Us and Settings (change password).
- App: **Recommended destinations** (filtered result sorted by `savedCount`).
- App: **Save Destination / Saved places** (UC-T06).
- App: **Reset Password** via Firebase email link (UC-T03).
- App: Edit itinerary and search itineraries.
- App: Onboarding slides.

## TIER 3 — STRETCH (to 100%)

- In-app **notifications** from MTCAO with read/unread (`notifications`, `notification_reads`).
- **Write Review** with photos (flowchart only, not on the Use Case Diagram).
- Custom 6-digit OTP for password reset (optional upgrade).
- Web: Dashboard overview filter (Today / This week / This month) with real charts.
- Auto-computed travel time and distance per route option.
- Optional archive of tourist records.

---

## Explicitly Cut From This Phase

Booking/payment, turn-by-turn navigation, multi-language, tourist access to web, iOS-specific polish, staff-account management.

## Why This Scope

- Tier 1 covers every Tier 1 use case on the Use Case Diagram (Login, View Dashboard, Monitor Tourist Records, Manage Tourism Destination, View Tourism Destination, Manage Itineraries, Register, Receive SMS Notification) plus the flowchart-level steps behind them (details, location/route, add to itinerary).
- SMS is in Tier 1 because it is a course requirement. It adds a Cloud Function and a paid gateway, so start the account setup early.
- Tiers 2 and 3 use the same collections, so nothing needs rebuilding later.
- Tier 3 items are optional extras, so they are attempted last.

## Build Order

1. **Firebase setup:** project on **Blaze** with a budget alert (see `03` §10), Auth, Firestore, Storage, rules skeleton, seed categories and transport modes, first admin. **Also create the SMS gateway account now** (sign-up, top-up, sender name) because approval can take days.
2. Web: login, layout shell (sidebar/topbar), destination CRUD with photos and map pin, `logAction` helper.
3. App: register/login, destination list and details reading the same data.
4. Web: transport/route entry → App: route screen with GPS and distance.
5. App: itineraries and add-to-itinerary (including the late-hour warning, BR-16).
5b. **SMS:** `sendSms()` helper, `onTouristCreated` welcome trigger, scheduled `sendInactivityReminders`, and `lastActiveAt` updates in the app (see `03` §6.6).
6. Web: tourist list, dashboard counts, filters.
7. Tier 2 (logs page, archive/restore, reset password, saved places, recommended).
8. Tier 3.

## Acceptance Check (80% Demo)

- [ ] MTCAO logs in and adds a destination with photo, pin, cost, and a transport option.
- [ ] That destination appears in the tourist app with no code change.
- [ ] A tourist registers, logs in, filters destinations, opens details and the route.
- [ ] A tourist creates an itinerary, adds the destination, and deletes an itinerary.
- [ ] Adding a destination with a visit time after its closing time shows a warning. "Continue" saves the stop; "Cancel" does not save and returns to the destination details. A time before opening (e.g. 7 AM for an 8 AM opening) shows no warning.
- [ ] MTCAO sees the new tourist in the Tourist List.
- [ ] MTCAO edits and archives a destination; the tourist app reflects it.
- [ ] An invalid login shows "Invalid username or password" on both apps.
- [ ] Registering a new tourist delivers a welcome SMS to the registered number.
- [ ] A tourist inactive for 7 days gets one "don't miss out" SMS, and one more at 30 days, and none after that. After the tourist opens the app again, the cycle resets. (Demo: set `lastActiveAt` back in the console and force-run the job.)

## Acceptance Check (Tier 2)

- [ ] Every add/edit/archive/restore appears on the Activity Logs page.
- [ ] An archived destination can be restored and reappears in the tourist app.
- [ ] Reset password emails arrive and the new password works on both apps.
- [ ] A tourist can save/unsave a destination and see it under Saved places.
- [ ] Recommended destinations are ordered by saves.
