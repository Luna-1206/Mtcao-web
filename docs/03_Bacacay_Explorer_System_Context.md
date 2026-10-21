# BACACAY EXPLORER — SYSTEM ARCHITECTURE & TECHNICAL CONTEXT (v1.2)

**Audience:** Developers (and Claude Code)
**Status:** Design complete; implementation starting
Requirement IDs (W-x, T-x), use cases (UC-…), and business rules (BR-x) refer to `01_Bacacay_Explorer_PRD.md`. The Use Case Diagram shows main goals only; the PRD §4.3 lists features that are built but not drawn.

---

## 1. Architecture Overview

Two clients share one Firebase project (serverless, no custom backend).

```
 MTCAO Personnel (React + Vite)        Tourist (Flutter)
          │                                   │
          └──────────────┬────────────────────┘
                         ▼
                 Firebase Project
   ┌─────────────┬──────────────┬───────────┬──────────────────┐
   │ Auth        │ Firestore    │ Storage   │ Cloud Functions  │
   │ (email/pw)  │ (data)       │ (photos)  │ (SMS)            │
   └─────────────┴──────────────┴───────────┴──────────────────┘
                                                   │
                                            SMS gateway (Semaphore)
```
Storage and Functions both need the Blaze plan (see §10). **Cloud Functions + SMS gateway are part of Tier 1.**

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Web frontend | React 18, Vite, React Router, Firebase JS SDK (modular v9+) |
| Web styling | Tailwind CSS or plain CSS; follow the HTML prototype's light tourism palette |
| Maps (web) | Leaflet + OpenStreetMap (free, no API key) |
| Mobile app | Flutter (Dart), `firebase_core`, `firebase_auth`, `cloud_firestore`, `firebase_storage` |
| Maps (mobile) | `flutter_map` + OpenStreetMap; `geolocator` for GPS |
| Auth | Firebase Authentication (email/password) |
| Database | Cloud Firestore |
| File storage | Firebase Storage (destination, profile, review photos) — or Cloudinary fallback (§10) |
| SMS | Cloud Functions v2 (Node.js, Firestore trigger + scheduled) + Semaphore SMS API; API key in Secret Manager |
| Hosting (web) | Firebase Hosting |

## 3. Suggested Project Structure

