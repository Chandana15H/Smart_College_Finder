
import { useEffect, useState } from "react";
import "./ManageColleges.css";

const API_URL = "http://localhost:5000/api";

const emptyForm = {
    college_name: "",
    area_id: "",
    address: "",
    phone: "",
    website: "",
    description: "",
    image_url: "",
    rating: ""
};

function ManageColleges({ token, onBack }) {
    const [colleges, setColleges] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);

    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingCollegeId, setEditingCollegeId] = useState(null);

    const [form, setForm] = useState({ ...emptyForm });
    const [editForm, setEditForm] = useState({ ...emptyForm });

    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [formMessage, setFormMessage] = useState("");

    // Load colleges
    const fetchColleges = async () => {
        const response = await fetch(`${API_URL}/colleges`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load colleges.");
        }

        const collegeList = Array.isArray(data)
            ? data
            : data.colleges || [];

        setColleges(collegeList);
    };

    useEffect(() => {
        const loadColleges = async () => {
            try {
                await fetchColleges();
            } catch (err) {
                setError(err.message || "Unable to load colleges.");
            } finally {
                setLoading(false);
            }
        };

        loadColleges();
    }, []);

    // Load districts
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await fetch(`${API_URL}/districts`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Unable to load districts.");
                }

                setDistricts(
                    Array.isArray(data) ? data : data.districts || []
                );
            } catch (err) {
                setFormError(err.message);
            }
        };

        fetchDistricts();
    }, []);

    // Load cities
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch(`${API_URL}/cities`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Unable to load cities.");
                }

                setCities(
                    Array.isArray(data) ? data : data.cities || []
                );
            } catch (err) {
                setFormError(err.message);
            }
        };

        fetchCities();
    }, []);

    // Load areas for the Add College and Edit College forms
    useEffect(() => {
        const fetchAreas = async () => {
            if (!selectedCity) {
                setAreas([]);
                return;
            }

            try {
                const response = await fetch(
                    `${API_URL}/areas?cityId=${selectedCity}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch areas");
                }

                setAreas(Array.isArray(data) ? data : data.areas || []);
            } catch (error) {
                console.error("Error fetching areas:", error);
                setAreas([]);
            }
        };

        fetchAreas();
    }, [selectedCity]);

    // Handle Add College form changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Add a new college
    const handleAddCollege = async (e) => {
        e.preventDefault();

        setSaving(true);
        setFormError("");
        setFormMessage("");

        try {
            const response = await fetch(`${API_URL}/colleges`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    ...form,
                    area_id: form.area_id === "" ? null : Number(form.area_id),
                    rating:
                        form.rating === "" ? null : Number(form.rating)
                })

            });

            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || "Unable to add college.");
            }

            await fetchColleges();

            setForm({ ...emptyForm });
            setFormMessage("College added successfully!");
        } catch (err) {
            setFormError(err.message || "Unable to add college.");
        } finally {
            setSaving(false);
        }
    };

    // Open the Edit College form
    const handleEditClick = (college) => {
        setEditingCollegeId(college.college_id);

        setEditForm({
            college_name: college.college_name || "",
            area_id: String(college.area_id || ""),
            address: college.address || "",
            phone: college.phone || "",
            website: college.website || "",
            description: college.description || "",
            image_url: college.image_url || "",
            rating: college.rating ?? ""
        });

        setError("");
        setFormError("");
        setFormMessage("");
    };

    // Handle Edit College form changes
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;

        setEditForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Save edited college details
    const handleSaveChanges = async (e) => {
        e.preventDefault();

        if (!editingCollegeId) return;

        setSaving(true);
        setFormError("");
        setFormMessage("");

        try {
            const response = await fetch(
                `${API_URL}/colleges/${editingCollegeId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...editForm,
                        area_id: editForm.area_id === "" ? null : Number(editForm.area_id),
                        rating:
                            editForm.rating === ""
                                ? null
                                : Number(editForm.rating)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || "Unable to update college.");
            }

            await fetchColleges();

            setEditingCollegeId(null);
            setEditForm({ ...emptyForm });
            setFormMessage("College updated successfully!");
        } catch (err) {
            setFormError(err.message || "Unable to update college.");
        } finally {
            setSaving(false);
        }
    };

    // Delete a college
    const handleDeleteCollege = async (collegeId, collegeName) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${collegeName}"?`
        );

        if (!confirmed) return;

        setError("");

        try {
            const response = await fetch(
                `${API_URL}/colleges/${collegeId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || "Unable to delete college.");
            }

            setColleges((previous) =>
                previous.filter(
                    (college) => college.college_id !== collegeId
                )
            );

            if (editingCollegeId === collegeId) {
                setEditingCollegeId(null);
            }
        } catch (err) {
            setError(err.message || "Unable to delete college.");
        }
    };

    return (
        <div className="manage-colleges">
            <h1>Manage Colleges</h1>
            <p>View and manage college information.</p>

            <button type="button" onClick={onBack}>
                Back to Dashboard
            </button>

            {/* ADD COLLEGE FORM */}
            <form onSubmit={handleAddCollege}>
                <h2>Add New College</h2>

                <label htmlFor="add_college_name">College Name *</label>
                <input
                    id="add_college_name"
                    name="college_name"
                    value={form.college_name}
                    onChange={handleFormChange}
                    placeholder="Enter college name"
                    required
                />
                <label>District *</label>
                <select
                    value={selectedDistrict}
                    onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        setSelectedCity("");
                        setForm((prev) => ({ ...prev, area_id: "" }));
                    }}
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

                <label>City *</label>
                <select
                    value={selectedCity}
                    onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setForm((prev) => ({ ...prev, area_id: "" }));
                    }}
                    required
                    disabled={!selectedDistrict}
                >
                    <option value="">Select City</option>
                    {cities
                        .filter(
                            (city) =>
                                String(city.district_id) === String(selectedDistrict)
                        )
                        .map((city) => (
                            <option key={city.city_id} value={city.city_id}>
                                {city.city_name}
                            </option>
                        ))}
                </select>

                <label htmlFor="add_area_id">Area *</label>
                <select
                    id="add_area_id"
                    name="area_id"
                    value={form.area_id}
                    onChange={handleFormChange}
                >

                    <option value="">Select an area</option>
                    {areas.map((area) => (
                        <option key={area.area_id} value={area.area_id}>
                            {area.area_name} — {area.city_name}
                        </option>
                    ))}
                </select>

                <label htmlFor="add_address">Address</label>
                <input
                    id="add_address"
                    name="address"
                    value={form.address}
                    onChange={handleFormChange}
                    placeholder="Enter address"
                />

                <label htmlFor="add_phone">Phone</label>
                <input
                    id="add_phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="Enter phone number"
                />

                <label htmlFor="add_website">Website</label>
                <input
                    id="add_website"
                    name="website"
                    type="url"
                    value={form.website}
                    onChange={handleFormChange}
                    placeholder="https://example.com"
                />

                <label htmlFor="add_description">Description</label>
                <textarea
                    id="add_description"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Enter college description"
                />

                <label htmlFor="add_image_url">Image URL</label>
                <input
                    id="add_image_url"
                    name="image_url"
                    type="url"
                    value={form.image_url}
                    onChange={handleFormChange}
                    placeholder="https://example.com/college.jpg"
                />

                <label htmlFor="add_rating">Rating (0–5)</label>
                <input
                    id="add_rating"
                    name="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={handleFormChange}
                    placeholder="Example: 4.2"
                />

                {formError && <p role="alert">{formError}</p>}
                {formMessage && <p role="status">{formMessage}</p>}

                <button
                    type="submit"
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Add College"}
                </button>
            </form>

            {/* COLLEGE LIST */}
            {loading && <p>Loading colleges...</p>}
            {error && <p role="alert">{error}</p>}

            {!loading && !error && (
                <>

                    <h2>Total Colleges: {colleges.length}</h2>

                    <div className="college-admin-list">
                        {colleges.length === 0 ? (
                            <p>No colleges found in the database.</p>
                        ) : (
                            colleges.map((college) => (


                                <div
                                    key={college.college_id}
                                    className="college-admin-card"
                                >
                                    <h3>{college.college_name}</h3>

                                    <p>
                                        City: {college.city_name || "Not available"}
                                    </p>

                                    <p>
                                        Area: {college.area_name || "Not available"}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => handleEditClick(college)}
                                    >
                                        Edit College
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteCollege(
                                                college.college_id,
                                                college.college_name
                                            )
                                        }
                                    >
                                        Delete College
                                    </button>

                                    {/* EDIT COLLEGE FORM */}
                                    {editingCollegeId === college.college_id && (
                                        <form
                                            className="edit-college-form"
                                            onSubmit={handleSaveChanges}
                                        >
                                            <h3>Edit College Details</h3>

                                            <label>College Name *</label>
                                            <input
                                                name="college_name"
                                                value={editForm.college_name}
                                                onChange={handleEditFormChange}
                                                required
                                            />



                                            <label>Area (optional)</label>
                                            <select
                                                name="area_id"
                                                value={editForm.area_id}
                                                onChange={handleEditFormChange}
                                            >
                                                <option value="">No area selected</option>
                                                {areas.map((area) => (
                                                    <option
                                                        key={area.area_id}
                                                        value={area.area_id}
                                                    >
                                                        {area.area_name} — {area.city_name}
                                                    </option>
                                                ))}
                                            </select>


                                            <label>Address</label>
                                            <input
                                                name="address"
                                                value={editForm.address}
                                                onChange={handleEditFormChange}
                                            />

                                            <label>Phone</label>
                                            <input
                                                name="phone"
                                                value={editForm.phone}
                                                onChange={handleEditFormChange}
                                            />

                                            <label>Website</label>
                                            <input
                                                name="website"
                                                type="url"
                                                value={editForm.website}
                                                onChange={handleEditFormChange}
                                            />

                                            <label>Description</label>
                                            <textarea
                                                name="description"
                                                value={editForm.description}
                                                onChange={handleEditFormChange}
                                            />

                                            <label>Image URL</label>
                                            <input
                                                name="image_url"
                                                type="url"
                                                value={editForm.image_url}
                                                onChange={handleEditFormChange}
                                            />

                                            <label>Rating (0–5)</label>
                                            <input
                                                name="rating"
                                                type="number"
                                                min="0"
                                                max="5"
                                                step="0.1"
                                                value={editForm.rating}
                                                onChange={handleEditFormChange}
                                            />

                                            <button
                                                type="submit"
                                                disabled={saving}
                                            >
                                                {saving ? "Saving..." : "Save Changes"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingCollegeId(null);
                                                    setFormError("");
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </form>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default ManageColleges;
