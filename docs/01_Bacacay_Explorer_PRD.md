# BACACAY EXPLORER — PRODUCT REQUIREMENTS DOCUMENT

**System Name:** Bacacay Explorer
**Components:** MTCAO Personnel Web Dashboard (React + Vite + Firebase) · Tourist Mobile App (Flutter + Firebase)
**Stakeholder:** Municipal Tourism, Culture and Arts Office (MTCAO), Bacacay, Albay
**Version:** 1.2 (final design baseline + late-hour warning) · **Date:** October 13, 2026
**Status:** Use Case Diagram, both flowcharts, ERD, and UI prototypes are final. Ready for implementation.

> This file is the source of truth for **what** the system does. For scope/tiers see `02`, for architecture and data see `03`, for status and decisions see `04`, for diagram details see `05`.

---

## 1. Overview & Problem Statement

Bacacay is a coastal municipality in Albay with beaches, islands, rock formations, parks, and resorts. Tourism information is scattered, and MTCAO has no central way to:

- Keep an updated list of tourism destinations (details, photos, location, cost, operating hours).
- Know who is visiting, i.e. a record of registered tourists.
- Tell tourists how to get to a destination (route, fare, where to board transport).

Tourists have no single local guide to discover places, plan trips, and get directions.

**Solution:** Two apps sharing one Firebase backend.

| App | Users | Platform | Purpose |
|---|---|---|---|
| MTCAO Personnel Dashboard | MTCAO staff / administrator | Website only (React + Vite) | Manage destinations, routes and transport info; monitor tourist records; review activity logs; archive/restore |
| Bacacay Explorer | Tourists (locals and visitors) | Mobile app only (Flutter) | Discover destinations, view routes, save places, plan itineraries, receive SMS messages |

## 2. Goals & Objectives

- MTCAO can add, edit, and archive destinations, and the tourist app always shows current data.
- MTCAO has visibility over registered tourists (counts, records, filters).
- Tourists can find destinations by time, budget, and activity, and see how to get there.
- Tourists can plan trips as itineraries with dates, activities, budget, and estimated costs.
- Every MTCAO data change is accountable through activity logs.

## 3. Users & Roles

| Role | Platform | Can do |
|---|---|---|
| MTCAO Personnel | Web | Login, reset password, view dashboard, monitor/filter tourist records, manage destinations (add, edit, archive), set map location and routes/transport, view activity logs, view archive and restore records, edit own profile, logout |
| Tourist | Mobile | Register, login, reset password, browse/filter destinations, view recommended destinations, view details and location/route, save places, write reviews (stretch), manage itineraries (create, view, edit, delete, search), receive automatic SMS messages (welcome and inactivity), edit profile, logout |

**Access rules**
- Tourists cannot access the web dashboard; MTCAO Personnel do not use the mobile app.
- Tourists can only read/write their own profile, itineraries, saved places, and reviews.
- Only MTCAO Personnel can write destinations, routes, categories, and notifications.
- MTCAO accounts are created manually by the developers/administrator. There is no public registration on the web.
- Role = existence of an `admins/{uid}` document. There is no role field.

## 4. Use Case Inventory (matches the final Use Case Diagram)

The Use Case Diagram shows only the **main goals** of each user, like the course reference diagrams. Step-by-step detail (search/filter, details, route, save, add to itinerary, review, profile, logout) lives in the flowcharts and in the feature list in §5. A feature that is not drawn on the diagram is **still part of the system**.

### 4.1 MTCAO Personnel

