
import { useState } from "react";
import "./UserLogin.css";

const API_URL = "http://localhost:5000/api";

function UserLogin({ onLogin, onBack, onRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed. Please try again.");
                return;
            }

            // Keep the token for the current login session.
            onLogin(data);
        } catch (err) {
            setError(
                "Cannot connect to the server. Please check whether the backend is running."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-login-page">
            <div className="user-login-card">
                <div className="user-login-icon">🎓</div>

                <h1>Student Login</h1>
                <p>Welcome to Smart College Finder</p>

                <form onSubmit={handleLogin}>
                    <label htmlFor="user-email">Email Address</label>
                    <input
                        id="user-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                    />

                    <label htmlFor="user-password">Password</label>
                    <input
                        id="user-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                    />

                    {error && (
                        <p className="user-login-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="user-register-link">
                    Don't have an account?{" "}

                    <button
                        type="button"
                        onClick={onRegister}
                    >
                        Register
                    </button>

                </p>
                <button
                    type="button"
                    className="user-back-button"
                    onClick={onBack}
                >
                    ← Back to Home
                </button>
            </div>
        </div>
    );
}

export default UserLogin;