Two repositories (or one monorepo with two folders). Put the diagrams and HTML prototypes in `docs/` of each. **`mtcao-web/` is also the Firebase project root:** keep `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `storage.rules`, and the `functions/` folder there (the Flutter app only needs `firebase_options.dart`).

### Web (`mtcao-web/`)
```
src/
├── components/   Sidebar, Topbar, DestinationForm, MapPicker, RouteEditor,
│                 FilterModal, ConfirmDialog, StatusBadge
├── pages/        Login, ForgotPassword, Dashboard, TouristList, ManageDestination,
│                 Archive, ActivityLogs, AboutUs, Settings
├── context/      AuthContext.jsx   (current admin, loading state)
├── services/     firebase.js, destinations.js, tourists.js, routes.js, logs.js
├── utils/        logAction.js, distance.js
├── App.jsx       Routes + ProtectedRoute (requires admins/{uid})
└── main.jsx
functions/        Cloud Functions (Node.js): index.js, sendSms.js
```

| Route | Page | Use case |
|---|---|---|
| `/login` | Login | UC-W01 |
| `/forgot-password` | ForgotPassword (email → "Check your email") | UC-W02 |
| `/dashboard` | Dashboard | UC-W03 |
| `/tourists` | TouristList | UC-W04 |
| `/destinations` | ManageDestination (+ modals) | UC-W05 |
| `/archive` | Archive | UC-W07 |
| `/activity-logs` | ActivityLogs | UC-W06 |
| `/about` | AboutUs | W-12 |
| `/settings` | Settings / Profile | W-11 (not on diagram) |

### Mobile (`bacacay_explorer/lib/`)
```
lib/
├── main.dart
├── models/       destination.dart, route_option.dart, itinerary.dart, tourist.dart
├── services/     auth_service.dart, destination_service.dart, itinerary_service.dart,
│                 location_service.dart
├── screens/      onboarding, login, register, forgot_password, home,
│                 destinations, destination_details, route_map,
│                 itineraries, itinerary_details, add_to_itinerary,
│                 saved_places, profile, hotlines
└── widgets/      destination_card, filter_sheet, itinerary_card
```

## 4. Data Model — ERD to Firestore Mapping

One collection per entity; reference by ID (like a foreign key) except where noted.

| ERD table | Firestore location | Key fields |
|---|---|---|
| admin | `admins/{uid}` | fullName, position, email, photoUrl, lastLoginAt (optional). **No password.** |
| activity_logs | `activityLogs/{logId}` | adminId, **adminName**, action, section, details, createdAt |
| categories | `categories/{categoryId}` | name |
| destinations | `destinations/{destId}` | categoryId, **categoryName**, createdBy, name, shortDescription, fullDescription, status, timeFrom, timeTo, openDaily, estimatedCost, activities[], latitude, longitude, photos[], **savedCount**, averageRating (stretch), isArchived, archivedAt, createdAt, updatedAt |
| destination_photos | field `photos[]` on destination | imageUrl, sortOrder |
| transport_modes | `transportModes/{modeId}` | name, avgSpeedKph |
| routes | `destinations/{destId}/routes/{routeId}` | modeId, customModeName, startingPoint, stoppingPoint, startLat, startLng, fare, travelTimeMins, distanceKm, note |
| notifications | `notifications/{id}` (Tier 3) | destinationId, title, body, createdAt |
| notification_reads | `tourists/{uid}/notificationReads/{notifId}` (Tier 3) | readAt |
| tourists | `tourists/{uid}` | firstName, middleName, lastName, address, sex, nationality, email, contactNumber, photoUrl, lastActiveAt, registeredAt, isArchived, archivedAt, and function-written fields `welcomeSmsSentAt`, `inactive7SentAt`, `inactive30SentAt`. **No password.** |
| saved_destinations | `tourists/{uid}/saved/{destId}` | destinationName, savedAt |
| reviews (stretch) | `destinations/{destId}/reviews/{reviewId}` | touristId, touristName, rating, comment, createdAt, photos[] |
| review_photos | field `photos[]` on review | imageUrl |
| itineraries | `tourists/{uid}/itineraries/{itinId}` | name, budget, isArchived, createdAt |
| itinerary_stops | `tourists/{uid}/itineraries/{itinId}/stops/{stopId}` | destinationId, destinationName, activity, visitDate (`YYYY-MM-DD`), visitTime (`HH:mm`), estimatedCost, notes |
| sms_reminders | `smsLogs/{autoId}` | touristId, type, phone, message, status, providerMessageId, error, sentAt (a log only; duplicates are prevented by the timestamp fields on the tourist document) |

### Allowed values (enums)

| Field | Values |
|---|---|
| destination `status` | `Open`, `Closed` |
| category `name` | Island hopping, Rock formations, Park, Resort and beach, Beach |
| tourist `sex` | Male, Female (adjust to the prototype's options) |
| transport mode `name` | Tricycle, Jeepney, Boat, Van, plus "Other" (custom name in `customModeName`) |
| activity log `section` | `Destinations`, `Tourists` |
| activity log `action` | `Added`, `Edited`, `Archived`, `Restored` |
| SMS `type` | `welcome`, `inactive_7d`, `inactive_30d` |
| SMS `status` | `sent`, `failed` |

### Notes
- Use `isArchived` flags; never hard-delete (BR-1, BR-6, BR-8).
- Itineraries live under the tourist so rules stay simple.
- `routes` is a subcollection of the destination; the tourist app reads it on the Route screen.
- Denormalize `categoryName`, `destinationName`, `adminName`, `touristName` so lists need no extra reads.
- Dashboard counts: use `count()` aggregation queries (`isArchived == false`); never download all tourists to count.
- Tourist "User ID" shown on the web = last 6 characters of the UID, uppercased.
- `savedCount` is incremented/decremented in the same batch as the `saved/{destId}` write.

## 5. Authentication & Authorization

- **Admins:** created manually (decision 6): add the user in the Firebase console, then create `admins/{uid}`. On login the web app checks that `admins/{uid}` exists; otherwise sign out and show "Invalid username or password".
- **Tourists:** self-register; creates the Auth user and `tourists/{uid}`.
- Role check in rules by document existence only.
- Change password (both apps) needs recent login: call `reauthenticateWithCredential` before `updatePassword`.

### Firestore Security Rules (outline — tighten before submission)
```
function isAdmin()    { return request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid)); }
function isOwner(uid) { return request.auth != null && request.auth.uid == uid; }