| ID | Use case (as drawn) | Relationships on the diagram | Requirement IDs |
|---|---|---|---|
| UC-W01 | Login | include Verify Credentials; extend Display Login Error; extend Reset Password | W-1 |
| UC-W02 | Reset Password | extends Login | W-2 |
| UC-W03 | View Dashboard | | W-3 |
| UC-W04 | Monitor Tourist Records | include View Tourist Records | W-4 |
| UC-W05 | Manage Tourism Destination | include Add Destination; Add Destination includes Edit Destination and Archive Destination (drawn in the reference's style) | W-5, W-6, W-7, W-8 |
| UC-W06 | View Activity Logs | | W-10 |
| UC-W07 | View Archive | include Restore Record | W-9 |

### 4.2 Tourist

| ID | Use case (as drawn) | Relationships on the diagram | Requirement IDs |
|---|---|---|---|
| UC-T01 | Register | | T-2 |
| UC-T02 | Login | shared with MTCAO (include Verify Credentials) | T-3 |
| UC-T03 | Reset Password | extends Login | T-3 |
| UC-T04 | View Tourism Destination | | T-4, T-5, T-6, T-7 |
| UC-T05 | Manage Itineraries | include Create Itinerary; Create Itinerary includes Edit Itinerary and Delete Itinerary | T-8, T-9 |
| UC-T06 | View Saved Places | | T-10 |
| UC-T07 | Receive SMS Notification | system-triggered: welcome after registration; "don't miss out" after 7 and 30 days of inactivity; no screen and no opt-out | T-11 |

### 4.3 In the system but not drawn on the diagram (covered by flowcharts and §5)

| Feature | Where it is covered |
|---|---|
| Search/Filter Tourist Records, Search/Filter Destination, Filter Activity Logs | Flowcharts; W-4, W-5, W-10, T-5 |
| View Destination Information, View Destination Details | Flowcharts; W-5, T-6 |
| View Recommended Destinations | Tourist flowchart; T-5 |
| View Destination Location / Route | Tourist flowchart; T-7 |
| Add Destination to Itinerary, Save Destination | Tourist flowchart; T-9, T-10 |
| Write Review (stretch) | Tourist flowchart; T-13 |
| Edit Profile (both apps), Logout | Feature list; W-11, T-12, W-1 |

## 5. Functional Requirements

### 5.1 MTCAO Personnel Web Dashboard

| ID | Feature | Description |
|---|---|---|
| W-1 | Authentication | Email + password login. Invalid credentials show "Invalid username or password". After login the app checks `admins/{uid}` exists; if not, sign out and show the same error. Logout. |
| W-2 | Reset password | Enter email → Firebase sends a reset link → "Check your email" confirmation. The user sets the new password through the link (min 8 chars, no spaces). |
| W-3 | Dashboard | Totals for Registered Tourists and Registered Destinations (non-archived); overview filter (Today / This week / This month, based on `registeredAt`); List of Destinations table (Destination, Category, Status). |
| W-4 | Tourist List | Table: User ID, Name, Address, Sex, Nationality, Contact Number, Date Registered. Search; filter by date registered. |
| W-5 | Manage Destination | List of non-archived destinations. Search/filter by category, status, available time range. **Add**, **Edit**, **Archive** (confirm dialog; no permanent delete). |
| W-6 | Destination form | Name, category (Island hopping, Rock formations, Park, Resort and beach, Beach), status (Open/Closed), short and full description, available time (from–to, or open daily), estimated cost, activities, photos (at least one). |
| W-7 | Map location | MTCAO pins the exact location (search or tap/drag pin). Latitude/longitude saved. |
| W-8 | Route to destination | MTCAO adds one or more transport options: mode (or custom mode), starting/boarding point (e.g. "7/11"), stopping point, fare. Distance and travel time are computed automatically. |
| W-9 | Archive page | Lists archived destinations. **Restore** per row with confirm dialog. Restoring clears `isArchived` and is logged. |
| W-10 | Activity Logs | Timestamped log: User, Action, Page, Details. Filter by page (Tourists / Destinations / All). Logs are append-only. |
| W-11 | Profile & Settings | Edit name, position, email, photo; change password. |
| W-12 | About Us | Static information about Bacacay and MTCAO contact. |

### 5.2 Tourist Mobile App

| ID | Feature | Description |
|---|---|---|
| T-1 | Onboarding | 3 intro slides (Find your favorite destination / Plan your trip easily), Skip, Get Started |
| T-2 | Register | Multi-step sign-up: personal details (first, middle, last name, address, sex, nationality), contact number (required, used for SMS), email, password (8+ chars, capital letter, number, special character, no spaces, passwords match) |
| T-3 | Login & reset password | Email + password, remember me. Forgot password sends the Firebase reset email, then shows "Check your email". |
| T-4 | Home | Greeting, shortcuts to Manage itineraries and Tourism destinations, Popular Destinations, live counts (itineraries, places) |
| T-5 | Tourism Destinations | Search; filter by time (open at selected time), budget (estimated cost), and activity; Recommended destinations |
| T-6 | Destination Details | Photos, description, hours, cost, activities, reviews; Save/unsave button |
| T-7 | Location / Route | Open map; GPS gets the tourist's location; shows distance to the destination; lists transport options with boarding point, stopping point, fare, estimated time ("From 7/11 → next stop") |
| T-8 | Itineraries | Folder list; create (name + budget); search; view details; edit; **Delete itinerary** |
| T-9 | Add to Itinerary | From details: choose an existing itinerary or create one (name + budget), then set date, time, activity, estimated cost, notes. If the visit time is after the destination's closing time, show the late-hour warning before saving (BR-16) |
| T-10 | Save Destination / Saved Places | Bookmark/unbookmark from details; list under Profile → Saved places |
| T-11 | SMS Notifications | Automatic and mandatory; there is no toggle or test button. (1) **Welcome SMS** right after registration. (2) **"Don't miss out" SMS** when the tourist has been inactive for 7 days, and another at 30 days. Nothing more after 30 days. If the tourist becomes active again, the cycle resets (BR-11 to BR-15). |
| T-12 | Profile | Edit profile, change photo, change password, Saved places, hotlines (MTCAO, Municipal Office, PTCAO), logout |
| T-13 | Write Review (stretch) | Rating, comment, optional photos |

## 6. User Flows (match the final flowcharts)

**MTCAO Personnel**
1. Login → if credentials are invalid, show the error → "Forgot password?" → Yes: send reset email → check email → set new password → back to Login; No: back to Login. Valid → Dashboard.
2. From Dashboard, four branches, each returning to Dashboard:
   - **Monitor tourist records:** view → optional search/filter → apply filters → view filtered records.
   - **Manage tourism destinations:** view information → optional search/filter → Add / Edit / Archive.
     - Add: enter details → set map location → add transport/route options → save → log action.
     - Edit: update details → update map location → update transport/route options → save → log action.
     - Archive: confirm archive → save → log action.
   - **View activity logs:** display entries → optional filter → apply filters → view filtered logs.
   - **View archive:** display archived records → optional restore → select record → confirm restore → restore and log action.
3. Dashboard → Logout → End.

**Tourist**
1. Login (or Register if no account) → if invalid, error → Forgot password flow → Dashboard.
2. **Manage itineraries:** view folders → search, or create (name, budget) → view details → edit / delete itinerary.
3. **View tourism destination:** optional search/filter (time, budget, activity) → recommended destinations → select destination → details.
   - Optional: open GPS/map → view location/route → back to details.
   - Save this destination? Yes: save to saved places.
   - (Stretch) Write a review? Yes: enter rating and comment → submit.
   - Add to an itinerary? Yes: select or create itinerary → set trip details → (if the visit time is after closing time: late-hour warning, **Continue** saves, **Cancel** returns to the destination details) → add → destination added → view another destination or return to Dashboard.
4. **Profile:** edit profile, saved places. (MTCAO hotlines is also on the Profile screen, T-12, but is not drawn in the flowchart.)
5. Dashboard → Logout → End.
6. **System (no screen):** (a) right after a tourist registers, a welcome SMS is sent; (b) every day at 8:00 AM Philippine time, a scheduled job checks tourist activity and sends the 7-day or 30-day "don't miss out" SMS where due.

## 7. Business Rules

| # | Rule |
|---|---|
| BR-1 | Destinations are **archived, never deleted**. Archived destinations are hidden from tourists and listed on the Archive page. Restore sets `isArchived=false`. |
| BR-2 | Every MTCAO Add / Edit / Archive / Restore writes an activity log entry with user, action, page, details, timestamp. |
| BR-3 | A destination needs name, category, status, description, available time, estimated cost, at least one photo, and a map pin before it can be saved. |
| BR-4 | Transport options are optional per destination, but the Route screen shows "No transport info yet" if none exist. |
| BR-5 | Passwords: 8+ characters, no spaces. Registration also needs a capital letter, a number, and a special character. Passwords are never stored in Firestore. |
| BR-6 | Itineraries belong to one tourist. "Delete itinerary" is a **soft delete** (`isArchived=true`); there is no restore screen in the app. |
| BR-7 | A destination can appear in an itinerary on different dates; each entry is a separate stop. |
| BR-8 | Tourist-facing queries always exclude `isArchived == true`. |
| BR-9 | Estimated cost is in PHP. Budget filter shows destinations with `estimatedCost <= budget`. |
| BR-10 | Time filter: a destination matches if it is `openDaily` or the selected time is within `timeFrom`–`timeTo`. |
| BR-11 | **Welcome SMS:** sent once, automatically, after a tourist account is created. |
| BR-12 | **Inactivity SMS:** a tourist is inactive when `lastActiveAt` is 7 or more days ago. Send one SMS at 7 days and one at 30 days, each at most once per inactivity period; send nothing after the 30-day message. If a tourist is already 30+ days inactive and never got the 7-day SMS, send only the 30-day one. The daily job runs at 8:00 AM Asia/Manila. |
| BR-13 | **Reset:** when the tourist becomes active again (`lastActiveAt` is newer than the last inactivity SMS), the cycle resets and the 7-day and 30-day SMS can be sent again in a later inactivity period. |
| BR-14 | **Phone, consent, content:** `contactNumber` is required, validated as `09XXXXXXXXX`, and converted to the gateway's format when sending. The Register screen has a required consent line (for example "I agree to receive SMS from MTCAO Bacacay Explorer"). Messages are plain text under 160 characters, use only the first name, and contain no links or other personal data. SMS is only for registration and inactive tourists; archived tourists get none. |
| BR-15 | **Activity tracking:** the app updates `lastActiveAt` on login and app launch, at most once per day. At registration it equals `registeredAt`. |
| BR-16 | **Late-hour warning:** when a tourist sets a visit time later than the destination's closing time (`timeTo`), the app shows a safety warning ("It may not be safe at this hour. Do you still want to continue?") with **Continue** and **Cancel**. Continue saves the stop. Cancel closes the warning without saving, and the tourist stays on the destination details. A visit time before opening time does not trigger a warning. If the destination is `openDaily` or has no `timeTo`, no warning is shown. The warning is advisory and never blocks saving. |

## 8. Non-Functional Requirements

- **Security:** Firebase Authentication; Firestore Security Rules enforce roles server-side (hiding buttons in the UI is not enough). No passwords in Firestore.
- **Data freshness:** Destination changes appear in the tourist app without reinstalling.
- **Usability:** Light, tourism-themed palette; simple data-entry steps for MTCAO.
- **Responsive web:** Laptop/desktop; mobile app targets Android (iOS optional).
- **Accountability:** Logs are append-only (no update/delete in rules).
- **Privacy:** Tourist personal data visible only to MTCAO Personnel and the tourist.
- **Hosting/billing:** the project must be on the **Blaze** plan: Cloud Storage has required it since Feb 3, 2026, and the SMS Cloud Function needs it too. Set a low budget alert. See decision 8.
- **SMS reliability:** the gateway API key lives in Secret Manager, never in the apps. A failed send is recorded with an error and retried once on the next daily run at most.

## 9. Out of Scope (Current Phase)

- Tourist use of the web dashboard / MTCAO use of the mobile app.
- Online booking, payments, reservations.
- Turn-by-turn navigation (app shows location, distance, and transport info).
- Multi-language support.
- Public marketing website beyond the landing/login page.
- Managing MTCAO staff accounts in the app.
- Permanent deletion of any record.

## 10. Resolved Decisions

| # | Item | Decision |
|---|---|---|
| 1 | Activity Logs, Archive in diagrams | Added: View Activity Logs, Filter Activity Logs, View Archive, Restore Record |
| 2 | Archive vs Delete (destinations) | **Archive only**, with Restore. Use case is "Archive Destination" |
| 3 | Save Destination, Reviews | Save Destination = Tier 2; Write Review = Tier 3 stretch; both extend View Destination Details |
| 4 | Forgot password | **Firebase reset-email link**. Reset Password extends Login. Custom OTP = stretch |
| 5 | SMS | **Tier 1 (the 80%)**, as required by the course panel. Only two kinds: welcome SMS after registration, and "don't miss out" SMS for inactive tourists at 7 and 30 days. **No itinerary reminders, no toggle, no test button.** Cloud Functions + Philippine SMS gateway (Semaphore recommended) |
| 6 | MTCAO account creation | **Manual** (Firebase console + `admins/{uid}` document) |
| 7 | Map provider | **OpenStreetMap**: Leaflet (web), `flutter_map` (mobile) |
| 8 | Billing / photo storage | **Blaze plan is now required** (Storage since Feb 2026, and Functions for SMS). Enable it with a low budget alert. Cloudinary for photos is optional and no longer avoids Blaze. See `03` §10 |
| 9 | Itinerary "delete" | Label **Delete itinerary**; implemented as soft delete (BR-6). Use case renamed "Delete Itinerary" |
| 10 | Archive page scope | **Destinations only** for MVP (matches the diagram). Archiving tourist records is optional and not required |
| 11 | Recommended destinations | Filtered result sorted by `savedCount` (desc), then newest |
| 12 | Tourist "User ID" display | Last 6 characters of the Auth UID, uppercased (no counter needed) |
| 13 | SMS gateway | **Semaphore** (Philippine gateway, simple HTTP API, pay-as-you-go). Any PH gateway works if the `sendSms()` helper is the only code that talks to it |
| 14 | SMS is mandatory | SMS cannot be turned off in the app. Consent is collected at registration (required checkbox) |
| 15 | Use Case Diagram scope | Main goals only, as in the course reference diagrams. Detail is in the flowcharts and §5. Nothing is removed from the system because it is not drawn |
| 16 | Include style on the diagram | Follows the reference style: Add Destination → Edit/Archive Destination, Create Itinerary → Edit/Delete Itinerary. In the build, "Manage Tourism Destination" = Add, Edit, Archive, and "Manage Itineraries" = Create, Edit, Delete |
| 17 | Late-hour warning | **Advisory only**, based on closing time (BR-16). Continue / Cancel. Early visits are allowed with no warning. No new data fields; the ERD and Use Case Diagram are unchanged. Only the Tourist flowchart gets one extra diamond |

## 11. Deliverables

- Use Case Diagram, MTCAO and Tourist flowcharts, ERD, UI prototypes (done)
- Documentation set: PRD, MVP Scope, System Context, Project Context, Diagram Reference, `CLAUDE.md`
- MTCAO Personnel Web Dashboard (React + Vite + Firebase)
- Tourist Mobile App (Flutter + Firebase)
- Firestore Security Rules, Storage rules, Cloud Functions (welcome SMS trigger and daily inactivity job)
- Source code with README, user guide, final demo
