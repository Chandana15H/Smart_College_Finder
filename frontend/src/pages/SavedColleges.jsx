
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function SavedColleges({ onBack, onViewCollege, onSessionExpired }) {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [removingId, setRemovingId] = useState(null);



    const fetchSavedColleges = async () => {
        const token = sessionStorage.getItem("studentToken");

        if (!token) {
            onSessionExpired?.();
            return;
        }

        try {
            const response = await fetch(`${API_URL}/saved-colleges`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                onSessionExpired?.();
                return;
            }

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to load saved colleges."
                );
            }

            setColleges(data.colleges || []);
        } catch (err) {
            setError(err.message || "Unable to load saved colleges.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedColleges();
    }, []);

    const removeCollege = async (collegeId) => {
        const token = sessionStorage.getItem("studentToken");

        if (!token) {
            setError("Please log in again.");
            return;
        }

        setRemovingId(collegeId);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/saved-colleges/${collegeId}`,
                {
                    method: "DELETE",
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
                throw new Error(data.message || "Unable to load saved colleges.");
            }


            setColleges((previous) =>
                previous.filter(
                    (college) => String(college.college_id) !== String(collegeId)
                )
            );

            setMessage("College removed from your saved list.");
        } catch (err) {
            setError(err.message || "Unable to remove college.");
        } finally {
            setRemovingId(null);
        }
    };

    if (loading) {
        return <main className="main-content"><p>Loading saved colleges...</p></main>;
    }

    return (
        <main className="main-content saved-colleges-page">
            <button type="button" onClick={onBack}>
                ← Back
            </button>

            <h1>My Saved Colleges</h1>
            <p>Keep track of the colleges you're interested in.</p>

            {error && <p className="error-message" role="alert">{error}</p>}
            {message && <p role="status">{message}</p>}

            {!error && colleges.length === 0 && (
                <p>You haven't saved any colleges yet.</p>
            )}

            <div className="college-grid">
                {colleges.map((college) => (
                    <article className="college-card" key={college.college_id}>
                        {college.image_url && (
                            <img
                                className="college-image"
                                src={college.image_url}
                                alt={college.college_name}
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                }}
                            />
                        )}

                        <h3>{college.college_name}</h3>

                        {college.city_name && <p><strong>City:</strong> {college.city_name}</p>}
                        {college.area_name && <p><strong>Area:</strong> {college.area_name}</p>}
                        {college.address && <p><strong>Address:</strong> {college.address}</p>}
                        {college.courses && <p><strong>Courses:</strong> {college.courses}</p>}
                        {college.rating != null && (
                            <p>⭐ {Number(college.rating).toFixed(1)} / 5</p>
                        )}

                        <div className="button-group">
                            <button
                                type="button"
                                onClick={() => onViewCollege(college)}
                            >
                                View Details
                            </button>

                            <button
                                type="button"
                                className="reset-button"
                                disabled={removingId === college.college_id}
                                onClick={() => removeCollege(college.college_id)}
                            >
                                {removingId === college.college_id
                                    ? "Removing..."
                                    : "Remove"}
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
}

export default SavedColleges;
