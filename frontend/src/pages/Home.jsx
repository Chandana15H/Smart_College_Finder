
import "./Home.css";

function Home({
    onExplore,
    onAdminLogin,
    onUserLogin,
}) {
    return (
        <div className="home-page">
            <nav className="home-navbar">
                <a href="#home" className="home-logo">
                    <span className="logo-icon">🎓</span>
                    Smart College Finder
                </a>

                <div className="home-nav-links">
                    <a href="#home">Home</a>
                    <a href="#about">About Us</a>
                    <button onClick={onExplore}>Explore Colleges</button>
                    <button
                        className="nav-login-button"
                        onClick={onUserLogin}
                    >
                        Login
                    </button>
                </div>
            </nav>

            <main>
                <section className="home-hero" id="home">
                    <div className="hero-content">
                        <span className="hero-label">
                            YOUR FUTURE STARTS HERE
                        </span>

                        <h1>
                            Find the Right College
                            <span> for Your Future.</span>
                        </h1>

                        <p>
                            Discover colleges across Karnataka by district,
                            city, area and course. Explore your options and
                            take the next step towards your career.
                        </p>

                        <div className="hero-buttons">
                            <button
                                className="primary-home-button"
                                onClick={onExplore}
                            >
                                Explore Colleges →
                            </button>

                            <button
                                className="secondary-home-button"
                                onClick={onUserLogin}
                            >
                                Login to Continue
                            </button>
                        </div>

                        <div className="hero-features">
                            <span>✓ Location-based search</span>
                            <span>✓ Course discovery</span>
                            <span>✓ College details</span>
                        </div>
                    </div>

                    <div className="hero-illustration">
                        <div className="hero-icon">🎓</div>
                        <h2>Your Journey. Your Choice.</h2>
                        <p>Explore possibilities. Plan your future.</p>
                        <div className="hero-decoration decoration-one" />
                        <div className="hero-decoration decoration-two" />
                    </div>
                </section>

                <section className="home-about" id="about">
                    <span className="section-label">ABOUT OUR PROJECT</span>
                    <h2>Making College Discovery Easier</h2>

                    <p className="about-description">
                        Smart College Finder is a college discovery
                        platform designed to help students explore
                        colleges in Karnataka based on their location
                        and preferred courses.
                    </p>

                    <div className="about-cards">
                        <article className="about-card">
                            <span>📍</span>
                            <h3>Location-Based Search</h3>
                            <p>
                                Explore colleges by district, city and area.
                            </p>
                        </article>

                        <article className="about-card">
                            <span>📚</span>
                            <h3>Course Discovery</h3>
                            <p>
                                Find colleges offering your preferred courses.
                            </p>
                        </article>

                        <article className="about-card">
                            <span>ℹ️</span>
                            <h3>College Information</h3>
                            <p>
                                View available contact information and
                                official college websites.
                            </p>
                        </article>
                    </div>
                </section>

                <section className="home-login-section">
                    <h2>Choose Your Portal</h2>
                    <p>Select the login option you need.</p>

                    <div className="login-cards">
                        <article className="login-card">
                            <span className="login-card-icon">🛡️</span>
                            <h3>Admin Portal</h3>
                            <p>
                                Manage college information, areas and courses.
                            </p>
                            <button onClick={onAdminLogin}>
                                Admin Login →
                            </button>
                        </article>

                        <article className="login-card">
                            <span className="login-card-icon">👤</span>
                            <h3>Student Portal</h3>
                            <p>
                                Sign in to access the college discovery portal.
                            </p>
                            <button onClick={onUserLogin}>
                                User Login →
                            </button>
                        </article>
                    </div>
                </section>
            </main>

            <footer className="home-footer">
                <h3>Smart College Finder</h3>
                <p>
                    Helping students discover opportunities across Karnataka.
                </p>
                <p>College-Finder Academic Project</p>
            </footer>
        </div>
    );
}

export default Home;
