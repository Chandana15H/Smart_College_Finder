import "./AdminDashboard.css";
function AdminDashboard({
    admin,
    onLogout,
    onManageColleges,
    onManageAreas,
    onManageCourses,
    onManageLocations
}) {
    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            <p>
                Welcome, {admin?.username || "Admin"}!
            </p>

            <p>
                Manage colleges, courses, and locations for Smart College Finder.
            </p>

            <div className="dashboard-cards">
                <div className="dashboard-card">
                    <h3>Manage Colleges</h3>
                    <p>Add, view, edit, and delete college records.</p>
                    <button type="button" onClick={onManageColleges}>
                        Manage Colleges
                    </button>
                </div>

                <div className="dashboard-card">
                    <h3>Manage Courses</h3>
                    <p>Manage courses offered by colleges.</p>
                    <button
                        type="button"
                        onClick={onManageCourses}
                    >
                        Manage Courses
                    </button>
                </div>

                <div className="dashboard-card">
                    <h3>Manage Locations</h3>
                    <p>Manage districts, cities, and areas.</p>
                    <button type="button" onClick={onManageLocations}>
                        Manage Locations
                    </button>
                </div>
            </div>

            <div className="dashboard-card">
                <h3>Manage Areas</h3>
                <p>View and manage areas for each city.</p>
                <button type="button" onClick={onManageAreas}>
                    Manage Areas
                </button>
            </div>


            <button type="button" onClick={onLogout}>
                Logout
            </button>
        </div>
    );
}

export default AdminDashboard;
