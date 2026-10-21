import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

// Saves one log to the "activityLogs" collection.
// action: 'Added', 'Edited', 'Archived', or 'Restored'
// section: 'Destinations' or 'Tourists'
// details: short text, example: 'Archived destination "Cagbalogo Beach"'
export async function logAction({ adminId, adminName, action, section, details }) {
    try {
        await addDoc(collection(db, 'activityLogs'), {
            adminId,
            adminName,
            action,
            section,
            details,
            createdAt: serverTimestamp(),
        })
    } catch (err) {
        // The main action (add, edit, archive) is already done,
        // so a failed log should not show an error to the admin
        console.log('cant save activity log', err)
    }
}