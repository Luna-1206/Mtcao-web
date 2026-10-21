import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getDestinations, archiveDestination } from '../services/destinations'
import { logAction } from '../utils/logAction'
import DestinationForm from '../components/DestinationForm'

// Changes a 24-hour time to 12-hour. Example: "14:05" -> "2:05 PM"
function formatTime(time) {
    // No time given, so show nothing
    if (!time) {
        return ''
    }

    // Split "14:05" into hours (14) and minutes (5)
    const timeParts = time.split(':')
    const hours = Number(timeParts[0])
    const minutes = Number(timeParts[1])

    // 14 becomes 2. And 0 or 12 become 12.
    let hour12 = hours % 12
    if (hour12 === 0) {
        hour12 = 12
    }

    // Before 12 is AM, otherwise PM
    let ampm = 'PM'
    if (hours < 12) {
        ampm = 'AM'
    }

    // Minutes need two digits: 5 becomes 05
    let minuteText = String(minutes)
    if (minutes < 10) {
        minuteText = '0' + minuteText
    }

    return hour12 + ':' + minuteText + ' ' + ampm
}

export default function ManageDestination() {
    // Who is logged in (user.uid) and the admin info (admin.fullName)
    const { user, admin } = useAuth()

    // The list from Firestore, and the loading and error messages
    const [destinations, setDestinations] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    // What the admin typed in the search box, and the two filters ('' means all)
    const [searchText, setSearchText] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    // The destination waiting for the "Are you sure?" answer (null means none)
    const [destinationToArchive, setDestinationToArchive] = useState(null)

    // True while archiving, so the buttons can't be clicked twice
    const [archiving, setArchiving] = useState(false)

    // Is the form open? And which destination are we editing? (null means Add)
    const [formOpen, setFormOpen] = useState(false)
    const [destinationToEdit, setDestinationToEdit] = useState(null)

    // Get the list from Firestore
    async function loadDestinations() {
        setLoading(true)
        setErrorMessage('')
        try {
            const destinationList = await getDestinations(false)
            setDestinations(destinationList)
        } catch (error) {
            setErrorMessage('Could not load destinations.')
        }
        setLoading(false)
    }

    // Runs once when the page opens
    useEffect(() => {
        loadDestinations()
    }, [])

    // Add and Edit buttons. destination = null means Add, otherwise it is the one to edit
    function openForm(destination) {
        setDestinationToEdit(destination)
        setFormOpen(true)
    }

    // Close the form without saving
    function closeForm() {
        setFormOpen(false)
        setDestinationToEdit(null)
    }

    // Runs after the form saved. Close it and get the list again
    function handleSaved() {
        closeForm()
        loadDestinations()
    }

    // Runs when the admin presses Confirm in the dialog
    async function confirmArchive() {
        setArchiving(true)
        try {
            // Mark it as archived, save a log, then get the list again
            await archiveDestination(destinationToArchive.id)
            await logAction({
                adminId: user.uid,
                adminName: admin.fullName,
                action: 'Archived',
                section: 'Destinations',
                details: 'Archived destination "' + destinationToArchive.name + '"',
            })
            await loadDestinations()
        } catch (error) {
            setErrorMessage('Could not archive. Please try again.')
        }
        // Close the dialog
        setDestinationToArchive(null)
        setArchiving(false)
    }

    // Collect the category names for the filter (from the destinations we have)
    const categoryNames = []
    for (const destination of destinations) {
        if (!categoryNames.includes(destination.categoryName)) {
            categoryNames.push(destination.categoryName)
        }
    }

    // Keep only the destinations that match the search and the filters
    const shownDestinations = []
    for (const destination of destinations) {
        // Does the name have the typed text? (small letters, so "Beach" matches "beach")
        const nameMatches = destination.name.toLowerCase().includes(searchText.toLowerCase())

        // No category filter means everything matches
        let categoryMatches = true
        if (categoryFilter !== '' && destination.categoryName !== categoryFilter) {
            categoryMatches = false
        }

        // Same for the status filter
        let statusMatches = true
        if (statusFilter !== '' && destination.status !== statusFilter) {
            statusMatches = false
        }

        // Show it only if all three match
        if (nameMatches && categoryMatches && statusMatches) {
            shownDestinations.push(destination)
        }
    }

    // Decide what to show below the search bar: loading, nothing, or the cards
    let content
    if (loading) {
        content = <p className="empty">Loading...</p>
    } else if (shownDestinations.length === 0) {
        // Two different messages: no data at all, or nothing matches the search
        let emptyMessage = 'No destinations match your search.'
        if (destinations.length === 0) {
            emptyMessage = 'No destinations yet. Click "Add Destination".'
        }
        content = <p className="empty">{emptyMessage}</p>
    } else {
        content = (
            <div className="cards">
                {/* One card for each destination. The key helps React tell the cards apart */}
                {shownDestinations.map((destination) => (
                    <div className="card dc" key={destination.id}>
                        <div className="ph">{destination.categoryName}</div>

                        {/* Name, with the Edit and Archive buttons */}
                        <div className="head">
                            <h4>{destination.name}</h4>
                            <div className="tools">
                                <button
                                    className="ico"
                                    aria-label="Edit"
                                    onClick={() => openForm(destination)}
                                >
                                    <svg viewBox="0 0 24 24">
                                        <path d="M4 20h4L19 9l-4-4L4 16z" />
                                    </svg>
                                </button>
                                <button
                                    className="ico del"
                                    aria-label="Archive"
                                    onClick={() => setDestinationToArchive(destination)}
                                >
                                    <svg viewBox="0 0 24 24">
                                        <path d="M3 5h18v4H3zM5 9v10h14V9M10 13h4" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Show the short description only if there is one */}
                        {destination.shortDescription && (
                            <p className="info">{destination.shortDescription}</p>
                        )}

                        {/* Details. Each row shows only if it has a value */}
                        <dl className="dl">
                            <dt>Status</dt>
                            <dd>{destination.status}</dd>

                            {destination.timeFrom && destination.timeTo && (
                                <>
                                    <dt>Available time</dt>
                                    <dd>
                                        {formatTime(destination.timeFrom)} - {formatTime(destination.timeTo)}
                                    </dd>
                                </>
                            )}

                            {destination.estimatedCost !== undefined && destination.estimatedCost !== '' && (
                                <>
                                    <dt>Estimated cost</dt>
                                    <dd>₱{destination.estimatedCost}</dd>
                                </>
                            )}

                            {destination.activities && destination.activities.length > 0 && (
                                <>
                                    <dt>Activities</dt>
                                    <dd>{destination.activities.join(', ')}</dd>
                                </>
                            )}
                        </dl>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div>
            {/* Search, filters, and Add button */}
            <div className="bar">
                <input
                    type="search"
                    placeholder="Search destination"
                    aria-label="Search destination"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                />

                <select
                    aria-label="Filter by category"
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                >
                    <option value="">All categories</option>
                    {categoryNames.map((categoryName) => (
                        <option key={categoryName} value={categoryName}>
                            {categoryName}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="Filter by status"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                >
                    <option value="">All status</option>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                </select>

                <button className="btn" onClick={() => openForm(null)}>
                    + Add Destination
                </button>
            </div>

            {/* Shows only when there is an error */}
            {errorMessage && <p className="lerr">{errorMessage}</p>}

            {/* Loading, nothing to show, or the cards (decided above) */}
            {content}

            {/* "Are you sure?" dialog. Shows only when destinationToArchive has a destination */}
            {destinationToArchive && (
                <div className="overlay">
                    <div className="confirm">
                        <h3>Are you sure?</h3>
                        <p>
                            Archive "{destinationToArchive.name}"? You can restore it later
                            from the Archive page.
                        </p>
                        <div className="acts">
                            <button
                                className="btn o"
                                onClick={() => setDestinationToArchive(null)}
                                disabled={archiving}
                            >
                                Cancel
                            </button>
                            <button className="btn" onClick={confirmArchive} disabled={archiving}>
                                {archiving ? 'Archiving...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add / Edit form. Shows only when formOpen is true */}
            {formOpen && (
                <DestinationForm
                    destination={destinationToEdit}
                    onClose={closeForm}
                    onSaved={handleSaved}
                />
            )}
        </div>
    )
}