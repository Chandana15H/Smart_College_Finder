
import { useEffect, useState } from "react";
import "./ManageLocations.css";

const API_URL = "http://localhost:5000/api";

function ManageLocations({ token, onBack }) {
    const [districts, setDistricts] = useState([]);
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cityName, setCityName] = useState("");
    const [selectedDistrictId, setSelectedDistrictId] = useState("");
    const [editingCityId, setEditingCityId] = useState(null);
    const [editCityName, setEditCityName] = useState("");
    const [editDistrictId, setEditDistrictId] = useState("");
    const [districtName, setDistrictName] = useState("");
    const [addingDistrict, setAddingDistrict] = useState(false);
    const [editingDistrictId, setEditingDistrictId] = useState(null);
    const [editDistrictName, setEditDistrictName] = useState("");

    useEffect(() => {
        const loadLocations = async () => {
            try {
                const [districtResponse, cityResponse, areaResponse] =
                    await Promise.all([
                        fetch(`${API_URL}/districts`),
                        fetch(`${API_URL}/cities`),
                        fetch(`${API_URL}/areas`)
                    ]);

                const [districtData, cityData, areaData] = await Promise.all([
                    districtResponse.json(),
                    cityResponse.json(),
                    areaResponse.json()
                ]);

                if (!districtResponse.ok || !cityResponse.ok || !areaResponse.ok) {
                    throw new Error("Unable to load location data.");
                }

                setDistricts(districtData.districts || []);
                setCities(cityData.cities || []);
                setAreas(areaData.areas || []);
            } catch (err) {
                setError(err.message || "Unable to load locations.");
            } finally {
                setLoading(false);
            }
        };

        loadLocations();
    }, []);

    const handleAddCity = async (e) => {
        e.preventDefault();

        if (!cityName.trim() || !selectedDistrictId) {
            alert("Please enter a city name and select a district.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/cities", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    city_name: cityName.trim(),
                    district_id: Number(selectedDistrictId),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to add city.");
                return;
            }

            alert("City added successfully!");

            setCityName("");
            setSelectedDistrictId("");

            const citiesResponse = await fetch(
                "http://localhost:5000/api/cities"
            );
            const citiesData = await citiesResponse.json();

            setCities(citiesData.cities || []);
        } catch (error) {
            console.error("Error adding city:", error);
            alert("Unable to add city. Please check whether the backend is running.");
        }
    };


    const handleAddDistrict = async (e) => {
        e.preventDefault();

        const name = districtName.trim();

        if (!name) {
            alert("Please enter a district name.");
            return;
        }

        setAddingDistrict(true);

        try {
            const response = await fetch(`${API_URL}/districts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    district_name: name,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(data.message || "Failed to add district.");
                return;
            }

            alert("District added successfully!");
            setDistrictName("");

            const districtsResponse = await fetch(`${API_URL}/districts`);
            const districtsData = await districtsResponse.json();

            if (!districtsResponse.ok) {
                throw new Error("District was added, but the district list could not be refreshed.");
            }

            setDistricts(districtsData.districts || []);
        } catch (error) {
            console.error("Error adding district:", error);
            alert(error.message || "Unable to add district.");
        } finally {
            setAddingDistrict(false);
        }
    };


    const handleUpdateDistrict = async (e) => {
        e.preventDefault();

        const name = editDistrictName.trim();

        if (!editingDistrictId || !name) {
            alert("Please enter a district name.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/districts/${editingDistrictId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        district_name: name,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(data.message || "Failed to update district.");
                return;
            }

            alert("District updated successfully!");

            setEditingDistrictId(null);
            setEditDistrictName("");

            const districtsResponse = await fetch(`${API_URL}/districts`);
            const districtsData = await districtsResponse.json();

            setDistricts(districtsData.districts || []);
        } catch (error) {
            console.error("Error updating district:", error);
            alert("Unable to update district. Please check whether the backend is running.");
        }
    };


    const handleUpdateCity = async (e) => {
        e.preventDefault();

        if (!editingCityId || !editCityName.trim() || !editDistrictId) {
            alert("Please enter a city name and select a district.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/cities/${editingCityId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        city_name: editCityName.trim(),
                        district_id: Number(editDistrictId),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(data.message || "Failed to update city.");
                return;
            }

            alert("City updated successfully!");

            setEditingCityId(null);
            setEditCityName("");
            setEditDistrictId("");

            const citiesResponse = await fetch(
                "http://localhost:5000/api/cities"
            );
            const citiesData = await citiesResponse.json();

            setCities(citiesData.cities || []);
        } catch (error) {
            console.error("Error updating city:", error);
            alert("Unable to update city. Please check whether the backend is running.");
        }
    };

    const handleDeleteCity = async (cityId, cityName) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${cityName}"?`
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `http://localhost:5000/api/cities/${cityId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(data.message || "Failed to delete city.");
                return;
            }

            alert("City deleted successfully!");

            setCities((previousCities) =>
                previousCities.filter((city) => city.city_id !== cityId)
            );
        } catch (error) {
            console.error("Error deleting city:", error);
            alert("Unable to delete city. Please check whether the backend is running.");
        }
    };
    return (
        <div className="manage-locations">
            <button type="button" onClick={onBack}>
                Back to Dashboard
            </button>

            <h1>Manage Locations</h1>
            <p>View districts, cities, and areas stored in your database.</p>

            {loading && <p>Loading locations...</p>}
            {error && <p role="alert">{error}</p>}

            {!loading && !error && (
                <>
                    <div className="location-summary">
                        <div className="location-card">
                            <h2>{districts.length}</h2>
                            <p>Districts</p>
                        </div>

                        <div className="location-card">
                            <h2>{cities.length}</h2>
                            <p>Cities</p>
                        </div>

                        <div className="location-card">
                            <h2>{areas.length}</h2>
                            <p>Areas</p>
                        </div>
                    </div>

                    <section className="location-section">

                        <h2>Add New District</h2>

                        <form onSubmit={handleAddDistrict}>
                            <input
                                type="text"
                                placeholder="Enter district name"
                                value={districtName}
                                onChange={(e) => setDistrictName(e.target.value)}
                                required
                            />

                            <button type="submit" disabled={addingDistrict}>
                                {addingDistrict ? "Adding..." : "Add District"}
                            </button>
                        </form>

                        <h2>Districts</h2>
                        {districts.length === 0 ? (
                            <p>No districts found.</p>
                        ) : (
                            <ul>

                                {districts.map((district) => (
                                    <li key={district.district_id}>
                                        {editingDistrictId === district.district_id ? (
                                            <form onSubmit={handleUpdateDistrict}>
                                                <input
                                                    type="text"
                                                    value={editDistrictName}
                                                    onChange={(e) =>
                                                        setEditDistrictName(e.target.value)
                                                    }
                                                    placeholder="Enter district name"
                                                    required
                                                />

                                                <button type="submit">Save Changes</button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingDistrictId(null);
                                                        setEditDistrictName("");
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </form>
                                        ) : (
                                            <>
                                                {district.district_name}{" "}

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingDistrictId(district.district_id);
                                                        setEditDistrictName(district.district_name);
                                                    }}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const confirmed = window.confirm(
                                                            `Are you sure you want to delete "${district.district_name}"?`
                                                        );

                                                        if (!confirmed) return;

                                                        try {
                                                            const response = await fetch(
                                                                `${API_URL}/districts/${district.district_id}`,
                                                                {
                                                                    method: "DELETE",
                                                                    headers: {
                                                                        Authorization: `Bearer ${token}`,
                                                                    },
                                                                }
                                                            );

                                                            const data = await response.json();

                                                            if (!response.ok || !data.success) {
                                                                alert(data.message || "Failed to delete district.");
                                                                return;
                                                            }

                                                            alert("District deleted successfully!");

                                                            setDistricts((previousDistricts) =>
                                                                previousDistricts.filter(
                                                                    (item) => item.district_id !== district.district_id
                                                                )
                                                            );
                                                        } catch (error) {
                                                            console.error("Error deleting district:", error);
                                                            alert("Unable to delete district. Please check whether the backend is running.");
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </button>

                                            </>
                                        )}
                                    </li>
                                ))}

                            </ul>
                        )}
                    </section>

                    <section className="location-section">
                        <h2>Cities</h2>
                        {cities.length === 0 ? (
                            <p>No cities found.</p>
                        ) : (
                            <ul>
                                {cities.map((city) => (
                                    <li key={city.city_id}>
                                        {city.city_name}
                                        {" — "}
                                        {districts.find(
                                            (district) =>
                                                Number(district.district_id) ===
                                                Number(city.district_id)
                                        )?.district_name || "District not assigned"}

                                        {" "}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingCityId(city.city_id);
                                                setEditCityName(city.city_name);
                                                setEditDistrictId(String(city.district_id || ""));
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteCity(city.city_id, city.city_name)}
                                        >
                                            Delete
                                        </button>

                                        {editingCityId === city.city_id && (
                                            <form onSubmit={handleUpdateCity}>
                                                <input
                                                    type="text"
                                                    value={editCityName}
                                                    onChange={(e) => setEditCityName(e.target.value)}
                                                    placeholder="Enter city name"
                                                    required
                                                />

                                                <select
                                                    value={editDistrictId}
                                                    onChange={(e) => setEditDistrictId(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select District</option>

                                                    {districts.map((district) => (
                                                        <option
                                                            key={district.district_id}
                                                            value={district.district_id}
                                                        >
                                                            {district.district_name}
                                                        </option>
                                                    ))}
                                                </select>

                                                <button type="submit">Save Changes</button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCityId(null);
                                                        setEditCityName("");
                                                        setEditDistrictId("");
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </form>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="location-section">
                        <h2>Areas</h2>
                        {/* Add New City */}
                        <div className="location-section">
                            <h3>Add New City</h3>

                            <form onSubmit={handleAddCity}>
                                <input
                                    type="text"
                                    placeholder="Enter city name"
                                    value={cityName}
                                    onChange={(e) => setCityName(e.target.value)}
                                    required
                                />

                                <select
                                    value={selectedDistrictId}
                                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                                    required
                                >
                                    <option value="">Select District</option>

                                    {districts.map((district) => (
                                        <option
                                            key={district.district_id}
                                            value={district.district_id}
                                        >
                                            {district.district_name}
                                        </option>
                                    ))}
                                </select>

                                <button type="submit">Add City</button>
                            </form>
                        </div>
                        <form
                            className="add-area-form"
                            onSubmit={async (e) => {
                                e.preventDefault();

                                const formData = new FormData(e.currentTarget);
                                const areaName = formData.get("area_name");
                                const cityId = formData.get("city_id");

                                try {
                                    const response = await fetch(`${API_URL}/areas`, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${token}`
                                        },
                                        body: JSON.stringify({
                                            area_name: areaName,
                                            city_id: Number(cityId)
                                        })
                                    });

                                    const data = await response.json();

                                    if (!response.ok || data.success === false) {
                                        throw new Error(data.message || "Unable to add area.");
                                    }

                                    alert("Area added successfully!");
                                    window.location.reload();
                                } catch (err) {
                                    alert(err.message || "Unable to add area.");
                                }
                            }}
                        >
                            <h3>Add New Area</h3>

                            <label htmlFor="new-area-name">Area Name</label>
                            <input
                                id="new-area-name"
                                name="area_name"
                                placeholder="Enter area name"
                                required
                            />

                            <label htmlFor="new-area-city">City</label>
                            <select
                                id="new-area-city"
                                name="city_id"
                                required
                                defaultValue=""
                            >
                                <option value="" disabled>Select a city</option>
                                {cities.map((city) => (
                                    <option key={city.city_id} value={city.city_id}>
                                        {city.city_name}
                                    </option>
                                ))}
                            </select>

                            <button type="submit">Add Area</button>
                        </form>

                        {areas.length === 0 ? (
                            <p>No areas found.</p>
                        ) : (

                            <ul>
                                {areas.map((area) => (
                                    <li key={area.area_id}>
                                        <span>
                                            {area.area_name} — {area.city_name}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const newName = window.prompt(
                                                    "Enter the new area name:",
                                                    area.area_name
                                                );

                                                if (newName === null || !newName.trim()) {
                                                    return;
                                                }

                                                try {
                                                    const response = await fetch(
                                                        `${API_URL}/areas/${area.area_id}`,
                                                        {
                                                            method: "PUT",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                                Authorization: `Bearer ${token}`
                                                            },
                                                            body: JSON.stringify({
                                                                area_name: newName.trim(),
                                                                city_id: Number(area.city_id)
                                                            })
                                                        }
                                                    );

                                                    const data = await response.json();

                                                    if (!response.ok || data.success === false) {
                                                        throw new Error(
                                                            data.message || "Unable to update area."
                                                        );
                                                    }

                                                    alert("Area updated successfully!");
                                                    window.location.reload();
                                                } catch (err) {
                                                    alert(err.message || "Unable to update area.");
                                                }
                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const confirmed = window.confirm(
                                                    `Are you sure you want to delete "${area.area_name}"?`
                                                );

                                                if (!confirmed) {
                                                    return;
                                                }

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

                                                    if (!response.ok || data.success === false) {
                                                        throw new Error(
                                                            data.message || "Unable to delete area."
                                                        );
                                                    }

                                                    alert("Area deleted successfully!");
                                                    window.location.reload();
                                                } catch (err) {
                                                    alert(err.message || "Unable to delete area.");
                                                }
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>

                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default ManageLocations;
