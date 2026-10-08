import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function ApplicationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [withdrawing, setWithdrawing] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // =========================================================
    // LOAD APPLICATION
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const loadApplication = async () => {
            try {
                const response = await api.get(`/applications/${id}`);

                if (!cancelled) {
                    setApplication(response.data);
                    setError("");
                }
            } catch (err) {
                console.error("Failed to load application:", err);

                if (cancelled) {
                    return;
                }

                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    err.response?.data ||
                    "Failed to load application."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadApplication();

        return () => {
            cancelled = true;
        };
    }, [id, navigate]);

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // =========================================================
    // WITHDRAW APPLICATION
    // =========================================================

    const handleWithdraw = async () => {
        if (!application) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to withdraw this application?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setWithdrawing(true);
            setError("");
            setSuccessMessage("");

            await api.delete(`/applications/${application.id}`);

            setSuccessMessage(
                "Application withdrawn successfully."
            );

            setTimeout(() => {
                navigate("/applications");
            }, 1200);
        } catch (err) {
            console.error("Failed to withdraw application:", err);

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to withdraw application."
            );
        } finally {
            setWithdrawing(false);
        }
    };

    // =========================================================
    // STATUS STYLE
    // =========================================================

    const getStatusStyle = (status) => {
        switch (status) {
            case "APPLIED":
                return {
                    background:
                        "linear-gradient(135deg, rgba(59,130,246,.18), rgba(37,99,235,.10))",
                    color: "#93c5fd",
                    border: "1px solid rgba(96,165,250,.30)",
                    boxShadow: "0 0 20px rgba(59,130,246,.10)"
                };

            case "SHORTLISTED":
                return {
                    background:
                        "linear-gradient(135deg, rgba(245,158,11,.18), rgba(217,119,6,.10))",
                    color: "#fcd34d",
                    border: "1px solid rgba(251,191,36,.30)",
                    boxShadow: "0 0 20px rgba(245,158,11,.10)"
                };

            case "INTERVIEW":
                return {
                    background:
                        "linear-gradient(135deg, rgba(139,92,246,.20), rgba(124,58,237,.10))",
                    color: "#c4b5fd",
                    border: "1px solid rgba(167,139,250,.32)",
                    boxShadow: "0 0 20px rgba(139,92,246,.12)"
                };

            case "HIRED":
                return {
                    background:
                        "linear-gradient(135deg, rgba(16,185,129,.18), rgba(5,150,105,.10))",
                    color: "#6ee7b7",
                    border: "1px solid rgba(52,211,153,.30)",
                    boxShadow: "0 0 20px rgba(16,185,129,.10)"
                };

            case "REJECTED":
                return {
                    background:
                        "linear-gradient(135deg, rgba(244,63,94,.18), rgba(225,29,72,.10))",
                    color: "#fda4af",
                    border: "1px solid rgba(251,113,133,.30)",
                    boxShadow: "0 0 20px rgba(244,63,94,.10)"
                };

            default:
                return {
                    background:
                        "rgba(100,116,139,.14)",
                    color: "#cbd5e1",
                    border: "1px solid rgba(148,163,184,.22)"
                };
        }
    };

    // =========================================================
    // FORMAT STATUS
    // =========================================================

    const formatStatus = (status) => {
        if (!status) {
            return "Applied";
        }

        return status
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
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
                        <div style={styles.logoIcon}>🚀</div>

                        <div>
                            <h1 style={styles.logo}>
                                Hire<span style={styles.logoAccent}>AI</span>
                            </h1>

                            <p style={styles.subtitle}>
                                Application Details
                            </p>
                        </div>
                    </div>
                </header>

                <main style={styles.container}>
                    <div style={styles.loadingCard}>
                        <div style={styles.loadingIcon}>
                            ⏳
                        </div>

                        <h2 style={styles.loadingTitle}>
                            Loading Application
                        </h2>

                        <p style={styles.loadingText}>
                            Please wait while we fetch your application details...
                        </p>

                        <div style={styles.loadingBar}>
                            <div style={styles.loadingBarInner} />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error && !application) {
        return (
            <div style={styles.page}>
                <div style={styles.backgroundGlowOne} />
                <div style={styles.backgroundGlowTwo} />

                <header style={styles.header}>
                    <div style={styles.brandArea}>
                        <div style={styles.logoIcon}>🚀</div>

                        <div>
                            <h1 style={styles.logo}>
                                Hire<span style={styles.logoAccent}>AI</span>
                            </h1>

                            <p style={styles.subtitle}>
                                Application Details
                            </p>
                        </div>
                    </div>

                    <div style={styles.headerButtons}>
                        <button
                            style={styles.profileButton}
                            onClick={() => navigate("/profile")}
                        >
                            <span>👤</span>
                            My Profile
                        </button>

                        <button
                            style={styles.logoutButton}
                            onClick={handleLogout}
                        >
                            <span>↪</span>
                            Logout
                        </button>
                    </div>
                </header>

                <main style={styles.container}>
                    <button
                        style={styles.backButton}
                        onClick={() => navigate("/applications")}
                    >
                        <span>←</span>
                        My Applications
                    </button>

                    <div style={styles.errorCard}>
                        <div style={styles.errorIcon}>
                            !
                        </div>

                        <h2 style={styles.errorTitle}>
                            Unable to Load Application
                        </h2>

                        <p style={styles.errorText}>
                            {error}
                        </p>

                        <button
                            style={styles.primaryButton}
                            onClick={() => navigate("/applications")}
                        >
                            ← Back to Applications
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // =========================================================
    // NO APPLICATION
    // =========================================================

    if (!application) {
        return (
            <div style={styles.page}>
                <div style={styles.backgroundGlowOne} />
                <div style={styles.backgroundGlowTwo} />

                <main style={styles.container}>
                    <button
                        style={styles.backButton}
                        onClick={() => navigate("/applications")}
                    >
                        <span>←</span>
                        My Applications
                    </button>

                    <div style={styles.errorCard}>
                        <div style={styles.errorIcon}>
                            ?
                        </div>

                        <h2 style={styles.errorTitle}>
                            Application Not Found
                        </h2>

                        <p style={styles.errorText}>
                            The requested application could not be found.
                        </p>

                        <button
                            style={styles.primaryButton}
                            onClick={() => navigate("/applications")}
                        >
                            ← Back to Applications
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // =========================================================
    // CHECK WHETHER WITHDRAW IS ALLOWED
    // =========================================================

    const canWithdraw =
        application.status !== "HIRED" &&
        application.status !== "REJECTED";

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div style={styles.page}>
            <div style={styles.backgroundGlowOne} />
            <div style={styles.backgroundGlowTwo} />
            <div style={styles.backgroundGlowThree} />

            {/* =================================================
                HEADER
            ================================================= */}

            <header style={styles.header}>
                <div style={styles.brandArea}>
                    <div style={styles.logoIcon}>
                        🚀
                    </div>

                    <div>
                        <h1 style={styles.logo}>
                            Hire<span style={styles.logoAccent}>AI</span>
                        </h1>

                        <p style={styles.subtitle}>
                            Application Details
                        </p>
                    </div>
                </div>

                <div style={styles.headerButtons}>
                    <button
                        style={styles.profileButton}
                        onClick={() => navigate("/profile")}
                    >
                        <span>👤</span>
                        My Profile
                    </button>

                    <button
                        style={styles.logoutButton}
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>
                </div>
            </header>

            {/* =================================================
                MAIN
            ================================================= */}

            <main style={styles.container}>
                {/* BACK BUTTON */}

                <button
                    style={styles.backButton}
                    onClick={() => navigate("/applications")}
                >
                    <span>←</span>
                    My Applications
                </button>

                {/* =================================================
                    APPLICATION CARD
                ================================================= */}

                <div style={styles.card}>
                    {/* TOP SECTION */}

                    <div style={styles.topSection}>
                        <div style={styles.titleArea}>
                            <div style={styles.applicationIcon}>
                                💼
                            </div>

                            <div>
                                <div style={styles.titleEyebrow}>
                                    JOB APPLICATION
                                </div>

                                <h2 style={styles.jobTitle}>
                                    {application.jobTitle ||
                                        "Job Application"}
                                </h2>

                                <p style={styles.applicationId}>
                                    Application ID{" "}
                                    <strong>
                                        #{application.id}
                                    </strong>
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
                            <span style={styles.statusDot} />
                            {formatStatus(application.status)}
                        </span>
                    </div>

                    <div style={styles.divider} />

                    {/* =================================================
                        SUCCESS MESSAGE
                    ================================================= */}

                    {successMessage && (
                        <div style={styles.success}>
                            <div style={styles.successIcon}>
                                ✓
                            </div>

                            <div>
                                <strong>
                                    Success
                                </strong>

                                <div>
                                    {successMessage}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =================================================
                        ERROR MESSAGE
                    ================================================= */}

                    {error && (
                        <div style={styles.error}>
                            <div style={styles.errorSmallIcon}>
                                !
                            </div>

                            <span>{error}</span>
                        </div>
                    )}

                    {/* =================================================
                        CANDIDATE INFORMATION
                    ================================================= */}

                    <SectionHeader
                        icon="👤"
                        title="Candidate Information"
                        subtitle="Your application profile"
                    />

                    <div style={styles.infoGrid}>
                        <InfoBox
                            icon="👤"
                            label="Name"
                            value={
                                application.candidateName ||
                                "N/A"
                            }
                        />

                        <InfoBox
                            icon="📧"
                            label="Email"
                            value={
                                application.candidateEmail ||
                                "N/A"
                            }
                        />
                    </div>

                    {/* =================================================
                        JOB INFORMATION
                    ================================================= */}

                    <SectionHeader
                        icon="💼"
                        title="Job Information"
                        subtitle="Position details"
                    />

                    <div style={styles.infoGrid}>
                        <InfoBox
                            icon="💼"
                            label="Job Title"
                            value={
                                application.jobTitle ||
                                "N/A"
                            }
                        />

                        <InfoBox
                            icon="🏢"
                            label="Company"
                            value={
                                application.companyName ||
                                "Company not specified"
                            }
                        />

                        <InfoBox
                            icon="🆔"
                            label="Job ID"
                            value={
                                application.jobId ||
                                "N/A"
                            }
                        />
                    </div>

                    {/* =================================================
                        APPLICATION INFORMATION
                    ================================================= */}

                    <SectionHeader
                        icon="📋"
                        title="Application Information"
                        subtitle="Current application status"
                    />

                    <div style={styles.infoGrid}>
                        <InfoBox
                            icon="📅"
                            label="Applied Date"
                            value={formatDate(
                                application.appliedAt
                            )}
                        />

                        <InfoBox
                            icon="📌"
                            label="Current Status"
                            value={formatStatus(
                                application.status
                            )}
                        />
                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div style={styles.actions}>
                        {application.status === "INTERVIEW" && (
                            <button
                                style={styles.interviewButton}
                                onClick={() =>
                                    navigate(
                                        `/interview/${application.id}`
                                    )
                                }
                            >
                                <span>🎯</span>
                                Take Interview
                                <span>→</span>
                            </button>
                        )}

                        <button
                            style={styles.viewJobButton}
                            onClick={() =>
                                navigate(
                                    `/jobs/${application.jobId}`
                                )
                            }
                        >
                            <span>💼</span>
                            View Job
                        </button>

                        <button
                            style={styles.backActionButton}
                            onClick={() =>
                                navigate("/applications")
                            }
                        >
                            <span>←</span>
                            Back to Applications
                        </button>

                        {canWithdraw && (
                            <button
                                style={{
                                    ...styles.withdrawButton,
                                    ...(withdrawing
                                        ? styles.disabledButton
                                        : {})
                                }}
                                onClick={handleWithdraw}
                                disabled={withdrawing}
                            >
                                <span>
                                    {withdrawing
                                        ? "⏳"
                                        : "↩"}
                                </span>

                                {withdrawing
                                    ? "Withdrawing..."
                                    : "Withdraw Application"}
                            </button>
                        )}
                    </div>

                    {/* =================================================
                        WITHDRAW INFORMATION
                    ================================================= */}

                    {!canWithdraw && (
                        <div style={styles.statusInfo}>
                            <div style={styles.statusInfoIcon}>
                                {application.status === "HIRED"
                                    ? "✓"
                                    : "!"}
                            </div>

                            <div>
                                <strong>
                                    {application.status === "HIRED"
                                        ? "Application Hired"
                                        : "Application Rejected"}
                                </strong>

                                <p>
                                    {application.status === "HIRED"
                                        ? "This application has been hired and cannot be withdrawn."
                                        : "This application has been rejected and cannot be withdrawn."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER NOTE */}

                <div style={styles.footerNote}>
                    <span>🔒</span>
                    Your application information is securely managed by HireAI.
                </div>
            </main>
        </div>
    );
}


/* =============================================================
   SECTION HEADER
============================================================= */

function SectionHeader({ icon, title, subtitle }) {
    return (
        <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
                {icon}
            </div>

            <div>
                <h3 style={styles.sectionTitle}>
                    {title}
                </h3>

                <p style={styles.sectionSubtitle}>
                    {subtitle}
                </p>
            </div>
        </div>
    );
}


/* =============================================================
   INFO BOX
============================================================= */

function InfoBox({ icon, label, value }) {
    return (
        <div style={styles.infoBox}>
            <div style={styles.infoTop}>
                <div style={styles.infoIcon}>
                    {icon}
                </div>

                <span style={styles.label}>
                    {label}
                </span>
            </div>

            <span style={styles.value}>
                {value}
            </span>
        </div>
    );
}


/* =============================================================
   STYLES
============================================================= */

const styles = {
    page: {
        minHeight: "100vh",
        background:
            "radial-gradient(circle at 10% 10%, rgba(99,102,241,.14), transparent 28%), radial-gradient(circle at 90% 20%, rgba(34,211,238,.09), transparent 25%), radial-gradient(circle at 50% 100%, rgba(139,92,246,.10), transparent 30%), #050816",
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
            "rgba(99,102,241,.07)",
        filter: "blur(100px)",
        top: "-180px",
        left: "-160px",
        pointerEvents: "none",
        zIndex: 0
    },

    backgroundGlowTwo: {
        position: "fixed",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background:
            "rgba(34,211,238,.05)",
        filter: "blur(110px)",
        right: "-180px",
        top: "180px",
        pointerEvents: "none",
        zIndex: 0
    },

    backgroundGlowThree: {
        position: "fixed",
        width: "450px",
        height: "450px",
        borderRadius: "50%",
        background:
            "rgba(139,92,246,.06)",
        filter: "blur(120px)",
        bottom: "-250px",
        left: "35%",
        pointerEvents: "none",
        zIndex: 0
    },

    header: {
        position: "relative",
        zIndex: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        padding: "18px clamp(20px, 5vw, 60px)",
        background:
            "rgba(8,15,31,.78)",
        borderBottom:
            "1px solid rgba(148,163,184,.12)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow:
            "0 10px 40px rgba(0,0,0,.18)"
    },

    brandArea: {
        display: "flex",
        alignItems: "center",
        gap: "13px"
    },

    logoIcon: {
        width: "46px",
        height: "46px",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg, rgba(99,102,241,.22), rgba(34,211,238,.12))",
        border:
            "1px solid rgba(129,140,248,.25)",
        boxShadow:
            "0 8px 30px rgba(99,102,241,.16)",
        fontSize: "22px"
    },

    logo: {
        margin: 0,
        fontSize: "25px",
        fontWeight: 800,
        letterSpacing: "-0.7px",
        color: "#f8fafc"
    },

    logoAccent: {
        background:
            "linear-gradient(90deg, #818cf8, #22d3ee)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
    },

    subtitle: {
        margin: "3px 0 0",
        color: "#94a3b8",
        fontSize: "12px",
        fontWeight: 500
    },

    headerButtons: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap"
    },

    profileButton: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "10px 15px",
        border: "1px solid rgba(99,102,241,.28)",
        borderRadius: "11px",
        background:
            "rgba(99,102,241,.10)",
        color: "#c7d2fe",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "13px",
        boxShadow:
            "0 8px 25px rgba(99,102,241,.08)"
    },

    logoutButton: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "10px 15px",
        border: "1px solid rgba(244,63,94,.24)",
        borderRadius: "11px",
        background:
            "rgba(244,63,94,.09)",
        color: "#fda4af",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "13px"
    },

    container: {
        position: "relative",
        zIndex: 1,
        width: "min(1100px, calc(100% - 40px))",
        margin: "0 auto",
        padding: "32px 0 50px"
    },

    backButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        padding: "10px 15px",
        marginBottom: "22px",
        border:
            "1px solid rgba(148,163,184,.15)",
        borderRadius: "11px",
        background:
            "rgba(15,23,42,.60)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "13px",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow:
            "0 8px 25px rgba(0,0,0,.16)"
    },

    card: {
        background:
            "linear-gradient(145deg, rgba(15,23,42,.88), rgba(11,18,32,.82))",
        border:
            "1px solid rgba(148,163,184,.14)",
        borderRadius: "24px",
        padding: "clamp(22px, 4vw, 38px)",
        boxShadow:
            "0 30px 80px rgba(0,0,0,.34)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)"
    },

    topSection: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "25px",
        flexWrap: "wrap"
    },

    titleArea: {
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        minWidth: 0
    },

    applicationIcon: {
        width: "58px",
        height: "58px",
        minWidth: "58px",
        borderRadius: "17px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg, rgba(99,102,241,.20), rgba(139,92,246,.12))",
        border:
            "1px solid rgba(129,140,248,.22)",
        fontSize: "25px",
        boxShadow:
            "0 12px 35px rgba(99,102,241,.12)"
    },

    titleEyebrow: {
        color: "#818cf8",
        fontSize: "10px",
        fontWeight: 800,
        letterSpacing: "1.6px",
        marginBottom: "5px"
    },

    jobTitle: {
        margin: 0,
        fontSize: "clamp(22px, 4vw, 30px)",
        lineHeight: 1.2,
        color: "#f8fafc",
        fontWeight: 800,
        letterSpacing: "-0.7px"
    },

    applicationId: {
        color: "#64748b",
        marginTop: "8px",
        marginBottom: 0,
        fontSize: "12px"
    },

    status: {
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "9px 14px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 800,
        whiteSpace: "nowrap",
        letterSpacing: ".2px"
    },

    statusDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "currentColor",
        boxShadow: "0 0 10px currentColor"
    },

    divider: {
        height: "1px",
        background:
            "linear-gradient(90deg, transparent, rgba(148,163,184,.16), transparent)",
        margin: "30px 0"
    },

    sectionHeader: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginTop: "30px",
        marginBottom: "15px"
    },

    sectionIcon: {
        width: "38px",
        height: "38px",
        borderRadius: "11px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(99,102,241,.09)",
        border:
            "1px solid rgba(99,102,241,.15)",
        fontSize: "16px"
    },

    sectionTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "16px",
        fontWeight: 750
    },

    sectionSubtitle: {
        margin: "3px 0 0",
        color: "#64748b",
        fontSize: "11px"
    },

    infoGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "13px"
    },

    infoBox: {
        background:
            "linear-gradient(145deg, rgba(15,23,42,.72), rgba(2,6,23,.45))",
        border:
            "1px solid rgba(148,163,184,.11)",
        borderRadius: "16px",
        padding: "17px",
        minWidth: 0,
        transition: "all .2s ease",
        boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.025)"
    },

    infoTop: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        marginBottom: "11px"
    },

    infoIcon: {
        width: "30px",
        height: "30px",
        borderRadius: "9px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(99,102,241,.08)",
        border:
            "1px solid rgba(99,102,241,.12)",
        fontSize: "13px"
    },

    label: {
        color: "#64748b",
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: ".7px"
    },

    value: {
        display: "block",
        color: "#e2e8f0",
        fontSize: "14px",
        fontWeight: 650,
        lineHeight: 1.5,
        overflowWrap: "anywhere"
    },

    actions: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginTop: "34px",
        paddingTop: "24px",
        borderTop:
            "1px solid rgba(148,163,184,.10)",
        flexWrap: "wrap"
    },

    interviewButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        padding: "12px 17px",
        border: "1px solid rgba(52,211,153,.25)",
        borderRadius: "12px",
        background:
            "linear-gradient(135deg, #059669, #10b981)",
        color: "#ecfdf5",
        cursor: "pointer",
        fontWeight: 800,
        fontSize: "13px",
        boxShadow:
            "0 10px 28px rgba(16,185,129,.18)"
    },

    viewJobButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 17px",
        border: "1px solid rgba(129,140,248,.25)",
        borderRadius: "12px",
        background:
            "linear-gradient(135deg, #4f46e5, #6366f1)",
        color: "#fff",
        cursor: "pointer",
        fontWeight: 800,
        fontSize: "13px",
        boxShadow:
            "0 10px 28px rgba(99,102,241,.20)"
    },

    backActionButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 17px",
        border:
            "1px solid rgba(148,163,184,.15)",
        borderRadius: "12px",
        background:
            "rgba(30,41,59,.65)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: 750,
        fontSize: "13px"
    },

    withdrawButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 17px",
        border:
            "1px solid rgba(251,113,133,.22)",
        borderRadius: "12px",
        background:
            "linear-gradient(135deg, rgba(225,29,72,.85), rgba(244,63,94,.75))",
        color: "#fff1f2",
        cursor: "pointer",
        fontWeight: 800,
        fontSize: "13px",
        boxShadow:
            "0 10px 28px rgba(244,63,94,.14)"
    },

    disabledButton: {
        opacity: 0.55,
        cursor: "not-allowed",
        boxShadow: "none"
    },

    success: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        background:
            "linear-gradient(135deg, rgba(16,185,129,.13), rgba(5,150,105,.06))",
        color: "#a7f3d0",
        border:
            "1px solid rgba(52,211,153,.20)",
        padding: "14px 16px",
        borderRadius: "14px",
        marginBottom: "20px",
        fontSize: "13px",
        lineHeight: 1.5
    },

    successIcon: {
        width: "26px",
        height: "26px",
        minWidth: "26px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(16,185,129,.18)",
        color: "#6ee7b7",
        fontWeight: 900
    },

    error: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "13px 15px",
        background:
            "rgba(244,63,94,.08)",
        color: "#fda4af",
        border:
            "1px solid rgba(251,113,133,.20)",
        borderRadius: "13px",
        marginBottom: "20px",
        fontSize: "13px"
    },

    errorSmallIcon: {
        width: "24px",
        height: "24px",
        minWidth: "24px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(244,63,94,.15)",
        fontWeight: 900
    },

    statusInfo: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        marginTop: "20px",
        padding: "15px 17px",
        background:
            "rgba(30,41,59,.45)",
        border:
            "1px solid rgba(148,163,184,.12)",
        borderRadius: "14px",
        color: "#94a3b8",
        fontSize: "12px",
        lineHeight: 1.5
    },

    statusInfoIcon: {
        width: "27px",
        height: "27px",
        minWidth: "27px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(99,102,241,.12)",
        color: "#a5b4fc",
        fontWeight: 900
    },

    footerNote: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "7px",
        color: "#475569",
        fontSize: "11px",
        marginTop: "18px",
        textAlign: "center"
    },

    primaryButton: {
        marginTop: "20px",
        padding: "11px 18px",
        border: "none",
        borderRadius: "11px",
        background:
            "linear-gradient(135deg, #4f46e5, #6366f1)",
        color: "#fff",
        cursor: "pointer",
        fontWeight: 800,
        fontSize: "13px",
        boxShadow:
            "0 10px 25px rgba(99,102,241,.20)"
    },

    errorCard: {
        background:
            "linear-gradient(145deg, rgba(15,23,42,.88), rgba(11,18,32,.82))",
        border:
            "1px solid rgba(244,63,94,.15)",
        borderRadius: "22px",
        padding: "45px 25px",
        textAlign: "center",
        boxShadow:
            "0 25px 70px rgba(0,0,0,.30)"
    },

    errorIcon: {
        width: "58px",
        height: "58px",
        margin: "0 auto 18px",
        borderRadius: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(244,63,94,.10)",
        border:
            "1px solid rgba(251,113,133,.20)",
        color: "#fb7185",
        fontSize: "25px",
        fontWeight: 900
    },

    errorTitle: {
        margin: 0,
        color: "#f8fafc",
        fontSize: "21px",
        fontWeight: 800
    },

    errorText: {
        maxWidth: "600px",
        margin: "10px auto 0",
        color: "#94a3b8",
        fontSize: "13px",
        lineHeight: 1.6
    },

    loadingCard: {
        maxWidth: "520px",
        margin: "80px auto 0",
        padding: "45px 25px",
        textAlign: "center",
        background:
            "linear-gradient(145deg, rgba(15,23,42,.88), rgba(11,18,32,.82))",
        border:
            "1px solid rgba(148,163,184,.12)",
        borderRadius: "22px",
        boxShadow:
            "0 25px 70px rgba(0,0,0,.30)"
    },

    loadingIcon: {
        width: "58px",
        height: "58px",
        margin: "0 auto 18px",
        borderRadius: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(99,102,241,.10)",
        border:
            "1px solid rgba(129,140,248,.20)",
        fontSize: "24px"
    },

    loadingTitle: {
        margin: 0,
        color: "#f8fafc",
        fontSize: "21px",
        fontWeight: 800
    },

    loadingText: {
        color: "#64748b",
        fontSize: "13px",
        marginTop: "9px"
    },

    loadingBar: {
        width: "100%",
        height: "4px",
        background:
            "rgba(148,163,184,.10)",
        borderRadius: "999px",
        overflow: "hidden",
        marginTop: "24px"
    },

    loadingBarInner: {
        width: "45%",
        height: "100%",
        borderRadius: "999px",
        background:
            "linear-gradient(90deg, #6366f1, #22d3ee)"
    },

    message: {
        textAlign: "center",
        padding: "60px",
        color: "#94a3b8",
        fontSize: "15px"
    }
};

export default ApplicationDetails;