// Temporary page for pages we have not built yet.
// "title" is the page name that we pass in (example: Archive).
export default function Placeholder({ title }) {
    return (
        <div>
            <div className="hd">
                <div>
                    <h1>{title}</h1>
                    <p>This page is not ready yet.</p>
                </div>
            </div>

            <div className="card">
                <p className="empty">Coming soon.</p>
            </div>
        </div>
    )
}