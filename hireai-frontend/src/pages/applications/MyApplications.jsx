import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function MyApplications() {
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // LOAD MY APPLICATIONS
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const fetchApplications = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                // =================================================
                // CANDIDATE - MY APPLICATIONS
                // GET /api/v1/applications/my
                // =================================================

                const response = await api.get("/applications/my");

                console.log(
                    "My applications:",
                    response.data
                );

                if (!cancelled) {
                    setApplications(
                        Array.isArray(response.data)
                            ? response.data
                            : []
                    );
                }
            } catch (err) {
                console.error(
                    "Failed to fetch applications:",
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
                        "You are not authorized to view your applications."
                    );
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    err.response?.data ||
                    "Failed to load your applications."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchApplications();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        navigate("/login");
    };

    // =========================================================
    // VIEW APPLICATION
    // =========================================================

    const handleViewApplication = (applicationId) => {
        if (!applicationId) {
            return;
        }

        navigate(`/applications/${applicationId}`);
    };

    // =========================================================
    // STATUS FORMAT
    // =========================================================

    const formatStatus = (status) => {
        if (!status) {
            return "Unknown";
        }

        return status
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                (char) => char.toUpperCase()
            );
    };

    // =========================================================
    // STATUS STYLE
    // =========================================================

    const getStatusStyle = (status) => {
        const normalizedStatus = String(
            status || ""
        ).toUpperCase();

        if (
            normalizedStatus === "HIRED" ||
            normalizedStatus === "SELECTED"
        ) {
            return {
                background:
                    "rgba(16, 185, 129, 0.14)",
                border:
                    "1px solid rgba(52, 211, 153, 0.28)",
                color: "#6ee7b7",
                boxShadow:
                    "0 0 18px rgba(16, 185, 129, 0.08)"
            };
        }

        if (
            normalizedStatus === "REJECTED" ||
            normalizedStatus === "DECLINED"
        ) {
            return {
                background:
                    "rgba(239, 68, 68, 0.14)",
                border:
                    "1px solid rgba(248, 113, 113, 0.28)",
                color: "#fca5a5",
                boxShadow:
                    "0 0 18px rgba(239, 68, 68, 0.08)"
            };
        }

        if (
            normalizedStatus === "INTERVIEW" ||
            normalizedStatus === "INTERVIEW_SCHEDULED"
        ) {
            return {
                background:
                    "rgba(168, 85, 247, 0.14)",
                border:
                    "1px solid rgba(192, 132, 252, 0.28)",
                color: "#d8b4fe",
                boxShadow:
                    "0 0 18px rgba(168, 85, 247, 0.08)"
            };
        }

        if (
            normalizedStatus === "SHORTLISTED"
        ) {
            return {
                background:
                    "rgba(34, 211, 238, 0.12)",
                border:
                    "1px solid rgba(34, 211, 238, 0.25)",
                color: "#67e8f9",
                boxShadow:
                    "0 0 18px rgba(34, 211, 238, 0.08)"
            };
        }

        return {
            background:
                "rgba(99, 102, 241, 0.14)",
            border:
                "1px solid rgba(129, 140, 248, 0.28)",
            color: "#a5b4fc",
            boxShadow:
                "0 0 18px rgba(99, 102, 241, 0.08)"
        };
    };

    // =========================================================
    // DATE FORMAT
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        try {
            return new Date(date).toLocaleString();
        } catch {
            return "N/A";
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div style={styles.page}>

                <div style={styles.backgroundGlowOne} />
                <div style={styles.backgroundGlowTwo} />

                <header style={styles.header}>

                    <div style={styles.brandArea}>
                        <div style={styles.logoMark}>
                            H
                        </div>

                        <div>
                            <h1 style={styles.logo}>
                                Hire<span style={styles.logoAccent}>AI</span>
                            </h1>

                            <p style={styles.subtitle}>
                                My Applications
                            </p>
                        </div>
                    </div>

                </header>

                <main style={styles.container}>

                    <div style={styles.loadingCard}>

                        <div style={styles.loadingOrb}>
                            <div style={styles.loadingInner}>
                                ⏳
                            </div>
                        </div>

                        <h2 style={styles.loadingTitle}>
                            Loading your applications
                        </h2>

                        <p style={styles.loadingText}>
                            We're getting your application history ready...
                        </p>

                        <div style={styles.loadingBar}>
                            <div style={styles.loadingBarFill} />
                        </div>

                    </div>

                </main>
            </div>
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div style={styles.page}>

            {/* BACKGROUND DECORATION */}

            <div style={styles.backgroundGlowOne} />
            <div style={styles.backgroundGlowTwo} />
            <div style={styles.backgroundGlowThree} />

            {/* =================================================
                HEADER
            ================================================= */}

            <header style={styles.header}>

                <div style={styles.brandArea}>

                    <div style={styles.logoMark}>
                        H
                    </div>

                    <div>
                        <h1 style={styles.logo}>
                            Hire<span style={styles.logoAccent}>AI</span>
                        </h1>

                        <p style={styles.subtitle}>
                            Track your career journey
                        </p>
                    </div>

                </div>


                <div style={styles.headerButtons}>

                    <button
                        style={styles.profileButton}
                        onClick={() =>
                            navigate("/profile")
                        }
                    >
                        <span style={styles.buttonIcon}>
                            ◉
                        </span>

                        My Profile
                    </button>


                    <button
                        style={styles.logoutButton}
                        onClick={handleLogout}
                    >
                        <span style={styles.buttonIcon}>
                            ↪
                        </span>

                        Logout
                    </button>

                </div>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main style={styles.container}>

                {/* =================================================
                    BACK TO DASHBOARD
                ================================================= */}

                <button
                    style={styles.backButton}
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    <span style={styles.backArrow}>
                        ←
                    </span>

                    Dashboard
                </button>


                {/* =================================================
                    HERO / TITLE
                ================================================= */}

                <section style={styles.heroSection}>

                    <div style={styles.heroBadge}>
                        <span style={styles.badgeDot} />
                        APPLICATION TRACKER
                    </div>

                    <h2 style={styles.heading}>
                        My{" "}
                        <span style={styles.headingAccent}>
                            Applications
                        </span>
                    </h2>

                    <p style={styles.description}>
                        Keep track of every opportunity you've
                        applied for and stay updated on your
                        hiring journey.
                    </p>


                    {applications.length > 0 && !error && (
                        <div style={styles.applicationCount}>

                            <div style={styles.countIcon}>
                                ✓
                            </div>

                            <div>
                                <span style={styles.countNumber}>
                                    {applications.length}
                                </span>

                                <span style={styles.countLabel}>
                                    {" "}
                                    application
                                    {applications.length !== 1
                                        ? "s"
                                        : ""}
                                </span>
                            </div>

                        </div>
                    )}

                </section>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div style={styles.error}>

                        <div style={styles.errorIcon}>
                            !
                        </div>

                        <div style={styles.errorContent}>

                            <strong style={styles.errorTitle}>
                                Unable to load applications
                            </strong>

                            <p style={styles.errorText}>
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* =================================================
                    EMPTY
                ================================================= */}

                {!error &&
                    applications.length === 0 && (

                        <div style={styles.emptyCard}>

                            <div style={styles.emptyVisual}>

                                <div style={styles.emptyGlow} />

                                <div style={styles.emptyIcon}>
                                    ✓
                                </div>

                            </div>

                            <h3 style={styles.emptyTitle}>
                                No Applications Yet
                            </h3>

                            <p style={styles.emptyText}>
                                Your career journey starts here.
                                Explore available opportunities
                                and submit your first application.
                            </p>


                            <button
                                style={styles.primaryButton}
                                onClick={() =>
                                    navigate("/jobs")
                                }
                            >
                                <span>
                                    Browse Jobs
                                </span>

                                <span style={styles.primaryArrow}>
                                    →
                                </span>
                            </button>

                        </div>

                    )}


                {/* =================================================
                    APPLICATIONS
                ================================================= */}

                {!error &&
                    applications.length > 0 && (

                        <div style={styles.applicationsGrid}>

                            {applications.map(
                                (application, index) => (

                                    <div
                                        key={application.id}
                                        style={{
                                            ...styles.applicationCard,
                                            animationDelay:
                                                `${index * 60}ms`
                                        }}
                                    >

                                        {/* CARD TOP ACCENT */}

                                        <div
                                            style={
                                                styles.cardAccent
                                            }
                                        />


                                        {/* CARD HEADER */}

                                        <div
                                            style={
                                                styles.cardHeader
                                            }
                                        >

                                            <div
                                                style={
                                                    styles.jobInfo
                                                }
                                            >

                                                <div
                                                    style={
                                                        styles.jobIcon
                                                    }
                                                >
                                                    💼
                                                </div>

                                                <div>

                                                    <h3
                                                        style={
                                                            styles.jobTitle
                                                        }
                                                    >
                                                        {application.jobTitle ||
                                                            "Job Application"}
                                                    </h3>

                                                    <p
                                                        style={
                                                            styles.company
                                                        }
                                                    >
                                                        {application.companyName ||
                                                            "Company not specified"}
                                                    </p>

                                                </div>

                                            </div>


                                            <span
                                                style={{
                                                    ...styles.status,
                                                    ...getStatusStyle(
                                                        application.status
                                                    )
                                                }}
                                            >
                                                <span
                                                    style={
                                                        styles.statusDot
                                                    }
                                                />

                                                {formatStatus(
                                                    application.status
                                                )}
                                            </span>

                                        </div>


                                        {/* APPLICATION DETAILS */}

                                        <div
                                            style={
                                                styles.details
                                            }
                                        >

                                            <div
                                                style={
                                                    styles.detailItem
                                                }
                                            >

                                                <span
                                                    style={
                                                        styles.detailIcon
                                                    }
                                                >
                                                    📅
                                                </span>

                                                <div>

                                                    <span
                                                        style={
                                                            styles.detailLabel
                                                        }
                                                    >
                                                        Applied On
                                                    </span>

                                                    <span
                                                        style={
                                                            styles.detailValue
                                                        }
                                                    >
                                                        {formatDate(
                                                            application.appliedAt
                                                        )}
                                                    </span>

                                                </div>

                                            </div>


                                            {application.jobLocation && (

                                                <div
                                                    style={
                                                        styles.detailItem
                                                    }
                                                >

                                                    <span
                                                        style={
                                                            styles.detailIcon
                                                        }
                                                    >
                                                        📍
                                                    </span>

                                                    <div>

                                                        <span
                                                            style={
                                                                styles.detailLabel
                                                            }
                                                        >
                                                            Location
                                                        </span>

                                                        <span
                                                            style={
                                                                styles.detailValue
                                                            }
                                                        >
                                                            {
                                                                application.jobLocation
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            )}

                                        </div>


                                        {/* DIVIDER */}

                                        <div
                                            style={
                                                styles.cardDivider
                                            }
                                        />


                                        {/* VIEW BUTTON */}

                                        <button
                                            style={
                                                styles.detailsButton
                                            }
                                            onClick={() =>
                                                handleViewApplication(
                                                    application.id
                                                )
                                            }
                                        >

                                            <span>
                                                View Application
                                            </span>

                                            <span
                                                style={
                                                    styles.viewArrow
                                                }
                                            >
                                                →
                                            </span>

                                        </button>

                                    </div>
                                )
                            )}

                        </div>

                    )}

            </main>

        </div>
    );
}


