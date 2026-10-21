import {
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore'
import { db } from '../firebase'

// The "destinations" collection in Firestore
const destinationsRef = collection(db, 'destinations')

// Get destinations.
// showArchived = false gives the active ones.
// showArchived = true gives the archived ones (for the Archive page later).
export async function getDestinations(showArchived = false) {
    // Ask Firestore only for destinations with the matching isArchived value
    const activeOrArchivedQuery = query(
        destinationsRef,
        where('isArchived', '==', showArchived)
    )
    const snapshot = await getDocs(activeOrArchivedQuery)

    // Make a list. For each document, we join its id and its fields in one object.
    // destinationDoc.data() does not include the id, so we add it ourselves.
    const destinationList = []
    for (const destinationDoc of snapshot.docs) {
        const destination = { id: destinationDoc.id, ...destinationDoc.data() }
        destinationList.push(destination)
    }

    // Sort A to Z by name.
    // localeCompare gives a negative number if the first name comes first,
    // and a positive number if the second name comes first.
    destinationList.sort((firstDestination, secondDestination) => {
        return firstDestination.name.localeCompare(secondDestination.name)
    })

    return destinationList
}

// Add a new destination.
// destinationData = what the form gives us (name, categoryId, categoryName, status,
// shortDescription, fullDescription, timeFrom, timeTo, estimatedCost, activities)
// adminId = the uid of the admin who is adding it
export async function addDestination(destinationData, adminId) {
    await addDoc(destinationsRef, {
        ...destinationData,
        photos: [], // no photo upload yet (Spark plan)
        savedCount: 0,
        isArchived: false,
        archivedAt: null,
        createdBy: adminId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    })
}

// Edit a destination. Only the fields in destinationData are changed.
export async function updateDestination(destinationId, destinationData) {
    const destinationRef = doc(db, 'destinations', destinationId)
    await updateDoc(destinationRef, {
        ...destinationData,
        updatedAt: serverTimestamp(),
    })
}

// Archive a destination. We never delete, we only mark it as archived.
export async function archiveDestination(destinationId) {
    const destinationRef = doc(db, 'destinations', destinationId)
    await updateDoc(destinationRef, {
        isArchived: true,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    })
}