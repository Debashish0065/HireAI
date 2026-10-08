import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function HRInterviewDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // FETCH INTERVIEW DETAILS
    // =========================================================

    useEffect(() => {
        const fetchInterviewDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await fetch(
                     `/api/v1/interviews/admin/${id}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    setError(
                        "You are not authorized to view this interview."
                    );
                    return;
                }

                if (response.status === 404) {
                    setError("Interview not found.");
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        `Failed to load interview (${response.status})`
                    );
                }

                const data = await response.json();

                console.log("Interview details:", data);

                setInterview(data);
            } catch (err) {
                console.error(
                    "Error loading interview details:",
                    err
                );

                setError(
                    "Failed to load interview details. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchInterviewDetails();
    }, [id, navigate]);

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // =========================================================
    // STATUS CONFIG
    // =========================================================

    const getStatusConfig = (status) => {
        switch (status) {
            case "COMPLETED":
                return {
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#34d399",
                    border: "rgba(16, 185, 129, 0.25)",
                    icon: "✓"
                };

            case "IN_PROGRESS":
                return {
                    background: "rgba(59, 130, 246, 0.12)",
                    color: "#60a5fa",
                    border: "rgba(59, 130, 246, 0.25)",
                    icon: "●"
                };

            case "NOT_STARTED":
                return {
                    background: "rgba(245, 158, 11, 0.12)",
                    color: "#fbbf24",
                    border: "rgba(245, 158, 11, 0.25)",
                    icon: "○"
                };

            default:
                return {
                    background: "rgba(148, 163, 184, 0.10)",
                    color: "#94a3b8",
                    border: "rgba(148, 163, 184, 0.20)",
                    icon: "?"
                };
        }
    };

    // =========================================================
    // COMPLETED QUESTIONS
    // =========================================================

    const getCompletedQuestions = () => {
        if (!interview) {
            return 0;
        }

        if (interview.status === "COMPLETED") {
            return interview.totalQuestions ?? 0;
        }

        return (
            interview.answeredQuestions ??
            interview.completedQuestions ??
            0
        );
    };

    // =========================================================
    // SCORE
    // =========================================================

    const getScore = () => {
        if (!interview) {
            return 0;
        }

        const score = Number(interview.score);

        if (Number.isNaN(score)) {
            return 0;
        }

        return Math.max(0, Math.min(100, score));
    };

    // =========================================================
    // PROGRESS
    // =========================================================

    const getQuestionProgress = () => {
        if (!interview) {
            return 0;
        }

        const total = Number(interview.totalQuestions ?? 0);
        const completed = Number(getCompletedQuestions());

        if (total <= 0) {
            return 0;
        }

        return Math.min(
            100,
            Math.round((completed / total) * 100)
        );
    };

    // =========================================================
    // SCORE LABEL
    // =========================================================

    const getScoreLabel = () => {
        const score = getScore();

        if (score >= 80) {
            return "Excellent";
        }

        if (score >= 60) {
            return "Good";
        }

        if (score >= 40) {
            return "Average";
        }

        return "Needs Improvement";
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div style={styles.page}>
                <div style={styles.backgroundGlowOne} />
                <div style={styles.backgroundGlowTwo} />

                <Header
                    navigate={navigate}
                    handleLogout={handleLogout}
                />

                <main style={styles.container}>
                    <div style={styles.loadingCard}>
                        <div style={styles.spinner} />

                        <h2 style={styles.loadingTitle}>
                            Loading Interview
                        </h2>

                        <p style={styles.loadingText}>
                            Please wait while we load the interview
                            details.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <div style={styles.page}>
                <div style={styles.backgroundGlowOne} />
                <div style={styles.backgroundGlowTwo} />

                <Header
                    navigate={navigate}
                    handleLogout={handleLogout}
                />

                <main style={styles.container}>
                    <button
                        style={styles.backButton}
                        onClick={() =>
                            navigate("/hr/interviews")
                        }
                    >
                        <span style={styles.backArrow}>
                            ←
                        </span>

                        Back to Interviews
                    </button>

                    <div style={styles.errorCard}>
                        <div style={styles.errorIcon}>
                            !
                        </div>

                        <h2 style={styles.errorTitle}>
                            Unable to Load Interview
                        </h2>

                        <p style={styles.errorText}>
                            {error}
                        </p>

                        <div style={styles.errorActions}>
                            <button
                                style={styles.retryButton}
                                onClick={() =>
                                    window.location.reload()
                                }
                            >
                                Try Again
                            </button>

                            <button
                                style={styles.secondaryButton}
                                onClick={() =>
                                    navigate(
                                        "/hr/interviews"
                                    )
                                }
                            >
                                Back to Interviews
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const statusConfig = getStatusConfig(
        interview?.status
    );

    const score = getScore();
    const questionProgress =
        getQuestionProgress();

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div style={styles.page}>
            {/* =================================================
                BACKGROUND
            ================================================= */}

            <div style={styles.backgroundGlowOne} />
            <div style={styles.backgroundGlowTwo} />

            {/* =================================================
                HEADER
            ================================================= */}

            <Header
                navigate={navigate}
                handleLogout={handleLogout}
            />

            {/* =================================================
                MAIN
            ================================================= */}

            <main style={styles.container}>
                {/* =================================================
                    BACK BUTTON
                ================================================= */}

                <button
                    style={styles.backButton}
                    onClick={() =>
                        navigate("/hr/interviews")
                    }
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                            "rgba(59, 130, 246, 0.10)";
                        e.currentTarget.style.borderColor =
                            "rgba(96, 165, 250, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                            "rgba(255, 255, 255, 0.045)";
                        e.currentTarget.style.borderColor =
                            "rgba(255, 255, 255, 0.08)";
                    }}
                >
                    <span style={styles.backArrow}>
                        ←
                    </span>

                    Back to Interviews
                </button>

                {/* =================================================
                    HERO
                ================================================= */}

                <section style={styles.heroSection}>
                    <div style={styles.heroBadge}>
                        <span style={styles.badgeDot} />

                        Interview Management
                    </div>

                    <h1 style={styles.heading}>
                        Interview Details
                    </h1>

                    <p style={styles.description}>
                        Review the candidate's interview progress,
                        assessment score, and interview information.
                    </p>
                </section>

                {/* =================================================
                    MAIN INTERVIEW CARD
                ================================================= */}

                <section style={styles.mainCard}>
                    <div style={styles.mainCardTop}>
                        <div style={styles.jobIdentity}>
                            <div style={styles.interviewIcon}>
                                🎯
                            </div>

                            <div style={styles.jobIdentityText}>
                                <span
                                    style={
                                        styles.smallLabel
                                    }
                                >
                                    Interview for
                                </span>

                                <h2
                                    style={
                                        styles.jobTitle
                                    }
                                >
                                    {interview.jobTitle ||
                                        "Interview"}
                                </h2>

                                <p
                                    style={
                                        styles.interviewId
                                    }
                                >
                                    Interview ID #
                                    {interview.id}
                                </p>
                            </div>
                        </div>

                        <div
                            style={{
                                ...styles.statusBadge,
                                background:
                                    statusConfig.background,
                                color:
                                    statusConfig.color,
                                borderColor:
                                    statusConfig.border
                            }}
                        >
                            <span>
                                {statusConfig.icon}
                            </span>

                            {interview.status ||
                                "UNKNOWN"}
                        </div>
                    </div>

                    {/* =================================================
                        QUICK STATS
                    ================================================= */}

                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div
                                style={{
                                    ...styles.statIcon,
                                    background:
                                        "rgba(59, 130, 246, 0.10)",
                                    color: "#60a5fa"
                                }}
                            >
                                #
                            </div>

                            <div>
                                <span
                                    style={
                                        styles.statLabel
                                    }
                                >
                                    Job ID
                                </span>

                                <strong
                                    style={
                                        styles.statValue
                                    }
                                >
                                    {interview.jobId ??
                                        "N/A"}
                                </strong>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div
                                style={{
                                    ...styles.statIcon,
                                    background:
                                        "rgba(139, 92, 246, 0.10)",
                                    color: "#a78bfa"
                                }}
                            >
                                ?
                            </div>

                            <div>
                                <span
                                    style={
                                        styles.statLabel
                                    }
                                >
                                    Questions
                                </span>

                                <strong
                                    style={
                                        styles.statValue
                                    }
                                >
                                    {interview.totalQuestions ??
                                        0}
                                </strong>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div
                                style={{
                                    ...styles.statIcon,
                                    background:
                                        "rgba(16, 185, 129, 0.10)",
                                    color: "#34d399"
                                }}
                            >
                                ✓
                            </div>

                            <div>
                                <span
                                    style={
                                        styles.statLabel
                                    }
                                >
                                    Completed
                                </span>

                                <strong
                                    style={
                                        styles.statValue
                                    }
                                >
                                    {getCompletedQuestions()}
                                </strong>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div
                                style={{
                                    ...styles.statIcon,
                                    background:
                                        "rgba(245, 158, 11, 0.10)",
                                    color: "#fbbf24"
                                }}
                            >
                                ★
                            </div>

                            <div>
                                <span
                                    style={
                                        styles.statLabel
                                    }
                                >
                                    Score
                                </span>

                                <strong
                                    style={
                                        styles.statValue
                                    }
                                >
                                    {score}/100
                                </strong>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =================================================
                    PROGRESS + SCORE
                ================================================= */}

                <div style={styles.analysisGrid}>
                    {/* QUESTION PROGRESS */}

                    <section style={styles.analysisCard}>
                        <div style={styles.cardTitleRow}>
                            <div>
                                <span
                                    style={
                                        styles.sectionEyebrow
                                    }
                                >
                                    Interview Progress
                                </span>

                                <h3
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Question Completion
                                </h3>
                            </div>

                            <span
                                style={
                                    styles.percentageValue
                                }
                            >
                                {questionProgress}%
                            </span>
                        </div>

                        <div
                            style={
                                styles.progressTrack
                            }
                        >
                            <div
                                style={{
                                    ...styles.progressFill,
                                    width: `${questionProgress}%`
                                }}
                            />
                        </div>

                        <div
                            style={
                                styles.progressFooter
                            }
                        >
                            <span>
                                {getCompletedQuestions()}{" "}
                                completed
                            </span>

                            <span>
                                {interview.totalQuestions ??
                                    0}{" "}
                                total questions
                            </span>
                        </div>
                    </section>

                    {/* SCORE */}

                    <section style={styles.analysisCard}>
                        <div style={styles.cardTitleRow}>
                            <div>
                                <span
                                    style={
                                        styles.sectionEyebrow
                                    }
                                >
                                    AI Assessment
                                </span>

                                <h3
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Interview Score
                                </h3>
                            </div>

                            <span
                                style={
                                    styles.scoreLabel
                                }
                            >
                                {getScoreLabel()}
                            </span>
                        </div>

                        <div style={styles.scoreContent}>
                            <div
                                style={
                                    styles.scoreCircle
                                }
                            >
                                <div
                                    style={
                                        styles.scoreCircleInner
                                    }
                                >
                                    <strong
                                        style={
                                            styles.scoreNumber
                                        }
                                    >
                                        {score}
                                    </strong>

                                    <span
                                        style={
                                            styles.scoreOutOf
                                        }
                                    >
                                        /100
                                    </span>
                                </div>
                            </div>

                            <div
                                style={
                                    styles.scoreDescription
                                }
                            >
                                <strong>
                                    Assessment Result
                                </strong>

                                <p>
                                    The current interview
                                    score is{" "}
                                    <b>{score}/100</b>.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* =================================================
                    INTERVIEW INFORMATION
                ================================================= */}

                <section style={styles.infoCard}>
                    <div style={styles.infoHeader}>
                        <div>
                            <span
                                style={
                                    styles.sectionEyebrow
                                }
                            >
                                Interview Overview
                            </span>

                            <h3
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Interview Information
                            </h3>
                        </div>

                        <div
                            style={
                                styles.infoHeaderIcon
                            }
                        >
                            ℹ
                        </div>
                    </div>

                    <div style={styles.infoGrid}>
                        <InfoItem
                            label="Interview ID"
                            value={`#${interview.id}`}
                        />

                        <InfoItem
                            label="Job ID"
                            value={
                                interview.jobId ??
                                "N/A"
                            }
                        />

                        <InfoItem
                            label="Interview Status"
                            value={
                                interview.status ??
                                "N/A"
                            }
                        />

                        <InfoItem
                            label="Total Questions"
                            value={
                                interview.totalQuestions ??
                                0
                            }
                        />

                        <InfoItem
                            label="Completed Questions"
                            value={
                                getCompletedQuestions()
                            }
                        />

                        <InfoItem
                            label="Interview Score"
                            value={`${score}/100`}
                        />
                    </div>
                </section>

                {/* =================================================
                    FOOTER ACTION
                ================================================= */}

                <div style={styles.bottomAction}>
                    <button
                        style={styles.bottomButton}
                        onClick={() =>
                            navigate("/hr/interviews")
                        }
                    >
                        <span>←</span>

                        Back to All Interviews
                    </button>
                </div>
            </main>
        </div>
    );
}

/* =============================================================
   HEADER COMPONENT
============================================================= */

function Header({
    navigate,
    handleLogout
}) {
    return (
        <header style={styles.header}>
            <div style={styles.brandSection}>
                <div style={styles.logoIcon}>
                    🚀
                </div>

                <div>
                    <h1 style={styles.logo}>
                        HireAI
                    </h1>

                    <p style={styles.subtitle}>
                        HR Interview Management
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
                    <span>👤</span>
                    My Profile
                </button>

                <button
                    style={styles.logoutButton}
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </header>
    );
}

/* =============================================================
   INFORMATION ITEM
============================================================= */

function InfoItem({ label, value }) {
    return (
        <div style={styles.infoItem}>
            <span style={styles.infoLabel}>
                {label}
            </span>

            <strong style={styles.infoValue}>
                {value}
            </strong>
        </div>
    );
}

/* =============================================================
   STYLES
============================================================= */

const styles = {
    /* =========================================================
       PAGE
    ========================================================= */

    page: {
        minHeight: "100vh",
        background:
            "radial-gradient(circle at 10% 0%, rgba(37, 99, 235, 0.12), transparent 30%), radial-gradient(circle at 90% 15%, rgba(124, 58, 237, 0.10), transparent 30%), #080d18",
        color: "#f8fafc",
        fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        position: "relative",
        overflowX: "hidden"
    },

    backgroundGlowOne: {
        position: "fixed",
        width: "420px",
        height: "420px",
        borderRadius: "50%",
        background:
            "rgba(37, 99, 235, 0.07)",
        filter: "blur(90px)",
        top: "-190px",
        left: "-170px",
        pointerEvents: "none"
    },

    backgroundGlowTwo: {
        position: "fixed",
        width: "380px",
        height: "380px",
        borderRadius: "50%",
        background:
            "rgba(124, 58, 237, 0.07)",
        filter: "blur(90px)",
        bottom: "-150px",
        right: "-130px",
        pointerEvents: "none"
    },

    /* =========================================================
       HEADER
    ========================================================= */

    header: {
        minHeight: "76px",
        padding: "0 42px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background:
            "rgba(10, 16, 29, 0.82)",
        borderBottom:
            "1px solid rgba(255, 255, 255, 0.07)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        position: "sticky",
        top: 0,
        zIndex: 100
    },

    brandSection: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },

    logoIcon: {
        width: "42px",
        height: "42px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg, #2563eb, #7c3aed)",
        boxShadow:
            "0 8px 25px rgba(37, 99, 235, 0.28)",
        fontSize: "20px"
    },

    logo: {
        margin: 0,
        fontSize: "21px",
        fontWeight: 750,
        letterSpacing: "-0.4px",
        color: "#f8fafc"
    },

    subtitle: {
        margin: "2px 0 0",
        color: "#7f8ba3",
        fontSize: "11px",
        fontWeight: 500
    },

    headerButtons: {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },

    profileButton: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "10px 15px",
        border:
            "1px solid rgba(255, 255, 255, 0.09)",
        borderRadius: "10px",
        background:
            "rgba(255, 255, 255, 0.045)",
        color: "#dbe4f2",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "13px"
    },

    logoutButton: {
        padding: "10px 15px",
        border:
            "1px solid rgba(248, 113, 113, 0.18)",
        borderRadius: "10px",
        background:
            "rgba(239, 68, 68, 0.08)",
        color: "#fca5a5",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "13px"
    },

    /* =========================================================
       CONTAINER
    ========================================================= */

    container: {
        width: "100%",
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "38px 30px 70px",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 1
    },

    backButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "9px 14px",
        marginBottom: "30px",
        border:
            "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "10px",
        background:
            "rgba(255, 255, 255, 0.045)",
        color: "#b9c5d8",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "13px",
        transition: "all 0.2s ease"
    },

    backArrow: {
        fontSize: "17px",
        lineHeight: 1
    },

    /* =========================================================
       HERO
    ========================================================= */

    heroSection: {
        textAlign: "center",
        maxWidth: "720px",
        margin: "0 auto 35px"
    },

    heroBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 12px",
        borderRadius: "999px",
        background:
            "rgba(59, 130, 246, 0.09)",
        border:
            "1px solid rgba(96, 165, 250, 0.18)",
        color: "#93c5fd",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.55px",
        textTransform: "uppercase",
        marginBottom: "14px"
    },

    badgeDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#60a5fa",
        boxShadow:
            "0 0 10px rgba(96, 165, 250, 0.8)"
    },

    heading: {
        margin: 0,
        fontSize: "40px",
        lineHeight: 1.15,
        fontWeight: 800,
        letterSpacing: "-1.2px",
        background:
            "linear-gradient(135deg, #ffffff 20%, #b8c7e6 70%, #8aa8df)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
    },

    description: {
        margin: "12px auto 0",
        color: "#8996aa",
        fontSize: "14px",
        lineHeight: 1.7,
        maxWidth: "610px"
    },

    /* =========================================================
       MAIN CARD
    ========================================================= */

    mainCard: {
        padding: "22px",
        marginBottom: "16px",
        background:
            "linear-gradient(145deg, rgba(18, 28, 46, 0.94), rgba(11, 19, 33, 0.94))",
        border:
            "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "18px",
        boxShadow:
            "0 18px 50px rgba(0, 0, 0, 0.20)"
    },

    mainCardTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        paddingBottom: "20px",
        borderBottom:
            "1px solid rgba(255,255,255,0.065)"
    },

    jobIdentity: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        minWidth: 0
    },

    interviewIcon: {
        width: "50px",
        height: "50px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "14px",
        background:
            "linear-gradient(135deg, rgba(37, 99, 235, 0.20), rgba(124, 58, 237, 0.20))",
        border:
            "1px solid rgba(96, 165, 250, 0.16)",
        fontSize: "22px"
    },

    jobIdentityText: {
        minWidth: 0
    },

    smallLabel: {
        display: "block",
        marginBottom: "4px",
        color: "#68768c",
        fontSize: "9px",
        textTransform: "uppercase",
        letterSpacing: "0.6px",
        fontWeight: 700
    },

    jobTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "21px",
        fontWeight: 750,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },

    interviewId: {
        margin: "5px 0 0",
        color: "#768399",
        fontSize: "11px"
    },

    statusBadge: {
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "8px 12px",
        borderRadius: "999px",
        border: "1px solid",
        fontSize: "10px",
        fontWeight: 800,
        letterSpacing: "0.35px"
    },

    /* =========================================================
       STATS
    ========================================================= */

    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        gap: "12px",
        marginTop: "18px"
    },

    statCard: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "13px",
        borderRadius: "12px",
        background:
            "rgba(255,255,255,0.025)",
        border:
            "1px solid rgba(255,255,255,0.055)"
    },

    statIcon: {
        width: "34px",
        height: "34px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: 800
    },

    statLabel: {
        display: "block",
        color: "#6f7d92",
        fontSize: "9px",
        textTransform: "uppercase",
        letterSpacing: "0.45px",
        fontWeight: 700,
        marginBottom: "3px"
    },

    statValue: {
        display: "block",
        color: "#e9eff8",
        fontSize: "15px",
        fontWeight: 750
    },

    /* =========================================================
       ANALYSIS
    ========================================================= */

    analysisGrid: {
        display: "grid",
        gridTemplateColumns:
            "1.15fr 0.85fr",
        gap: "16px",
        marginBottom: "16px"
    },

    analysisCard: {
        padding: "20px",
        background:
            "linear-gradient(145deg, rgba(18, 28, 46, 0.88), rgba(12, 20, 34, 0.88))",
        border:
            "1px solid rgba(255,255,255,0.075)",
        borderRadius: "16px",
        boxShadow:
            "0 12px 35px rgba(0,0,0,0.15)"
    },

    cardTitleRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "15px"
    },

    sectionEyebrow: {
        display: "block",
        color: "#64748b",
        fontSize: "9px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.65px",
        marginBottom: "5px"
    },

    sectionTitle: {
        margin: 0,
        color: "#eaf1fb",
        fontSize: "16px",
        fontWeight: 700
    },

    percentageValue: {
        color: "#60a5fa",
        fontSize: "22px",
        fontWeight: 800
    },

    scoreLabel: {
        padding: "5px 9px",
        borderRadius: "7px",
        background:
            "rgba(16,185,129,0.09)",
        color: "#6ee7b7",
        fontSize: "9px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.4px"
    },

    progressTrack: {
        height: "9px",
        marginTop: "24px",
        borderRadius: "999px",
        overflow: "hidden",
        background:
            "rgba(255,255,255,0.06)"
    },

    progressFill: {
        height: "100%",
        borderRadius: "999px",
        background:
            "linear-gradient(90deg, #2563eb, #7c3aed)",
        boxShadow:
            "0 0 16px rgba(59,130,246,0.35)",
        transition: "width 0.4s ease"
    },

    progressFooter: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "9px",
        color: "#69778c",
        fontSize: "10px"
    },

    scoreContent: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
        marginTop: "17px"
    },

    scoreCircle: {
        width: "88px",
        height: "88px",
        flexShrink: 0,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "conic-gradient(#60a5fa 0%, #7c3aed 65%, rgba(255,255,255,0.06) 65%, rgba(255,255,255,0.06) 100%)",
        padding: "5px",
        boxSizing: "border-box"
    },

    scoreCircleInner: {
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#101827",
        flexDirection: "column"
    },

    scoreNumber: {
        color: "#f8fafc",
        fontSize: "23px",
        lineHeight: 1,
        fontWeight: 800
    },

    scoreOutOf: {
        marginTop: "3px",
        color: "#69778c",
        fontSize: "9px"
    },

    scoreDescription: {
        minWidth: 0
    },

    scoreDescription: {
        color: "#cbd5e1",
        fontSize: "12px",
        lineHeight: 1.5
    },

    /* =========================================================
       INFO CARD
    ========================================================= */

    infoCard: {
        padding: "20px",
        marginBottom: "22px",
        background:
            "linear-gradient(145deg, rgba(18, 28, 46, 0.88), rgba(12, 20, 34, 0.88))",
        border:
            "1px solid rgba(255,255,255,0.075)",
        borderRadius: "16px",
        boxShadow:
            "0 12px 35px rgba(0,0,0,0.15)"
    },

    infoHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "16px",
        borderBottom:
            "1px solid rgba(255,255,255,0.055)"
    },

    infoHeaderIcon: {
        width: "30px",
        height: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9px",
        background:
            "rgba(59,130,246,0.09)",
        color: "#60a5fa",
        fontSize: "13px",
        fontWeight: 800
    },

    infoGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
        gap: "1px",
        marginTop: "16px",
        background:
            "rgba(255,255,255,0.055)",
        borderRadius: "11px",
        overflow: "hidden"
    },

    infoItem: {
        minHeight: "72px",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#101827"
    },

    infoLabel: {
        display: "block",
        color: "#69778c",
        fontSize: "9px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: "5px"
    },

    infoValue: {
        color: "#e5edf8",
        fontSize: "13px",
        fontWeight: 650
    },

    /* =========================================================
       BOTTOM
    ========================================================= */

    bottomAction: {
        display: "flex",
        justifyContent: "center"
    },

    bottomButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "11px 17px",
        border:
            "1px solid rgba(96,165,250,0.18)",
        borderRadius: "10px",
        background:
            "rgba(59,130,246,0.08)",
        color: "#93c5fd",
        cursor: "pointer",
        fontWeight: 650,
        fontSize: "12px"
    },

    /* =========================================================
       LOADING
    ========================================================= */

    loadingCard: {
        maxWidth: "480px",
        margin: "110px auto 0",
        padding: "55px 30px",
        textAlign: "center",
        background:
            "linear-gradient(145deg, rgba(18, 28, 46, 0.90), rgba(12, 20, 34, 0.90))",
        border:
            "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        boxShadow:
            "0 20px 55px rgba(0,0,0,0.20)"
    },

    spinner: {
        width: "38px",
        height: "38px",
        margin: "0 auto 20px",
        borderRadius: "50%",
        border:
            "3px solid rgba(255,255,255,0.08)",
        borderTopColor: "#60a5fa",
        animation: "spin 0.9s linear infinite"
    },

    loadingTitle: {
        margin: 0,
        color: "#eaf1fb",
        fontSize: "17px"
    },

    loadingText: {
        margin: "7px 0 0",
        color: "#77849a",
        fontSize: "12px"
    },

    /* =========================================================
       ERROR
    ========================================================= */

    errorCard: {
        maxWidth: "580px",
        margin: "30px auto 0",
        padding: "55px 30px",
        textAlign: "center",
        background:
            "linear-gradient(145deg, rgba(18, 28, 46, 0.92), rgba(12, 20, 34, 0.92))",
        border:
            "1px solid rgba(248,113,113,0.12)",
        borderRadius: "18px",
        boxShadow:
            "0 20px 55px rgba(0,0,0,0.20)"
    },

    errorIcon: {
        width: "56px",
        height: "56px",
        margin: "0 auto 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "16px",
        background:
            "rgba(239,68,68,0.10)",
        border:
            "1px solid rgba(248,113,113,0.16)",
        color: "#f87171",
        fontSize: "24px",
        fontWeight: 800
    },

    errorTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "20px"
    },

    errorText: {
        maxWidth: "420px",
        margin: "10px auto 22px",
        color: "#a5b1c3",
        fontSize: "13px",
        lineHeight: 1.6
    },

    errorActions: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        flexWrap: "wrap"
    },

    retryButton: {
        padding: "10px 16px",
        border: "none",
        borderRadius: "9px",
        background:
            "linear-gradient(135deg, #2563eb, #4f46e5)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "12px",
        boxShadow:
            "0 8px 20px rgba(37,99,235,0.22)"
    },

    secondaryButton: {
        padding: "10px 16px",
        border:
            "1px solid rgba(255,255,255,0.08)",
        borderRadius: "9px",
        background:
            "rgba(255,255,255,0.045)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: 650,
        fontSize: "12px"
    }
};

export default HRInterviewDetails;