/* =============================================================
   PREMIUM HIREAI STYLES
============================================================= */

const styles = {

    // =========================================================
    // PAGE
    // =========================================================

    page: {
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
            "radial-gradient(circle at 15% 10%, rgba(99,102,241,0.12), transparent 28%), radial-gradient(circle at 85% 15%, rgba(34,211,238,0.08), transparent 25%), radial-gradient(circle at 50% 100%, rgba(139,92,246,0.08), transparent 32%), #050816",
        color: "#f8fafc",
        fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },


    // =========================================================
    // BACKGROUND GLOWS
    // =========================================================

    backgroundGlowOne: {
        position: "fixed",
        width: "420px",
        height: "420px",
        borderRadius: "50%",
        top: "-220px",
        left: "-160px",
        background:
            "radial-gradient(circle, rgba(99,102,241,0.16), transparent 68%)",
        pointerEvents: "none",
        zIndex: 0
    },


    backgroundGlowTwo: {
        position: "fixed",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        top: "25%",
        right: "-220px",
        background:
            "radial-gradient(circle, rgba(34,211,238,0.10), transparent 68%)",
        pointerEvents: "none",
        zIndex: 0
    },


    backgroundGlowThree: {
        position: "fixed",
        width: "500px",
        height: "300px",
        borderRadius: "50%",
        bottom: "-180px",
        left: "35%",
        background:
            "radial-gradient(circle, rgba(139,92,246,0.10), transparent 70%)",
        pointerEvents: "none",
        zIndex: 0
    },


    // =========================================================
    // HEADER
    // =========================================================

    header: {
        position: "relative",
        zIndex: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 5%",
        background:
            "rgba(8, 13, 28, 0.78)",
        borderBottom:
            "1px solid rgba(148,163,184,0.10)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        gap: "20px"
    },


    brandArea: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },


    logoMark: {
        width: "42px",
        height: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "13px",
        background:
            "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#ffffff",
        fontWeight: 900,
        fontSize: "19px",
        boxShadow:
            "0 8px 30px rgba(99,102,241,0.28)"
    },


    logo: {
        margin: 0,
        fontSize: "23px",
        lineHeight: 1,
        letterSpacing: "-0.5px",
        fontWeight: 800,
        color: "#f8fafc"
    },


    logoAccent: {
        background:
            "linear-gradient(90deg, #818cf8, #22d3ee)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text"
    },


    subtitle: {
        margin: "5px 0 0",
        color: "#64748b",
        fontSize: "12px",
        fontWeight: 500
    },


    headerButtons: {
        display: "flex",
        gap: "9px",
        flexWrap: "wrap",
        alignItems: "center"
    },


    profileButton: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "9px 15px",
        border:
            "1px solid rgba(129,140,248,0.20)",
        borderRadius: "10px",
        background:
            "rgba(99,102,241,0.10)",
        color: "#c7d2fe",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "13px",
        transition: "all 0.2s ease"
    },


    logoutButton: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "9px 15px",
        border:
            "1px solid rgba(248,113,113,0.18)",
        borderRadius: "10px",
        background:
            "rgba(239,68,68,0.08)",
        color: "#fca5a5",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "13px"
    },


    buttonIcon: {
        fontSize: "13px"
    },


    // =========================================================
    // CONTAINER
    // =========================================================

    container: {
        position: "relative",
        zIndex: 1,
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "34px 25px 70px"
    },


    // =========================================================
    // BACK BUTTON
    // =========================================================

    backButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "9px 14px",
        marginBottom: "30px",
        border:
            "1px solid rgba(148,163,184,0.14)",
        borderRadius: "10px",
        background:
            "rgba(15,23,42,0.65)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "13px",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)"
    },


    backArrow: {
        color: "#818cf8",
        fontSize: "16px"
    },


    // =========================================================
    // HERO
    // =========================================================

    heroSection: {
        textAlign: "center",
        marginBottom: "40px"
    },


    heroBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 12px",
        marginBottom: "17px",
        border:
            "1px solid rgba(99,102,241,0.18)",
        borderRadius: "999px",
        background:
            "rgba(99,102,241,0.08)",
        color: "#a5b4fc",
        fontSize: "10px",
        fontWeight: 800,
        letterSpacing: "1.4px"
    },


    badgeDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#818cf8",
        boxShadow:
            "0 0 10px rgba(129,140,248,0.8)"
    },


    heading: {
        margin: 0,
        fontSize: "clamp(32px, 5vw, 48px)",
        lineHeight: 1.1,
        letterSpacing: "-1.8px",
        fontWeight: 850,
        color: "#f8fafc"
    },


    headingAccent: {
        background:
            "linear-gradient(90deg, #818cf8, #22d3ee)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text"
    },


    description: {
        maxWidth: "650px",
        margin: "14px auto 0",
        color: "#94a3b8",
        lineHeight: 1.7,
        fontSize: "14px"
    },


    applicationCount: {
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        marginTop: "20px",
        padding: "8px 13px",
        border:
            "1px solid rgba(34,211,238,0.14)",
        borderRadius: "999px",
        background:
            "rgba(34,211,238,0.06)",
        color: "#94a3b8",
        fontSize: "12px"
    },


    countIcon: {
        width: "22px",
        height: "22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background:
            "rgba(34,211,238,0.14)",
        color: "#67e8f9",
        fontSize: "11px",
        fontWeight: 900
    },


    countNumber: {
        color: "#e2e8f0",
        fontSize: "14px",
        fontWeight: 800
    },


    countLabel: {
        color: "#64748b"
    },


    // =========================================================
    // APPLICATION GRID
    // =========================================================

    applicationsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(330px, 1fr))",
        gap: "20px"
    },


    // =========================================================
    // APPLICATION CARD
    // =========================================================

    applicationCard: {
        position: "relative",
        overflow: "hidden",
        minWidth: 0,
        padding: "23px",
        border:
            "1px solid rgba(148,163,184,0.12)",
        borderRadius: "18px",
        background:
            "linear-gradient(145deg, rgba(15,23,42,0.90), rgba(9,14,28,0.82))",
        boxShadow:
            "0 18px 50px rgba(0,0,0,0.20)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)"
    },


    cardAccent: {
        position: "absolute",
        top: 0,
        left: "22px",
        right: "22px",
        height: "1px",
        background:
            "linear-gradient(90deg, transparent, rgba(129,140,248,0.7), rgba(34,211,238,0.45), transparent)"
    },


    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px"
    },


    jobInfo: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        minWidth: 0,
        flex: 1
    },


    jobIcon: {
        flexShrink: 0,
        width: "42px",
        height: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.16), rgba(34,211,238,0.08))",
        border:
            "1px solid rgba(129,140,248,0.15)",
        fontSize: "18px"
    },


    jobTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "18px",
        lineHeight: 1.35,
        fontWeight: 750,
        letterSpacing: "-0.3px",
        overflowWrap: "anywhere"
    },


    company: {
        margin: "5px 0 0",
        color: "#818cf8",
        fontWeight: 650,
        fontSize: "13px"
    },


    // =========================================================
    // STATUS
    // =========================================================

    status: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        flexShrink: 0,
        padding: "6px 9px",
        borderRadius: "999px",
        fontSize: "10px",
        fontWeight: 800,
        whiteSpace: "nowrap",
        letterSpacing: "0.3px"
    },


    statusDot: {
        width: "5px",
        height: "5px",
        borderRadius: "50%",
        background: "currentColor",
        boxShadow: "0 0 8px currentColor"
    },


    // =========================================================
    // DETAILS
    // =========================================================

    details: {
        display: "flex",
        flexDirection: "column",
        gap: "11px",
        marginTop: "22px",
        padding: "15px",
        border:
            "1px solid rgba(148,163,184,0.08)",
        borderRadius: "12px",
        background:
            "rgba(2,6,23,0.30)"
    },


    detailItem: {
        display: "flex",
        alignItems: "center",
        gap: "11px"
    },


    detailIcon: {
        width: "31px",
        height: "31px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "9px",
        background:
            "rgba(99,102,241,0.08)",
        fontSize: "13px"
    },


    detailLabel: {
        display: "block",
        marginBottom: "2px",
        color: "#64748b",
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.7px"
    },


    detailValue: {
        display: "block",
        color: "#cbd5e1",
        fontSize: "12px",
        fontWeight: 600,
        lineHeight: 1.4
    },


    cardDivider: {
        height: "1px",
        margin: "20px 0 16px",
        background:
            "linear-gradient(90deg, transparent, rgba(148,163,184,0.10), transparent)"
    },


    // =========================================================
    // VIEW BUTTON
    // =========================================================

    detailsButton: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "11px 15px",
        border:
            "1px solid rgba(99,102,241,0.20)",
        borderRadius: "10px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.08))",
        color: "#c7d2fe",
        cursor: "pointer",
        fontWeight: 750,
        fontSize: "12px"
    },


    viewArrow: {
        color: "#67e8f9",
        fontSize: "15px"
    },


    // =========================================================
    // EMPTY STATE
    // =========================================================

    emptyCard: {
        maxWidth: "650px",
        margin: "0 auto",
        padding: "55px 35px",
        textAlign: "center",
        border:
            "1px solid rgba(148,163,184,0.12)",
        borderRadius: "22px",
        background:
            "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(8,13,27,0.82))",
        boxShadow:
            "0 25px 70px rgba(0,0,0,0.25)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)"
    },


    emptyVisual: {
        position: "relative",
        width: "82px",
        height: "82px",
        margin: "0 auto 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },


    emptyGlow: {
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(99,102,241,0.22), transparent 68%)"
    },


    emptyIcon: {
        position: "relative",
        width: "62px",
        height: "62px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "20px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(34,211,238,0.08))",
        border:
            "1px solid rgba(129,140,248,0.22)",
        color: "#818cf8",
        fontSize: "25px",
        fontWeight: 900,
        boxShadow:
            "0 15px 40px rgba(99,102,241,0.12)"
    },


    emptyTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "23px",
        fontWeight: 800
    },


    emptyText: {
        maxWidth: "470px",
        margin: "10px auto 0",
        color: "#94a3b8",
        lineHeight: 1.7,
        fontSize: "13px"
    },


    primaryButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        marginTop: "25px",
        padding: "12px 20px",
        border: "none",
        borderRadius: "11px",
        background:
            "linear-gradient(135deg, #6366f1, #7c3aed)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 800,
        fontSize: "13px",
        boxShadow:
            "0 12px 30px rgba(99,102,241,0.25)"
    },


    primaryArrow: {
        fontSize: "17px"
    },


    // =========================================================
    // ERROR
    // =========================================================

    error: {
        display: "flex",
        alignItems: "flex-start",
        gap: "13px",
        maxWidth: "750px",
        margin: "0 auto 25px",
        padding: "17px 19px",
        border:
            "1px solid rgba(248,113,113,0.18)",
        borderRadius: "14px",
        background:
            "rgba(127,29,29,0.16)",
        boxShadow:
            "0 15px 40px rgba(127,29,29,0.08)"
    },


    errorIcon: {
        width: "28px",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "50%",
        background:
            "rgba(239,68,68,0.14)",
        color: "#fca5a5",
        fontWeight: 900,
        fontSize: "14px"
    },


    errorContent: {
        minWidth: 0
    },


    errorTitle: {
        display: "block",
        color: "#fecaca",
        fontSize: "13px",
        marginBottom: "4px"
    },


    errorText: {
        margin: 0,
        color: "#fca5a5",
        fontSize: "12px",
        lineHeight: 1.6
    },


    // =========================================================
    // LOADING
    // =========================================================

    loadingCard: {
        maxWidth: "600px",
        margin: "70px auto",
        padding: "55px 30px",
        textAlign: "center",
        border:
            "1px solid rgba(148,163,184,0.12)",
        borderRadius: "22px",
        background:
            "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(8,13,27,0.82))",
        boxShadow:
            "0 25px 70px rgba(0,0,0,0.22)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)"
    },


    loadingOrb: {
        width: "78px",
        height: "78px",
        margin: "0 auto 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background:
            "conic-gradient(from 0deg, #6366f1, #22d3ee, #8b5cf6, #6366f1)",
        padding: "2px",
        boxShadow:
            "0 0 45px rgba(99,102,241,0.18)"
    },


    loadingInner: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "#080d1c",
        fontSize: "25px"
    },


    loadingTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "21px",
        fontWeight: 800
    },


    loadingText: {
        margin: "9px 0 0",
        color: "#64748b",
        fontSize: "13px"
    },


    loadingBar: {
        width: "180px",
        height: "4px",
        margin: "22px auto 0",
        overflow: "hidden",
        borderRadius: "999px",
        background:
            "rgba(148,163,184,0.10)"
    },


    loadingBarFill: {
        width: "45%",
        height: "100%",
        borderRadius: "999px",
        background:
            "linear-gradient(90deg, #6366f1, #22d3ee)"
    }

};

export default MyApplications;