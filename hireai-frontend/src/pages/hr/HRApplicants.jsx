import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function HRApplicants() {
    const navigate = useNavigate();
    const { jobId } = useParams();

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    // =========================================================
    // LOAD APPLICANTS
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const fetchApplicants = async () => {
            try {
                setLoading(true);
                setError("");
                setSuccessMessage("");

                const response = jobId
                    ? await api.get(`/applications/hr/job/${jobId}`)
                    : await api.get("/applications/hr");

                if (cancelled) {
                    return;
                }

                console.log("HR Applicants:", response.data);

                setApplicants(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to fetch applicants:",
                    err
                );

                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }

                if (err.response?.status === 403) {
                    setError(
                        "You are not authorized to view applicants."
                    );
                } else {
                    setError(
                        err.response?.data?.message ||
                        err.response?.data ||
                        "Failed to load applicants."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchApplicants();

        return () => {
            cancelled = true;
        };
    }, [navigate, jobId]);

    // =========================================================
    // UPDATE APPLICATION STATUS
    // =========================================================

    const handleStatusChange = async (
        applicationId,
        newStatus
    ) => {
        if (!newStatus) {
            return;
        }

        try {
            setUpdatingId(applicationId);
            setError("");
            setSuccessMessage("");

            console.log(
                "Updating application:",
                applicationId,
                "Status:",
                newStatus
            );

            const response = await api.put(
                `/applications/${applicationId}/status`,
                {
                    status: newStatus
                }
            );

            console.log(
                "Updated application:",
                response.data
            );

            setApplicants((currentApplicants) =>
                currentApplicants.map((applicant) =>
                    applicant.id === applicationId
                        ? {
                              ...applicant,
                              status: response.data.status
                          }
                        : applicant
                )
            );

            setSuccessMessage(
                "Application status updated successfully."
            );

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error(
                "Failed to update application status:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            if (err.response?.status === 403) {
                setError(
                    "You are not authorized to update this application."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    err.response?.data ||
                    "Failed to update application status."
                );
            }
        } finally {
            setUpdatingId(null);
        }
    };

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
            case "SHORTLISTED":
                return {
                    background: "rgba(245, 158, 11, 0.14)",
                    color: "#fbbf24",
                    border: "rgba(245, 158, 11, 0.28)"
                };

            case "INTERVIEW":
                return {
                    background: "rgba(139, 92, 246, 0.14)",
                    color: "#a78bfa",
                    border: "rgba(139, 92, 246, 0.28)"
                };

            case "HIRED":
                return {
                    background: "rgba(16, 185, 129, 0.14)",
                    color: "#34d399",
                    border: "rgba(16, 185, 129, 0.28)"
                };

            case "REJECTED":
                return {
                    background: "rgba(239, 68, 68, 0.14)",
                    color: "#f87171",
                    border: "rgba(239, 68, 68, 0.28)"
                };

            case "APPLIED":
            default:
                return {
                    background: "rgba(59, 130, 246, 0.14)",
                    color: "#60a5fa",
                    border: "rgba(59, 130, 246, 0.28)"
                };
        }
    };

    // =========================================================
    // GET INITIALS
    // =========================================================

    const getInitials = (name) => {
        if (!name) {
            return "C";
        }

        const parts = name.trim().split(" ");

        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();
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
                    <div style={styles.brandSection}>
                        <div style={styles.logoIcon}>
                            🚀
                        </div>

                        <div>
                            <h1 style={styles.logo}>
                                HireAI
                            </h1>

                            <p style={styles.subtitle}>
                                HR Applicant Management
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

                <main style={styles.container}>
                    <div style={styles.loadingCard}>
                        <div style={styles.spinner} />

                        <h3 style={styles.loadingTitle}>
                            Loading applicants
                        </h3>

                        <p style={styles.loadingText}>
                            Please wait while we fetch your
                            candidate applications.
                        </p>
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
            {/* Background decoration */}
            <div style={styles.backgroundGlowOne} />
            <div style={styles.backgroundGlowTwo} />

            {/* =================================================
                HEADER
            ================================================= */}

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
                            HR Applicant Management
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

            {/* =================================================
                MAIN
            ================================================= */}

            <main style={styles.container}>
                {/* Back */}
                <button
                    style={styles.backButton}
                    onClick={() =>
                        navigate("/hr/dashboard")
                    }
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                            "rgba(59, 130, 246, 0.12)";
                        e.currentTarget.style.borderColor =
                            "rgba(96, 165, 250, 0.35)";
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

                    Dashboard
                </button>

                {/* =================================================
                    TITLE
                ================================================= */}

                <section style={styles.heroSection}>
                    <div style={styles.heroBadge}>
                        <span style={styles.badgeDot} />
                        Talent Management
                    </div>

                    <h2 style={styles.heading}>
                        Applicants
                    </h2>

                    <p style={styles.description}>
                        Review candidates, track application
                        progress, and manage hiring decisions
                        from one place.
                    </p>
                </section>

                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div style={styles.summaryGrid}>
                    <div style={styles.summaryCard}>
                        <div
                            style={{
                                ...styles.summaryIcon,
                                background:
                                    "rgba(59, 130, 246, 0.12)",
                                color: "#60a5fa"
                            }}
                        >
                            👥
                        </div>

                        <div>
                            <span style={styles.summaryLabel}>
                                Total Applicants
                            </span>

                            <strong style={styles.summaryValue}>
                                {applicants.length}
                            </strong>
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <div
                            style={{
                                ...styles.summaryIcon,
                                background:
                                    "rgba(245, 158, 11, 0.12)",
                                color: "#fbbf24"
                            }}
                        >
                            ⭐
                        </div>

                        <div>
                            <span style={styles.summaryLabel}>
                                Shortlisted
                            </span>

                            <strong style={styles.summaryValue}>
                                {
                                    applicants.filter(
                                        (item) =>
                                            item.status ===
                                            "SHORTLISTED"
                                    ).length
                                }
                            </strong>
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <div
                            style={{
                                ...styles.summaryIcon,
                                background:
                                    "rgba(139, 92, 246, 0.12)",
                                color: "#a78bfa"
                            }}
                        >
                            🎯
                        </div>

                        <div>
                            <span style={styles.summaryLabel}>
                                Interviews
                            </span>

                            <strong style={styles.summaryValue}>
                                {
                                    applicants.filter(
                                        (item) =>
                                            item.status ===
                                            "INTERVIEW"
                                    ).length
                                }
                            </strong>
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <div
                            style={{
                                ...styles.summaryIcon,
                                background:
                                    "rgba(16, 185, 129, 0.12)",
                                color: "#34d399"
                            }}
                        >
                            ✓
                        </div>

                        <div>
                            <span style={styles.summaryLabel}>
                                Hired
                            </span>

                            <strong style={styles.summaryValue}>
                                {
                                    applicants.filter(
                                        (item) =>
                                            item.status ===
                                            "HIRED"
                                    ).length
                                }
                            </strong>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    SUCCESS
                ================================================= */}

                {successMessage && (
                    <div style={styles.success}>
                        <div style={styles.successIcon}>
                            ✓
                        </div>

                        <span>
                            {successMessage}
                        </span>
                    </div>
                )}

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div style={styles.error}>
                        <div style={styles.errorIcon}>
                            !
                        </div>

                        <span>{error}</span>
                    </div>
                )}

                {/* =================================================
                    NO APPLICANTS
                ================================================= */}

                {!error && applicants.length === 0 && (
                    <div style={styles.emptyCard}>
                        <div style={styles.emptyIcon}>
                            👥
                        </div>

                        <h3 style={styles.emptyTitle}>
                            No Applicants Yet
                        </h3>

                        <p style={styles.emptyText}>
                            Candidates who apply to your jobs
                            will appear here.
                        </p>

                        <button
                            style={styles.emptyButton}
                            onClick={() =>
                                navigate("/hr/dashboard")
                            }
                        >
                            Back to Dashboard
                        </button>
                    </div>
                )}

                {/* =================================================
                    APPLICANTS
                ================================================= */}

                {!error && applicants.length > 0 && (
                    <section style={styles.applicantsSection}>
                        <div style={styles.sectionHeader}>
                            <div>
                                <h3 style={styles.sectionTitle}>
                                    Candidate Applications
                                </h3>

                                <p
                                    style={
                                        styles.sectionSubtitle
                                    }
                                >
                                    Manage and update candidate
                                    application status.
                                </p>
                            </div>

                            <div style={styles.totalBadge}>
                                {applicants.length}{" "}
                                {applicants.length === 1
                                    ? "Candidate"
                                    : "Candidates"}
                            </div>
                        </div>

                        <div style={styles.list}>
                            {applicants.map((applicant) => {
                                const statusConfig =
                                    getStatusConfig(
                                        applicant.status
                                    );

                                return (
                                    <article
                                        key={applicant.id}
                                        style={styles.card}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform =
                                                "translateY(-2px)";
                                            e.currentTarget.style.borderColor =
                                                "rgba(96, 165, 250, 0.28)";
                                            e.currentTarget.style.boxShadow =
                                                "0 18px 45px rgba(0, 0, 0, 0.24)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform =
                                                "translateY(0)";
                                            e.currentTarget.style.borderColor =
                                                "rgba(255, 255, 255, 0.08)";
                                            e.currentTarget.style.boxShadow =
                                                "0 10px 35px rgba(0, 0, 0, 0.16)";
                                        }}
                                    >
                                        {/* Candidate */}
                                        <div
                                            style={
                                                styles.candidateInfo
                                            }
                                        >
                                            <div
                                                style={
                                                    styles.avatar
                                                }
                                            >
                                                {getInitials(
                                                    applicant.candidateName
                                                )}
                                            </div>

                                            <div
                                                style={
                                                    styles.candidateDetails
                                                }
                                            >
                                                <h3
                                                    style={
                                                        styles.candidateName
                                                    }
                                                >
                                                    {applicant.candidateName ||
                                                        "Candidate"}
                                                </h3>

                                                <p
                                                    style={
                                                        styles.email
                                                    }
                                                >
                                                    {applicant.candidateEmail ||
                                                        "Email not available"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Job */}
                                        <div
                                            style={styles.jobInfo}
                                        >
                                            <span
                                                style={
                                                    styles.infoLabel
                                                }
                                            >
                                                Applied for
                                            </span>

                                            <h4
                                                style={
                                                    styles.jobTitle
                                                }
                                            >
                                                {applicant.jobTitle ||
                                                    "Job not specified"}
                                            </h4>

                                            <p
                                                style={
                                                    styles.company
                                                }
                                            >
                                                <span>
                                                    ◉
                                                </span>

                                                {applicant.companyName ||
                                                    "Company not available"}
                                            </p>

                                            <p
                                                style={
                                                    styles.appliedDate
                                                }
                                            >
                                                Applied{" "}
                                                {applicant.appliedAt
                                                    ? new Date(
                                                          applicant.appliedAt
                                                      ).toLocaleString()
                                                    : "N/A"}
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <div
                                            style={
                                                styles.statusContainer
                                            }
                                        >
                                            <span
                                                style={
                                                    styles.infoLabel
                                                }
                                            >
                                                Application Status
                                            </span>

                                            <select
                                                value={
                                                    applicant.status ||
                                                    "APPLIED"
                                                }
                                                disabled={
                                                    updatingId ===
                                                    applicant.id
                                                }
                                                onChange={(event) =>
                                                    handleStatusChange(
                                                        applicant.id,
                                                        event.target
                                                            .value
                                                    )
                                                }
                                                style={{
                                                    ...styles.statusSelect,
                                                    background:
                                                        statusConfig.background,
                                                    color:
                                                        statusConfig.color,
                                                    borderColor:
                                                        statusConfig.border
                                                }}
                                            >
                                                <option value="APPLIED">
                                                    APPLIED
                                                </option>

                                                <option value="SHORTLISTED">
                                                    SHORTLISTED
                                                </option>

                                                <option value="INTERVIEW">
                                                    INTERVIEW
                                                </option>

                                                <option value="HIRED">
                                                    HIRED
                                                </option>

                                                <option value="REJECTED">
                                                    REJECTED
                                                </option>
                                            </select>

                                            {updatingId ===
                                                applicant.id && (
                                                <span
                                                    style={
                                                        styles.updating
                                                    }
                                                >
                                                    Saving changes...
                                                </span>
                                            )}
                                        </div>
                                    </article>
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
   PREMIUM HIRING DASHBOARD STYLES
============================================================= */

const styles = {
    page: {
        minHeight: "100vh",
        background:
            "radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 32%), radial-gradient(circle at 85% 20%, rgba(124, 58, 237, 0.10), transparent 30%), #080d18",
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
        top: "-180px",
        left: "-160px",
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
        right: "-120px",
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
        fontSize: "13px",
        transition: "all 0.2s ease"
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
        fontSize: "13px",
        transition: "all 0.2s ease"
    },

    /* =========================================================
       MAIN
    ========================================================= */

    container: {
        width: "100%",
        maxWidth: "1240px",
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
        marginBottom: "32px",
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
        maxWidth: "700px",
        margin: "0 auto 36px"
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
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.4px",
        textTransform: "uppercase",
        marginBottom: "15px"
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
        margin: "13px auto 0",
        color: "#8996aa",
        fontSize: "14px",
        lineHeight: 1.7,
        maxWidth: "600px"
    },

    /* =========================================================
       SUMMARY
    ========================================================= */

    summaryGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        gap: "14px",
        marginBottom: "28px"
    },

    summaryCard: {
        minHeight: "84px",
        display: "flex",
        alignItems: "center",
        gap: "13px",
        padding: "15px 17px",
        background:
            "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
        border:
            "1px solid rgba(255,255,255,0.075)",
        borderRadius: "15px",
        boxShadow:
            "0 10px 30px rgba(0,0,0,0.14)",
        boxSizing: "border-box"
    },

    summaryIcon: {
        width: "42px",
        height: "42px",
        flexShrink: 0,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        fontWeight: 700
    },

    summaryLabel: {
        display: "block",
        color: "#7f8ba0",
        fontSize: "10px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: "4px"
    },

    summaryValue: {
        display: "block",
        color: "#f8fafc",
        fontSize: "23px",
        fontWeight: 750
    },

    /* =========================================================
       ALERTS
    ========================================================= */

    success: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
        padding: "13px 16px",
        marginBottom: "20px",
        border:
            "1px solid rgba(16, 185, 129, 0.20)",
        borderRadius: "12px",
        background:
            "rgba(16, 185, 129, 0.08)",
        color: "#6ee7b7",
        fontSize: "13px",
        fontWeight: 600
    },

    successIcon: {
        width: "21px",
        height: "21px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(16, 185, 129, 0.15)",
        fontSize: "12px"
    },

    error: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
        padding: "13px 16px",
        marginBottom: "20px",
        border:
            "1px solid rgba(239, 68, 68, 0.20)",
        borderRadius: "12px",
        background:
            "rgba(239, 68, 68, 0.08)",
        color: "#fca5a5",
        fontSize: "13px",
        fontWeight: 600
    },

    errorIcon: {
        width: "21px",
        height: "21px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(239, 68, 68, 0.15)",
        fontSize: "12px",
        fontWeight: 800
    },

    /* =========================================================
       APPLICANT SECTION
    ========================================================= */

    applicantsSection: {
        marginTop: "8px"
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "20px",
        marginBottom: "15px",
        padding: "0 3px"
    },

    sectionTitle: {
        margin: 0,
        fontSize: "17px",
        fontWeight: 700,
        color: "#edf3fc"
    },

    sectionSubtitle: {
        margin: "5px 0 0",
        color: "#77849a",
        fontSize: "12px"
    },

    totalBadge: {
        flexShrink: 0,
        padding: "7px 11px",
        borderRadius: "8px",
        background:
            "rgba(255, 255, 255, 0.045)",
        border:
            "1px solid rgba(255,255,255,0.07)",
        color: "#aebbd0",
        fontSize: "11px",
        fontWeight: 600
    },

    list: {
        display: "flex",
        flexDirection: "column",
        gap: "11px"
    },

    card: {
        display: "grid",
        gridTemplateColumns:
            "minmax(230px, 1fr) minmax(250px, 1.25fr) 190px",
        gap: "25px",
        alignItems: "center",
        padding: "18px 20px",
        background:
            "linear-gradient(145deg, rgba(18, 28, 46, 0.92), rgba(12, 20, 34, 0.92))",
        border:
            "1px solid rgba(255,255,255,0.08)",
        borderRadius: "15px",
        boxShadow:
            "0 10px 35px rgba(0,0,0,0.16)",
        transition:
            "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease"
    },

    /* =========================================================
       CANDIDATE
    ========================================================= */

    candidateInfo: {
        display: "flex",
        alignItems: "center",
        gap: "13px",
        minWidth: 0
    },

    avatar: {
        width: "44px",
        height: "44px",
        flexShrink: 0,
        borderRadius: "13px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg, #2563eb, #4f46e5)",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: 800,
        boxShadow:
            "0 7px 20px rgba(37, 99, 235, 0.22)"
    },

    candidateDetails: {
        minWidth: 0
    },

    candidateName: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "14px",
        fontWeight: 700,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },

    email: {
        margin: "5px 0 0",
        color: "#7da6e8",
        fontSize: "11px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },

    /* =========================================================
       JOB
    ========================================================= */

    jobInfo: {
        minWidth: 0
    },

    infoLabel: {
        display: "block",
        marginBottom: "5px",
        color: "#69778d",
        fontSize: "9px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.65px"
    },

    jobTitle: {
        margin: 0,
        color: "#e8eef8",
        fontSize: "13px",
        fontWeight: 700,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },

    company: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        margin: "5px 0 0",
        color: "#9eabc0",
        fontSize: "11px"
    },

    appliedDate: {
        margin: "5px 0 0",
        color: "#626f83",
        fontSize: "10px"
    },

    /* =========================================================
       STATUS
    ========================================================= */

    statusContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "5px"
    },

    statusSelect: {
        width: "100%",
        padding: "9px 11px",
        borderRadius: "9px",
        border: "1px solid",
        color: "#ffffff",
        fontSize: "10px",
        fontWeight: 800,
        letterSpacing: "0.35px",
        cursor: "pointer",
        outline: "none",
        appearance: "auto"
    },

    updating: {
        color: "#748198",
        fontSize: "9px",
        fontWeight: 500
    },

    /* =========================================================
       EMPTY
    ========================================================= */

    emptyCard: {
        maxWidth: "620px",
        margin: "25px auto 0",
        padding: "60px 30px",
        textAlign: "center",
        background:
            "linear-gradient(145deg, rgba(18, 28, 46, 0.9), rgba(12, 20, 34, 0.9))",
        border:
            "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        boxShadow:
            "0 20px 55px rgba(0,0,0,0.20)"
    },

    emptyIcon: {
        width: "68px",
        height: "68px",
        margin: "0 auto 18px",
        borderRadius: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(59, 130, 246, 0.10)",
        border:
            "1px solid rgba(96, 165, 250, 0.15)",
        fontSize: "29px"
    },

    emptyTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "20px",
        fontWeight: 750
    },

    emptyText: {
        maxWidth: "400px",
        margin: "9px auto 22px",
        color: "#77849a",
        fontSize: "13px",
        lineHeight: 1.6
    },

    emptyButton: {
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
            "0 8px 20px rgba(37, 99, 235, 0.22)"
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
            "linear-gradient(145deg, rgba(18, 28, 46, 0.9), rgba(12, 20, 34, 0.9))",
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
    }
};

export default HRApplicants;