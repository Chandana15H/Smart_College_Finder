
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function ManageCourses({ token, onBack }) {
    const [courses, setCourses] = useState([]);
    const [courseName, setCourseName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchCourses = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/courses`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to load courses.");
            }

            setCourses(data.courses || []);
        } catch (err) {
            setError(err.message || "Could not connect to the backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const name = courseName.trim();

        if (!name) {
            setError("Please enter a course name.");
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const url = editingId
                ? `${API_URL}/courses/${editingId}`
                : `${API_URL}/courses`;

            const response = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ course_name: name }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to save course.");
            }

            setMessage(editingId ? "Course updated successfully." : "Course added successfully.");
            setCourseName("");
            setEditingId(null);
            await fetchCourses();
        } catch (err) {
            setError(err.message || "Could not save course.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (course) => {
        setEditingId(course.course_id);
        setCourseName(course.course_name);
        setError("");
        setMessage("");
    };

    const handleDelete = async (course) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${course.course_name}"?`
        );

        if (!confirmed) return;

        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/courses/${course.course_id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to delete course.");
            }

            setMessage("Course deleted successfully.");
            await fetchCourses();
        } catch (err) {
            setError(err.message || "Could not delete course.");
        }
    };

    return (
        <div className="admin-dashboard">
            <h1>Manage Courses</h1>
            <p>Add, edit, and view the courses available in College Finder.</p>

            <button type="button" onClick={onBack}>
                Back to Dashboard
            </button>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="courseName">Course Name</label>
                    <input
                        id="courseName"
                        type="text"
                        value={courseName}
                        onChange={(event) => setCourseName(event.target.value)}
                        placeholder="Example: BCA"
                        required
                    />
                </div>

                <button type="submit" disabled={saving}>
                    {saving
                        ? "Saving..."
                        : editingId
                            ? "Update Course"
                            : "Add Course"}
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setCourseName("");
                            setError("");
                            setMessage("");
                        }}
                    >
                        Cancel Edit
                    </button>
                )}
            </form>

            {error && <p className="error-message">{error}</p>}
            {message && <p>{message}</p>}

            <h2>Existing Courses</h2>

            {loading ? (
                <p>Loading courses...</p>
            ) : courses.length === 0 ? (
                <p>No courses found.</p>
            ) : (
                <div className="college-grid">
                    {courses.map((course) => (
                        <article className="college-card" key={course.course_id}>
                            <h3>{course.course_name}</h3>

                            <button type="button" onClick={() => handleEdit(course)}>
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDelete(course)}
                            >
                                Delete
                            </button>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ManageCourses;
