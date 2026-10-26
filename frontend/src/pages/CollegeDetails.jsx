import "./CollegeDetails.css";

function CollegeDetails({ college, onBack }) {
    if (!college) {
        return <p>College details are unavailable.</p>;
    }

    return (
        <main className="college-details">
            <button
                type="button"
                className="back-button"
                onClick={onBack}
            >
                ← Back to Colleges
            </button>

            <h1>{college.college_name}</h1>

            {college.city_name && (
                <p>
                    <strong>City:</strong> {college.city_name}
                </p>
            )}

            {college.area_name && (
                <p>
                    <strong>Area:</strong> {college.area_name}
                </p>
            )}

            {college.address && (
                <p>
                    <strong>Address:</strong> {college.address}
                </p>
            )}

            {college.courses && (
                <p>
                    <strong>Courses:</strong> {college.courses}
                </p>
            )}

            {college.fees != null && (
                <p>
                    <strong>Fees:</strong> ₹{college.fees}
                </p>
            )}

            {college.duration && (
                <p>
                    <strong>Duration:</strong> {college.duration}
                </p>
            )}

            {college.phone && (
                <p>
                    <strong>Phone:</strong> {college.phone}
                </p>
            )}

            {college.rating != null && (
                <p>
                    <strong>Rating:</strong>{" "}
                    ⭐ {Number(college.rating).toFixed(1)} / 5
                </p>
            )}


            {college.website && (
                <p>
                    <strong>Official Website:</strong>{" "}
                    <a
                        href={
                            college.website.startsWith("http://") ||
                                college.website.startsWith("https://")
                                ? college.website
                                : `https://${college.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Visit Website
                    </a>
                </p>
            )}

        </main>
    );
}

export default CollegeDetails;