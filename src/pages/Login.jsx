import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { user, login } = useAuth();

    // What the user types
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Show or hide the password (eye button)
    const [showPassword, setShowPassword] = useState(false);

    // Error message shown under the form
    const [error, setError] = useState("");

    // True while we wait for Firebase, so the button can't be clicked twice
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault(); // stop the page from reloading
        setError("")
        setLoading(true);

        try {
            await login(email, password);

        } catch (err) {
            // Wrong password or not an admin: same message on purpose
            setError("Invalid email or password");
            setPassword("");
        }

        setLoading(false);
    }

    // Already logged in: go straight to the dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div id="landing">
            {/* Left side: seal of Bacacay */}
            <div className="lseal">
                <img src="/seal.png" alt="Seal of the MTCAO" />
            </div>

            {/* Right side: login panel */}
            <div className="lpanel">
                <section className="lv">
                    <h1 className="sm"> Login </h1>
                    <p> MTCAO Personnel </p>

                    <form className="lform" onSubmit={handleSubmit}>
                        <label>
                            Email
                            <input 
                                type="email" 
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </label>

                        <label>
                            Password
                            <span className="pw">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="pwt"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24">
                                            <path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4M6.5 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 004.2 4.2" />
                                        </svg>   
                                    ) : (
                                        <svg viewBox="0 0 24 24">
                                            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </span>
                        </label>

                        {/* Only shows when there is an error */}
                        {error && <p className="lerr"> {error} </p>}

                        <button className="go" type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        {/* No function yet. Will be added in Tier 2 */}
                        <button type="button" className="flink">
                            Forgot password?
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}