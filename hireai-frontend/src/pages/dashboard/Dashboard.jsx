import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import PageContainer from "../../components/common/PageContainer";
import Button from "../../components/ui/Button";

function Dashboard() {
    const navigate = useNavigate();

    return (
        <div style={styles.page}>

            {/* =====================================================
                BACKGROUND GLOW EFFECTS
            ===================================================== */}

            <div style={styles.backgroundGlowOne} />
            <div style={styles.backgroundGlowTwo} />
            <div style={styles.backgroundGlowThree} />

            {/* =====================================================
                COMMON NAVBAR
            ===================================================== */}

            <Navbar role="CANDIDATE" />

            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}

            <PageContainer maxWidth="1100px">

                <div style={styles.contentWrapper}>

                    {/* =================================================
                        WELCOME / HERO CARD
                    ================================================= */}

                    <section style={styles.welcomeCard}>

                        <div style={styles.welcomeGlow} />

                        <div style={styles.welcomeContent}>

                            {/* LEFT CONTENT */}

                            <div style={styles.welcomeTextSection}>

                                <div style={styles.eyebrow}>
                                    <span style={styles.eyebrowDot} />
                                    CANDIDATE WORKSPACE
                                </div>

                                <h1 style={styles.welcomeTitle}>
                                    Welcome to{" "}
                                    <span style={styles.gradientText}>
                                        HireAI
                                    </span>{" "}
                                    👋
                                </h1>

                                <p style={styles.welcomeText}>
                                    Find the right opportunity, manage your
                                    applications, and take the next step in
                                    your career.
                                </p>

                                <div style={styles.heroActions}>

                                    <button
                                        style={styles.heroPrimaryButton}
                                        onClick={() =>
                                            navigate("/jobs")
                                        }
                                    >
                                        <span>
                                            Explore Jobs
                                        </span>

                                        <span style={styles.buttonArrow}>
                                            →
                                        </span>
                                    </button>

                                    <button
                                        style={styles.heroSecondaryButton}
                                        onClick={() =>
                                            navigate("/profile")
                                        }
                                    >
                                        View Profile
                                    </button>

                                </div>

                            </div>

                            {/* RIGHT VISUAL */}

                            <div style={styles.heroVisual}>

                                <div style={styles.heroOrbOuter}>
                                    <div style={styles.heroOrbInner}>
                                        <span style={styles.heroOrbIcon}>
                                            ✦
                                        </span>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        ...styles.floatingBadge,
                                        ...styles.floatingBadgeTop
                                    }}
                                >
                                    <span style={styles.badgeIcon}>
                                        ✦
                                    </span>
                                    AI Powered
                                </div>

                                <div
                                    style={{
                                        ...styles.floatingBadge,
                                        ...styles.floatingBadgeBottom
                                    }}
                                >
                                    <span style={styles.badgeIconCyan}>
                                        ✓
                                    </span>
                                    Career Ready
                                </div>

                            </div>

                        </div>

                    </section>

                    {/* =================================================
                        SECTION HEADER
                    ================================================= */}

                    <div style={styles.sectionHeader}>

                        <div>

                            <div style={styles.sectionEyebrow}>
                                YOUR WORKSPACE
                            </div>

                            <h2 style={styles.sectionTitle}>
                                Manage Your Career
                            </h2>

                            <p style={styles.sectionDescription}>
                                Everything you need to discover jobs,
                                manage applications, and build your
                                professional profile.
                            </p>

                        </div>

                    </div>

                    {/* =================================================
                        DASHBOARD CARDS
                    ================================================= */}

                    <div style={styles.cardsGrid}>

                        {/* =================================================
                            BROWSE JOBS
                        ================================================= */}

                        <div
                            style={styles.card}
                            className="hireai-dashboard-card"
                            onClick={() => navigate("/jobs")}
                        >

                            <div style={styles.cardTop}>

                                <div
                                    style={{
                                        ...styles.iconWrapper,
                                        ...styles.jobsIcon
                                    }}
                                >
                                    💼
                                </div>

                                <span style={styles.cardNumber}>
                                    01
                                </span>

                            </div>

                            <div style={styles.cardContent}>

                                <h2 style={styles.cardTitle}>
                                    Browse Jobs
                                </h2>

                                <p style={styles.cardText}>
                                    Explore available job opportunities
                                    and discover roles that match your
                                    skills and career goals.
                                </p>

                            </div>

                            <Button
                                variant="primary"
                                fullWidth
                                onClick={(event) => {
                                    event.stopPropagation();
                                    navigate("/jobs");
                                }}
                            >
                                Browse Jobs
                                <span style={styles.buttonArrow}>
                                    →
                                </span>
                            </Button>

                        </div>

                        {/* =================================================
                            MY APPLICATIONS
                        ================================================= */}

                        <div
                            style={styles.card}
                            className="hireai-dashboard-card"
                            onClick={() =>
                                navigate("/applications")
                            }
                        >

                            <div style={styles.cardTop}>

                                <div
                                    style={{
                                        ...styles.iconWrapper,
                                        ...styles.applicationIcon
                                    }}
                                >
                                    📋
                                </div>

                                <span style={styles.cardNumber}>
                                    02
                                </span>

                            </div>

                            <div style={styles.cardContent}>

                                <h2 style={styles.cardTitle}>
                                    My Applications
                                </h2>

                                <p style={styles.cardText}>
                                    Track your submitted applications,
                                    monitor progress, and check your
                                    application status.
                                </p>

                            </div>

                            <Button
                                variant="primary"
                                fullWidth
                                onClick={(event) => {
                                    event.stopPropagation();
                                    navigate("/applications");
                                }}
                            >
                                My Applications
                                <span style={styles.buttonArrow}>
                                    →
                                </span>
                            </Button>

                        </div>

                        {/* =================================================
                            MY PROFILE
                        ================================================= */}

                        <div
                            style={styles.card}
                            className="hireai-dashboard-card"
                            onClick={() =>
                                navigate("/profile")
                            }
                        >

                            <div style={styles.cardTop}>

                                <div
                                    style={{
                                        ...styles.iconWrapper,
                                        ...styles.profileIcon
                                    }}
                                >
                                    👤
                                </div>

                                <span style={styles.cardNumber}>
                                    03
                                </span>

                            </div>

                            <div style={styles.cardContent}>

                                <h2 style={styles.cardTitle}>
                                    My Profile
                                </h2>

                                <p style={styles.cardText}>
                                    View and manage your personal
                                    information and professional
                                    profile.
                                </p>

                            </div>

                            <Button
                                variant="primary"
                                fullWidth
                                onClick={(event) => {
                                    event.stopPropagation();
                                    navigate("/profile");
                                }}
                            >
                                View Profile
                                <span style={styles.buttonArrow}>
                                    →
                                </span>
                            </Button>

                        </div>

                        {/* =================================================
                            MY RESUME
                        ================================================= */}

                        <div
                            style={styles.card}
                            className="hireai-dashboard-card"
                            onClick={() =>
                                navigate("/resume")
                            }
                        >

                            <div style={styles.cardTop}>

                                <div
                                    style={{
                                        ...styles.iconWrapper,
                                        ...styles.resumeIcon
                                    }}
                                >
                                    📄
                                </div>

                                <span style={styles.cardNumber}>
                                    04
                                </span>

                            </div>

                            <div style={styles.cardContent}>

                                <h2 style={styles.cardTitle}>
                                    My Resume
                                </h2>

                                <p style={styles.cardText}>
                                    Upload and manage your resume
                                    to keep your job applications
                                    ready.
                                </p>

                            </div>

                            <Button
                                variant="primary"
                                fullWidth
                                onClick={(event) => {
                                    event.stopPropagation();
                                    navigate("/resume");
                                }}
                            >
                                Manage Resume
                                <span style={styles.buttonArrow}>
                                    →
                                </span>
                            </Button>

                        </div>

                        {/* =================================================
                            NOTIFICATIONS
                        ================================================= */}

                        <div
                            style={{
                                ...styles.card,
                                ...styles.notificationCard
                            }}
                            className="hireai-dashboard-card"
                            onClick={() =>
                                navigate("/notifications")
                            }
                        >

                            <div style={styles.cardTop}>

                                <div
                                    style={{
                                        ...styles.iconWrapper,
                                        ...styles.notificationIcon
                                    }}
                                >
                                    🔔
                                </div>

                                <span style={styles.cardNumber}>
                                    05
                                </span>

                            </div>

                            <div style={styles.cardContent}>

                                <h2 style={styles.cardTitle}>
                                    Notifications
                                </h2>

                                <p style={styles.cardText}>
                                    Stay updated about your
                                    applications, interviews, and
                                    selection status.
                                </p>

                            </div>

                            <Button
                                variant="primary"
                                fullWidth
                                onClick={(event) => {
                                    event.stopPropagation();
                                    navigate("/notifications");
                                }}
                            >
                                Notifications
                                <span style={styles.buttonArrow}>
                                    →
                                </span>
                            </Button>

                        </div>

                    </div>

                    {/* =================================================
                        BOTTOM CAREER STRIP
                    ================================================= */}

                    <section style={styles.bottomCard}>

                        <div style={styles.bottomIcon}>
                            ✨
                        </div>

                        <div style={styles.bottomContent}>

                            <h3 style={styles.bottomTitle}>
                                Your next opportunity starts here.
                            </h3>

                            <p style={styles.bottomText}>
                                Keep your profile updated, maintain your
                                resume, and explore new opportunities
                                regularly.
                            </p>

                        </div>

                        <button
                            style={styles.bottomButton}
                            onClick={() =>
                                navigate("/jobs")
                            }
                        >
                            Explore Opportunities
                            <span style={styles.buttonArrow}>
                                →
                            </span>
                        </button>

                    </section>

                </div>

            </PageContainer>

            {/* =====================================================
                RESPONSIVE + HOVER CSS
            ===================================================== */}

            <style>
                {`

                    .hireai-dashboard-card {
                        transition:
                            transform 0.25s ease,
                            border-color 0.25s ease,
                            box-shadow 0.25s ease,
                            background 0.25s ease;
                    }

                    .hireai-dashboard-card:hover {
                        transform: translateY(-6px);
                        border-color: rgba(129, 140, 248, 0.28) !important;
                        box-shadow:
                            0 25px 60px rgba(0, 0, 0, 0.28),
                            0 0 30px rgba(99, 102, 241, 0.08);
                        background:
                            linear-gradient(
                                145deg,
                                rgba(24, 34, 58, 0.95),
                                rgba(10, 16, 32, 0.92)
                            ) !important;
                    }

                    .hireai-dashboard-card:hover .hireai-card-arrow {
                        transform: translateX(4px);
                    }

                    @media (max-width: 1050px) {
                        .hireai-dashboard-grid {
                            grid-template-columns: repeat(2, 1fr) !important;
                        }

                        .hireai-hero-visual {
                            display: none !important;
                        }
                    }

                    @media (max-width: 700px) {
                        .hireai-dashboard-grid {
                            grid-template-columns: 1fr !important;
                        }

                        .hireai-welcome-content {
                            padding: 28px !important;
                        }

                        .hireai-welcome-title {
                            font-size: 32px !important;
                        }

                        .hireai-section-title {
                            font-size: 24px !important;
                        }

                        .hireai-bottom-card {
                            flex-direction: column !important;
                            align-items: flex-start !important;
                        }

                        .hireai-bottom-button {
                            width: 100% !important;
                            justify-content: center !important;
                        }
                    }

                    @media (max-width: 480px) {
                        .hireai-welcome-content {
                            padding: 22px !important;
                        }

                        .hireai-welcome-title {
                            font-size: 28px !important;
                        }

                        .hireai-hero-actions {
                            flex-direction: column !important;
                            align-items: stretch !important;
                        }

                        .hireai-hero-primary,
                        .hireai-hero-secondary {
                            width: 100% !important;
                            justify-content: center !important;
                        }
                    }

                `}
            </style>

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
            "radial-gradient(circle at 10% 5%, rgba(99,102,241,0.13), transparent 28%), radial-gradient(circle at 90% 10%, rgba(34,211,238,0.08), transparent 25%), radial-gradient(circle at 50% 100%, rgba(139,92,246,0.08), transparent 30%), #060914",
        color: "#f8fafc",
        fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    // =========================================================
    // BACKGROUND GLOWS
    // =========================================================

    backgroundGlowOne: {
        position: "fixed",
        width: "500px",
        height: "500px",
        top: "-250px",
        left: "-200px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(99,102,241,0.15), transparent 68%)",
        filter: "blur(35px)",
        pointerEvents: "none",
        zIndex: 0,
    },

    backgroundGlowTwo: {
        position: "fixed",
        width: "550px",
        height: "550px",
        top: "15%",
        right: "-300px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(34,211,238,0.09), transparent 68%)",
        filter: "blur(40px)",
        pointerEvents: "none",
        zIndex: 0,
    },

    backgroundGlowThree: {
        position: "fixed",
        width: "500px",
        height: "500px",
        bottom: "-300px",
        left: "35%",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(139,92,246,0.10), transparent 68%)",
        filter: "blur(40px)",
        pointerEvents: "none",
        zIndex: 0,
    },

    // =========================================================
    // CONTENT
    // =========================================================

    contentWrapper: {
        position: "relative",
        zIndex: 2,
        paddingTop: "25px",
        paddingBottom: "50px",
    },

    // =========================================================
    // WELCOME CARD
    // =========================================================

    welcomeCard: {
        position: "relative",
        overflow: "hidden",
        marginBottom: "38px",
        borderRadius: "24px",
        border:
            "1px solid rgba(129,140,248,0.18)",
        background:
            "linear-gradient(135deg, rgba(18,27,48,0.92), rgba(9,15,30,0.88))",
        boxShadow:
            "0 30px 80px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.025)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
    },

    welcomeGlow: {
        position: "absolute",
        width: "420px",
        height: "420px",
        top: "-260px",
        right: "-80px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(99,102,241,0.18), transparent 68%)",
        filter: "blur(15px)",
        pointerEvents: "none",
    },

    welcomeContent: {
        position: "relative",
        zIndex: 2,
        minHeight: "300px",
        padding: "42px 45px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "40px",
    },

    welcomeTextSection: {
        maxWidth: "680px",
    },

    eyebrow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "13px",
        color: "#818cf8",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.5px",
    },

    eyebrowDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#22d3ee",
        boxShadow:
            "0 0 12px rgba(34,211,238,0.8)",
    },

    welcomeTitle: {
        margin: 0,
        fontSize: "42px",
        lineHeight: 1.12,
        fontWeight: "800",
        letterSpacing: "-1.5px",
        color: "#f8fafc",
    },

    gradientText: {
        background:
            "linear-gradient(90deg, #818cf8, #22d3ee)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },

    welcomeText: {
        maxWidth: "620px",
        margin: "15px 0 0",
        color: "#94a3b8",
        fontSize: "15px",
        lineHeight: 1.75,
    },

    // =========================================================
    // HERO ACTIONS
    // =========================================================

    heroActions: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        marginTop: "25px",
    },

    heroPrimaryButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "12px 19px",
        border: "1px solid rgba(129,140,248,0.30)",
        borderRadius: "11px",
        background:
            "linear-gradient(135deg, #4f46e5, #6366f1)",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "700",
        boxShadow:
            "0 12px 30px rgba(79,70,229,0.25)",
    },

    heroSecondaryButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 19px",
        border:
            "1px solid rgba(148,163,184,0.15)",
        borderRadius: "11px",
        background:
            "rgba(15,23,42,0.65)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
        backdropFilter: "blur(12px)",
    },

    buttonArrow: {
        fontSize: "16px",
        lineHeight: 1,
    },

    // =========================================================
    // HERO VISUAL
    // =========================================================

    heroVisual: {
        position: "relative",
        width: "235px",
        height: "235px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    heroOrbOuter: {
        width: "175px",
        height: "175px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(99,102,241,0.14), rgba(99,102,241,0.03) 65%, transparent 70%)",
        border:
            "1px solid rgba(129,140,248,0.15)",
        boxShadow:
            "0 0 70px rgba(99,102,241,0.12)",
    },

    heroOrbInner: {
        width: "110px",
        height: "110px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.85), rgba(139,92,246,0.85))",
        border:
            "1px solid rgba(255,255,255,0.14)",
        boxShadow:
            "0 0 45px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
    },

    heroOrbIcon: {
        color: "#ffffff",
        fontSize: "42px",
        textShadow:
            "0 0 25px rgba(255,255,255,0.5)",
    },

    floatingBadge: {
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "8px 11px",
        borderRadius: "10px",
        background:
            "rgba(15,23,42,0.82)",
        border:
            "1px solid rgba(148,163,184,0.15)",
        boxShadow:
            "0 15px 30px rgba(0,0,0,0.25)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        color: "#cbd5e1",
        fontSize: "10px",
        fontWeight: "700",
        whiteSpace: "nowrap",
    },

    floatingBadgeTop: {
        top: "8px",
        right: "-5px",
    },

    floatingBadgeBottom: {
        bottom: "12px",
        left: "-12px",
    },

    badgeIcon: {
        color: "#a5b4fc",
    },

    badgeIconCyan: {
        color: "#67e8f9",
    },

    // =========================================================
    // SECTION HEADER
    // =========================================================

    sectionHeader: {
        marginBottom: "18px",
    },

    sectionEyebrow: {
        marginBottom: "5px",
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.4px",
    },

    sectionTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "26px",
        fontWeight: "750",
        letterSpacing: "-0.6px",
    },

    sectionDescription: {
        margin: "7px 0 0",
        color: "#64748b",
        fontSize: "13px",
        lineHeight: 1.6,
    },

    // =========================================================
    // CARDS GRID
    // =========================================================

    cardsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
        gap: "16px",
    },

    // =========================================================
    // CARD
    // =========================================================

    card: {
        position: "relative",
        overflow: "hidden",
        minHeight: "295px",
        padding: "21px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "space-between",
        boxSizing: "border-box",
        borderRadius: "18px",
        border:
            "1px solid rgba(148,163,184,0.11)",
        background:
            "linear-gradient(145deg, rgba(17,25,43,0.88), rgba(9,15,29,0.82))",
        boxShadow:
            "0 15px 45px rgba(0,0,0,0.18)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        cursor: "pointer",
    },

    notificationCard: {
        border:
            "1px solid rgba(34,211,238,0.13)",
    },

    cardTop: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "10px",
    },

    iconWrapper: {
        width: "52px",
        height: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "15px",
        fontSize: "23px",
        border:
            "1px solid rgba(148,163,184,0.12)",
        boxShadow:
            "0 10px 25px rgba(0,0,0,0.14)",
    },

    jobsIcon: {
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(79,70,229,0.07))",
        borderColor:
            "rgba(129,140,248,0.18)",
    },

    applicationIcon: {
        background:
            "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(6,182,212,0.06))",
        borderColor:
            "rgba(34,211,238,0.17)",
    },

    profileIcon: {
        background:
            "linear-gradient(135deg, rgba(139,92,246,0.17), rgba(124,58,237,0.06))",
        borderColor:
            "rgba(167,139,250,0.18)",
    },

    resumeIcon: {
        background:
            "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.06))",
        borderColor:
            "rgba(52,211,153,0.17)",
    },

    notificationIcon: {
        background:
            "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(99,102,241,0.07))",
        borderColor:
            "rgba(34,211,238,0.17)",
    },

    cardNumber: {
        color: "#334155",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "1px",
    },

    cardContent: {
        flex: 1,
        paddingTop: "22px",
        paddingBottom: "20px",
    },

    cardTitle: {
        margin: "0 0 9px",
        color: "#f1f5f9",
        fontSize: "18px",
        fontWeight: "700",
        letterSpacing: "-0.3px",
    },

    cardText: {
        margin: 0,
        color: "#64748b",
        fontSize: "13px",
        lineHeight: 1.7,
        maxWidth: "280px",
    },

    // =========================================================
    // BOTTOM CARD
    // =========================================================

    bottomCard: {
        marginTop: "18px",
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        borderRadius: "17px",
        border:
            "1px solid rgba(99,102,241,0.13)",
        background:
            "linear-gradient(135deg, rgba(30,41,72,0.58), rgba(10,16,31,0.78))",
        boxShadow:
            "0 18px 45px rgba(0,0,0,0.17)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
    },

    bottomIcon: {
        width: "44px",
        height: "44px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "13px",
        background:
            "rgba(99,102,241,0.10)",
        border:
            "1px solid rgba(129,140,248,0.15)",
        fontSize: "20px",
    },

    bottomContent: {
        flex: 1,
        minWidth: 0,
    },

    bottomTitle: {
        margin: 0,
        color: "#e2e8f0",
        fontSize: "15px",
        fontWeight: "700",
    },

    bottomText: {
        margin: "5px 0 0",
        color: "#64748b",
        fontSize: "12px",
        lineHeight: 1.6,
    },

    bottomButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
        flexShrink: 0,
        padding: "11px 16px",
        border:
            "1px solid rgba(129,140,248,0.22)",
        borderRadius: "10px",
        background:
            "rgba(99,102,241,0.09)",
        color: "#c7d2fe",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "700",
    },
};

export default Dashboard;