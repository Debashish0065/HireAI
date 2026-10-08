import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HRInterviews() {
    const navigate = useNavigate();

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // FETCH ALL INTERVIEWS
    // =========================================================

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await fetch(
                    "/api/v1/interviews/admin",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }

                if (response.status === 403) {
                    setError(
                        "You are not authorized to view interviews."
                    );
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        `Failed to load interviews (${response.status})`
                    );
                }

                const data = await response.json();

                setInterviews(
                    Array.isArray(data) ? data : []
                );
            } catch (err) {
                console.error(
                    "Error loading interviews:",
                    err
                );

                setError(
                    "Failed to load interviews. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchInterviews();
    }, [navigate]);

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // =========================================================
    // STATUS STYLE
    // =========================================================

    const getStatusStyle = (status) => {
        switch (status) {
            case "COMPLETED":
                return {
                    background:
                        "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.08))",
                    color: "#6ee7b7",
                    border: "1px solid rgba(52,211,153,0.25)",
                    dot: "#34d399",
                    shadow: "0 0 18px rgba(52,211,153,0.12)",
                };

            case "IN_PROGRESS":
                return {
                    background:
                        "linear-gradient(135deg, rgba(99,102,241,0.20), rgba(34,211,238,0.08))",
                    color: "#a5b4fc",
                    border: "1px solid rgba(129,140,248,0.28)",
                    dot: "#818cf8",
                    shadow: "0 0 18px rgba(99,102,241,0.15)",
                };

            case "NOT_STARTED":
                return {
                    background:
                        "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(217,119,6,0.07))",
                    color: "#fcd34d",
                    border: "1px solid rgba(251,191,36,0.25)",
                    dot: "#fbbf24",
                    shadow: "0 0 18px rgba(245,158,11,0.10)",
                };

            default:
                return {
                    background:
                        "linear-gradient(135deg, rgba(148,163,184,0.15), rgba(71,85,105,0.08))",
                    color: "#cbd5e1",
                    border: "1px solid rgba(148,163,184,0.20)",
                    dot: "#94a3b8",
                    shadow: "none",
                };
        }
    };

    // =========================================================
    // FORMAT STATUS
    // =========================================================

    const formatStatus = (status) => {
        if (!status) return "UNKNOWN";

        return status
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div style={styles.page}>

            {/* =================================================
                BACKGROUND GLOW EFFECTS
            ================================================= */}

            <div style={styles.backgroundGlowOne} />
            <div style={styles.backgroundGlowTwo} />
            <div style={styles.backgroundGlowThree} />

            {/* =================================================
                HEADER
            ================================================= */}

            <header style={styles.header}>

                <div style={styles.headerInner}>

                    {/* Brand */}

                    <div style={styles.brandSection}>

                        <div style={styles.logoMark}>
                            ✦
                        </div>

                        <div>
                            <h1 style={styles.logo}>
                                Hire<span style={styles.logoAccent}>
                                    AI
                                </span>
                            </h1>

                            <p style={styles.subtitle}>
                                HR Interview Management
                            </p>
                        </div>

                    </div>

                    {/* Header actions */}

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

                </div>

            </header>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main style={styles.container}>

                {/* =================================================
                    BREADCRUMB / BACK
                ================================================= */}

                <div style={styles.topNavigation}>

                    <button
                        style={styles.backButton}
                        onClick={() =>
                            navigate("/hr/dashboard")
                        }
                    >
                        <span style={styles.backArrow}>
                            ←
                        </span>

                        Dashboard
                    </button>

                    <div style={styles.breadcrumb}>
                        HR Workspace
                        <span style={styles.breadcrumbSeparator}>
                            /
                        </span>
                        Interviews
                    </div>

                </div>

                {/* =================================================
                    PAGE TITLE
                ================================================= */}

                <section style={styles.titleSection}>

                    <div>

                        <div style={styles.titleEyebrow}>
                            <span style={styles.eyebrowDot} />
                            INTERVIEW MANAGEMENT
                        </div>

                        <h2 style={styles.heading}>
                            Candidate{" "}
                            <span style={styles.headingAccent}>
                                Interviews
                            </span>
                        </h2>

                        <p style={styles.description}>
                            Monitor candidate interviews,
                            assessment progress, and AI
                            evaluation results from one place.
                        </p>

                    </div>

                    {/* Interview count */}

                    {!loading && !error && (
                        <div style={styles.summaryCard}>

                            <div style={styles.summaryIcon}>
                                ◫
                            </div>

                            <div>

                                <span style={styles.summaryLabel}>
                                    Total Interviews
                                </span>

                                <strong style={styles.summaryValue}>
                                    {interviews.length}
                                </strong>

                            </div>

                        </div>
                    )}

                </section>

                {/* =================================================
                    LOADING STATE
                ================================================= */}

                {loading && (
                    <div style={styles.messageCard}>

                        <div style={styles.loadingIcon}>
                            <div style={styles.loadingSpinner} />
                        </div>

                        <h3 style={styles.messageTitle}>
                            Loading Interviews
                        </h3>

                        <p style={styles.emptyText}>
                            Please wait while we load candidate
                            interviews.
                        </p>

                    </div>
                )}

                {/* =================================================
                    ERROR STATE
                ================================================= */}

                {!loading && error && (
                    <div style={styles.messageCard}>

                        <div style={styles.errorIcon}>
                            !
                        </div>

                        <h3 style={styles.messageTitle}>
                            Unable to Load Interviews
                        </h3>

                        <p style={styles.errorText}>
                            {error}
                        </p>

                        <button
                            style={styles.retryButton}
                            onClick={() =>
                                window.location.reload()
                            }
                        >
                            Try Again
                            <span style={styles.arrowIcon}>
                                →
                            </span>
                        </button>

                    </div>
                )}

                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {!loading &&
                    !error &&
                    interviews.length === 0 && (
                        <div style={styles.emptyCard}>

                            <div style={styles.emptyIconWrapper}>
                                <div style={styles.emptyIcon}>
                                    ◫
                                </div>
                            </div>

                            <div style={styles.emptyEyebrow}>
                                INTERVIEW CENTER
                            </div>

                            <h3 style={styles.emptyTitle}>
                                No Interviews Found
                            </h3>

                            <p style={styles.emptyText}>
                                No candidate interviews have
                                been created yet. Interviews
                                will appear here once candidates
                                are scheduled.
                            </p>

                            <button
                                style={styles.applicantsButton}
                                onClick={() =>
                                    navigate("/hr/applicants")
                                }
                            >
                                <span>
                                    View Applicants
                                </span>

                                <span style={styles.arrowIcon}>
                                    →
                                </span>
                            </button>

                        </div>
                    )}

                {/* =================================================
                    INTERVIEW LIST
                ================================================= */}

                {!loading &&
                    !error &&
                    interviews.length > 0 && (

                        <section style={styles.interviewList}>

                            {/* List heading */}

                            <div style={styles.listHeader}>

                                <div>

                                    <div style={styles.listEyebrow}>
                                        ALL INTERVIEWS
                                    </div>

                                    <h3 style={styles.listTitle}>
                                        Interview Overview
                                    </h3>

                                </div>

                                <div style={styles.countBadge}>
                                    <span style={styles.countDot} />
                                    {interviews.length}{" "}
                                    {interviews.length === 1
                                        ? "Interview"
                                        : "Interviews"}
                                </div>

                            </div>

                            {/* =================================================
                                INTERVIEW CARDS
                            ================================================= */}

                            <div style={styles.cardsContainer}>

                                {interviews.map((interview) => {

                                    const statusStyle =
                                        getStatusStyle(
                                            interview.status
                                        );

                                    const score = Math.max(
                                        0,
                                        Math.min(
                                            100,
                                            Number(
                                                interview.score ?? 0
                                            )
                                        )
                                    );

                                    return (
                                        <div
                                            key={interview.id}
                                            style={styles.interviewCard}
                                        >

                                            {/* Top accent */}

                                            <div
                                                style={{
                                                    ...styles.cardAccent,
                                                    background:
                                                        statusStyle.dot,
                                                }}
                                            />

                                            {/* =================================================
                                                LEFT - INTERVIEW INFO
                                            ================================================= */}

                                            <div style={styles.interviewInfo}>

                                                <div style={styles.interviewIcon}>
                                                    <span>
                                                        ✦
                                                    </span>
                                                </div>

                                                <div style={styles.infoContent}>

                                                    <div style={styles.idLabel}>
                                                        INTERVIEW #{interview.id}
                                                    </div>

                                                    <h3 style={styles.jobTitle}>
                                                        {interview.jobTitle ||
                                                            "Interview"}
                                                    </h3>

                                                    <div style={styles.metaRow}>

                                                        <span style={styles.metaItem}>
                                                            <span style={styles.metaIcon}>
                                                                ◈
                                                            </span>

                                                            Job ID:{" "}
                                                            {interview.jobId ??
                                                                "N/A"}
                                                        </span>

                                                        <span style={styles.metaDivider}>
                                                            •
                                                        </span>

                                                        <span style={styles.metaItem}>
                                                            <span style={styles.metaIcon}>
                                                                ◷
                                                            </span>

                                                            Candidate Assessment
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                            {/* =================================================
                                                CENTER - STATUS
                                            ================================================= */}

                                            <div style={styles.statusSection}>

                                                <span
                                                    style={{
                                                        ...styles.statusBadge,
                                                        background:
                                                            statusStyle.background,
                                                        color:
                                                            statusStyle.color,
                                                        border:
                                                            statusStyle.border,
                                                        boxShadow:
                                                            statusStyle.shadow,
                                                    }}
                                                >

                                                    <span
                                                        style={{
                                                            ...styles.statusDot,
                                                            backgroundColor:
                                                                statusStyle.dot,
                                                        }}
                                                    />

                                                    {formatStatus(
                                                        interview.status
                                                    )}

                                                </span>

                                                <div style={styles.metricsRow}>

                                                    <div style={styles.metric}>

                                                        <span style={styles.metricLabel}>
                                                            SCORE
                                                        </span>

                                                        <strong
                                                            style={{
                                                                ...styles.metricValue,
                                                                color:
                                                                    score >= 70
                                                                        ? "#6ee7b7"
                                                                        : score >= 40
                                                                        ? "#fcd34d"
                                                                        : "#fda4af",
                                                            }}
                                                        >
                                                            {score}
                                                        </strong>

                                                        <span style={styles.metricSuffix}>
                                                            /100
                                                        </span>

                                                    </div>

                                                    <div style={styles.metricSeparator} />

                                                    <div style={styles.metric}>

                                                        <span style={styles.metricLabel}>
                                                            QUESTIONS
                                                        </span>

                                                        <strong style={styles.metricValue}>
                                                            {interview.totalQuestions ??
                                                                0}
                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>

                                            {/* =================================================
                                                RIGHT - VIEW BUTTON
                                            ================================================= */}

                                            <button
                                                style={styles.viewButton}
                                                onClick={() =>
                                                    navigate(
                                                        `/hr/interviews/${interview.id}`
                                                    )
                                                }
                                            >

                                                <span>
                                                    View Details
                                                </span>

                                                <span style={styles.viewArrow}>
                                                    →
                                                </span>

                                            </button>

                                        </div>
                                    );
                                })}

                            </div>

                        </section>
                    )}

            </main>
        </div>
    );
}

