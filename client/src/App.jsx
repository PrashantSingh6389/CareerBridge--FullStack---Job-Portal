import { useEffect, useMemo, useState } from "react";
import {
  Search, MapPin, BriefcaseBusiness, Clock3,
  ArrowUpRight, Code2, Database, Palette,
  Megaphone, BarChart3, Heart, Menu, X,
  GraduationCap, ShieldCheck
} from "lucide-react";
import "./App.css";

const initialJobs = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "TechNova",
    location: "Remote",
    type: "Internship",
    category: "Technology",
    salary: "₹12,000 / month",
    duration: "3 months",
    icon: Code2,
    featured: true,
  },
  {
    id: 2,
    title: "Data Analyst Intern",
    company: "DataSphere",
    location: "Noida",
    type: "Internship",
    category: "Data Science",
    salary: "₹15,000 / month",
    duration: "6 months",
    icon: Database,
    featured: false,
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "PixelWorks",
    location: "Remote",
    type: "Full-time",
    category: "Design",
    salary: "₹4–6 LPA",
    duration: "Full-time",
    icon: Palette,
    featured: true,
  },
  {
    id: 4,
    title: "Digital Marketing Intern",
    company: "GrowthLab",
    location: "Lucknow",
    type: "Internship",
    category: "Marketing",
    salary: "₹8,000 / month",
    duration: "3 months",
    icon: Megaphone,
    featured: false,
  },
  {
    id: 5,
    title: "Junior Business Analyst",
    company: "Insight Co.",
    location: "Hybrid",
    type: "Full-time",
    category: "Business",
    salary: "₹5–7 LPA",
    duration: "Full-time",
    icon: BarChart3,
    featured: false,
  },
  {
    id: 6,
    title: "Backend Developer Intern",
    company: "CloudPeak",
    location: "Remote",
    type: "Internship",
    category: "Technology",
    salary: "₹14,000 / month",
    duration: "4 months",
    icon: Code2,
    featured: false,
  },
];

const categories = [
  { name: "Technology", count: "Development roles", icon: Code2 },
  { name: "Data Science", count: "Data & analytics", icon: Database },
  { name: "Design", count: "Creative careers", icon: Palette },
  { name: "Marketing", count: "Growth & content", icon: Megaphone },
];

function App() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [activeCategory, setActiveCategory] = useState("");
  const [saved, setSaved] = useState([]);
  const [applied, setApplied] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
   const [authMode, setAuthMode] = useState("");
