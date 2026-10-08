import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import Navbar from "../../components/navbar/Navbar";
import PageContainer from "../../components/common/PageContainer";

function Jobs() {

    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [jobType, setJobType] = useState("ALL");


    // =========================================================
    // LOAD JOBS
    // =========================================================

    useEffect(() => {

        let cancelled = false;

        const loadJobs = async () => {

            try {

                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await api.get(
                    "/jobs",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log("Jobs response:", response.data);

                if (!cancelled) {

                    setJobs(
                        Array.isArray(response.data)
                            ? response.data
                            : []
                    );

                }

            } catch (err) {

                console.error(
                    "Failed to load jobs:",
                    err
                );

                if (cancelled) {
                    return;
                }

                if (err.response?.status === 401) {

                    localStorage.removeItem("token");
                    localStorage.removeItem("role");

                    navigate("/login");

                    return;
                }

                if (err.response?.status === 403) {

                    setError(
                        "You are not authorized to view jobs."
                    );

                    return;
                }

                setError(
                    err.response?.data?.message ||
                    err.response?.data ||
                    "Failed to load jobs."
                );

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }
        };

        loadJobs();

        return () => {
            cancelled = true;
        };

    }, [navigate]);


    // =========================================================
    // SEARCH + FILTER
    // =========================================================

    const filteredJobs = jobs.filter((job) => {

        const searchText =
            search.trim().toLowerCase();

        const matchesSearch =
            !searchText ||
            job.title?.toLowerCase().includes(searchText) ||
            job.companyName?.toLowerCase().includes(searchText) ||
            job.location?.toLowerCase().includes(searchText);

        const matchesType =
            jobType === "ALL" ||
            job.jobType === jobType;

        return matchesSearch && matchesType;
    });


    // =========================================================
    // FORMAT JOB TYPE
    // =========================================================

    const formatJobType = (type) => {

        if (!type) {
            return "Not specified";
        }

        return type
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                (char) => char.toUpperCase()
            );
    };


    // =========================================================
    // FORMAT SALARY
    // =========================================================

    const formatSalary = (salary) => {

        if (
            salary === null ||
            salary === undefined ||
            salary === ""
        ) {
            return "Not specified";
        }

        const numericSalary = Number(salary);

        if (Number.isNaN(numericSalary)) {
            return "Not specified";
        }

        return `₹${numericSalary.toLocaleString("en-IN")}`;
    };


    // =========================================================
    // VIEW JOB
    // =========================================================

    const handleViewJob = (jobId) => {

        if (!jobId) {
            return;
        }

        navigate(`/jobs/${jobId}`);
    };


    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const clearFilters = () => {
        setSearch("");
        setJobType("ALL");
    };


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div style={styles.page}>

            {/* =================================================
                PREMIUM BACKGROUND EFFECT
            ================================================= */}

            <div style={styles.backgroundGlowOne}></div>
            <div style={styles.backgroundGlowTwo}></div>


            {/* =================================================
                COMMON NAVBAR
            ================================================= */}

            <Navbar role="CANDIDATE" />


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <PageContainer>

                <div style={styles.contentWrapper}>

                    {/* =================================================
                        PAGE HERO
                    ================================================= */}

                    <section style={styles.heroSection}>

                        <div style={styles.heroTextWrapper}>

                            <div style={styles.eyebrow}>

                                <span style={styles.eyebrowDot}></span>

                                CAREER OPPORTUNITIES

                            </div>


                            <h1 style={styles.heading}>

                                Find Your Next{" "}

                                <span style={styles.gradientText}>
                                    Opportunity
                                </span>

                            </h1>


                            <p style={styles.subtitle}>

                                Explore opportunities that match
                                your skills, experience and career goals.

                            </p>

                        </div>


                        <div style={styles.jobCountContainer}>

                            <div style={styles.jobCountIcon}>
                                ✦
                            </div>

                            <div>

                                <span style={styles.jobCountNumber}>

                                    {!loading && !error
                                        ? filteredJobs.length
                                        : "--"}

                                </span>

                                <span style={styles.jobCountLabel}>

                                    {filteredJobs.length === 1
                                        ? "Opportunity"
                                        : "Opportunities"}

                                </span>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        SEARCH + FILTER CARD
                    ================================================= */}

                    <section style={styles.filterCard}>

                        <div style={styles.filterTopRow}>

                            <div style={styles.searchWrapper}>

                                <span style={styles.searchIcon}>
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search jobs, companies or locations..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    style={styles.searchInput}
                                />

                                {search && (

                                    <button
                                        type="button"
                                        style={styles.searchClear}
                                        onClick={() =>
                                            setSearch("")
                                        }
                                        aria-label="Clear search"
                                    >
                                        ×
                                    </button>

                                )}

                            </div>


                            <div style={styles.filterDivider}></div>


                            <div style={styles.selectWrapper}>

                                <span style={styles.selectIcon}>
                                    ◈
                                </span>

                                <select
                                    value={jobType}
                                    onChange={(event) =>
                                        setJobType(event.target.value)
                                    }
                                    style={styles.select}
                                >

                                    <option value="ALL">
                                        All Job Types
                                    </option>

                                    <option value="FULL_TIME">
                                        Full Time
                                    </option>

                                    <option value="PART_TIME">
                                        Part Time
                                    </option>

                                    <option value="INTERNSHIP">
                                        Internship
                                    </option>

                                    <option value="CONTRACT">
                                        Contract
                                    </option>

                                    <option value="FREELANCE">
                                        Freelance
                                    </option>

                                </select>

                            </div>


                            {(search || jobType !== "ALL") && (

                                <button
                                    type="button"
                                    style={styles.clearFilterButton}
                                    onClick={clearFilters}
                                >
                                    Reset
                                </button>

                            )}

                        </div>

                    </section>


                    {/* =================================================
                        RESULT INFORMATION
                    ================================================= */}

                    {!loading && !error && (

                        <div style={styles.resultBar}>

                            <div style={styles.resultLeft}>

                                <span style={styles.resultIndicator}></span>

                                <span>

                                    Showing{" "}

                                    <strong style={styles.resultStrong}>
                                        {filteredJobs.length}
                                    </strong>{" "}

                                    {filteredJobs.length === 1
                                        ? "opportunity"
                                        : "opportunities"}

                                </span>

                            </div>


                            {(search || jobType !== "ALL") && (

                                <div style={styles.filterApplied}>

                                    <span>
                                        Filtered results
                                    </span>

                                    <button
                                        type="button"
                                        style={styles.inlineClear}
                                        onClick={clearFilters}
                                    >
                                        Clear
                                    </button>

                                </div>

                            )}

                        </div>

                    )}


                    {/* =================================================
                        LOADING STATE
                    ================================================= */}

                    {loading && (

                        <div style={styles.stateCard}>

                            <div style={styles.loadingOrb}>

                                <div style={styles.loadingRing}></div>

                                <span>✦</span>

                            </div>

                            <h3 style={styles.stateTitle}>
                                Finding opportunities
                            </h3>

                            <p style={styles.stateText}>
                                We're loading the latest roles for you.
                            </p>

                        </div>

                    )}


                    {/* =================================================
                        ERROR STATE
                    ================================================= */}

                    {!loading && error && (

                        <div style={styles.errorCard}>

                            <div style={styles.errorIconWrapper}>
                                !
                            </div>

                            <h3 style={styles.stateTitle}>
                                Unable to Load Jobs
                            </h3>

                            <p style={styles.errorText}>
                                {error}
                            </p>

                            <button
                                type="button"
                                style={styles.primaryButton}
                                onClick={() =>
                                    window.location.reload()
                                }
                            >
                                Try Again
                            </button>

                        </div>

                    )}


                    {/* =================================================
                        EMPTY STATE
                    ================================================= */}

                    {!loading &&
                        !error &&
                        filteredJobs.length === 0 && (

                            <div style={styles.emptyCard}>

                                <div style={styles.emptyIconWrapper}>

                                    <span>
                                        ⌕
                                    </span>

                                </div>

                                <h3 style={styles.emptyTitle}>
                                    No Jobs Found
                                </h3>

                                <p style={styles.emptyText}>

                                    {search || jobType !== "ALL"
                                        ? "No jobs match your current search or filter."
                                        : "There are currently no available job opportunities."}

                                </p>


                                {(search || jobType !== "ALL") && (

                                    <button
                                        type="button"
                                        style={styles.secondaryButton}
                                        onClick={clearFilters}
                                    >
                                        Clear Filters
                                    </button>

                                )}

                            </div>

                        )}


                    {/* =================================================
                        JOB CARDS
                    ================================================= */}

                    {!loading &&
                        !error &&
                        filteredJobs.length > 0 && (

                            <div style={styles.jobsGrid}>

                                {filteredJobs.map((job) => (

                                    <article
                                        key={job.id}
                                        style={styles.jobCard}
                                    >

                                        {/* =========================
                                            CARD TOP ACCENT
                                        ========================= */}

                                        <div style={styles.cardAccent}></div>


                                        {/* =========================
                                            CARD HEADER
                                        ========================= */}

                                        <div style={styles.cardHeader}>

                                            <div
                                                style={
                                                    styles.jobHeaderInfo
                                                }
                                            >

                                                <div style={styles.companyBadge}>

                                                    <span>
                                                        {job.companyName
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "H"}
                                                    </span>

                                                </div>


                                                <div style={styles.titleArea}>

                                                    <h2
                                                        style={
                                                            styles.jobTitle
                                                        }
                                                    >
                                                        {job.title ||
                                                            "Untitled Job"}
                                                    </h2>

                                                    <p
                                                        style={
                                                            styles.company
                                                        }
                                                    >
                                                        {job.companyName ||
                                                            "Company not specified"}
                                                    </p>

                                                </div>

                                            </div>


                                            <span
                                                style={{
                                                    ...styles.statusBadge,

                                                    backgroundColor:
                                                        job.status === "OPEN"
                                                            ? "rgba(34, 197, 94, 0.10)"
                                                            : "rgba(239, 68, 68, 0.10)",

                                                    color:
                                                        job.status === "OPEN"
                                                            ? "#86efac"
                                                            : "#fca5a5",

                                                    borderColor:
                                                        job.status === "OPEN"
                                                            ? "rgba(34, 197, 94, 0.22)"
                                                            : "rgba(239, 68, 68, 0.22)"
                                                }}
                                            >

                                                <span
                                                    style={{
                                                        ...styles.statusDot,

                                                        backgroundColor:
                                                            job.status === "OPEN"
                                                                ? "#22c55e"
                                                                : "#ef4444"
                                                    }}
                                                ></span>

                                                {job.status ||
                                                    "UNKNOWN"}

                                            </span>

                                        </div>


                                        {/* =========================
                                            JOB INFORMATION
                                        ========================= */}

                                        <div style={styles.infoGrid}>

                                            <div style={styles.infoItem}>

                                                <div style={styles.infoIconBox}>
                                                    ◉
                                                </div>

                                                <div>

                                                    <span
                                                        style={
                                                            styles.infoLabel
                                                        }
                                                    >
                                                        Location
                                                    </span>

                                                    <span
                                                        style={
                                                            styles.infoValue
                                                        }
                                                    >
                                                        {job.location ||
                                                            "Not specified"}
                                                    </span>

                                                </div>

                                            </div>


                                            <div style={styles.infoItem}>

                                                <div style={styles.infoIconBox}>
                                                    ◇
                                                </div>

                                                <div>

                                                    <span
                                                        style={
                                                            styles.infoLabel
                                                        }
                                                    >
                                                        Job Type
                                                    </span>

                                                    <span
                                                        style={
                                                            styles.infoValue
                                                        }
                                                    >
                                                        {formatJobType(
                                                            job.jobType
                                                        )}
                                                    </span>

                                                </div>

                                            </div>


                                            <div style={styles.infoItem}>

                                                <div style={styles.infoIconBox}>
                                                    ₹
                                                </div>

                                                <div>

                                                    <span
                                                        style={
                                                            styles.infoLabel
                                                        }
                                                    >
                                                        Salary
                                                    </span>

                                                    <span
                                                        style={
                                                            styles.infoValue
                                                        }
                                                    >
                                                        {formatSalary(
                                                            job.salary
                                                        )}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>


                                        {/* =========================
                                            DESCRIPTION
                                        ========================= */}

                                        <p style={styles.description}>

                                            {job.description
                                                ? job.description.length > 180
                                                    ? `${job.description.substring(
                                                        0,
                                                        180
                                                    )}...`
                                                    : job.description
                                                : "No description provided."}

                                        </p>


                                        {/* =========================
                                            HR INFORMATION
                                        ========================= */}

                                        {job.hr && (

                                            <div style={styles.hrInfo}>

                                                <span style={styles.hrAvatar}>
                                                    {job.hr.firstName
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "H"}
                                                </span>

                                                <div>

                                                    <span
                                                        style={
                                                            styles.postedLabel
                                                        }
                                                    >
                                                        Posted by
                                                    </span>

                                                    <strong
                                                        style={
                                                            styles.hrName
                                                        }
                                                    >

                                                        {job.hr.firstName ||
                                                            ""}{" "}

                                                        {job.hr.lastName ||
                                                            ""}

                                                    </strong>

                                                </div>

                                            </div>

                                        )}


                                        {/* =========================
                                            ACTION
                                        ========================= */}

                                        <button
                                            type="button"
                                            style={styles.detailsButton}
                                            onClick={() =>
                                                handleViewJob(
                                                    job.id
                                                )
                                            }
                                        >

                                            <span>
                                                View Details
                                            </span>

                                            <span
                                                style={
                                                    styles.arrowCircle
                                                }
                                            >
                                                →
                                            </span>

                                        </button>

                                    </article>

                                ))}

                            </div>

                        )}

                </div>

            </PageContainer>

        </div>
    );
}


