
import { useState } from "react";
import "./AdminLogin.css";

const API_URL = "http://localhost:5000/api";

function AdminLogin({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.message || "Login failed. Please try again.");
                return;
            }

            onLogin(data.token, data.admin);
        } catch (err) {
            setError(
                "Cannot connect to the server. Please check whether your backend is running."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <h1>Smart College Finder</h1>
            <h2>Admin Login</h2>
            <p>Sign in to manage college information.</p>

            <form onSubmit={handleLogin}>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />

                {error && <p role="alert" className="admin-error">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <button
                type="button"
                onClick={() => window.location.href = "/"}
            >
                Back to Home
            </button>
        </div>
    );
}

export default AdminLogin;
