import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Bell,
    BriefcaseBusiness,
    CalendarDays,
    LogOut,
    Plus,
    User,
    Users,
    Sparkles,
    ShieldCheck,
} from "lucide-react";

function HRDashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (
        <div style={styles.page}>

            {/* =====================================================
                BACKGROUND DECORATION
            ===================================================== */}

            <div style={styles.backgroundGlowOne} />
            <div style={styles.backgroundGlowTwo} />
            <div style={styles.backgroundGlowThree} />


            {/* =====================================================
                HEADER
            ===================================================== */}

            <header style={styles.header}>

                <div style={styles.headerInner}>

                    {/* BRAND */}

                    <div style={styles.brandSection}>

                        <div style={styles.logoMark}>
                            <Sparkles size={21} strokeWidth={2.4} />
                        </div>

                        <div>

                            <h1 style={styles.logo}>
                                Hire<span style={styles.logoAccent}>AI</span>
                            </h1>

                            <p style={styles.subtitle}>
                                HR Recruitment Workspace
                            </p>

                        </div>

                    </div>


                    {/* HEADER ACTIONS */}

                    <div style={styles.headerButtons}>

                        <button
                            type="button"
                            style={styles.profileButton}
                            onClick={() => navigate("/profile")}
                        >
                            <User size={16} />
                            <span>My Profile</span>
                        </button>


                        <button
                            type="button"
                            style={styles.logoutButton}
                            onClick={handleLogout}
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>

                    </div>

                </div>

            </header>


            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}

            <main style={styles.container}>


                {/* =================================================
                    PAGE INTRO
                ================================================= */}

                <section style={styles.heroSection}>

                    <div style={styles.heroContent}>

                        <div style={styles.heroBadge}>
                            <span style={styles.statusDot} />
                            HR CONTROL CENTER
                        </div>


                        <h2 style={styles.welcomeTitle}>
                            Welcome back to{" "}
                            <span style={styles.gradientText}>
                                HireAI
                            </span>
                        </h2>


                        <p style={styles.welcomeText}>
                            Manage your recruitment workflow, job
                            postings, applicants and interviews from
                            one intelligent workspace.
                        </p>


                        <div style={styles.heroMeta}>

                            <div style={styles.metaItem}>
                                <ShieldCheck size={15} />
                                <span>Recruitment Workspace</span>
                            </div>

                            <div style={styles.metaDivider} />

                            <div style={styles.metaItem}>
                                <Sparkles size={15} />
                                <span>AI Powered Hiring</span>
                            </div>

                        </div>

                    </div>


                    {/* HERO VISUAL */}

                    <div style={styles.heroVisual}>

                        <div style={styles.heroVisualGlow} />

                        <div style={styles.heroIconCircle}>
                            <BriefcaseBusiness
                                size={42}
                                strokeWidth={1.7}
                            />
                        </div>

                        <div style={styles.heroVisualText}>
                            <span style={styles.heroVisualLabel}>
                                RECRUITMENT
                            </span>

                            <strong style={styles.heroVisualTitle}>
                                Command Center
                            </strong>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    SECTION HEADER
                ================================================= */}

                <div style={styles.sectionHeader}>

                    <div>

                        <div style={styles.sectionEyebrow}>
                            HR OPERATIONS
                        </div>

                        <h3 style={styles.sectionTitle}>
                            Recruitment Management
                        </h3>

                    </div>

                    <p style={styles.sectionDescription}>
                        Everything you need to manage your hiring workflow.
                    </p>

                </div>


                {/* =================================================
                    HR FEATURES
                ================================================= */}

                <div style={styles.cardsGrid}>


                    {/* =================================================
                        MY JOBS
                    ================================================= */}

                    <div style={styles.card}>

                        <div style={styles.cardTopRow}>

                            <div
                                style={{
                                    ...styles.iconContainer,
                                    ...styles.blueIcon,
                                }}
                            >
                                <BriefcaseBusiness size={23} />
                            </div>

                            <span style={styles.cardNumber}>
                                01
                            </span>

                        </div>


                        <h3 style={styles.cardTitle}>
                            My Jobs
                        </h3>


                        <p style={styles.cardText}>
                            View, manage and monitor all job postings
                            created by you.
                        </p>


                        <button
                            type="button"
                            style={styles.primaryButton}
                            onClick={() => navigate("/hr/jobs")}
                        >
                            <span>Manage Jobs</span>
                            <ArrowRight size={17} />
                        </button>

                    </div>


                    {/* =================================================
                        POST JOB
                    ================================================= */}

                    <div style={styles.card}>

                        <div style={styles.cardTopRow}>

                            <div
                                style={{
                                    ...styles.iconContainer,
                                    ...styles.violetIcon,
                                }}
                            >
                                <Plus size={24} />
                            </div>

                            <span style={styles.cardNumber}>
                                02
                            </span>

                        </div>


                        <h3 style={styles.cardTitle}>
                            Post New Job
                        </h3>


                        <p style={styles.cardText}>
                            Create a new vacancy and reach suitable
                            candidates through HireAI.
                        </p>


                        <button
                            type="button"
                            style={styles.primaryButton}
                            onClick={() => navigate("/hr/jobs/create")}
                        >
                            <span>Post a Job</span>
                            <ArrowRight size={17} />
                        </button>

                    </div>


                    {/* =================================================
                        APPLICANTS
                    ================================================= */}

                    <div style={styles.card}>

                        <div style={styles.cardTopRow}>

                            <div
                                style={{
                                    ...styles.iconContainer,
                                    ...styles.cyanIcon,
                                }}
                            >
                                <Users size={23} />
                            </div>

                            <span style={styles.cardNumber}>
                                03
                            </span>

                        </div>


                        <h3 style={styles.cardTitle}>
                            Applicants
                        </h3>


                        <p style={styles.cardText}>
                            Review candidates who have applied to
                            your active job openings.
                        </p>


                        <button
                            type="button"
                            style={styles.primaryButton}
                            onClick={() => navigate("/hr/applicants")}
                        >
                            <span>View Applicants</span>
                            <ArrowRight size={17} />
                        </button>

                    </div>


                    {/* =================================================
                        INTERVIEWS
                    ================================================= */}

                    <div style={styles.card}>

                        <div style={styles.cardTopRow}>

                            <div
                                style={{
                                    ...styles.iconContainer,
                                    ...styles.purpleIcon,
                                }}
                            >
                                <CalendarDays size={23} />
                            </div>

                            <span style={styles.cardNumber}>
                                04
                            </span>

                        </div>


                        <h3 style={styles.cardTitle}>
                            Interviews
                        </h3>


                        <p style={styles.cardText}>
                            Schedule, review and manage candidate
                            interviews throughout the hiring process.
                        </p>


                        <button
                            type="button"
                            style={styles.primaryButton}
                            onClick={() => navigate("/hr/interviews")}
                        >
                            <span>Manage Interviews</span>
                            <ArrowRight size={17} />
                        </button>

                    </div>


                    {/* =================================================
                        NOTIFICATIONS
                    ================================================= */}

                    <div style={styles.card}>

                        <div style={styles.cardTopRow}>

                            <div
                                style={{
                                    ...styles.iconContainer,
                                    ...styles.amberIcon,
                                }}
                            >
                                <Bell size={23} />
                            </div>

                            <span style={styles.cardNumber}>
                                05
                            </span>

                        </div>


                        <h3 style={styles.cardTitle}>
                            Notifications
                        </h3>


                        <p style={styles.cardText}>
                            Stay updated with new applications and
                            important recruitment activity.
                        </p>


                        <button
                            type="button"
                            style={styles.primaryButton}
                            onClick={() => navigate("/notifications")}
                        >
                            <span>View Notifications</span>
                            <ArrowRight size={17} />
                        </button>

                    </div>


                    {/* =================================================
                        PROFILE
                    ================================================= */}

                    <div style={styles.card}>

                        <div style={styles.cardTopRow}>

                            <div
                                style={{
                                    ...styles.iconContainer,
                                    ...styles.greenIcon,
                                }}
                            >
                                <User size={23} />
                            </div>

                            <span style={styles.cardNumber}>
                                06
                            </span>

                        </div>


                        <h3 style={styles.cardTitle}>
                            HR Profile
                        </h3>


                        <p style={styles.cardText}>
                            Manage your professional information and
                            recruitment profile.
                        </p>


                        <button
                            type="button"
                            style={styles.primaryButton}
                            onClick={() => navigate("/profile")}
                        >
                            <span>View Profile</span>
                            <ArrowRight size={17} />
                        </button>

                    </div>

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div style={styles.footer}>

                    <div style={styles.footerLeft}>

                        <div style={styles.footerLogo}>
                            <Sparkles size={15} />
                        </div>

                        <span>
                            HireAI Recruitment Platform
                        </span>

                    </div>


                    <span style={styles.footerText}>
                        Intelligent hiring • Smarter decisions
                    </span>

                </div>

            </main>

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
            "radial-gradient(circle at 10% 0%, rgba(99,102,241,0.15), transparent 30%)," +
            "radial-gradient(circle at 90% 5%, rgba(168,85,247,0.13), transparent 28%)," +
            "radial-gradient(circle at 50% 100%, rgba(124,58,237,0.08), transparent 32%)," +
            "linear-gradient(135deg, #060914 0%, #0a1020 48%, #100a18 100%)",
        color: "#f8fafc",
        fontFamily:
            "'Inter', 'Segoe UI', Arial, sans-serif",
    },


    /* =========================================================
       BACKGROUND GLOWS
       ========================================================= */

    backgroundGlowOne: {
        position: "fixed",
        width: "420px",
        height: "420px",
        borderRadius: "50%",
        top: "-220px",
        left: "-160px",
        background:
            "radial-gradient(circle, rgba(99,102,241,0.14), transparent 70%)",
        pointerEvents: "none",
        filter: "blur(10px)",
    },


    backgroundGlowTwo: {
        position: "fixed",
        width: "380px",
        height: "380px",
        borderRadius: "50%",
        top: "20%",
        right: "-190px",
        background:
            "radial-gradient(circle, rgba(168,85,247,0.11), transparent 70%)",
        pointerEvents: "none",
        filter: "blur(12px)",
    },


    backgroundGlowThree: {
        position: "fixed",
        width: "450px",
        height: "450px",
        borderRadius: "50%",
        bottom: "-300px",
        left: "35%",
        background:
            "radial-gradient(circle, rgba(30,64,175,0.12), transparent 70%)",
        pointerEvents: "none",
        filter: "blur(15px)",
    },


    /* =========================================================
       HEADER
       ========================================================= */

    header: {
        position: "relative",
        zIndex: 10,
        background:
            "linear-gradient(180deg, rgba(12,18,34,0.96), rgba(8,13,25,0.92))",
        borderBottom:
            "1px solid rgba(148,163,184,0.12)",
        backdropFilter: "blur(18px)",
        boxShadow:
            "0 12px 40px rgba(0,0,0,0.25)",
    },


    headerInner: {
        maxWidth: "1250px",
        margin: "0 auto",
        padding: "20px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
    },


    brandSection: {
        display: "flex",
        alignItems: "center",
        gap: "13px",
    },


    logoMark: {
        width: "42px",
        height: "42px",
        borderRadius: "13px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        background:
            "linear-gradient(135deg, #4f46e5, #7c3aed 55%, #9333ea)",
        boxShadow:
            "0 8px 25px rgba(99,102,241,0.30)",
        border:
            "1px solid rgba(255,255,255,0.14)",
    },


    logo: {
        margin: 0,
        fontSize: "25px",
        lineHeight: 1,
        fontWeight: 800,
        letterSpacing: "-0.7px",
        color: "#f8fafc",
    },


    logoAccent: {
        color: "#a78bfa",
    },


    subtitle: {
        margin: "6px 0 0",
        color: "#94a3b8",
        fontSize: "12px",
        letterSpacing: "0.4px",
    },


    headerButtons: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },


    profileButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "10px 16px",
        border:
            "1px solid rgba(148,163,184,0.18)",
        borderRadius: "10px",
        background:
            "rgba(255,255,255,0.045)",
        color: "#e2e8f0",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 600,
        transition: "all 0.2s ease",
    },


    logoutButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "10px 16px",
        border:
            "1px solid rgba(248,113,113,0.18)",
        borderRadius: "10px",
        background:
            "rgba(127,29,29,0.20)",
        color: "#fda4af",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 600,
    },


    /* =========================================================
       CONTAINER
       ========================================================= */

    container: {
        position: "relative",
        zIndex: 2,
        maxWidth: "1250px",
        margin: "0 auto",
        padding: "42px 28px 30px",
    },


    /* =========================================================
       HERO
       ========================================================= */

    heroSection: {
        position: "relative",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "35px",
        padding: "36px",
        marginBottom: "42px",
        borderRadius: "22px",
        overflow: "hidden",
        background:
            "linear-gradient(135deg, rgba(20,28,50,0.92), rgba(17,13,31,0.92))",
        border:
            "1px solid rgba(148,163,184,0.15)",
        boxShadow:
            "0 25px 70px rgba(0,0,0,0.32)",
        backdropFilter: "blur(18px)",
    },


    heroContent: {
        position: "relative",
        zIndex: 2,
        maxWidth: "750px",
    },


    heroBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 11px",
        marginBottom: "16px",
        borderRadius: "999px",
        background:
            "rgba(99,102,241,0.10)",
        border:
            "1px solid rgba(129,140,248,0.20)",
        color: "#a5b4fc",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "1.2px",
    },


    statusDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "#34d399",
        boxShadow:
            "0 0 10px rgba(52,211,153,0.75)",
    },


    welcomeTitle: {
        margin: 0,
        fontSize: "36px",
        lineHeight: 1.15,
        fontWeight: 800,
        letterSpacing: "-1.2px",
        color: "#f8fafc",
    },


    gradientText: {
        background:
            "linear-gradient(90deg, #818cf8, #a78bfa, #c084fc)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },


    welcomeText: {
        margin: "15px 0 0",
        maxWidth: "680px",
        color: "#94a3b8",
        fontSize: "15px",
        lineHeight: 1.75,
    },


    heroMeta: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        marginTop: "22px",
        flexWrap: "wrap",
    },


    metaItem: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        color: "#cbd5e1",
        fontSize: "12px",
    },


    metaDivider: {
        width: "1px",
        height: "15px",
        background: "rgba(148,163,184,0.20)",
    },


    heroVisual: {
        position: "relative",
        minWidth: "205px",
        height: "180px",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(145deg, rgba(79,70,229,0.13), rgba(124,58,237,0.06))",
        border:
            "1px solid rgba(129,140,248,0.16)",
        overflow: "hidden",
    },


    heroVisualGlow: {
        position: "absolute",
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(129,140,248,0.22), transparent 70%)",
        filter: "blur(5px)",
    },


    heroIconCircle: {
        position: "relative",
        zIndex: 2,
        width: "78px",
        height: "78px",
        borderRadius: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#c4b5fd",
        background:
            "linear-gradient(145deg, rgba(99,102,241,0.20), rgba(139,92,246,0.10))",
        border:
            "1px solid rgba(167,139,250,0.25)",
        boxShadow:
            "0 15px 35px rgba(79,70,229,0.20)",
    },


    heroVisualText: {
        position: "relative",
        zIndex: 2,
        textAlign: "center",
        marginTop: "13px",
    },


    heroVisualLabel: {
        display: "block",
        color: "#818cf8",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1.5px",
    },


    heroVisualTitle: {
        display: "block",
        marginTop: "3px",
        color: "#e2e8f0",
        fontSize: "13px",
    },


    /* =========================================================
       SECTION
       ========================================================= */

    sectionHeader: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "20px",
        marginBottom: "20px",
    },


    sectionEyebrow: {
        marginBottom: "5px",
        color: "#818cf8",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "1.5px",
    },


    sectionTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "23px",
        fontWeight: 750,
        letterSpacing: "-0.4px",
    },


    sectionDescription: {
        margin: 0,
        maxWidth: "420px",
        color: "#64748b",
        fontSize: "12px",
        lineHeight: 1.5,
        textAlign: "right",
    },


    /* =========================================================
       GRID
       ========================================================= */

    cardsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(290px, 1fr))",
        gap: "18px",
    },


    /* =========================================================
       CARD
       ========================================================= */

    card: {
        position: "relative",
        overflow: "hidden",
        padding: "24px",
        minHeight: "255px",
        borderRadius: "17px",
        background:
            "linear-gradient(145deg, rgba(19,27,46,0.94), rgba(11,17,31,0.96))",
        border:
            "1px solid rgba(148,163,184,0.13)",
        boxShadow:
            "0 15px 40px rgba(0,0,0,0.24)",
        transition:
            "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
    },


    cardTopRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
    },


    iconContainer: {
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.08)",
    },


    blueIcon: {
        color: "#60a5fa",
        background:
            "linear-gradient(145deg, rgba(37,99,235,0.20), rgba(59,130,246,0.07))",
        boxShadow:
            "0 8px 25px rgba(37,99,235,0.12)",
    },


    violetIcon: {
        color: "#a78bfa",
        background:
            "linear-gradient(145deg, rgba(124,58,237,0.20), rgba(139,92,246,0.07))",
        boxShadow:
            "0 8px 25px rgba(124,58,237,0.12)",
    },


    cyanIcon: {
        color: "#22d3ee",
        background:
            "linear-gradient(145deg, rgba(8,145,178,0.20), rgba(6,182,212,0.07))",
        boxShadow:
            "0 8px 25px rgba(6,182,212,0.12)",
    },


    purpleIcon: {
        color: "#c084fc",
        background:
            "linear-gradient(145deg, rgba(147,51,234,0.20), rgba(168,85,247,0.07))",
        boxShadow:
            "0 8px 25px rgba(168,85,247,0.12)",
    },


    amberIcon: {
        color: "#fbbf24",
        background:
            "linear-gradient(145deg, rgba(217,119,6,0.20), rgba(245,158,11,0.07))",
        boxShadow:
            "0 8px 25px rgba(245,158,11,0.10)",
    },


    greenIcon: {
        color: "#34d399",
        background:
            "linear-gradient(145deg, rgba(5,150,105,0.20), rgba(16,185,129,0.07))",
        boxShadow:
            "0 8px 25px rgba(16,185,129,0.10)",
    },


    cardNumber: {
        color: "#475569",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "1px",
    },


    cardTitle: {
        margin: "0 0 10px",
        color: "#f1f5f9",
        fontSize: "19px",
        fontWeight: 700,
        letterSpacing: "-0.25px",
    },


    cardText: {
        margin: 0,
        minHeight: "62px",
        color: "#8492a6",
        fontSize: "13px",
        lineHeight: 1.7,
    },


    /* =========================================================
       BUTTON
       ========================================================= */

    primaryButton: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        marginTop: "18px",
        border: "1px solid rgba(129,140,248,0.20)",
        borderRadius: "10px",
        background:
            "linear-gradient(135deg, rgba(79,70,229,0.22), rgba(124,58,237,0.16))",
        color: "#c7d2fe",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.1px",
        cursor: "pointer",
        boxShadow:
            "0 8px 25px rgba(79,70,229,0.08)",
        transition:
            "all 0.2s ease",
    },


    /* =========================================================
       FOOTER
       ========================================================= */

    footer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        marginTop: "34px",
        paddingTop: "20px",
        borderTop:
            "1px solid rgba(148,163,184,0.10)",
    },


    footerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#64748b",
        fontSize: "11px",
    },


    footerLogo: {
        width: "25px",
        height: "25px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "7px",
        color: "#a78bfa",
        background:
            "rgba(99,102,241,0.10)",
        border:
            "1px solid rgba(129,140,248,0.12)",
    },


    footerText: {
        color: "#475569",
        fontSize: "10px",
    },
};


export default HRDashboard;