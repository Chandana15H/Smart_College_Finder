
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function StudentDashboard({
    refreshKey,
    onFindColleges,
    onSavedColleges,
    onProfile,
    onLogout,
    onSessionExpired,
}) {
    const [student, setStudent] = useState(null);
    const [savedCount, setSavedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedStudent = sessionStorage.getItem("student");
        const token = sessionStorage.getItem("studentToken");

        if (!token || !storedStudent) {
            onSessionExpired?.();
            setLoading(false);
            return;
        }
        try {
            setStudent(JSON.parse(storedStudent));
        } catch {
            onSessionExpired?.();
            setLoading(false);
            return;
        }

        const fetchSavedCount = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/saved-colleges`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (response.status === 401) {
                    onSessionExpired?.();
                    return;
                }

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Unable to load saved colleges."
                    );
                }

                setSavedCount(data.count ?? data.colleges?.length ?? 0);
            } catch (err) {
                setError(err.message || "Unable to load dashboard information.");
            } finally {
                setLoading(false);
            }
        };

        fetchSavedCount();
    }, [refreshKey, onSessionExpired]);

    if (loading) {
        return (
            <main className="main-content">
                <p>Loading your dashboard...</p>
            </main>
        );
    }

    return (
        <main className="main-content student-dashboard">
            <header className="dashboard-header">
                <h1>Student Dashboard</h1>
                <p>Welcome to your College-Finder account.</p>
            </header>

            {error && (
                <p className="error-message" role="alert">
                    {error}
                </p>
            )}

            {student && (
                <section className="dashboard-profile">
                    <h2>Welcome, {student.full_name}!</h2>
                    <p>{student.email}</p>
                </section>
            )}

            <section className="dashboard-cards">
                <article className="dashboard-card">
                    <h3>Find Colleges</h3>
                    <p>Search colleges by district, city, area, and course.</p>
                    <button type="button" onClick={onFindColleges}>
                        Find Colleges
                    </button>
                </article>

                <article className="dashboard-card">
                    <h3>My Saved Colleges</h3>
                    <p className="saved-count">
                        {savedCount} saved {savedCount === 1 ? "college" : "colleges"}
                    </p>
                    <button type="button" onClick={onSavedColleges}>
                        View Saved Colleges
                    </button>
                </article>
            </section>


            <article className="dashboard-card">
                <h3>My Profile</h3>
                <p>View and update your student account details.</p>
                <button
                    type="button"
                    onClick={onProfile}
                >
                    View Profile
                </button>
            </article>



            <button
                type="button"
                className="logout-button"
                onClick={onLogout}
            >
                Logout
            </button>
        </main>
    );
}

export default StudentDashboard;
