
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function ManageAreas({ token, onBack }) {
    const [areas, setAreas] = useState([]);
    const [cities, setCities] = useState([]);
    const [areaName, setAreaName] = useState("");
    const [cityId, setCityId] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const [areasResponse, citiesResponse] = await Promise.all([
                fetch(`${API_URL}/areas`),
                fetch(`${API_URL}/cities`)
            ]);

            const areasData = await areasResponse.json();
            const citiesData = await citiesResponse.json();

            if (!areasResponse.ok) {
                throw new Error(areasData.message || "Unable to load areas.");
            }

            if (!citiesResponse.ok) {
                throw new Error(citiesData.message || "Unable to load cities.");
            }

            setAreas(
                Array.isArray(areasData)
                    ? areasData
                    : areasData.areas || []
            );

            setCities(
                Array.isArray(citiesData)
                    ? citiesData
                    : citiesData.cities || []
            );
        } catch (err) {
            setError(err.message || "Unable to load areas and cities.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const name = areaName.trim();

        if (!name || !cityId) {
            setError("Enter an area name and select a city.");
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                editingId
                    ? `${API_URL}/areas/${editingId}`
                    : `${API_URL}/areas`,
                {
                    method: editingId ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        area_name: name,
                        city_id: Number(cityId)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to save area.");
            }

            setMessage(
                editingId
                    ? "Area updated successfully."
                    : "Area added successfully."
            );

            setAreaName("");
            setCityId("");
            setEditingId(null);

            await loadData();
        } catch (err) {
            setError(err.message || "Unable to save area.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (area) => {
        setEditingId(area.area_id);
        setAreaName(area.area_name);
        setCityId(String(area.city_id));
        setError("");
        setMessage("");
    };

    const handleDelete = async (area) => {
        const confirmed = window.confirm(
            `Delete area "${area.area_name}"?`
        );

        if (!confirmed) return;

        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/areas/${area.area_id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to delete area.");
            }

            setMessage("Area deleted successfully.");
            await loadData();
        } catch (err) {
            setError(err.message || "Unable to delete area.");
        }
    };

    return (
        <div className="manage-colleges">
            <h1>Manage Areas</h1>
            <p>Add and manage areas belonging to each city.</p>

            <button type="button" onClick={onBack}>
                Back to Dashboard
            </button>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="areaName">Area Name</label>
                    <input
                        id="areaName"
                        value={areaName}
                        onChange={(event) =>
                            setAreaName(event.target.value)
                        }
                        placeholder="Example: Malleshwaram"
                        maxLength={100}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="areaCity">City</label>
                    <select
                        id="areaCity"
                        value={cityId}
                        onChange={(event) => setCityId(event.target.value)}
                        required
                    >
                        <option value="">Select a city</option>
                        {cities.map((city) => (
                            <option key={city.city_id} value={city.city_id}>
                                {city.city_name}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" disabled={saving || loading}>
                    {saving
                        ? "Saving..."
                        : editingId
                            ? "Update Area"
                            : "Add Area"}
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setAreaName("");
                            setCityId("");
                            setError("");
                            setMessage("");
                        }}
                    >
                        Cancel Edit
                    </button>
                )}
            </form>

            {error && <p role="alert" className="error-message">{error}</p>}
            {message && <p role="status">{message}</p>}

            <h2>Existing Areas ({areas.length})</h2>

            {loading ? (
                <p>Loading areas...</p>
            ) : areas.length === 0 ? (
                <p>No areas found. Add your first area above.</p>
            ) : (
                <div className="college-grid">
                    {areas.map((area) => (
                        <article
                            className="college-card"
                            key={area.area_id}
                        >
                            <h3>{area.area_name}</h3>
                            <p>
                                City: {area.city_name || "City ID " + area.city_id}
                            </p>

                            <button
                                type="button"
                                onClick={() => handleEdit(area)}
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDelete(area)}
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

export default ManageAreas;
