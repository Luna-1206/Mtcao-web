// Seeds `categories` and `transportModes` (docs/03 §4). Safe to re-run: fixed doc IDs + merge.
// Run from the mtcao-web root:
//   npm i firebase-admin
//   set GOOGLE_APPLICATION_CREDENTIALS=path\to\serviceAccount.json   (keep this key OUT of git)
//   node scripts/seed.js
// For the emulator instead: set FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 and GCLOUD_PROJECT=<your-project-id>
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
initializeApp();
const db = getFirestore();

const categories = [
  ['island-hopping', 'Island hopping'],
  ['rock-formations', 'Rock formations'],
  ['park', 'Park'],
  ['resort-and-beach', 'Resort and beach'],
  ['beach', 'Beach'],
];

// avgSpeedKph is NOT specified in the docs: these are placeholder values. Adjust before relying on auto travel time (Tier 3).
const transportModes = [
  ['tricycle', 'Tricycle', 30],
  ['jeepney', 'Jeepney', 30],
  ['boat', 'Boat', 20],
  ['van', 'Van', 40],
];

(async () => {
  const batch = db.batch();
  categories.forEach(([id, name]) => batch.set(db.collection('categories').doc(id), { name }, { merge: true }));
  transportModes.forEach(([id, name, avgSpeedKph]) =>
    batch.set(db.collection('transportModes').doc(id), { name, avgSpeedKph }, { merge: true }));
  await batch.commit();
  console.log(`Seeded ${categories.length} categories and ${transportModes.length} transport modes.`);
})().catch((e) => { console.error(e); process.exit(1); });
