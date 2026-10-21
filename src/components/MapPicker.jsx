import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'

// The pin picture. Leaflet's normal pin does not show when using Vite,
// so we tell it where the pictures are.
const pinIcon = L.icon({
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

// Where the map starts when there is no pin yet (around Bacacay, Albay)
const START_CENTER = [13.29407, 123.79225]
const START_ZOOM = 12

// Listens for clicks on the map. It shows nothing, it only listens.
// When the admin clicks, it tells the form where (latitude and longitude)
function MapClickListener({ onPick }) {
    useMapEvents({
        click(event) {
            onPick(event.latlng.lat, event.latlng.lng)
        },
    })
    return null
}

// latitude and longitude are numbers, or null when there is no pin yet.
// onPick is the function the form gives us, to receive the new pin location.
export default function MapPicker({ latitude, longitude, onPick }) {
    //Is there a pin already? (Edit mode has one, Add mode does not)
    let hasPin = false
    if (latitude !== null && longitude !== null) {
        hasPin = true
    }

    // If there is a pin, the map starts there. If not, it starts at Bacacay.
    let mapCenter = START_CENTER
    let mapZoom = START_ZOOM
    if (hasPin) {
        mapCenter = [latitude, longitude]
        mapZoom = 15
    }

    return (
        <div className="map-picker">
            <MapContainer center={mapCenter} zoom={mapZoom} className="map-box">
                {/* The map pictures, from OpenStreetMap */}
                <TileLayer 
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                {/* Listens for clicks */}
                <MapClickListener onPick={onPick} />

                {/* Show the pin only when there is a location */}
                {hasPin && <Marker position={[latitude, longitude]} icon={pinIcon} />}
            </MapContainer>

            {/* Tells the admin what to do, or shows the chosen location */}
            {hasPin ? (
                <p className="map-hint">
                    Pin at {latitude.toFixed(5)}, {longitude.toFixed(5)}. Click the map to move it.
                </p>
            ) : (
                <p className="map-hint">Click on the map to place the pin.</p>
            )}
        </div>
    )
}