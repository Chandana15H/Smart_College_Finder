
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function ManageColleges({ token, onBack }) {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const response = await fetch(`${API_URL}/colleges`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error("Unable to load colleges.");
                }

                const collegeList = Array.isArray(data)
                    ? data
                    : data.colleges || [];

                setColleges(collegeList);
            } catch (err) {
                setError(err.message || "Unable to load colleges.");
            } finally {
                setLoading(false);
            }
        };

        fetchColleges();
    }, []);

    return (
        <div className="manage-colleges">
            <h1>Manage Colleges</h1>
            <p>View and manage college information.</p>

            <button type="button" onClick={onBack}>
                Back to Dashboard
            </button>

            {loading && <p>Loading colleges...</p>}

            {error && <p role="alert">{error}</p>}

            {!loading && !error && (
                <>
                    <h2>Total Colleges: {colleges.length}</h2>

                    {colleges.length === 0 ? (
                        <p>No colleges found in the database.</p>
                    ) : (
                        colleges.map((college) => (
                            <div
                                key={college.college_id}
                                className="dashboard-card"
                            >
                                <h3>{college.college_name}</h3>
                                <p>
                                    City: {college.city_name || "Not available"}
                                </p>
                                <p>
                                    Area: {college.area_name || "Not available"}
                                </p>
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
}

export default ManageColleges;
