
import { useEffect, useState } from "react";
import "./App.css";
import CollegeDetails from "./pages/CollegeDetails";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ManageColleges from "./pages/ManageColleges";
import ManageAreas from "./pages/ManageAreas";
import ManageCourses from "./pages/ManageCourses";
import Home from "./pages/Home";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import SavedColleges from "./pages/SavedColleges";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import ManageLocations from "./pages/ManageLocations";


const API_URL = "http://localhost:5000/api";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const handleStudentLogout = (redirectToLogin = false) => {
    sessionStorage.removeItem("studentToken");
    sessionStorage.removeItem("student");
    setSavedCollegeIds([]);
    setSaveMessage("");
    setSelectedCollege(null);
    setCurrentPage(redirectToLogin ? "user-login" : "home");
  };

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [savedCollegeIds, setSavedCollegeIds] = useState([]);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [savingCollegeId, setSavingCollegeId] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [adminDetails, setAdminDetails] = useState(null);

  // Cities, colleges, and filter values
  const [cities, setCities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [availableColleges, setAvailableColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");

  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districtsLoading, setDistrictsLoading] = useState(false);

  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [course, setCourse] = useState("");


  // Loading and error states
  const [areas, setAreas] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [areasLoading, setAreasLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [error, setError] = useState("");
  const [areasError, setAreasError] = useState("");
  const [searched, setSearched] = useState(false);


  const courses = [
    "BCA",
    "B.Com",
    "BBA",
    "B.Sc",
    "MCA",
    "MBA",
  ];
  const sortedColleges = [...colleges].sort((a, b) => {
    if (sortBy === "name") {
      return a.college_name.localeCompare(b.college_name);
    }

    if (sortBy === "rating") {
      const ratingA = a.rating == null ? -1 : Number(a.rating);
      const ratingB = b.rating == null ? -1 : Number(b.rating);
      return ratingB - ratingA;
    }

    return 0;
  });

  // 1. Fetch cities from MySQL
  useEffect(() => {
    const fetchCities = async () => {
      setCitiesLoading(true);

      try {
        const response = await fetch(`${API_URL}/cities`);

        if (!response.ok) {
          throw new Error("Unable to load cities.");
        }

        const data = await response.json();

        if (data.success) {
          setCities(data.cities || []);
        } else {
          throw new Error(data.message || "Unable to load cities.");
        }
      } catch (err) {
        console.error("Cities fetch error:", err);
        setError("Could not load cities. Please check your backend.");
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(`${API_URL}/states`);
        const data = await response.json();

        if (data.success) {
          setStates(data.states);
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };

    fetchStates();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      setDistrictsLoading(true);

      try {
        const response = await fetch(`${API_URL}/districts`);
        const data = await response.json();

        if (data.success) {
          setDistricts(data.districts);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setDistrictsLoading(false);
      }
    };

    fetchDistricts();
  }, []);

  // Find the selected city's database ID
  const selectedCity = cities.find(
    (item) => String(item.city_id) === city
  );

  // 2. Fetch areas when the selected city changes

  useEffect(() => {
    // Do not show areas until a city is selected.
    if (!selectedCity) {
      setAreas([]);
      setArea("");
      setAreasError("");
      setAreasLoading(false);
      return;
    }

    const fetchAreas = async () => {
      setAreas([]);
      setArea("");
      setAreasError("");
      setAreasLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/areas?cityId=${selectedCity.city_id}`
        );

        if (!response.ok) {
          throw new Error("Unable to load areas.");
        }

        const data = await response.json();

        if (data.success) {
          setAreas(data.areas || []);
        } else {
          throw new Error(data.message || "Unable to load areas.");
        }
      } catch (err) {
        console.error("Areas fetch error:", err);
        setAreasError("Could not load areas. Please try again.");
      } finally {
        setAreasLoading(false);
      }
    };

    fetchAreas();
  }, [selectedCity?.city_id]);


  // Fetch colleges for the College dropdown
  useEffect(() => {
    const fetchAllColleges = async () => {
      setCollegesLoading(true);

      try {
        const response = await fetch(`${API_URL}/colleges`);

        if (!response.ok) {
          throw new Error("Unable to load colleges.");
        }

        const data = await response.json();

        if (data.success) {
          setAvailableColleges(data.colleges || []);
        } else {
          throw new Error(data.message || "Unable to load colleges.");
        }
      } catch (err) {
        console.error("Colleges dropdown error:", err);
      } finally {
        setCollegesLoading(false);
      }
    };

    fetchAllColleges();
  }, []);

  // 3. Search colleges

  const searchColleges = async (event) => {
    event.preventDefault();

    setSearchLoading(true);
    setError("");
    setSearched(true);
    setColleges([]);

    try {
      const params = new URLSearchParams();

      // Send district ID
      if (selectedDistrict) {
        params.append("district", selectedDistrict);
      }

      // Send city name
      if (selectedCity) {
        params.append("city", selectedCity.city_name);
      }

      // Send area name
      if (area) {
        const selectedArea = areas.find(
          (item) => String(item.area_id) === String(area)
        );

        if (selectedArea) {
          params.append("area", selectedArea.area_name);
        }
      }

      // Send course
      if (course) {
        params.append("course", course);
      }

      const response = await fetch(
        `${API_URL}/colleges?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Unable to search colleges.");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "College search failed.");
      }

      const results = data.colleges || [];
      console.log("Selected district:", selectedDistrict);
      console.log("Selected city:", selectedCity);
      console.log("API results:", results);
      console.log("Selected college ID:", selectedCollegeId);

      // Show only the selected college, if one was selected
      const filteredResults = selectedCollegeId
        ? results.filter(
          (item) =>
            String(item.college_id) === String(selectedCollegeId)
        )
        : results;

      setColleges(filteredResults);
    } catch (err) {
      console.error("College search error:", err);
      setError("Could not search colleges. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Save a college for the logged-in student
  const saveCollege = async (collegeId) => {
    const token = sessionStorage.getItem("studentToken");

    if (!token) {
      setSaveMessage("Please log in as a student to save colleges.");
      return;
    }

    setSavingCollegeId(collegeId);
    setSaveMessage("");

    try {
      const response = await fetch(`${API_URL}/saved-colleges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          college_id: collegeId,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setSaveMessage("Your login session expired. Please log in again.");
        return;
      }

      if (response.status === 409) {
        setSavedCollegeIds((previous) =>
          previous.includes(String(collegeId))
            ? previous
            : [...previous, String(collegeId)]
        );
        setSaveMessage("This college is already saved.");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save college.");
      }

      setSavedCollegeIds((previous) =>
        previous.includes(String(collegeId))
          ? previous
          : [...previous, String(collegeId)]
      );

      setSaveMessage("College saved successfully!");
    } catch (error) {
      console.error("Save college error:", error);
      setSaveMessage(error.message || "Unable to save college.");
    } finally {
      setSavingCollegeId(null);
    }
  };
  // 4. Reset filters
  const resetFilters = () => {
    setCity("");
    setArea("");
    setCourse("");
    setColleges([]);
    setError("");
    setAreasError("");
    setSearched(false);
    setSelectedDistrict("");
    setSelectedCollegeId("");
  };
  const filteredAvailableColleges = availableColleges.filter((item) => {
    if (
      selectedDistrict &&
      String(item.district_id) !== String(selectedDistrict)
    ) {
      return false;
    }

    if (city && String(item.city_id) !== String(city)) {
      return false;
    }

    if (area && String(item.area_id) !== String(area)) {
      return false;
    }

    return true;
  });

  // 5. Website UI

  if (selectedCollege) {
    return (
      <div className="app">
        <CollegeDetails
          college={selectedCollege}
          onBack={() => setSelectedCollege(null)}
        />
      </div>
    );
  }
  // Show the Admin Login page

  if (
    currentPage === "admin-login" ||
    (currentPage === "admin-dashboard" && !isAdminLoggedIn)
  ) {
    return (
      <div className="app">
        <AdminLogin
          onLogin={(token, admin) => {
            setAdminToken(token);
            setAdminDetails(admin);
            setIsAdminLoggedIn(true);
            setCurrentPage("admin-dashboard");
          }}
        />
      </div>
    );
  }
  // Show the Admin Dashboard only after the login flow

  // Show the Admin Dashboard only after successful login
  if (currentPage === "admin-dashboard" && isAdminLoggedIn) {
    return (
      <div className="app">
        <AdminDashboard
          admin={adminDetails}
          onManageColleges={() => setCurrentPage("manage-colleges")}
          onManageAreas={() => setCurrentPage("manage-areas")}
          onManageCourses={() => setCurrentPage("manage-courses")}
          onManageLocations={() => setCurrentPage("manage-locations")}
          onLogout={() => {
            setAdminToken("");
            setAdminDetails(null);
            setIsAdminLoggedIn(false);
            setCurrentPage("home");
          }}
        />
      </div>
    );
  }

  // Show the Manage Colleges page
  if (currentPage === "manage-colleges" && isAdminLoggedIn) {
    return (
      <div className="app">
        <ManageColleges
          token={adminToken}
          onBack={() => setCurrentPage("admin-dashboard")}
        />
      </div>
    );
  }

  // Show the Manage Locations page
  if (currentPage === "manage-locations" && isAdminLoggedIn) {
    return (
      <div className="app">
        <ManageLocations
          token={adminToken}
          onBack={() => setCurrentPage("admin-dashboard")}
        />
      </div>
    );
  }


  // Manage Courses page
  if (currentPage === "manage-courses" && isAdminLoggedIn) {
    return (
      <div className="app">
        <ManageCourses
          token={adminToken}
          onBack={() => setCurrentPage("admin-dashboard")}
        />
      </div>
    );
  }

  // Manage Areas page
  if (currentPage === "manage-areas" && isAdminLoggedIn) {
    return (
      <div className="app">
        <ManageAreas
          token={adminToken}
          onBack={() => setCurrentPage("admin-dashboard")}
        />
      </div>
    );
  }

  if (currentPage === "student-profile") {
    return (
      <StudentProfile
        onBack={() => setCurrentPage("student-dashboard")}
        onSessionExpired={() => handleStudentLogout(true)}
      />
    );
  }

  if (currentPage === "student-dashboard") {
    return (
      <StudentDashboard
        refreshKey={dashboardRefreshKey}
        onFindColleges={() => setCurrentPage("user-search")}
        onSavedColleges={() => setCurrentPage("saved-colleges")}
        onProfile={() => setCurrentPage("student-profile")}
        onSessionExpired={() => handleStudentLogout(true)}
        onLogout={() => handleStudentLogout(false)}
      />
    );
  }

  if (currentPage === "user-login") {
    return (
      <UserLogin
        onLogin={(data) => {
          sessionStorage.setItem("studentToken", data.token);
          sessionStorage.setItem(
            "student",
            JSON.stringify(data.student)
          );
          setCurrentPage("student-dashboard");
        }}
        onRegister={() => setCurrentPage("user-register")}
        onBack={() => setCurrentPage("home")}
      />
    );
  }

  if (currentPage === "user-register") {
    return (
      <UserRegister
        onRegister={() => setCurrentPage("user-login")}
        onLogin={() => setCurrentPage("user-login")}
        onBack={() => setCurrentPage("home")}
      />
    );
  }


  if (currentPage === "user-register") {
    return (
      <UserRegister
        onRegister={() => {
          setCurrentPage("user-login");
        }}
        onLogin={() => setCurrentPage("user-login")}
        onBack={() => setCurrentPage("home")}
      />
    );
  }


  if (currentPage === "saved-colleges") {
    return (
      <SavedColleges
        onBack={() => {
          setDashboardRefreshKey((previous) => previous + 1);
          setCurrentPage("student-dashboard");
        }}
        onViewCollege={(college) => setSelectedCollege(college)}
        onSessionExpired={() => {
          console.log("SESSION EXPIRED CALLBACK FIRED");
          handleStudentLogout(true);
        }}
      />
    );
  }

  if (currentPage === "home") {
    return (
      <Home
        onExplore={() => setCurrentPage("user-search")}
        onAdminLogin={() => setCurrentPage("admin-login")}
        onUserLogin={() => setCurrentPage("user-login")}
      />
    );
  }

  // Existing College Finder page
  return (
    <div className="app">


      <header className="app-header">
        <h1>Smart College Finder</h1>
        <p>Find the right college for your future.</p>
      </header>


      <main className="main-content">
        <section className="search-section">
          <h2>Find Your College</h2>
          <p>Select your preferences to discover colleges.</p>

          <form onSubmit={searchColleges}>
            <div className="filter-grid">

              {/* District dropdown */}
              <div className="form-group">
                <label htmlFor="district">District</label>

                <select
                  id="district"
                  value={selectedDistrict}
                  onChange={(event) => {
                    setSelectedDistrict(event.target.value);
                    setCity("");
                    setArea("");
                    setColleges([]);
                    setSearched(false);
                  }}
                >
                  <option value="">
                    {districtsLoading ? "Loading districts..." : "All Districts"}
                  </option>

                  {districts.map((item) => (
                    <option
                      key={item.district_id}
                      value={String(item.district_id)}
                    >
                      {item.district_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City dropdown */}
              <div className="form-group">
                <label htmlFor="city">City</label>

                <select
                  id="city"
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                    setArea("");
                    setColleges([]);
                    setSearched(false);
                  }}
                >
                  <option value="">
                    {citiesLoading ? "Loading cities..." : "All Cities"}
                  </option>

                  {cities
                    .filter(
                      (item) =>
                        !selectedDistrict ||
                        String(item.district_id) === selectedDistrict
                    )
                    .map((item) => (
                      <option
                        key={item.city_id}
                        value={String(item.city_id)}
                      >
                        {item.city_name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Area dropdown */}
              <div className="form-group">
                <label htmlFor="area">Area</label>

                <select
                  id="area"
                  value={area}
                  onChange={(event) => {
                    setArea(event.target.value);
                    setSelectedCollegeId("");
                    setColleges([]);
                    setSearched(false);
                  }}
                >
                  <option value="">
                    {areasLoading ? "Loading areas..." : "All Areas"}
                  </option>

                  {areas.map((item) => (
                    <option
                      key={item.area_id}
                      value={String(item.area_id)}
                    >
                      {item.area_name}
                    </option>
                  ))}
                </select>

                {areasError && (
                  <small className="error-message">
                    {areasError}
                  </small>
                )}
              </div>
              {/* College dropdown */}
              <div className="form-group">
                <label htmlFor="college">College</label>

                <select
                  id="college"
                  value={selectedCollegeId}
                  onChange={(event) => {
                    setSelectedCollegeId(event.target.value);
                    setColleges([]);
                    setSearched(false);
                  }}
                >
                  <option value="">
                    {collegesLoading ? "Loading colleges..." : "All Colleges"}
                  </option>

                  {filteredAvailableColleges.map((item) => (
                    <option
                      key={item.college_id}
                      value={String(item.college_id)}
                    >
                      {item.college_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course dropdown */}
              <div className="form-group">
                <label htmlFor="course">Course</label>

                <select
                  id="course"
                  value={course}
                  onChange={(event) => setCourse(event.target.value)}
                >
                  <option value="">All Courses</option>

                  {courses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="button-group">
              <button type="submit" disabled={searchLoading}>
                {searchLoading ? "Searching..." : "Search Colleges"}
              </button>

              <button
                type="button"
                className="reset-button"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>



            <button
              type="button"
              onClick={() => {
                const token = sessionStorage.getItem("studentToken");

                if (!token) {
                  setCurrentPage("user-login");
                  return;
                }

                setSelectedCollege(null);
                setCurrentPage("saved-colleges");
                console.log("Navigation requested:", "saved-colleges");
              }}
            >
              ♥ My Saved Colleges
            </button>



          </form>
        </section>

        {/* Error messages */}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {/* Search results */}
        <section className="results-section">
          {saveMessage && (
            <p role="status" aria-live="polite">
              {saveMessage}
            </p>
          )}
          <h2>College Results</h2>

          {searchLoading && <p>Finding colleges...</p>}

          {!searchLoading && searched && colleges.length === 0 && !error && (
            <p>No colleges found for your selected filters.</p>
          )}

          {!searchLoading && colleges.length > 0 && (
            <>
              <p>
                Found {colleges.length} college
                {colleges.length === 1 ? "" : "s"}.
              </p>

              <div className="form-group">
                <label htmlFor="sortBy">Sort colleges by</label>

                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="default">Default order</option>
                  <option value="name">College name (A–Z)</option>
                  <option value="rating">Rating (highest first)</option>
                </select>
              </div>
              <div className="college-grid">
                {sortedColleges.map((college) => (

                  <article
                    className="college-card"
                    key={college.college_id}
                    onClick={() => setSelectedCollege(college)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedCollege(college);
                      }
                    }}
                  >
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

                    <button
                      type="button"
                      className="save-college-button"
                      disabled={savingCollegeId === college.college_id}
                      onClick={(event) => {
                        event.stopPropagation();
                        saveCollege(college.college_id);
                      }}
                    >
                      {savingCollegeId === college.college_id
                        ? "Saving..."
                        : savedCollegeIds.includes(String(college.college_id))
                          ? "♥ Saved"
                          : "♡ Save College"}
                    </button>


                    {college.address && (
                      <p>
                        <strong>Address:</strong> {college.address}
                      </p>
                    )}

                    {college.phone && (
                      <p>
                        <strong>Phone:</strong> {college.phone}
                      </p>
                    )}


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

                    {college.courses && (
                      <p>
                        <strong>Courses:</strong> {college.courses}
                      </p>
                    )}

                    {college.rating != null && (
                      <p className="college-rating">
                        ⭐ {Number(college.rating).toFixed(1)} / 5
                      </p>
                    )}

                    {college.website && (
                      <p>
                        <a
                          href={college.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                        >
                          Visit Official Website
                        </a>
                      </p>
                    )}
                  </article>

                ))}
              </div>
            </>
          )}

          {!searched && !searchLoading && (
            <p>Choose your filters and click Search Colleges.</p>
          )}
        </section>
      </main>



      <footer className="app-footer">
        <p>Smart College Finder</p>
        <p>Find the right college for your future.</p>

        <button
          type="button"
          className="logout-button"
          onClick={() => setCurrentPage("home")}
        >
          Back to Home
        </button>
      </footer>


    </div>
  );
}

export default App;