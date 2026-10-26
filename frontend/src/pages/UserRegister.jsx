
import { useState } from "react";
import "./UserRegister.css";

const API_URL = "http://localhost:5000/api";

function UserRegister({ onRegister, onLogin, onBack }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();
        setMessage("");
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8 || password.length > 72) {
            setError("Password must be between 8 and 72 characters.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    full_name: fullName.trim(),
                    email: email.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registration failed.");
                return;
            }

            setMessage("Registration successful! You can now log in.");

            setFullName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");

            if (onRegister) {
                onRegister(data);
            }
        } catch (err) {
            setError(
                "Cannot connect to the server. Please check whether the backend is running."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-register-page">
            <div className="user-register-card">
                <div className="user-register-icon">🎓</div>

                <h1>Student Registration</h1>
                <p>Create your Smart College Finder account</p>

                <form onSubmit={handleRegister}>
                    <label htmlFor="register-name">Full Name</label>
                    <input
                        id="register-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        maxLength={100}
                        autoComplete="name"
                        required
                    />

                    <label htmlFor="register-email">Email Address</label>
                    <input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        maxLength={150}
                        autoComplete="email"
                        required
                    />

                    <label htmlFor="register-password">Password</label>
                    <input
                        id="register-password"
                        type="password"
                        placeholder="Create a password (8–72 characters)"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={8}
                        maxLength={72}
                        autoComplete="new-password"
                        required
                    />

                    <label htmlFor="confirm-password">
                        Confirm Password
                    </label>
                    <input
                        id="confirm-password"
                        type="password"
                        placeholder="Enter your password again"
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(event.target.value)
                        }
                        maxLength={72}
                        autoComplete="new-password"
                        required
                    />

                    {error && (
                        <p className="user-register-error" role="alert">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="user-register-success" role="status">
                            {message}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Registering..." : "Create Account"}
                    </button>
                </form>

                <p className="user-register-login">
                    Already have an account?{" "}
                    <button type="button" onClick={onLogin}>
                        Login
                    </button>
                </p>

                <button
                    type="button"
                    className="user-register-back"
                    onClick={onBack}
                >
                    ← Back to Home
                </button>
            </div>
        </div>
    );
}

export default UserRegister;
