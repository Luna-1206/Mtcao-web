import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCategories } from '../services/categories'
import { addDestination, updateDestination } from '../services/destinations'
import { logAction } from '../utils/logAction'
import MapPicker from './MapPicker'

// destination = null means Add, otherwise it is the one we are editing.
// onClose and onSaved are functions given by the page.
export default function DestinationForm({ destination, onClose, onSaved }) {
    const { user, admin } = useAuth()

    // One state for each field. If we are editing, start with the old value.
    // If we are adding, start with an empty value.
    const [name, setName] = useState(destination ? destination.name : '')
    const [categoryId, setCategoryId] = useState(destination ? destination.categoryId : '')
    const [status, setStatus] = useState(destination ? destination.status : 'Open')
    const [description, setDescription] = useState(destination ? destination.fullDescription : '')
    const [timeFrom, setTimeFrom] = useState(destination ? destination.timeFrom : '')
    const [timeTo, setTimeTo] = useState(destination ? destination.timeTo : '')
    const [estimatedCost, setEstimatedCost] = useState(destination ? destination.estimatedCost : '')

    // Activities are saved as a list, but typed as one text.
    // join(', ') changes ['Swimming', 'Picnic'] into "Swimming, Picnic"
    const [activities, setActivities] = useState(destination ? destination.activities.join(', ') : '')

    // Open daily starts as checked.
    // An old destination that has no openDaily value also starts as checked.
    let startOpenDaily = true
    if (destination && destination.openDaily === false) {
        startOpenDaily = false
    }
    const [openDaily, setOpenDaily] = useState(startOpenDaily)

    // The pin location. null means there is no pin yet.
    // An old destination without a pin also starts with no pin.
    let startLatitude = null
    let startLongitude = null
    if (destination && destination.latitude !== undefined && destination.latitude !== null) {
        startLatitude = destination.latitude
        startLongitude = destination.longitude
    }

    const [latitude, setLatitude] = useState(startLatitude)
    const [longitude, setLongitude] = useState(startLongitude)

    // The category list for the dropdown, the saving flag, and the error message
    const [categories, setCategories] = useState([])
    const [saving, setSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    // Get the categories once when the form opens
    useEffect(() => {
        async function loadCategories() {
            try {
                const categoryList = await getCategories()
                setCategories(categoryList)
            } catch (error) {
                setErrorMessage('Could not load categories.')
            }
        }
        loadCategories()
    }, [])

    // The map calls this when the admin clicks on it.
    // newLatitude and newLongitude are the place that was clicked.
    function handlePinPicked(newLatitude, newLongitude) {
        setLatitude(newLatitude)
        setLongitude(newLongitude)
    }

    // Runs when the admin presses Save.
    // "event" is the report React gives us when the form is submitted.
    async function handleSubmit(event) {
        // Stop the page from reloading
        event.preventDefault()
        setErrorMessage('')

        // The pin is required. Stop here if there is no pin yet.
        if (latitude === null || longitude === null) {
            setErrorMessage('Please click the map to place the pin.')
            return
        }

        setSaving(true)

        // Find the name of the chosen category.
        // We look at each category until the id matches.
        let categoryName = ''
        for (const category of categories) {
            if (category.id === categoryId) {
                categoryName = category.name
            }
        }

        // Change the typed activities into a list.
        // "Swimming, Picnic" -> ["Swimming", " Picnic"] -> ["Swimming", "Picnic"]
        const activityPieces = activities.split(',')
        const activityList = []
        for (const activityPiece of activityPieces) {
            // trim() removes the extra spaces
            const cleanActivity = activityPiece.trim()
            // Skip empty ones
            if (cleanActivity !== '') {
                activityList.push(cleanActivity)
            }
        }

        // The short description is the first 120 letters of the description.
        // Example: "Hello world".slice(0, 5) gives "Hello"
        const cleanDescription = description.trim()
        const shortDescription = cleanDescription.slice(0, 120)

        // What we save in Firestore.
        // Number() changes the typed text "500" into the number 500.
        const destinationData = {
            name: name.trim(),
            categoryId: categoryId,
            categoryName: categoryName,
            status: status,
            shortDescription: shortDescription,
            fullDescription: cleanDescription,
            timeFrom: timeFrom,
            timeTo: timeTo,
            openDaily: openDaily,
            estimatedCost: Number(estimatedCost),
            activities: activityList,
            latitude: latitude,
            longitude: longitude,
        }

        try {
            if (destination) {
                // Edit: change the old destination, then save a log
                await updateDestination(destination.id, destinationData)
                await logAction({
                    adminId: user.uid,
                    adminName: admin.fullName,
                    action: 'Edited',
                    section: 'Destinations',
                    details: 'Edited destination "' + destinationData.name + '"',
                })
            } else {
                // Add: create a new destination, then save a log
                await addDestination(destinationData, user.uid)
                await logAction({
                    adminId: user.uid,
                    adminName: admin.fullName,
                    action: 'Added',
                    section: 'Destinations',
                    details: 'Added destination "' + destinationData.name + '"',
                })
            }

            // Tell the page we are done. It will close the form and reload the list.
            onSaved()
        } catch (error) {
            setErrorMessage('Could not save. Please try again.')
            setSaving(false)
        }
    }

    // For every input below, it works the same way:
    //   event.target is the input box where the person typed
    //   event.target.value is the text inside that box right now
    // We save that text in the matching state (setName, setStatus, etc.)
    return (
        <div className="overlay">
            <form className="formbox" onSubmit={handleSubmit}>
                {/* Title changes depending on Add or Edit */}
                <h3>{destination ? 'Edit Destination' : 'Add Destination'}</h3>

                <div className="f">
                    <label>
                        Name
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="e.g. Sula Channel"
                            required
                        />
                    </label>

                    <label>
                        Category
                        <select
                            value={categoryId}
                            onChange={(event) => setCategoryId(event.target.value)}
                            required
                        >
                            <option value="">Select category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Status
                        <select value={status} onChange={(event) => setStatus(event.target.value)}>
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </label>

                    <label>
                        Description
                        <textarea
                            rows="3"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                        />
                    </label>

                    <label>
                        Available time
                        <span className="tr">
                            <input
                                type="time"
                                aria-label="From"
                                value={timeFrom}
                                onChange={(event) => setTimeFrom(event.target.value)}
                                required
                            />
                            <input
                                type="time"
                                aria-label="To"
                                value={timeTo}
                                onChange={(event) => setTimeTo(event.target.value)}
                                required
                            />
                        </span>
                    </label>

                    <label className="checkbox-row">
                        <input 
                            type="checkbox"
                            checked={openDaily}
                            onChange={(event) => setOpenDaily(event.target.checked)} 
                        />
                        Open daily
                    </label>

                    <label>
                        Estimated cost (₱)
                        <input
                            type="number"
                            min="0"
                            value={estimatedCost}
                            onChange={(event) => setEstimatedCost(event.target.value)}
                            placeholder="E.g., 500"
                            required
                        />
                    </label>

                    <label>
                        Available activities
                        <input
                            value={activities}
                            onChange={(event) => setActivities(event.target.value)}
                            placeholder="E.g., Swimming, snorkeling, picnic"
                        />
                    </label>

                    <div className="map-field">
                        Location
                        <MapPicker 
                            latitude={latitude}
                            longitude={longitude}
                            onPick={handlePinPicked}
                        />
                    </div>

                    {/* Shows only when there is an error */}
                    {errorMessage && <p className="lerr">{errorMessage}</p>}

                    {/* Cancel closes the form. Save runs handleSubmit. */}
                    <div className="acts">
                        <button type="button" className="btn o" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" className="btn" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Destination'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}