const [currentUser, setCurrentUser] = useState(
  () => JSON.parse(localStorage.getItem("cb_user") || "null")
);
const [token, setToken] = useState(() => localStorage.getItem("cb_token") || "");
const [showApplications, setShowApplications] = useState(false);
const [myApplications, setMyApplications] = useState([]);
const [authForm, setAuthForm] = useState({
  name: "",
  email: "",
  password: ""
});
const [authError, setAuthError] = useState("");
const [authLoading, setAuthLoading] = useState(false);
  const jobs = useMemo(() => initialJobs.filter((job) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query ||
      `${job.title} ${job.company} ${job.category}`
        .toLowerCase().includes(query);
    const matchesLocation = !location.trim() ||
      job.location.toLowerCase().includes(location.trim().toLowerCase());
    const matchesType = activeType === "All" || job.type === activeType;
    const matchesCategory = !activeCategory ||
      job.category === activeCategory;
    const matchesSaved = !showSaved || saved.includes(job.id);

    return matchesSearch && matchesLocation &&
      matchesType && matchesCategory && matchesSaved;
  }), [search, location, activeType, activeCategory, showSaved, saved]);

  const scrollToJobs = () => {
    document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  const resetFilters = () => {
    setSearch("");
    setLocation("");
    setActiveType("All");
    setActiveCategory("");
    setShowSaved(false);
  };

 const applyToJob = async (job) => {
  if (!token) {
  setSelectedJob(null);
  setAuthMode("login");
  return;
}
  try {
    const response = await fetch("http://localhost:5000/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
       Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Application failed");
    }

    setApplied((current) => [...current, job.id]);
    setSelectedJob(null);

    alert("Application submitted successfully!");
  } catch (error) {
    alert(error.message || "Could not submit application.");
  }
};
  const submitAuth = async (e) => {
  e.preventDefault();
  setAuthError("");
  setAuthLoading(true);

  try {
    const response = await fetch(
      `http://localhost:5000/api/auth/${authMode}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Authentication failed");
    }

    localStorage.setItem("cb_token", data.token);
    localStorage.setItem("cb_user", JSON.stringify(data.user));

    setToken(data.token);
    setCurrentUser(data.user);
    setAuthMode("");
    setAuthForm({ name: "", email: "", password: "" });
  } catch (error) {
    setAuthError(error.message);
  } finally {
    setAuthLoading(false);
  }
};

const loadMyApplications = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/applications/my",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not load applications");
    }

    setMyApplications(data.applications);
    setShowApplications(true);
  } catch (error) {
    alert(error.message);
  }
};
  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home" aria-label="CareerBridge home">
          <span className="brand-icon"><BriefcaseBusiness size={21} /></span>
          <span>Career<span className="brand-highlight">Bridge</span></span>
        </a>

        <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle navigation">
          {mobileMenu ? <X /> : <Menu />}
        </button>

        <nav className={mobileMenu ? "nav-links nav-open" : "nav-links"}>
          <a href="#home" onClick={() => setMobileMenu(false)}>Home</a>
          <a href="#categories" onClick={() => setMobileMenu(false)}>Categories</a>
          <a href="#jobs" onClick={() => { setActiveType("All"); setMobileMenu(false); }}>Find jobs</a>
          <a href="#jobs" onClick={() => { setActiveType("Internship"); setMobileMenu(false); }}>Internships</a>
        </nav>

       <div className="nav-actions">
  <button
    className="saved-nav"
    onClick={() => setShowSaved(!showSaved)}
  >
    Saved ({saved.length})
  </button>

  {currentUser ? (
    <>
      <button
        className="btn btn-small"
        onClick={loadMyApplications}
      >
        My Applications
      </button>

      <span>{currentUser.name}</span>

      <button
        className="btn btn-small"
        onClick={() => {
          localStorage.removeItem("cb_token");
          localStorage.removeItem("cb_user");
          setToken("");
          setCurrentUser(null);
          setMyApplications([]);
        }}
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <button
        className="btn btn-small"
        onClick={() => setAuthMode("login")}
      >
        Login
      </button>

      <button
        className="btn btn-small"
        onClick={() => setAuthMode("signup")}
      >
        Sign Up
      </button>
    </>
  )}

  <a className="btn btn-small" href="#jobs">
    Explore jobs <ArrowUpRight size={16} />
  </a>
</div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow"><span className="live-dot" /> YOUR NEXT OPPORTUNITY STARTS HERE</div>
            <h1>Find work that<br />moves you <span>forward.</span></h1>
            <p className="hero-description">
              Explore internships and jobs, discover your strengths,
              and take the next step in your career with confidence.
            </p>

            <form className="search-box" onSubmit={(e) => {
              e.preventDefault();
              setActiveCategory("");
              setShowSaved(false);
              scrollToJobs();
            }}>
              <label className="search-field">
                <Search size={20} />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Job title, skill or company" />
              </label>
              <label className="search-field location-field">
                <MapPin size={20} />
                <input value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or remote" />
              </label>
              <button className="btn search-button" type="submit">Search jobs</button>
            </form>

            <div className="hero-trust">
              <ShieldCheck size={17} />
              <span>Explore opportunities and build your future</span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="visual-center">
              <GraduationCap size={95} strokeWidth={1.3} />
            </div>
            <div className="visual-card visual-card-top">
              <span className="mini-icon"><BriefcaseBusiness size={19} /></span>
              <div><strong>Career opportunities</strong><small>Find your next step</small></div>
            </div>
            <div className="visual-card visual-card-bottom">
              <span className="success-icon">✓</span>
              <div><strong>Ready to grow?</strong><small>Your journey starts today</small></div>
            </div>
          </div>
        </section>

        <section className="categories section-wrap" id="categories">
          <div className="section-header">
            <div><span className="eyebrow">EXPLORE BY INTEREST</span>
              <h2>Find your field</h2></div>
            <button className="text-button" onClick={() => {
              setActiveCategory("");
              scrollToJobs();
            }}>View all jobs <ArrowUpRight size={17} /></button>
          </div>

          <div className="category-grid">
            {categories.map(({ name, count, icon: Icon }) => (
              <button key={name}
                className={activeCategory === name ? "category-card category-active" : "category-card"}
                onClick={() => {
                  setActiveCategory(activeCategory === name ? "" : name);
                  setActiveType("All");
                  setShowSaved(false);
                  scrollToJobs();
                }}>
                <span className="category-icon"><Icon size={23} /></span>
                <span className="category-copy"><strong>{name}</strong><small>{count}</small></span>
                <ArrowUpRight className="category-arrow" size={18} />
              </button>
            ))}
          </div>
        </section>

        <section className="jobs-section section-wrap" id="jobs">
          <div className="section-header jobs-heading">
            <div><span className="eyebrow">HANDPICKED FOR YOUR NEXT STEP</span>
              <h2>{showSaved ? "Your saved jobs" : "Featured opportunities"}</h2>
              <p>Explore roles that match your interests and ambitions.</p></div>
            <span className="results-count">{jobs.length} opportunities</span>
          </div>

          <div className="job-filters">
            {["All", "Internship", "Full-time"].map((type) => (
              <button key={type}
                className={activeType === type ? "filter active" : "filter"}
                onClick={() => setActiveType(type)}>{type}</button>
            ))}
            {activeCategory && <button className="filter category-filter"
              onClick={() => setActiveCategory("")}>{activeCategory} ×</button>}
            {showSaved && <button className="filter category-filter"
              onClick={() => setShowSaved(false)}>Saved jobs ×</button>}
            <button className="clear-filters" onClick={resetFilters}>Clear filters</button>
          </div>

          <div className="job-grid">
            {jobs.map((job) => {
              const Icon = job.icon;
              return (
                <article className="job-card" key={job.id}>
                  <div className="job-card-top">
                    <span className="job-icon"><Icon size={24} /></span>
                    <button className={saved.includes(job.id) ? "save-button is-saved" : "save-button"}
                      onClick={() => setSaved((current) =>
                        current.includes(job.id)
                          ? current.filter((id) => id !== job.id)
                          : [...current, job.id])}
                      aria-label={saved.includes(job.id) ? "Unsave job" : "Save job"}>
                      <Heart size={19} fill={saved.includes(job.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="job-badges">
                    <span className="job-type">{job.type}</span>
                    {job.featured && <span className="featured-badge">Featured</span>}
                  </div>
                  <h3>{job.title}</h3>
                  <p className="company">{job.company}</p>
                  <div className="job-meta"><span><MapPin size={15} />{job.location}</span>
                    <span><Clock3 size={15} />{job.duration}</span></div>
                  <div className="job-card-bottom">
                    <div><strong>{job.salary}</strong><small>{job.category}</small></div>
                    <button className="view-job" onClick={() => setSelectedJob(job)}
                      aria-label={`View ${job.title}`}><ArrowUpRight size={20} /></button>
                  </div>
                </article>
              );
            })}
          </div>

          {jobs.length === 0 && <div className="empty-state">
            <Search size={30} /><h3>No matching opportunities</h3>
            <p>Try a different keyword or clear your filters.</p>
            <button className="btn" onClick={resetFilters}>Clear filters</button>
          </div>}
        </section>

        <section className="cta">
          <div><span className="eyebrow">YOUR FUTURE IS WAITING</span>
            <h2>Make your next move count.</h2>
            <p>Discover an opportunity to learn, contribute, and grow.</p></div>
          <button className="btn cta-button" onClick={() => {
            resetFilters();
            scrollToJobs();
          }}>Explore opportunities <ArrowUpRight size={18} /></button>
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href="#home"><span className="brand-icon"><BriefcaseBusiness size={20} /></span>
          <span>Career<span className="brand-highlight">Bridge</span></span></a>
        <p>Connecting ambition with opportunity.</p>
        <span>© 2026 CareerBridge. Portfolio project.</span>
      </footer>

      {selectedJob && <div className="modal-backdrop" onClick={() => setSelectedJob(null)}>
        <section className="job-modal" role="dialog" aria-modal="true"
          aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setSelectedJob(null)}
            aria-label="Close details"><X size={20} /></button>
          <span className="job-icon modal-job-icon"><selectedJob.icon size={28} /></span>
          <span className="eyebrow">OPPORTUNITY DETAILS</span>
          <h2 id="modal-title">{selectedJob.title}</h2>
          <p className="company">{selectedJob.company}</p>
          <div className="modal-meta">
            <span><MapPin size={16} /> {selectedJob.location}</span>
            <span><Clock3 size={16} /> {selectedJob.duration}</span>
          </div>
          <h3>About this opportunity</h3>
          <p>This sample listing demonstrates how a job detail view will look. Add a backend to publish verified employer descriptions and real application requirements.</p>
          <div className="modal-salary">{selectedJob.salary}</div>
          <button className="btn modal-apply" disabled={applied.includes(selectedJob.id)}
            onClick={() => applyToJob(selectedJob)}>
            {applied.includes(selectedJob.id) ? "Applied" : "Apply Now"} <ArrowUpRight size={17} />
          </button>
        </section>
      </div>}
      {authMode && (
  <div className="modal-backdrop">
    <div className="job-modal auth-modal">
      <button
        className="modal-close"
        onClick={() => setAuthMode("")}
      >
        <X />
      </button>

      <h2>{authMode === "signup" ? "Create Account" : "Welcome Back"}</h2>
      <p>
        {authMode === "signup"
          ? "Join CareerBridge today."
          : "Login to manage your applications."}
      </p>

      <form className="auth-form" onSubmit={submitAuth}>
        {authMode === "signup" && (
          <input
            type="text"
            placeholder="Full Name"
            value={authForm.name}
            onChange={(e) =>
              setAuthForm({ ...authForm, name: e.target.value })
            }
            required
          />
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={authForm.email}
          onChange={(e) =>
            setAuthForm({ ...authForm, email: e.target.value })
          }
          required
        />

        <input
          type="password"
          placeholder="Password (minimum 8 characters)"
          minLength={8}
          value={authForm.password}
          onChange={(e) =>
            setAuthForm({ ...authForm, password: e.target.value })
          }
          required
        />

        {authError && <p className="auth-error">{authError}</p>}

        <button className="btn btn-primary" type="submit" disabled={authLoading}>
          {authLoading
            ? "Please wait..."
            : authMode === "signup"
            ? "Create Account"
            : "Login"}
        </button>
      </form>

      <p>
        {authMode === "signup"
          ? "Already have an account?"
          : "Don't have an account?"}
        <button
          className="auth-switch"
          onClick={() => {
            setAuthMode(authMode === "signup" ? "login" : "signup");
            setAuthError("");
          }}
        >
          {authMode === "signup" ? " Login" : " Sign Up"}
        </button>
      </p>
    </div>
  </div>
)}

{showApplications && (
  <div className="modal-backdrop">
    <div className="job-modal applications-modal">
      <button
        className="modal-close"
        onClick={() => setShowApplications(false)}
      >
        <X />
      </button>

      <h2>My Applications</h2>

      {myApplications.length === 0 ? (
        <p>You haven't applied for any jobs yet.</p>
      ) : (
        myApplications.map((application) => (
          <div className="application-row" key={application._id}>
            <h3>{application.jobTitle}</h3>
            <p>{application.company}</p>
            <p>Status: {application.status}</p>
            <p>
              Applied on:{" "}
              {new Date(
                application.appliedAt || application.createdAt
              ).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  </div>
)}
    </div>
  );
}

export default App;