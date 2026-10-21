
function AdminDashboard({ admin, onLogout, onManageColleges }) {
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
                    <button type="button">Manage Courses</button>
                </div>

                <div className="dashboard-card">
                    <h3>Manage Locations</h3>
                    <p>Manage districts, cities, and areas.</p>
                    <button type="button">Manage Locations</button>
                </div>
            </div>

            <button type="button" onClick={onLogout}>
                Logout
            </button>
        </div>
    );
}

export default AdminDashboard;
