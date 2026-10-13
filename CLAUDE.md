# Bacacay Explorer — Instructions for Claude Code

Tourism system for Bacacay, Albay. Two apps, one Firebase project:
- **MTCAO Personnel web dashboard** — React + Vite (repo `mtcao-web`, which is also the Firebase project root: rules, indexes, `functions/`)
- **Tourist mobile app** — Flutter (repo `bacacay_explorer`)

## Read first
Full specs are in `docs/`. Read in this order when starting a task:
1. `docs/01_Bacacay_Explorer_PRD.md` — features, use cases, business rules (BR-x)
2. `docs/02_Bacacay_Explorer_MVP_Scope.md` — what to build now (Tier 1 first)
3. `docs/03_Bacacay_Explorer_System_Context.md` — Firestore schema, security rules, logic
4. `docs/04_...Project_Context.md` and `docs/05_...Diagram_Reference.md` — decisions and diagrams
UI reference: HTML prototypes and diagrams in `docs/`. Copy layout, colors, and labels from the prototypes; do not copy their logic.

## Rules
- Build **Tier 1 only** until I say otherwise. Follow the build order in `02`.
- Use the Firestore structure in `03` §4 exactly. Do not store passwords in Firestore.
- Never hard-delete records. Use `isArchived` (BR-1, BR-6, BR-8).
- Every web add/edit/archive/restore must call `logAction` (BR-2).
- Security is enforced in Firestore/Storage rules, not only in the UI. Write and test the rules from `03` §5.
- Maps: Leaflet (web), `flutter_map` (mobile), OpenStreetMap. No Google Maps.
- UI labels must match the diagrams: "Archive destination", "Restore record", "Delete itinerary".
- Forgot password = Firebase `sendPasswordResetEmail` + "Check your email" screen. No OTP.
- **SMS is Tier 1 and mandatory.** Only two kinds: welcome SMS (Firestore trigger on new `tourists/{uid}`) and "don't miss out" SMS at 7 and 30 days of inactivity (scheduled job, once per inactivity period, resets when `lastActiveAt` is newer). No toggle, no test button, no itinerary reminders. Build per `docs/03` §6.6 with a `sendSms()` helper. The gateway API key goes in Secret Manager (`defineSecret`), never in the apps, Firestore, or git. Provide a test mode that logs instead of sending.
- Late-hour warning (BR-16, `docs/03` §6.8): when saving an itinerary stop, if `visitTime` is after the destination's `timeTo`, show a dialog with Continue / Cancel. Cancel discards the stop. Never hard-block. No warning for early visits, `openDaily`, or no `timeTo`. Client-side only, no new fields.
- Do not build in-app notifications or reviews unless asked (Tier 3).
- The Use Case Diagram shows only main goals. Features missing from it (search/filter, route, save, add to itinerary, profile, logout) are still required; `docs/01` §4.3 and §5 are the source of truth.
- Do not commit `.env`, service-account keys, or `firebase_options.dart` secrets beyond the public config.
- The Firebase project must be on the Blaze plan (Storage + Functions). Ask me to confirm it is enabled and the SMS gateway account exists before writing upload or SMS code.

## Working style
- Work in small steps; after each, tell me what to run to verify it.
- If a spec is missing or contradictory, ask me instead of guessing.
- Keep code simple and readable; this is a student capstone project that I must be able to explain.
