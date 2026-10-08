import { useNavigate } from "react-router-dom";

function Navbar({ role = "CANDIDATE" }) {
    const navigate = useNavigate();

    const normalizedRole = role
        ?.toString()
        ?.toUpperCase()
        ?.replace("ROLE_", "");

    // =========================================================
    // DASHBOARD
    // =========================================================

    const handleDashboard = () => {
        if (normalizedRole === "ADMIN") {
            navigate("/admin/dashboard");
            return;
        }

        if (normalizedRole === "HR") {
            navigate("/hr/dashboard");
            return;
        }

        navigate("/dashboard");
    };

    // =========================================================
    // PROFILE
    // =========================================================

    const handleProfile = () => {
        navigate("/profile");
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // =========================================================
    // NAVIGATION ITEMS
    // =========================================================

    const handleJobs = () => {
        if (normalizedRole === "HR") {
            navigate("/hr/jobs");
            return;
        }

        navigate("/jobs");
    };

    const handleApplications = () => {
        if (normalizedRole === "HR") {
            navigate("/hr/applicants");
            return;
        }

        navigate("/applications");
    };

    const handleInterviews = () => {
        if (normalizedRole === "HR") {
            navigate("/hr/interviews");
            return;
        }

        navigate("/applications");
    };

    // =========================================================
    // ADMIN NAVIGATION
    // =========================================================

    const handleAdminUsers = () => {
        navigate("/admin/users");
    };

    const handleAdminJobs = () => {
        navigate("/admin/jobs");
    };

    const handleAdminApplications = () => {
        navigate("/admin/applications");
    };

    const handleAdminAnalytics = () => {
        navigate("/admin/analytics");
    };

    // =========================================================
    // ROLE COLOR
    // =========================================================

    const getRoleStyle = () => {
        switch (normalizedRole) {
            case "ADMIN":
                return {
                    background:
                        "linear-gradient(135deg, rgba(139,92,246,.18), rgba(124,58,237,.10))",
                    color: "#c4b5fd",
                    border:
                        "1px solid rgba(167,139,250,.24)"
                };

            case "HR":
                return {
                    background:
                        "linear-gradient(135deg, rgba(34,211,238,.14), rgba(6,182,212,.08))",
                    color: "#67e8f9",
                    border:
                        "1px solid rgba(34,211,238,.22)"
                };

            default:
                return {
                    background:
                        "linear-gradient(135deg, rgba(99,102,241,.16), rgba(79,70,229,.08))",
                    color: "#a5b4fc",
                    border:
                        "1px solid rgba(129,140,248,.22)"
                };
        }
    };

    return (
        <header style={styles.header}>

            {/* =================================================
                BACKGROUND GLOW
            ================================================= */}

            <div style={styles.headerGlowLeft} />
            <div style={styles.headerGlowRight} />

            {/* =================================================
                LOGO
            ================================================= */}

            <div
                style={styles.logoContainer}
                onClick={handleDashboard}
                title="Go to Dashboard"
            >
                <div style={styles.logoIcon}>
                    🚀
                </div>

                <div style={styles.brandText}>
                    <h1 style={styles.logo}>
                        Hire
                        <span style={styles.logoAccent}>
                            AI
                        </span>
                    </h1>

                    <span style={styles.brandSubtitle}>
                        Smart Hiring Platform
                    </span>
                </div>

                <span
                    style={{
                        ...styles.role,
                        ...getRoleStyle()
                    }}
                >
                    {normalizedRole}
                </span>
            </div>

            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav style={styles.navigation}>

                {/* DASHBOARD */}

                <button
                    style={styles.navButton}
                    onClick={handleDashboard}
                >
                    <span style={styles.navIcon}>
                        ◈
                    </span>

                    Dashboard
                </button>


                {/* =================================================
                    CANDIDATE
                ================================================= */}

                {normalizedRole === "CANDIDATE" && (
                    <>
                        <button
                            style={styles.navButton}
                            onClick={handleJobs}
                        >
                            <span style={styles.navIcon}>
                                💼
                            </span>

                            Jobs
                        </button>

                        <button
                            style={styles.navButton}
                            onClick={handleApplications}
                        >
                            <span style={styles.navIcon}>
                                📋
                            </span>

                            My Applications
                        </button>
                    </>
                )}


                {/* =================================================
                    HR
                ================================================= */}

                {normalizedRole === "HR" && (
                    <>
                        <button
                            style={styles.navButton}
                            onClick={handleJobs}
                        >
                            <span style={styles.navIcon}>
                                💼
                            </span>

                            My Jobs
                        </button>

                        <button
                            style={styles.navButton}
                            onClick={handleApplications}
                        >
                            <span style={styles.navIcon}>
                                👥
                            </span>

                            Applicants
                        </button>

                        <button
                            style={styles.navButton}
                            onClick={handleInterviews}
                        >
                            <span style={styles.navIcon}>
                                🎯
                            </span>

                            Interviews
                        </button>
                    </>
                )}


                {/* =================================================
                    ADMIN
                ================================================= */}

                {normalizedRole === "ADMIN" && (
                    <>
                        <button
                            style={styles.navButton}
                            onClick={handleAdminUsers}
                        >
                            <span style={styles.navIcon}>
                                👥
                            </span>

                            Users
                        </button>

                        <button
                            style={styles.navButton}
                            onClick={handleAdminJobs}
                        >
                            <span style={styles.navIcon}>
                                💼
                            </span>

                            Jobs
                        </button>

                        <button
                            style={styles.navButton}
                            onClick={handleAdminApplications}
                        >
                            <span style={styles.navIcon}>
                                📋
                            </span>

                            Applications
                        </button>

                        <button
                            style={styles.navButton}
                            onClick={handleAdminAnalytics}
                        >
                            <span style={styles.navIcon}>
                                📊
                            </span>

                            Analytics
                        </button>
                    </>
                )}

            </nav>


            {/* =================================================
                RIGHT SIDE ACTIONS
            ================================================= */}

            <div style={styles.actions}>

                <button
                    style={styles.profileButton}
                    onClick={handleProfile}
                >
                    <span style={styles.buttonIcon}>
                        👤
                    </span>

                    <span>My Profile</span>
                </button>

                <button
                    style={styles.logoutButton}
                    onClick={handleLogout}
                >
                    <span style={styles.buttonIcon}>
                        ↪
                    </span>

                    <span>Logout</span>
                </button>

            </div>

        </header>
    );
}


/* =============================================================
   STYLES
============================================================= */

const styles = {

    // =========================================================
    // HEADER
    // =========================================================

    header: {
        position: "relative",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "18px",
        minHeight: "72px",
        padding: "12px clamp(18px, 4vw, 48px)",

        background:
            "linear-gradient(135deg, rgba(7,13,28,.94), rgba(10,18,35,.90))",

        borderBottom:
            "1px solid rgba(148,163,184,.12)",

        color: "#f8fafc",

        boxShadow:
            "0 12px 45px rgba(0,0,0,.22)",

        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",

        flexWrap: "wrap",

        overflow: "hidden"
    },


    // =========================================================
    // HEADER GLOW
    // =========================================================

    headerGlowLeft: {
        position: "absolute",
        width: "260px",
        height: "180px",
        left: "-100px",
        top: "-100px",
        borderRadius: "50%",

        background:
            "rgba(99,102,241,.10)",

        filter: "blur(65px)",

        pointerEvents: "none"
    },


    headerGlowRight: {
        position: "absolute",
        width: "280px",
        height: "180px",
        right: "-100px",
        top: "-80px",
        borderRadius: "50%",

        background:
            "rgba(34,211,238,.07)",

        filter: "blur(70px)",

        pointerEvents: "none"
    },


    // =========================================================
    // LOGO CONTAINER
    // =========================================================

    logoContainer: {
        position: "relative",
        zIndex: 2,

        display: "flex",
        alignItems: "center",

        gap: "11px",

        cursor: "pointer",

        minWidth: "220px",

        userSelect: "none"
    },


    // =========================================================
    // LOGO ICON
    // =========================================================

    logoIcon: {
        width: "43px",
        height: "43px",

        minWidth: "43px",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        borderRadius: "13px",

        background:
            "linear-gradient(135deg, rgba(99,102,241,.22), rgba(34,211,238,.10))",

        border:
            "1px solid rgba(129,140,248,.24)",

        boxShadow:
            "0 8px 28px rgba(99,102,241,.15)",

        fontSize: "20px"
    },


    // =========================================================
    // BRAND TEXT
    // =========================================================

    brandText: {
        display: "flex",
        flexDirection: "column",
        gap: "1px"
    },


    logo: {
        margin: 0,

        fontSize: "22px",

        lineHeight: 1,

        fontWeight: 850,

        letterSpacing: "-0.7px",

        color: "#f8fafc"
    },


    logoAccent: {
        background:
            "linear-gradient(90deg, #818cf8, #22d3ee)",

        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",

        backgroundClip: "text"
    },


    brandSubtitle: {
        color: "#64748b",

        fontSize: "8px",

        fontWeight: 600,

        letterSpacing: "1px",

        textTransform: "uppercase"
    },


    // =========================================================
    // ROLE BADGE
    // =========================================================

    role: {
        marginLeft: "3px",

        padding: "5px 9px",

        borderRadius: "999px",

        fontSize: "9px",

        fontWeight: 800,

        letterSpacing: ".6px",

        whiteSpace: "nowrap"
    },


    // =========================================================
    // NAVIGATION
    // =========================================================

    navigation: {
        position: "relative",
        zIndex: 2,

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        gap: "3px",

        flex: 1,

        minWidth: "300px",

        flexWrap: "wrap"
    },


    // =========================================================
    // NAV BUTTON
    // =========================================================

    navButton: {
        display: "inline-flex",

        alignItems: "center",

        justifyContent: "center",

        gap: "7px",

        padding: "9px 12px",

        border: "1px solid transparent",

        borderRadius: "10px",

        background: "transparent",

        color: "#94a3b8",

        cursor: "pointer",

        fontSize: "12px",

        fontWeight: 650,

        transition:
            "background .2s ease, color .2s ease, border .2s ease",

        whiteSpace: "nowrap"
    },


    // =========================================================
    // NAV ICON
    // =========================================================

    navIcon: {
        fontSize: "12px",

        opacity: 0.85
    },


    // =========================================================
    // ACTIONS
    // =========================================================

    actions: {
        position: "relative",
        zIndex: 2,

        display: "flex",

        alignItems: "center",

        gap: "8px",

        flexShrink: 0
    },


    // =========================================================
    // PROFILE BUTTON
    // =========================================================

    profileButton: {
        display: "inline-flex",

        alignItems: "center",

        justifyContent: "center",

        gap: "7px",

        padding: "9px 13px",

        border:
            "1px solid rgba(99,102,241,.25)",

        borderRadius: "10px",

        background:
            "linear-gradient(135deg, rgba(99,102,241,.15), rgba(79,70,229,.08))",

        color: "#c7d2fe",

        cursor: "pointer",

        fontSize: "12px",

        fontWeight: 750,

        boxShadow:
            "0 8px 24px rgba(99,102,241,.08)"
    },


    // =========================================================
    // LOGOUT BUTTON
    // =========================================================

    logoutButton: {
        display: "inline-flex",

        alignItems: "center",

        justifyContent: "center",

        gap: "7px",

        padding: "9px 13px",

        border:
            "1px solid rgba(244,63,94,.22)",

        borderRadius: "10px",

        background:
            "linear-gradient(135deg, rgba(244,63,94,.13), rgba(225,29,72,.07))",

        color: "#fda4af",

        cursor: "pointer",

        fontSize: "12px",

        fontWeight: 750
    },


    // =========================================================
    // BUTTON ICON
    // =========================================================

    buttonIcon: {
        fontSize: "12px"
    }
};

export default Navbar;