match /destinations/{id} {
  allow read: if request.auth != null;
  allow create, delete: if isAdmin();           // delete stays unused in the UI
  allow update: if isAdmin()
    || (request.auth != null
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['savedCount'])
        && math.abs(request.resource.data.savedCount - resource.data.savedCount) <= 1);
}
match /destinations/{id}/routes/{r}  { allow read: if request.auth != null; allow write: if isAdmin(); }
match /destinations/{id}/reviews/{r} { allow read: if request.auth != null;
                                       allow create: if isOwner(request.resource.data.touristId);
                                       allow update, delete: if isOwner(resource.data.touristId); }
match /categories/{id}      { allow read: if request.auth != null; allow write: if isAdmin(); }
match /transportModes/{id}  { allow read: if request.auth != null; allow write: if isAdmin(); }
match /tourists/{uid} {
  allow read: if isAdmin() || isOwner(uid);
  allow create: if isOwner(uid);
  allow update: if (isOwner(uid)
        && !request.resource.data.diff(resource.data).affectedKeys()
             .hasAny(['registeredAt','isArchived','archivedAt','welcomeSmsSentAt','inactive7SentAt','inactive30SentAt']))
    || (isAdmin() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isArchived','archivedAt']));
}
match /tourists/{uid}/{sub=**} { allow read, write: if isOwner(uid); }
match /admins/{uid}         { allow read, write: if isOwner(uid) && isAdmin(); }
match /activityLogs/{id}    { allow read, create: if isAdmin(); allow update, delete: if false; }
match /notifications/{id}   { allow read: if request.auth != null; allow write: if isAdmin(); }
match /smsLogs/{id}         { allow read: if isAdmin(); allow write: if false; }   // written by Cloud Functions (admin SDK) only
```
Also: restrict `tourists` create/update so users cannot set `registeredAt` or `isArchived` themselves. Storage rules: admins write `destinations/**`; a user writes only `profiles/{uid}/**`; everyone signed in can read.

### Composite indexes to expect
- `destinations`: `isArchived` + `categoryId`
- `destinations`: `isArchived` + `savedCount` (desc)
- `activityLogs`: `section` + `createdAt` (desc)
- `tourists`: `isArchived` + `registeredAt`
- `tourists`: `isArchived` + `lastActiveAt` (the inactivity job)

Create them when the console error link appears, or define them in `firestore.indexes.json`.

## 6. Key Feature Logic

### 6.1 Activity logging (web)
`logAction({action, section, details})` runs after each successful add/edit/archive/restore. It writes to `activityLogs` with the admin UID, admin name, and server timestamp. Prefer a batched write so the data change and the log succeed together. Details text example: `Archived destination "Cagbalogo Beach"`.

### 6.2 Route and transport (MTCAO → Tourist)
1. MTCAO sets the map pin (lat/lng), then adds one or more transport options: mode (or custom), starting point, stopping point, fare.
2. Distance and time: Haversine straight-line distance (or a routing API later). Travel time = distance ÷ `avgSpeedKph` of the mode.
3. Tourist app: `geolocator` reads GPS; app computes distance to the destination; route list shows each option's boarding point ("From 7/11 → next stop"), fare, and estimated time. If no options exist, show "No transport info yet".
4. Same `routes` data on both sides, so MTCAO edits appear on the next load.

### 6.3 Filter and recommendation (tourist)
- Time: match if `openDaily` or the selected time is within `timeFrom`–`timeTo` (BR-10).
- Budget: `estimatedCost <= budget` (BR-9).
- Activity: `activities` array contains the selection.
- Firestore limits multi-field filters. Query `isArchived == false` (plus category), then filter the rest on the client; the dataset is small.
- **Recommended:** the filtered result sorted by `savedCount` desc, then `createdAt` desc.
- Home "Popular Destinations": top N by `savedCount`.

### 6.4 Archive and restore
Archive sets `isArchived = true` and `archivedAt`. Restore sets `isArchived = false` and clears `archivedAt`. Both run behind a confirm dialog and both write a log. Tourist queries exclude archived items.

### 6.5 Save destination
Toggle writes/deletes `tourists/{uid}/saved/{destId}` and adjusts `destinations/{destId}.savedCount` by ±1 in one batch. Saved places = the `saved` subcollection.

### 6.6 SMS notifications (Tier 1, mandatory)

Only two kinds of SMS exist: a **welcome SMS** after registration, and **"don't miss out" SMS** for inactive tourists. There is no toggle, no test button, and no itinerary reminder.

**Pieces**
| Piece | Type | Purpose |
|---|---|---|
| `sendSms(phone, message)` | helper in `functions/sendSms.js` | The only code that talks to the gateway. Swap providers by changing this file |
| `onTouristCreated` | Firestore trigger (`onDocumentCreated("tourists/{uid}")`) | Sends the welcome SMS |
| `sendInactivityReminders` | scheduled function (`onSchedule`, `"0 8 * * *"`, timeZone `Asia/Manila`) | Sends the 7-day and 30-day messages |
| `SEMAPHORE_API_KEY` | Secret Manager (`defineSecret`) | Never in client code, Firestore, or git |

**Welcome SMS**
1. Triggered when `tourists/{uid}` is created.
2. If `welcomeSmsSentAt` already exists, stop (triggers can run twice).
3. Send the message, then set `welcomeSmsSentAt` and write a row in `smsLogs`.

**Inactivity job (daily, 8:00 AM)**
1. Query `tourists` where `isArchived == false` and `lastActiveAt <= now - 7 days`. (One inequality only; filter the rest in code.)
2. For each tourist compute `days = floor((now - lastActiveAt) / 1 day)`.
3. A sent timestamp counts only if it is newer than `lastActiveAt` (this is the reset rule, BR-13). So:
   - `sent7 = inactive7SentAt > lastActiveAt`, `sent30 = inactive30SentAt > lastActiveAt`
4. If `days >= 30` and not `sent30`: send the 30-day message and set `inactive30SentAt`.
   Else if `7 <= days < 30` and not `sent7`: send the 7-day message and set `inactive7SentAt`.
5. Write a row in `smsLogs` with `status` `sent` or `failed`. A failed send does not set the timestamp, so the next daily run retries it.

**App side:** update `tourists/{uid}.lastActiveAt` on login and app launch, at most once per day (BR-15). Register screen requires a valid `contactNumber` and a required consent checkbox (BR-14). Nothing else in the app deals with SMS.

**Message templates (under 160 characters; `{name}` = first name)**
- Welcome: `Welcome to Bacacay Explorer, {name}! Discover the beaches, islands, and sights of Bacacay, Albay. Plan your trip in the app.`
- 7 days: `Hi {name}! Don't miss out on Bacacay's beaches and islands. Open Bacacay Explorer and plan your next trip.`
- 30 days: `We miss you, {name}! Come back to Bacacay Explorer and see what Bacacay has to offer.`

**Gateway call (Semaphore):** HTTP POST to `https://api.semaphore.co/api/v4/messages` with `apikey`, `number`, `message`, and optionally `sendername` (defaults to "SEMAPHORE"). A custom sender name needs approval (up to about 5 business days), so use the default for the demo. A standard message costs 2 credits per 160 characters; check current docs and pricing at `api.semaphore.co/docs` before you top up.

**Testing and demo (no test button needed)**
- Local: run in the Emulator Suite with a `SMS_TEST_MODE` flag that logs the message instead of calling the gateway.
- Welcome SMS demo: register a new account with a real number.
- Inactivity demo: in the Firestore console set a test tourist's `lastActiveAt` to 8 days ago (then 31 days ago), and **force-run** the scheduled job from Cloud Scheduler in the Google Cloud console. Then open the app to show that the cycle resets.

**Cost:** about PHP 0.56 per text at the time of writing, so a school demo costs a few pesos. Top up the minimum.

### 6.7 Password reset
`sendPasswordResetEmail` on both apps. UI is two states: email form → "Check your email". No custom OTP in MVP.

### 6.8 Late-hour warning (itinerary stop, BR-16)
Before writing an itinerary stop, compare the chosen `visitTime` (`HH:mm`) with the destination's `timeTo`.
- If `visitTime > timeTo`: show a confirm dialog ("It may not be safe at this hour. Do you still want to continue?") with **Continue** and **Cancel**. Continue writes the stop to `tourists/{uid}/itineraries/{itinId}/stops`. Cancel discards it and returns to Destination Details.
- If `visitTime < timeFrom`: no warning (early visits are allowed).
- If the destination is `openDaily` or has no `timeTo`: skip the check.
- Client-side only. No new Firestore field, security rule, index, or Cloud Function. Zero-padded `HH:mm` strings compare correctly as text, but convert to minutes if you prefer.

## 7. Screen Inventory (from UI Prototypes)

**Web:** Landing/Login, Forgot password (email + "Check your email"), Dashboard, Tourist List (+ Filter modal), Manage Destination (+ Add/Edit modal, Assign Location map modal, Filter modal), Archive, Activity Logs, About Us, Settings/Profile, Confirm dialog.

**Mobile:** Onboarding (3 slides), Login, Register (multi-step), Forgot password (email + "Check your email"), Home, Tourism Destinations (+ filter sheet), Destination Details (with save button), Map/Route, Itineraries (folders), Itinerary Details, Add to Itinerary (+ late-hour warning dialog), Profile (Saved places, Help and support, MTCAO Hotlines), Confirm dialogs.

## 8. Environment & Setup

- One Firebase project; add a Web app and an Android app (iOS optional).
- Web: `.env` with `VITE_FIREBASE_*` keys (not secret; rules protect data). Do not commit `.env`.
- Flutter: `flutterfire configure` → `firebase_options.dart`.
- Android: `ACCESS_FINE_LOCATION`, internet.
- Enable Email/Password in Authentication; create the first admin user and `admins/{uid}`.
- Seed: categories and transport modes (§4 enums).
- Use the Firebase Emulator Suite for local testing where possible.

## 9. Known Risks

| Risk | Mitigation |
|---|---|
| Firestore multi-filter limits | Simple query, then client-side filtering |
| Cloud Storage needs Blaze | See §10 |
| SMS needs Blaze, a gateway account, and credits | Set up in build step 1; test mode logs instead of sending; demo by force-running the job |
| Sender name approval takes days | Use the gateway's default sender name for the demo |
| Duplicate or missed SMS | Sent-timestamps on the tourist document; failed sends retry on the next daily run |
| Tourists who never open the app again get exactly two SMS | By design (BR-12); nothing after 30 days |
| Map API cost/keys | OpenStreetMap packages |
| Poor signal at destinations | Firestore offline persistence in Flutter; cache destinations |
| Photo size | Compress before upload (target ≤ 500 KB each) |
| Open `savedCount` update rule | Acceptable for this scope; move to a Cloud Function if abused |

## 10. Billing & Photo Storage (decision 8)

The project needs the **Blaze** (pay-as-you-go) plan for two reasons:
- Since **February 3, 2026**, Cloud Storage for Firebase requires Blaze for any project, even at tiny volume. On Spark, Storage calls fail with 402/403.
- Cloud Functions (welcome trigger and scheduled job) require Blaze.

**Do this in build step 1:** upgrade to Blaze, link a billing account, and set a very low budget (for example USD 1) with email alerts. Free quotas still apply, but Blaze has no hard spending cap, so watch the alerts and never expose write access publicly. Firestore, Auth, and Hosting stay within their free quotas for a project this size.

**Photos:** use Firebase Storage by default (rules in §5). Optional alternative: Cloudinary free tier with an unsigned upload preset; store the returned URL in `photos[]`. It does not remove the Blaze requirement (SMS still needs it), so it is only worth it if you want photo traffic outside Google Cloud. If used, keep a small `uploadImage()` service so the rest of the code does not change.