/* =============================================================
   STYLES
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
            "radial-gradient(circle at 15% 10%, rgba(99,102,241,0.12), transparent 30%), radial-gradient(circle at 85% 15%, rgba(34,211,238,0.08), transparent 28%), #060914",
        color: "#f8fafc",
        fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    // =========================================================
    // BACKGROUND GLOWS
    // =========================================================

    backgroundGlowOne: {
        position: "fixed",
        width: "420px",
        height: "420px",
        top: "-180px",
        left: "-160px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(99,102,241,0.16), transparent 68%)",
        filter: "blur(20px)",
        pointerEvents: "none",
        zIndex: 0,
    },

    backgroundGlowTwo: {
        position: "fixed",
        width: "500px",
        height: "500px",
        right: "-220px",
        top: "160px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(34,211,238,0.10), transparent 68%)",
        filter: "blur(30px)",
        pointerEvents: "none",
        zIndex: 0,
    },

    backgroundGlowThree: {
        position: "fixed",
        width: "400px",
        height: "400px",
        bottom: "-220px",
        left: "35%",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(139,92,246,0.10), transparent 68%)",
        filter: "blur(30px)",
        pointerEvents: "none",
        zIndex: 0,
    },

    // =========================================================
    // HEADER
    // =========================================================

    header: {
        position: "sticky",
        top: 0,
        zIndex: 20,
        background:
            "rgba(6,9,20,0.78)",
        borderBottom:
            "1px solid rgba(148,163,184,0.10)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
    },

    headerInner: {
        maxWidth: "1240px",
        margin: "0 auto",
        padding: "18px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
    },

    brandSection: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },

    logoMark: {
        width: "42px",
        height: "42px",
        borderRadius: "13px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#ffffff",
        fontSize: "20px",
        fontWeight: "800",
        boxShadow:
            "0 8px 28px rgba(99,102,241,0.28)",
    },

    logo: {
        margin: 0,
        fontSize: "24px",
        lineHeight: 1,
        fontWeight: "800",
        letterSpacing: "-0.7px",
        color: "#f8fafc",
    },

    logoAccent: {
        background:
            "linear-gradient(90deg, #818cf8, #22d3ee)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },

    subtitle: {
        margin: "5px 0 0",
        color: "#64748b",
        fontSize: "12px",
        letterSpacing: "0.2px",
    },

    headerButtons: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },

    profileButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 15px",
        border:
            "1px solid rgba(129,140,248,0.20)",
        borderRadius: "11px",
        background:
            "rgba(99,102,241,0.08)",
        color: "#c7d2fe",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
        transition: "all 0.2s ease",
    },

    logoutButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 15px",
        border:
            "1px solid rgba(248,113,113,0.20)",
        borderRadius: "11px",
        background:
            "rgba(239,68,68,0.07)",
        color: "#fca5a5",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
        transition: "all 0.2s ease",
    },

    buttonIcon: {
        fontSize: "13px",
        opacity: 0.9,
    },

    // =========================================================
    // CONTAINER
    // =========================================================

    container: {
        position: "relative",
        zIndex: 2,
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "35px 30px 70px",
    },

    // =========================================================
    // TOP NAVIGATION
    // =========================================================

    topNavigation: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        marginBottom: "32px",
        flexWrap: "wrap",
    },

    backButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "9px 14px",
        border:
            "1px solid rgba(148,163,184,0.14)",
        borderRadius: "10px",
        background:
            "rgba(15,23,42,0.68)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
    },

    backArrow: {
        fontSize: "16px",
        color: "#818cf8",
    },

    breadcrumb: {
        color: "#64748b",
        fontSize: "12px",
        letterSpacing: "0.2px",
    },

    breadcrumbSeparator: {
        margin: "0 8px",
        color: "#334155",
    },

    // =========================================================
    // TITLE
    // =========================================================

    titleSection: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "30px",
        marginBottom: "38px",
    },

    titleEyebrow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#818cf8",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "1.4px",
        marginBottom: "10px",
    },

    eyebrowDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#22d3ee",
        boxShadow:
            "0 0 12px rgba(34,211,238,0.8)",
    },

    heading: {
        margin: 0,
        fontSize: "42px",
        lineHeight: 1.1,
        fontWeight: "800",
        letterSpacing: "-1.5px",
        color: "#f8fafc",
    },

    headingAccent: {
        background:
            "linear-gradient(90deg, #818cf8, #22d3ee)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },

    description: {
        maxWidth: "650px",
        margin: "13px 0 0",
        color: "#94a3b8",
        lineHeight: 1.7,
        fontSize: "14px",
    },

    // =========================================================
    // SUMMARY
    // =========================================================

    summaryCard: {
        minWidth: "180px",
        display: "flex",
        alignItems: "center",
        gap: "13px",
        padding: "14px 17px",
        borderRadius: "15px",
        border:
            "1px solid rgba(99,102,241,0.18)",
        background:
            "linear-gradient(145deg, rgba(30,41,59,0.72), rgba(15,23,42,0.62))",
        boxShadow:
            "0 15px 35px rgba(0,0,0,0.18)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
    },

    summaryIcon: {
        width: "38px",
        height: "38px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "11px",
        background:
            "rgba(99,102,241,0.13)",
        color: "#a5b4fc",
        fontSize: "19px",
    },

    summaryLabel: {
        display: "block",
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "0.8px",
        marginBottom: "3px",
    },

    summaryValue: {
        display: "block",
        color: "#f8fafc",
        fontSize: "21px",
        fontWeight: "800",
    },

    // =========================================================
    // MESSAGE CARDS
    // =========================================================

    messageCard: {
        maxWidth: "720px",
        margin: "20px auto 0",
        padding: "70px 35px",
        textAlign: "center",
        borderRadius: "20px",
        border:
            "1px solid rgba(148,163,184,0.13)",
        background:
            "linear-gradient(145deg, rgba(17,24,39,0.88), rgba(10,15,30,0.82))",
        boxShadow:
            "0 25px 70px rgba(0,0,0,0.25)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
    },

    loadingIcon: {
        width: "60px",
        height: "60px",
        margin: "0 auto 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "18px",
        background:
            "rgba(99,102,241,0.10)",
        border:
            "1px solid rgba(129,140,248,0.18)",
    },

    loadingSpinner: {
        width: "25px",
        height: "25px",
        borderRadius: "50%",
        border:
            "3px solid rgba(129,140,248,0.18)",
        borderTopColor: "#818cf8",
        borderRightColor: "#22d3ee",
        animation: "hireai-spin 0.9s linear infinite",
    },

    errorIcon: {
        width: "60px",
        height: "60px",
        margin: "0 auto 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "18px",
        background:
            "rgba(239,68,68,0.10)",
        border:
            "1px solid rgba(248,113,113,0.20)",
        color: "#fca5a5",
        fontSize: "25px",
        fontWeight: "800",
    },

    messageTitle: {
        margin: "0 0 10px",
        fontSize: "22px",
        color: "#f8fafc",
    },

    emptyText: {
        maxWidth: "560px",
        margin: "0 auto",
        color: "#64748b",
        lineHeight: 1.7,
        fontSize: "14px",
    },

    errorText: {
        maxWidth: "600px",
        margin: "0 auto",
        color: "#fda4af",
        lineHeight: 1.6,
        fontSize: "14px",
    },

    retryButton: {
        marginTop: "25px",
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "11px 18px",
        border: "1px solid rgba(129,140,248,0.22)",
        borderRadius: "11px",
        background:
            "linear-gradient(135deg, #4f46e5, #6366f1)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "13px",
        boxShadow:
            "0 10px 25px rgba(79,70,229,0.22)",
    },

    arrowIcon: {
        fontSize: "16px",
    },

    // =========================================================
    // EMPTY STATE
    // =========================================================

    emptyCard: {
        maxWidth: "720px",
        margin: "10px auto 0",
        padding: "75px 35px",
        textAlign: "center",
        borderRadius: "22px",
        border:
            "1px solid rgba(99,102,241,0.15)",
        background:
            "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.10), transparent 42%), linear-gradient(145deg, rgba(17,24,39,0.90), rgba(8,13,27,0.88))",
        boxShadow:
            "0 30px 80px rgba(0,0,0,0.28)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
    },

    emptyIconWrapper: {
        width: "78px",
        height: "78px",
        margin: "0 auto 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "22px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(34,211,238,0.07))",
        border:
            "1px solid rgba(129,140,248,0.20)",
        boxShadow:
            "0 15px 40px rgba(79,70,229,0.12)",
    },

    emptyIcon: {
        color: "#818cf8",
        fontSize: "34px",
    },

    emptyEyebrow: {
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.5px",
        marginBottom: "9px",
    },

    emptyTitle: {
        margin: "0 0 12px",
        fontSize: "25px",
        color: "#f8fafc",
        letterSpacing: "-0.4px",
    },

    applicantsButton: {
        marginTop: "27px",
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 20px",
        border:
            "1px solid rgba(129,140,248,0.24)",
        borderRadius: "12px",
        background:
            "linear-gradient(135deg, #4f46e5, #6366f1)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "13px",
        boxShadow:
            "0 12px 30px rgba(79,70,229,0.22)",
    },

    // =========================================================
    // INTERVIEW LIST
    // =========================================================

    interviewList: {
        width: "100%",
    },

    listHeader: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "20px",
        marginBottom: "18px",
    },

    listEyebrow: {
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.4px",
        marginBottom: "5px",
    },

    listTitle: {
        margin: 0,
        fontSize: "21px",
        fontWeight: "750",
        color: "#e2e8f0",
        letterSpacing: "-0.3px",
    },

    countBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "7px 12px",
        borderRadius: "20px",
        background:
            "rgba(99,102,241,0.09)",
        border:
            "1px solid rgba(129,140,248,0.17)",
        color: "#a5b4fc",
        fontSize: "11px",
        fontWeight: "700",
        whiteSpace: "nowrap",
    },

    countDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#818cf8",
        boxShadow:
            "0 0 9px rgba(129,140,248,0.7)",
    },

    cardsContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "13px",
    },

    // =========================================================
    // INTERVIEW CARD
    // =========================================================

    interviewCard: {
        position: "relative",
        display: "grid",
        gridTemplateColumns:
            "minmax(300px, 1.5fr) minmax(220px, 0.8fr) auto",
        alignItems: "center",
        gap: "25px",
        overflow: "hidden",
        padding: "22px 22px 22px 25px",
        borderRadius: "17px",
        border:
            "1px solid rgba(148,163,184,0.11)",
        background:
            "linear-gradient(145deg, rgba(17,24,39,0.90), rgba(10,15,30,0.84))",
        boxShadow:
            "0 15px 45px rgba(0,0,0,0.18)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        transition:
            "transform 0.2s ease, border-color 0.2s ease",
    },

    cardAccent: {
        position: "absolute",
        left: 0,
        top: "18px",
        bottom: "18px",
        width: "3px",
        borderRadius: "0 5px 5px 0",
        boxShadow:
            "0 0 15px rgba(99,102,241,0.35)",
    },

    // =========================================================
    // INTERVIEW INFO
    // =========================================================

    interviewInfo: {
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },

    interviewIcon: {
        flexShrink: 0,
        width: "48px",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "14px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(34,211,238,0.07))",
        border:
            "1px solid rgba(129,140,248,0.16)",
        color: "#818cf8",
        fontSize: "20px",
        boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.04)",
    },

    infoContent: {
        minWidth: 0,
    },

    idLabel: {
        color: "#6366f1",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1.1px",
        marginBottom: "5px",
    },

    jobTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "17px",
        fontWeight: "700",
        lineHeight: 1.3,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },

    metaRow: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        flexWrap: "wrap",
        marginTop: "8px",
    },

    metaItem: {
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        color: "#64748b",
        fontSize: "11px",
    },

    metaIcon: {
        color: "#818cf8",
        fontSize: "10px",
    },

    metaDivider: {
        color: "#334155",
        fontSize: "10px",
    },

    // =========================================================
    // STATUS / METRICS
    // =========================================================

    statusSection: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
    },

    statusBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "6px 11px",
        borderRadius: "20px",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "0.4px",
        whiteSpace: "nowrap",
    },

    statusDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
    },

    metricsRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "18px",
    },

    metric: {
        display: "flex",
        alignItems: "baseline",
        gap: "3px",
    },

    metricLabel: {
        color: "#475569",
        fontSize: "8px",
        fontWeight: "800",
        letterSpacing: "0.8px",
        marginRight: "3px",
    },

    metricValue: {
        color: "#e2e8f0",
        fontSize: "16px",
        fontWeight: "800",
    },

    metricSuffix: {
        color: "#475569",
        fontSize: "10px",
        fontWeight: "600",
    },

    metricSeparator: {
        width: "1px",
        height: "22px",
        background:
            "rgba(148,163,184,0.10)",
    },

    // =========================================================
    // VIEW BUTTON
    // =========================================================

    viewButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
        minWidth: "125px",
        padding: "11px 15px",
        border:
            "1px solid rgba(99,102,241,0.25)",
        borderRadius: "11px",
        background:
            "linear-gradient(135deg, rgba(79,70,229,0.95), rgba(99,102,241,0.92))",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "12px",
        boxShadow:
            "0 10px 25px rgba(79,70,229,0.18)",
        whiteSpace: "nowrap",
    },

    viewArrow: {
        fontSize: "15px",
        color: "#c7d2fe",
    },
};

/* =============================================================
   ANIMATION
============================================================= */

const styleSheet = document.createElement("style");

styleSheet.innerHTML = `
@keyframes hireai-spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 900px) {
    .hireai-interview-card {
        grid-template-columns: 1fr !important;
    }
}
`;

if (!document.head.contains(styleSheet)) {
    document.head.appendChild(styleSheet);
}

export default HRInterviews;