/* =============================================================
   PREMIUM HIREAI STYLES
============================================================= */

const styles = {

    /* =========================================================
       PAGE
    ========================================================= */

    page: {
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background:
            "linear-gradient(135deg, #050816 0%, #0a1020 45%, #0b1120 100%)",
        color: "#f8fafc",
        fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },


    contentWrapper: {
        position: "relative",
        zIndex: 2,
        paddingBottom: "60px"
    },


    /* =========================================================
       BACKGROUND GLOWS
    ========================================================= */

    backgroundGlowOne: {
        position: "fixed",
        width: "420px",
        height: "420px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)",
        top: "70px",
        right: "-150px",
        pointerEvents: "none",
        zIndex: 0
    },


    backgroundGlowTwo: {
        position: "fixed",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(34,211,238,0.08) 0%, rgba(34,211,238,0) 70%)",
        bottom: "-250px",
        left: "-180px",
        pointerEvents: "none",
        zIndex: 0
    },


    /* =========================================================
       HERO
    ========================================================= */

    heroSection: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "30px",
        marginBottom: "30px",
        padding:
            "28px 30px",
        border:
            "1px solid rgba(148,163,184,0.12)",
        borderRadius: "22px",
        background:
            "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(17,24,39,0.78))",
        boxShadow:
            "0 25px 70px rgba(0,0,0,0.25)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxSizing: "border-box",
        flexWrap: "wrap"
    },


    heroTextWrapper: {
        flex: 1,
        minWidth: "280px"
    },


    eyebrow: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "12px",
        color: "#818cf8",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "1.5px"
    },


    eyebrowDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        backgroundColor: "#22d3ee",
        boxShadow:
            "0 0 12px rgba(34,211,238,0.75)"
    },


    heading: {
        margin: 0,
        fontSize: "clamp(28px, 4vw, 42px)",
        lineHeight: "1.12",
        fontWeight: "800",
        letterSpacing: "-1.4px",
        color: "#f8fafc"
    },


    gradientText: {
        background:
            "linear-gradient(90deg, #818cf8 0%, #a78bfa 45%, #22d3ee 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text"
    },


    subtitle: {
        maxWidth: "650px",
        margin: "12px 0 0",
        color: "#94a3b8",
        fontSize: "14px",
        lineHeight: "1.7"
    },


    jobCountContainer: {
        display: "flex",
        alignItems: "center",
        gap: "13px",
        minWidth: "175px",
        padding: "14px 18px",
        borderRadius: "16px",
        background:
            "rgba(99,102,241,0.08)",
        border:
            "1px solid rgba(129,140,248,0.18)"
    },


    jobCountIcon: {
        width: "42px",
        height: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(34,211,238,0.12))",
        color: "#a5b4fc",
        fontSize: "19px"
    },


    jobCountNumber: {
        display: "block",
        color: "#f8fafc",
        fontSize: "22px",
        fontWeight: "800",
        lineHeight: "1"
    },


    jobCountLabel: {
        display: "block",
        marginTop: "5px",
        color: "#64748b",
        fontSize: "11px",
        fontWeight: "600"
    },


    /* =========================================================
       FILTER CARD
    ========================================================= */

    filterCard: {
        marginBottom: "18px",
        padding: "7px",
        border:
            "1px solid rgba(148,163,184,0.12)",
        borderRadius: "17px",
        background:
            "rgba(15,23,42,0.78)",
        boxShadow:
            "0 18px 50px rgba(0,0,0,0.18)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)"
    },


    filterTopRow: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        flexWrap: "wrap"
    },


    searchWrapper: {
        position: "relative",
        flex: 1,
        minWidth: "280px"
    },


    searchIcon: {
        position: "absolute",
        left: "16px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#64748b",
        fontSize: "20px",
        pointerEvents: "none"
    },


    searchInput: {
        width: "100%",
        padding: "14px 42px 14px 44px",
        borderRadius: "12px",
        border:
            "1px solid transparent",
        background:
            "rgba(30,41,59,0.72)",
        color: "#f8fafc",
        outline: "none",
        fontSize: "13px",
        boxSizing: "border-box"
    },


    searchClear: {
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "25px",
        height: "25px",
        border: "none",
        borderRadius: "50%",
        background: "#334155",
        color: "#cbd5e1",
        cursor: "pointer",
        fontSize: "17px",
        lineHeight: "20px"
    },


    filterDivider: {
        width: "1px",
        height: "28px",
        background: "rgba(148,163,184,0.12)"
    },


    selectWrapper: {
        position: "relative"
    },


    selectIcon: {
        position: "absolute",
        left: "13px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#818cf8",
        fontSize: "13px",
        pointerEvents: "none",
        zIndex: 1
    },


    select: {
        minWidth: "175px",
        padding: "14px 14px 14px 34px",
        borderRadius: "12px",
        border:
            "1px solid transparent",
        backgroundColor: "#1e293b",
        color: "#e2e8f0",
        cursor: "pointer",
        fontSize: "13px",
        outline: "none"
    },


    clearFilterButton: {
        padding: "13px 17px",
        border:
            "1px solid rgba(148,163,184,0.16)",
        borderRadius: "11px",
        background:
            "rgba(51,65,85,0.55)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "700"
    },


    /* =========================================================
       RESULT BAR
    ========================================================= */

    resultBar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "15px",
        minHeight: "32px",
        marginBottom: "16px",
        color: "#64748b",
        fontSize: "12px",
        flexWrap: "wrap"
    },


    resultLeft: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },


    resultIndicator: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        backgroundColor: "#22c55e",
        boxShadow:
            "0 0 10px rgba(34,197,94,0.6)"
    },


    resultStrong: {
        color: "#e2e8f0"
    },


    filterApplied: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "5px 8px",
        borderRadius: "8px",
        background: "rgba(99,102,241,0.08)",
        color: "#818cf8",
        fontSize: "11px",
        fontWeight: "600"
    },


    inlineClear: {
        border: "none",
        background: "transparent",
        color: "#a5b4fc",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: "700",
        padding: "0"
    },


    /* =========================================================
       JOB GRID
    ========================================================= */

    jobsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(310px, 1fr))",
        gap: "18px",
        alignItems: "stretch"
    },


    /* =========================================================
       JOB CARD
    ========================================================= */

    jobCard: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: "410px",
        padding: "22px",
        boxSizing: "border-box",
        overflow: "hidden",
        border:
            "1px solid rgba(148,163,184,0.12)",
        borderRadius: "19px",
        background:
            "linear-gradient(145deg, rgba(17,24,39,0.96), rgba(15,23,42,0.88))",
        boxShadow:
            "0 18px 45px rgba(0,0,0,0.22)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)"
    },


    cardAccent: {
        position: "absolute",
        top: 0,
        left: "22px",
        right: "22px",
        height: "2px",
        background:
            "linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)",
        opacity: 0.85
    },


    cardHeader: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "12px",
        paddingTop: "5px"
    },


    jobHeaderInfo: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        minWidth: 0,
        flex: 1
    },


    companyBadge: {
        flexShrink: 0,
        width: "43px",
        height: "43px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "13px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.20), rgba(34,211,238,0.10))",
        border:
            "1px solid rgba(129,140,248,0.16)",
        color: "#a5b4fc",
        fontSize: "16px",
        fontWeight: "800"
    },


    titleArea: {
        minWidth: 0,
        flex: 1
    },


    jobTitle: {
        margin: 0,
        fontSize: "17px",
        lineHeight: "1.35",
        fontWeight: "750",
        color: "#f8fafc",
        wordBreak: "break-word"
    },


    company: {
        margin: "5px 0 0",
        color: "#818cf8",
        fontSize: "12px",
        fontWeight: "650"
    },


    statusBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "6px 9px",
        borderRadius: "20px",
        border: "1px solid",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "0.4px",
        whiteSpace: "nowrap"
    },


    statusDot: {
        width: "5px",
        height: "5px",
        borderRadius: "50%"
    },


    /* =========================================================
       INFORMATION GRID
    ========================================================= */

    infoGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
        gap: "8px",
        marginTop: "20px",
        padding:
            "15px 0",
        borderTop:
            "1px solid rgba(148,163,184,0.10)",
        borderBottom:
            "1px solid rgba(148,163,184,0.10)"
    },


    infoItem: {
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        minWidth: 0
    },


    infoIconBox: {
        flexShrink: 0,
        width: "26px",
        height: "26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        background:
            "rgba(99,102,241,0.08)",
        color: "#818cf8",
        fontSize: "10px",
        fontWeight: "800"
    },


    infoLabel: {
        display: "block",
        color: "#475569",
        fontSize: "8px",
        textTransform: "uppercase",
        letterSpacing: "0.7px",
        marginBottom: "3px",
        fontWeight: "700"
    },


    infoValue: {
        display: "block",
        color: "#cbd5e1",
        fontSize: "11px",
        lineHeight: "1.35",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
    },


    /* =========================================================
       DESCRIPTION
    ========================================================= */

    description: {
        margin: "17px 0 12px",
        color: "#64748b",
        fontSize: "12px",
        lineHeight: "1.65",
        minHeight: "60px"
    },


    /* =========================================================
       HR INFORMATION
    ========================================================= */

    hrInfo: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        marginTop: "3px",
        marginBottom: "16px"
    },


    hrAvatar: {
        width: "29px",
        height: "29px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background:
            "linear-gradient(135deg, #312e81, #164e63)",
        color: "#c7d2fe",
        fontSize: "10px",
        fontWeight: "800"
    },


    postedLabel: {
        display: "block",
        color: "#475569",
        fontSize: "9px",
        marginBottom: "2px"
    },


    hrName: {
        display: "block",
        color: "#cbd5e1",
        fontSize: "11px",
        fontWeight: "650"
    },


    /* =========================================================
       DETAILS BUTTON
    ========================================================= */

    detailsButton: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        marginTop: "auto",
        padding: "11px 12px 11px 15px",
        border:
            "1px solid rgba(99,102,241,0.20)",
        borderRadius: "11px",
        background:
            "linear-gradient(135deg, rgba(79,70,229,0.17), rgba(34,211,238,0.07))",
        color: "#c7d2fe",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "750",
        textAlign: "left"
    },


    arrowCircle: {
        width: "27px",
        height: "27px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background:
            "rgba(99,102,241,0.20)",
        color: "#a5b4fc",
        fontSize: "15px"
    },


    /* =========================================================
       LOADING STATE
    ========================================================= */

    stateCard: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: "300px",
        padding: "50px 25px",
        background:
            "rgba(15,23,42,0.78)",
        border:
            "1px solid rgba(148,163,184,0.12)",
        borderRadius: "19px",
        boxShadow:
            "0 20px 60px rgba(0,0,0,0.20)"
    },


    loadingOrb: {
        position: "relative",
        width: "65px",
        height: "65px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "18px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(99,102,241,0.22), rgba(99,102,241,0.04))",
        color: "#a5b4fc",
        fontSize: "20px"
    },


    loadingRing: {
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        border:
            "2px solid rgba(99,102,241,0.18)",
        borderTopColor: "#818cf8"
    },


    stateTitle: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "750",
        color: "#f8fafc"
    },


    stateText: {
        margin: "8px auto 0",
        maxWidth: "500px",
        color: "#64748b",
        fontSize: "12px",
        lineHeight: "1.6"
    },


    /* =========================================================
       ERROR STATE
    ========================================================= */

    errorCard: {
        textAlign: "center",
        padding: "55px 25px",
        background:
            "rgba(69,10,10,0.30)",
        border:
            "1px solid rgba(239,68,68,0.18)",
        borderRadius: "19px",
        boxShadow:
            "0 20px 60px rgba(0,0,0,0.18)"
    },


    errorIconWrapper: {
        width: "52px",
        height: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 15px",
        borderRadius: "15px",
        background:
            "rgba(239,68,68,0.10)",
        border:
            "1px solid rgba(239,68,68,0.18)",
        color: "#fca5a5",
        fontSize: "21px",
        fontWeight: "800"
    },


    errorText: {
        margin: "10px auto 20px",
        maxWidth: "600px",
        color: "#fca5a5",
        fontSize: "12px",
        lineHeight: "1.6"
    },


    primaryButton: {
        padding: "11px 19px",
        border: "none",
        borderRadius: "10px",
        background:
            "linear-gradient(135deg, #4f46e5, #6366f1)",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "750",
        boxShadow:
            "0 8px 22px rgba(79,70,229,0.25)"
    },


    /* =========================================================
       EMPTY STATE
    ========================================================= */

    emptyCard: {
        textAlign: "center",
        padding: "60px 25px",
        background:
            "rgba(15,23,42,0.78)",
        border:
            "1px solid rgba(148,163,184,0.12)",
        borderRadius: "19px",
        boxShadow:
            "0 20px 60px rgba(0,0,0,0.18)"
    },


    emptyIconWrapper: {
        width: "62px",
        height: "62px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px",
        borderRadius: "18px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(34,211,238,0.06))",
        border:
            "1px solid rgba(129,140,248,0.13)",
        color: "#818cf8",
        fontSize: "27px"
    },


    emptyTitle: {
        margin: 0,
        fontSize: "20px",
        fontWeight: "750",
        color: "#f8fafc"
    },


    emptyText: {
        maxWidth: "500px",
        margin: "9px auto 0",
        color: "#64748b",
        fontSize: "12px",
        lineHeight: "1.6"
    },


    secondaryButton: {
        marginTop: "20px",
        padding: "10px 18px",
        border:
            "1px solid rgba(129,140,248,0.20)",
        borderRadius: "10px",
        background:
            "rgba(99,102,241,0.08)",
        color: "#a5b4fc",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "700"
    }

};


export default Jobs;