import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

// Get all categories (Beach, Island hopping, etc.), sorted A to Z.
// Each one looks like: { id: 'beach', name: 'Beach' }
export async function getCategories() {
    // Get every document in the "categories" collection
    const categoriesRef = collection(db, 'categories')
    const snapshot = await getDocs(categoriesRef)

    // Make a list. For each document, we join its id and its fields in one object.
    // categoryDoc.data() does not include the id, so we add it ourselves.
    const categoryList = []
    for (const categoryDoc of snapshot.docs) {
        const category = { id: categoryDoc.id, ...categoryDoc.data() }
        categoryList.push(category)
    }

    // Sort A to Z by name.
    // localeCompare gives a negative number if the first name comes first,
    // and a positive number if the second name comes first.
    categoryList.sort((firstCategory, secondCategory) => {
        return firstCategory.name.localeCompare(secondCategory.name)
    })

    return categoryList
}