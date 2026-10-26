
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function StudentProfile({ onBack, onSessionExpired }) {
    const [student, setStudent] = useState({
        full_name: "",
        email: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            const token = sessionStorage.getItem("studentToken");

            if (!token) {
                setError("Please log in again to view your profile.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/students/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (response.status === 401) {
                    onSessionExpired?.();
                    return;
                }

                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Unable to load profile.");
                }

                setStudent(data.student);
                sessionStorage.setItem("student", JSON.stringify(data.student));
            } catch (err) {
                setError(err.message || "Unable to load your profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setError("");

        const token = sessionStorage.getItem("studentToken");

        if (!token) {
            setError("Please log in again before updating your profile.");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(`${API_URL}/students/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    full_name: student.full_name,
                }),
            });

            const data = await response.json();
            if (response.status === 401) {
                onSessionExpired?.();
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to update profile.");
            }

            setStudent(data.student);
            sessionStorage.setItem("student", JSON.stringify(data.student));
            setMessage("Profile updated successfully!");
        } catch (err) {
            setError(err.message || "Unable to update your profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="main-content student-profile">
                <p>Loading your profile...</p>
            </main>
        );
    }

    return (
        <main className="main-content student-profile">
            <button type="button" onClick={onBack}>
                ← Back to Dashboard
            </button>

            <h1>My Student Profile</h1>
            <p>View and update your profile details.</p>

            {message && <p role="status">{message}</p>}
            {error && <p role="alert" className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                        id="fullName"
                        type="text"
                        value={student.full_name || ""}
                        onChange={(event) =>
                            setStudent({
                                ...student,
                                full_name: event.target.value,
                            })
                        }
                        required
                        maxLength={100}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        value={student.email || ""}
                        readOnly
                    />
                    <small>Email changes are not available in this version.</small>
                </div>

                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Profile"}
                </button>
            </form>
        </main>
    );
}

export default StudentProfile;
