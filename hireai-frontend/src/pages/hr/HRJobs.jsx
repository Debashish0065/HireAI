import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    BriefcaseBusiness,
    CheckCircle2,
    Clock3,
    DollarSign,
    Eye,
    LogOut,
    MapPin,
    Pencil,
    Plus,
    RefreshCw,
    Sparkles,
    Trash2,
    User,
    Users,
} from "lucide-react";
import api from "../../services/api";

function HRJobs() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // =========================================================
    // LOAD HR JOBS
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const fetchJobs = async () => {
            try {
                setLoading(true);
                setError("");
                setMessage("");

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                /*
                 * Backend endpoint:
                 *
                 * GET /api/v1/jobs/my-jobs
                 *
                 * api.js should already have /api/v1
                 */

                const response = await api.get("/jobs/my-jobs", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (cancelled) {
                    return;
                }

                console.log("HR Jobs response:", response.data);

                setJobs(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

                setError("");
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error("Failed to load HR jobs:", err);

                // Unauthorized
                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");

                    navigate("/login");
                    return;
                }

                // Forbidden
                if (err.response?.status === 403) {
                    setError(
                        "You are not authorized to manage jobs."
                    );
                    return;
                }

                // Other errors
                setError(
                    err.response?.data?.message ||
                        err.response?.data ||
                        "Failed to load your jobs."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchJobs();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    // =========================================================
    // DELETE JOB
    // =========================================================

    const handleDeleteJob = async (jobId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this job? This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(`delete-${jobId}`);
            setError("");
            setMessage("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            /*
             * Backend endpoint:
             *
             * DELETE /api/v1/jobs/{id}
             */

            await api.delete(`/jobs/${jobId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Remove deleted job immediately
            setJobs((previousJobs) =>
                previousJobs.filter(
                    (job) => job.id !== jobId
                )
            );

            setMessage("Job deleted successfully.");
        } catch (err) {
            console.error("Failed to delete job:", err);

            // Unauthorized
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");

                navigate("/login");
                return;
            }

            // Forbidden
            if (err.response?.status === 403) {
                setError(
                    "You are not authorized to delete this job."
                );
                return;
            }

            // Other errors
            setError(
                err.response?.data?.message ||
                    err.response?.data ||
                    "Failed to delete job."
            );
        } finally {
            setActionLoading(null);
        }
    };

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
            .replace(/\b\w/g, (char) => char.toUpperCase());
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

        const number = Number(salary);

        if (Number.isNaN(number)) {
            return "Not specified";
        }

        return `₹${number.toLocaleString("en-IN")}`;
    };

    // =========================================================
    // STATUS CONFIG
    // =========================================================

    const getStatusConfig = (status) => {
        switch (status) {
            case "OPEN":
                return {
                    label: "OPEN",
                    color: "#34d399",
                    background:
                        "rgba(16,185,129,0.10)",
                    border:
                        "rgba(52,211,153,0.20)",
                    icon: <CheckCircle2 size={13} />,
                };

            case "CLOSED":
                return {
                    label: "CLOSED",
                    color: "#fb7185",
                    background:
                        "rgba(244,63,94,0.10)",
                    border:
                        "rgba(251,113,133,0.20)",
                    icon: <Clock3 size={13} />,
                };

            default:
                return {
                    label: status || "UNKNOWN",
                    color: "#94a3b8",
                    background:
                        "rgba(148,163,184,0.08)",
                    border:
                        "rgba(148,163,184,0.16)",
                    icon: <Clock3 size={13} />,
                };
        }
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        navigate("/login");
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
                    <div style={styles.headerInner}>
                        <div style={styles.brandSection}>
                            <div style={styles.logoMark}>
                                <Sparkles
                                    size={20}
                                    strokeWidth={2.3}
                                />
                            </div>

                            <div>
                                <h1 style={styles.logo}>
                                    Hire
                                    <span style={styles.logoAccent}>
                                        AI
                                    </span>
                                </h1>

                                <p style={styles.subtitle}>
                                    HR Job Management
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main style={styles.container}>
                    <div style={styles.loadingCard}>
                        <div style={styles.loadingIcon}>
                            <RefreshCw
                                size={28}
                                style={{
                                    animation:
                                        "spin 1.2s linear infinite",
                                }}
                            />
                        </div>

                        <h2 style={styles.loadingTitle}>
                            Loading your jobs
                        </h2>

                        <p style={styles.loadingText}>
                            Fetching your recruitment postings...
                        </p>
                    </div>

                    <style>
                        {`
                            @keyframes spin {
                                from {
                                    transform: rotate(0deg);
                                }
                                to {
                                    transform: rotate(360deg);
                                }
                            }

                            @media (max-width: 700px) {
                                .hireai-header-inner {
                                    padding: 16px 18px !important;
                                }
                            }
                        `}
                    </style>
                </main>
            </div>
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div style={styles.page}>
            {/* =================================================
                BACKGROUND DECORATION
            ================================================= */}

            <div style={styles.backgroundGlowOne} />
            <div style={styles.backgroundGlowTwo} />
            <div style={styles.backgroundGlowThree} />

            {/* =================================================
                HEADER
            ================================================= */}

            <header style={styles.header}>
                <div
                    className="hireai-header-inner"
                    style={styles.headerInner}
                >
                    {/* BRAND */}

                    <div style={styles.brandSection}>
                        <div style={styles.logoMark}>
                            <Sparkles
                                size={20}
                                strokeWidth={2.3}
                            />
                        </div>

                        <div>
                            <h1 style={styles.logo}>
                                Hire
                                <span style={styles.logoAccent}>
                                    AI
                                </span>
                            </h1>

                            <p style={styles.subtitle}>
                                HR Job Management
                            </p>
                        </div>
                    </div>

                    {/* HEADER BUTTONS */}

                    <div style={styles.headerButtons}>
                        <button
                            type="button"
                            style={styles.profileButton}
                            onClick={() =>
                                navigate("/profile")
                            }
                        >
                            <User size={15} />
                            <span>My Profile</span>
                        </button>

                        <button
                            type="button"
                            style={styles.logoutButton}
                            onClick={handleLogout}
                        >
                            <LogOut size={15} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* =================================================
                MAIN
            ================================================= */}

            <main style={styles.container}>
                {/* =================================================
                    BACK BUTTON
                ================================================= */}

                <button
                    type="button"
                    style={styles.backButton}
                    onClick={() =>
                        navigate("/hr/dashboard")
                    }
                >
                    <ArrowLeft size={16} />
                    <span>HR Dashboard</span>
                </button>

                {/* =================================================
                    HERO / TITLE
                ================================================= */}

                <section style={styles.heroSection}>
                    <div style={styles.heroContent}>
                        <div style={styles.heroBadge}>
                            <BriefcaseBusiness size={13} />
                            <span>RECRUITMENT MANAGEMENT</span>
                        </div>

                        <h2 style={styles.heading}>
                            My{" "}
                            <span style={styles.gradientText}>
                                Jobs
                            </span>
                        </h2>

                        <p style={styles.description}>
                            Manage your job postings, track their
                            status and review applicants from one
                            professional workspace.
                        </p>

                        <div style={styles.heroStats}>
                            <div style={styles.heroStat}>
                                <div style={styles.heroStatIcon}>
                                    <BriefcaseBusiness
                                        size={15}
                                    />
                                </div>

                                <div>
                                    <strong
                                        style={
                                            styles.heroStatValue
                                        }
                                    >
                                        {jobs.length}
                                    </strong>

                                    <span
                                        style={
                                            styles.heroStatLabel
                                        }
                                    >
                                        Total Jobs
                                    </span>
                                </div>
                            </div>

                            <div style={styles.heroDivider} />

                            <div style={styles.heroStat}>
                                <div
                                    style={{
                                        ...styles.heroStatIcon,
                                        ...styles.greenHeroIcon,
                                    }}
                                >
                                    <CheckCircle2
                                        size={15}
                                    />
                                </div>

                                <div>
                                    <strong
                                        style={
                                            styles.heroStatValue
                                        }
                                    >
                                        {
                                            jobs.filter(
                                                (job) =>
                                                    job.status ===
                                                    "OPEN"
                                            ).length
                                        }
                                    </strong>

                                    <span
                                        style={
                                            styles.heroStatLabel
                                        }
                                    >
                                        Active Jobs
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.heroVisual}>
                        <div style={styles.heroVisualGlow} />

                        <div style={styles.heroIconCircle}>
                            <BriefcaseBusiness
                                size={38}
                                strokeWidth={1.6}
                            />
                        </div>

                        <span
                            style={styles.heroVisualLabel}
                        >
                            HIREAI
                        </span>

                        <strong
                            style={styles.heroVisualTitle}
                        >
                            Hiring Workspace
                        </strong>
                    </div>
                </section>

                {/* =================================================
                    TITLE ACTION ROW
                ================================================= */}

                <div style={styles.titleRow}>
                    <div>
                        <div style={styles.sectionEyebrow}>
                            JOB POSTINGS
                        </div>

                        <h3 style={styles.sectionTitle}>
                            Your Recruitment Pipeline
                        </h3>
                    </div>

                    <button
                        type="button"
                        style={styles.createButton}
                        onClick={() =>
                            navigate("/hr/jobs/create")
                        }
                    >
                        <Plus size={17} />
                        <span>Post New Job</span>
                    </button>
                </div>

                {/* =================================================
                    SUCCESS MESSAGE
                ================================================= */}

                {message && (
                    <div style={styles.success}>
                        <div style={styles.messageIcon}>
                            <CheckCircle2 size={18} />
                        </div>

                        <div>
                            <strong style={styles.messageTitle}>
                                Success
                            </strong>

                            <span style={styles.messageText}>
                                {message}
                            </span>
                        </div>
                    </div>
                )}

                {/* =================================================
                    ERROR MESSAGE
                ================================================= */}

                {error && (
                    <div style={styles.error}>
                        <div style={styles.errorIcon}>
                            <AlertCircle size={18} />
                        </div>

                        <div>
                            <strong style={styles.errorTitle}>
                                Something went wrong
                            </strong>

                            <span style={styles.errorText}>
                                {error}
                            </span>
                        </div>
                    </div>
                )}

                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {jobs.length === 0 ? (
                    <div style={styles.emptyCard}>
                        <div style={styles.emptyGlow} />

                        <div style={styles.emptyIcon}>
                            <BriefcaseBusiness
                                size={34}
                                strokeWidth={1.7}
                            />
                        </div>

                        <div style={styles.emptyBadge}>
                            NO ACTIVE POSTINGS
                        </div>

                        <h3 style={styles.emptyTitle}>
                            No Jobs Posted Yet
                        </h3>

                        <p style={styles.emptyText}>
                            You haven't posted any jobs yet.
                            Create your first vacancy to start
                            receiving applications from candidates.
                        </p>

                        <button
                            type="button"
                            style={styles.primaryButton}
                            onClick={() =>
                                navigate(
                                    "/hr/jobs/create"
                                )
                            }
                        >
                            <Plus size={17} />
                            <span>
                                Post Your First Job
                            </span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                ) : (
                    /* =================================================
                       JOB LIST
                    ================================================= */

                    <div style={styles.jobsGrid}>
                        {jobs.map((job) => {
                            const statusConfig =
                                getStatusConfig(
                                    job.status
                                );

                            const isDeleting =
                                actionLoading ===
                                `delete-${job.id}`;

                            return (
                                <article
                                    key={job.id}
                                    style={styles.jobCard}
                                >
                                    {/* =========================
                                        TOP ACCENT
                                    ========================= */}

                                    <div
                                        style={
                                            styles.cardAccent
                                        }
                                    />

                                    {/* =========================
                                        CARD HEADER
                                    ========================= */}

                                    <div
                                        style={
                                            styles.cardHeader
                                        }
                                    >
                                        <div
                                            style={
                                                styles.jobHeaderContent
                                            }
                                        >
                                            <div
                                                style={
                                                    styles.jobIcon
                                                }
                                            >
                                                <BriefcaseBusiness
                                                    size={19}
                                                />
                                            </div>

                                            <div>
                                                <h3
                                                    style={
                                                        styles.jobTitle
                                                    }
                                                >
                                                    {job.title ||
                                                        "Untitled Job"}
                                                </h3>

                                                <p
                                                    style={
                                                        styles.company
                                                    }
                                                >
                                                    {job.companyName ||
                                                        "Company"}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            style={{
                                                ...styles.status,
                                                color:
                                                    statusConfig.color,
                                                background:
                                                    statusConfig.background,
                                                borderColor:
                                                    statusConfig.border,
                                            }}
                                        >
                                            {
                                                statusConfig.icon
                                            }

                                            {
                                                statusConfig.label
                                            }
                                        </span>
                                    </div>

                                    {/* =========================
                                        JOB INFORMATION
                                    ========================= */}

                                    <div
                                        style={
                                            styles.infoGrid
                                        }
                                    >
                                        <div
                                            style={
                                                styles.infoItem
                                            }
                                        >
                                            <div
                                                style={
                                                    styles.infoIcon
                                                }
                                            >
                                                <MapPin
                                                    size={14}
                                                />
                                            </div>

                                            <div>
                                                <span
                                                    style={
                                                        styles.label
                                                    }
                                                >
                                                    Location
                                                </span>

                                                <strong
                                                    style={
                                                        styles.infoValue
                                                    }
                                                >
                                                    {job.location ||
                                                        "Not specified"}
                                                </strong>
                                            </div>
                                        </div>

                                        <div
                                            style={
                                                styles.infoItem
                                            }
                                        >
                                            <div
                                                style={{
                                                    ...styles.infoIcon,
                                                    ...styles.violetInfoIcon,
                                                }}
                                            >
                                                <Clock3
                                                    size={14}
                                                />
                                            </div>

                                            <div>
                                                <span
                                                    style={
                                                        styles.label
                                                    }
                                                >
                                                    Job Type
                                                </span>

                                                <strong
                                                    style={
                                                        styles.infoValue
                                                    }
                                                >
                                                    {formatJobType(
                                                        job.jobType
                                                    )}
                                                </strong>
                                            </div>
                                        </div>

                                        <div
                                            style={
                                                styles.infoItem
                                            }
                                        >
                                            <div
                                                style={{
                                                    ...styles.infoIcon,
                                                    ...styles.greenInfoIcon,
                                                }}
                                            >
                                                <DollarSign
                                                    size={14}
                                                />
                                            </div>

                                            <div>
                                                <span
                                                    style={
                                                        styles.label
                                                    }
                                                >
                                                    Salary
                                                </span>

                                                <strong
                                                    style={
                                                        styles.infoValue
                                                    }
                                                >
                                                    {formatSalary(
                                                        job.salary
                                                    )}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* =========================
                                        DESCRIPTION
                                    ========================= */}

                                    <div
                                        style={
                                            styles.descriptionSection
                                        }
                                    >
                                        <span
                                            style={
                                                styles.descriptionLabel
                                            }
                                        >
                                            JOB DESCRIPTION
                                        </span>

                                        <p
                                            style={
                                                styles.jobDescription
                                            }
                                        >
                                            {job.description ||
                                                "No description provided."}
                                        </p>
                                    </div>

                                    {/* =========================
                                        ACTIONS
                                    ========================= */}

                                    <div
                                        style={
                                            styles.actions
                                        }
                                    >
                                        {/* VIEW */}

                                        <button
                                            type="button"
                                            style={
                                                styles.viewButton
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/hr/jobs/${job.id}`
                                                )
                                            }
                                        >
                                            <Eye size={15} />
                                            <span>
                                                View
                                            </span>
                                        </button>

                                        {/* APPLICANTS */}

                                        <button
                                            type="button"
                                            style={
                                                styles.applicantsButton
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/hr/jobs/${job.id}/applicants`
                                                )
                                            }
                                        >
                                            <Users size={15} />
                                            <span>
                                                Applicants
                                            </span>
                                        </button>

                                        {/* EDIT */}

                                        <button
                                            type="button"
                                            style={
                                                styles.editButton
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/hr/jobs/${job.id}/edit`
                                                )
                                            }
                                        >
                                            <Pencil size={14} />
                                            <span>
                                                Edit
                                            </span>
                                        </button>

                                        {/* DELETE */}

                                        <button
                                            type="button"
                                            style={
                                                styles.deleteButton
                                            }
                                            disabled={
                                                isDeleting
                                            }
                                            onClick={() =>
                                                handleDeleteJob(
                                                    job.id
                                                )
                                            }
                                        >
                                            <Trash2
                                                size={14}
                                            />

                                            <span>
                                                {isDeleting
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </span>
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* =================================================
                RESPONSIVE STYLES
            ================================================= */}

            <style>
                {`
                    * {
                        box-sizing: border-box;
                    }

                    button {
                        font-family: inherit;
                    }

                    button:not(:disabled):hover {
                        transform: translateY(-1px);
                    }

                    button:disabled {
                        opacity: 0.55;
                        cursor: not-allowed;
                    }

                    @media (max-width: 900px) {
                        .hireai-hero-visual {
                            display: none;
                        }
                    }

                    @media (max-width: 700px) {
                        .hireai-header-inner {
                            padding: 16px 18px !important;
                        }

                        .hireai-header-inner
                            button span {
                            display: none;
                        }
                    }

                    @media (max-width: 600px) {
                        .hireai-container {
                            padding: 25px 16px !important;
                        }
                    }
                `}
            </style>
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
            "radial-gradient(circle at 8% 0%, rgba(99,102,241,0.15), transparent 30%)," +
            "radial-gradient(circle at 92% 5%, rgba(168,85,247,0.12), transparent 28%)," +
            "radial-gradient(circle at 50% 100%, rgba(37,99,235,0.08), transparent 35%)," +
            "linear-gradient(135deg, #060914 0%, #0a1020 48%, #100a18 100%)",
        color: "#f8fafc",
        fontFamily:
            "'Inter', 'Segoe UI', Arial, sans-serif",
    },

    /* =========================================================
       BACKGROUND GLOW
    ========================================================= */

    backgroundGlowOne: {
        position: "fixed",
        width: "450px",
        height: "450px",
        borderRadius: "50%",
        top: "-260px",
        left: "-180px",
        background:
            "radial-gradient(circle, rgba(79,70,229,0.15), transparent 70%)",
        filter: "blur(15px)",
        pointerEvents: "none",
    },

    backgroundGlowTwo: {
        position: "fixed",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        right: "-220px",
        top: "15%",
        background:
            "radial-gradient(circle, rgba(147,51,234,0.12), transparent 70%)",
        filter: "blur(15px)",
        pointerEvents: "none",
    },

    backgroundGlowThree: {
        position: "fixed",
        width: "450px",
        height: "450px",
        borderRadius: "50%",
        bottom: "-300px",
        left: "30%",
        background:
            "radial-gradient(circle, rgba(30,64,175,0.10), transparent 70%)",
        filter: "blur(18px)",
        pointerEvents: "none",
    },

    /* =========================================================
       HEADER
    ========================================================= */

    header: {
        position: "relative",
        zIndex: 10,
        background:
            "linear-gradient(180deg, rgba(12,18,34,0.97), rgba(8,13,25,0.93))",
        borderBottom:
            "1px solid rgba(148,163,184,0.12)",
        backdropFilter: "blur(18px)",
        boxShadow:
            "0 12px 40px rgba(0,0,0,0.25)",
    },

    headerInner: {
        maxWidth: "1250px",
        margin: "0 auto",
        padding: "19px 28px",
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
        border:
            "1px solid rgba(255,255,255,0.13)",
        boxShadow:
            "0 8px 25px rgba(99,102,241,0.30)",
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
        letterSpacing: "0.3px",
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
        padding: "10px 15px",
        border:
            "1px solid rgba(148,163,184,0.18)",
        borderRadius: "10px",
        background:
            "rgba(255,255,255,0.045)",
        color: "#e2e8f0",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 600,
        transition: "all 0.2s ease",
    },

    logoutButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "10px 15px",
        border:
            "1px solid rgba(248,113,113,0.18)",
        borderRadius: "10px",
        background:
            "rgba(127,29,29,0.20)",
        color: "#fda4af",
        cursor: "pointer",
        fontSize: "12px",
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
        padding: "32px 28px 55px",
    },

    /* =========================================================
       BACK BUTTON
    ========================================================= */

    backButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "9px 13px",
        marginBottom: "22px",
        border:
            "1px solid rgba(148,163,184,0.14)",
        borderRadius: "9px",
        background:
            "rgba(255,255,255,0.035)",
        color: "#94a3b8",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 600,
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
        padding: "32px",
        marginBottom: "36px",
        borderRadius: "22px",
        overflow: "hidden",
        background:
            "linear-gradient(135deg, rgba(20,28,50,0.93), rgba(17,13,31,0.94))",
        border:
            "1px solid rgba(148,163,184,0.14)",
        boxShadow:
            "0 25px 70px rgba(0,0,0,0.30)",
        backdropFilter: "blur(18px)",
    },

    heroContent: {
        maxWidth: "760px",
    },

    heroBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "7px 11px",
        marginBottom: "15px",
        borderRadius: "999px",
        background:
            "rgba(99,102,241,0.10)",
        border:
            "1px solid rgba(129,140,248,0.18)",
        color: "#a5b4fc",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1.3px",
    },

    heading: {
        margin: 0,
        fontSize: "35px",
        lineHeight: 1.15,
        fontWeight: 800,
        letterSpacing: "-1px",
        color: "#f8fafc",
    },

    gradientText: {
        background:
            "linear-gradient(90deg, #818cf8, #a78bfa, #c084fc)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },

    description: {
        margin: "13px 0 0",
        maxWidth: "680px",
        color: "#94a3b8",
        fontSize: "14px",
        lineHeight: 1.7,
    },

    heroStats: {
        display: "flex",
        alignItems: "center",
        gap: "18px",
        marginTop: "22px",
    },

    heroStat: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
    },

    heroStatIcon: {
        width: "32px",
        height: "32px",
        borderRadius: "9px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#a5b4fc",
        background:
            "rgba(99,102,241,0.11)",
        border:
            "1px solid rgba(129,140,248,0.14)",
    },

    greenHeroIcon: {
        color: "#34d399",
        background:
            "rgba(16,185,129,0.10)",
        borderColor:
            "rgba(52,211,153,0.15)",
    },

    heroStatValue: {
        display: "block",
        color: "#f1f5f9",
        fontSize: "16px",
        lineHeight: 1.1,
    },

    heroStatLabel: {
        display: "block",
        marginTop: "2px",
        color: "#64748b",
        fontSize: "9px",
        textTransform: "uppercase",
        letterSpacing: "0.7px",
    },

    heroDivider: {
        width: "1px",
        height: "30px",
        background:
            "rgba(148,163,184,0.14)",
    },

    heroVisual: {
        minWidth: "190px",
        height: "170px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        borderRadius: "20px",
        background:
            "linear-gradient(145deg, rgba(79,70,229,0.12), rgba(124,58,237,0.05))",
        border:
            "1px solid rgba(129,140,248,0.15)",
        overflow: "hidden",
    },

    heroVisualGlow: {
        position: "absolute",
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(129,140,248,0.22), transparent 70%)",
        filter: "blur(6px)",
    },

    heroIconCircle: {
        position: "relative",
        zIndex: 2,
        width: "70px",
        height: "70px",
        borderRadius: "21px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#c4b5fd",
        background:
            "linear-gradient(145deg, rgba(99,102,241,0.19), rgba(139,92,246,0.09))",
        border:
            "1px solid rgba(167,139,250,0.22)",
        boxShadow:
            "0 15px 35px rgba(79,70,229,0.18)",
    },

    heroVisualLabel: {
        position: "relative",
        zIndex: 2,
        marginTop: "11px",
        color: "#818cf8",
        fontSize: "8px",
        fontWeight: 700,
        letterSpacing: "1.5px",
    },

    heroVisualTitle: {
        position: "relative",
        zIndex: 2,
        marginTop: "3px",
        color: "#e2e8f0",
        fontSize: "12px",
    },

    /* =========================================================
       TITLE ROW
    ========================================================= */

    titleRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "20px",
        marginBottom: "20px",
        flexWrap: "wrap",
    },

    sectionEyebrow: {
        marginBottom: "5px",
        color: "#818cf8",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1.5px",
    },

    sectionTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "22px",
        fontWeight: 750,
        letterSpacing: "-0.3px",
    },

    createButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "11px 16px",
        border:
            "1px solid rgba(129,140,248,0.22)",
        borderRadius: "10px",
        background:
            "linear-gradient(135deg, #4f46e5, #7c3aed)",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 700,
        boxShadow:
            "0 10px 25px rgba(79,70,229,0.22)",
    },

    /* =========================================================
       MESSAGES
    ========================================================= */

    success: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "18px",
        padding: "14px 16px",
        borderRadius: "12px",
        background:
            "linear-gradient(135deg, rgba(5,150,105,0.12), rgba(16,185,129,0.05))",
        border:
            "1px solid rgba(52,211,153,0.18)",
    },

    messageIcon: {
        width: "34px",
        height: "34px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9px",
        color: "#34d399",
        background:
            "rgba(16,185,129,0.10)",
    },

    messageTitle: {
        display: "block",
        color: "#a7f3d0",
        fontSize: "12px",
    },

    messageText: {
        display: "block",
        marginTop: "2px",
        color: "#6ee7b7",
        fontSize: "11px",
    },

    error: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "18px",
        padding: "14px 16px",
        borderRadius: "12px",
        background:
            "linear-gradient(135deg, rgba(127,29,29,0.18), rgba(244,63,94,0.05))",
        border:
            "1px solid rgba(251,113,133,0.18)",
    },

    errorIcon: {
        width: "34px",
        height: "34px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9px",
        color: "#fb7185",
        background:
            "rgba(244,63,94,0.10)",
    },

    errorTitle: {
        display: "block",
        color: "#fecdd3",
        fontSize: "12px",
    },

    errorText: {
        display: "block",
        marginTop: "2px",
        color: "#fda4af",
        fontSize: "11px",
    },

    /* =========================================================
       JOB GRID
    ========================================================= */

    jobsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "18px",
    },

    /* =========================================================
       JOB CARD
    ========================================================= */

    jobCard: {
        position: "relative",
        overflow: "hidden",
        padding: "23px",
        borderRadius: "17px",
        background:
            "linear-gradient(145deg, rgba(19,27,46,0.95), rgba(10,16,30,0.97))",
        border:
            "1px solid rgba(148,163,184,0.13)",
        boxShadow:
            "0 18px 45px rgba(0,0,0,0.25)",
        transition:
            "transform 0.25s ease, border-color 0.25s ease",
    },

    cardAccent: {
        position: "absolute",
        top: 0,
        left: "22px",
        right: "22px",
        height: "1px",
        background:
            "linear-gradient(90deg, transparent, rgba(129,140,248,0.65), transparent)",
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
    },

    jobHeaderContent: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: 0,
    },

    jobIcon: {
        flexShrink: 0,
        width: "43px",
        height: "43px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#a5b4fc",
        background:
            "linear-gradient(145deg, rgba(79,70,229,0.18), rgba(124,58,237,0.07))",
        border:
            "1px solid rgba(129,140,248,0.15)",
    },

    jobTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "18px",
        lineHeight: 1.35,
        fontWeight: 700,
        letterSpacing: "-0.25px",
    },

    company: {
        margin: "4px 0 0",
        color: "#818cf8",
        fontSize: "11px",
        fontWeight: 600,
    },

    status: {
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "6px 9px",
        borderRadius: "999px",
        border: "1px solid",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.6px",
    },

    /* =========================================================
       INFO
    ========================================================= */

    infoGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
        gap: "9px",
        marginTop: "20px",
        padding: "15px 0",
        borderTop:
            "1px solid rgba(148,163,184,0.10)",
        borderBottom:
            "1px solid rgba(148,163,184,0.10)",
    },

    infoItem: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minWidth: 0,
    },

    infoIcon: {
        flexShrink: 0,
        width: "29px",
        height: "29px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        color: "#60a5fa",
        background:
            "rgba(37,99,235,0.10)",
    },

    violetInfoIcon: {
        color: "#a78bfa",
        background:
            "rgba(124,58,237,0.10)",
    },

    greenInfoIcon: {
        color: "#34d399",
        background:
            "rgba(16,185,129,0.10)",
    },

    label: {
        display: "block",
        color: "#64748b",
        fontSize: "8px",
        textTransform: "uppercase",
        letterSpacing: "0.7px",
        whiteSpace: "nowrap",
    },

    infoValue: {
        display: "block",
        marginTop: "3px",
        color: "#cbd5e1",
        fontSize: "10px",
        fontWeight: 600,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    /* =========================================================
       DESCRIPTION
    ========================================================= */

    descriptionSection: {
        marginTop: "17px",
    },

    descriptionLabel: {
        color: "#475569",
        fontSize: "8px",
        fontWeight: 700,
        letterSpacing: "1px",
    },

    jobDescription: {
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        minHeight: "57px",
        margin: "7px 0 0",
        color: "#8492a6",
        fontSize: "12px",
        lineHeight: 1.6,
    },

    /* =========================================================
       ACTIONS
    ========================================================= */

    actions: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        gap: "7px",
        marginTop: "18px",
        paddingTop: "16px",
        borderTop:
            "1px solid rgba(148,163,184,0.10)",
    },

    viewButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        padding: "9px 7px",
        border:
            "1px solid rgba(96,165,250,0.18)",
        borderRadius: "8px",
        background:
            "rgba(37,99,235,0.10)",
        color: "#93c5fd",
        cursor: "pointer",
        fontSize: "10px",
        fontWeight: 700,
    },

    applicantsButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        padding: "9px 7px",
        border:
            "1px solid rgba(167,139,250,0.18)",
        borderRadius: "8px",
        background:
            "rgba(124,58,237,0.10)",
        color: "#c4b5fd",
        cursor: "pointer",
        fontSize: "10px",
        fontWeight: 700,
    },

    editButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        padding: "9px 7px",
        border:
            "1px solid rgba(251,191,36,0.16)",
        borderRadius: "8px",
        background:
            "rgba(217,119,6,0.09)",
        color: "#fcd34d",
        cursor: "pointer",
        fontSize: "10px",
        fontWeight: 700,
    },

    deleteButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        padding: "9px 7px",
        border:
            "1px solid rgba(251,113,133,0.16)",
        borderRadius: "8px",
        background:
            "rgba(220,38,38,0.08)",
        color: "#fb7185",
        cursor: "pointer",
        fontSize: "10px",
        fontWeight: 700,
    },

    /* =========================================================
       EMPTY STATE
    ========================================================= */

    emptyCard: {
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        padding: "70px 30px",
        borderRadius: "20px",
        background:
            "linear-gradient(145deg, rgba(19,27,46,0.94), rgba(10,16,30,0.97))",
        border:
            "1px solid rgba(148,163,184,0.13)",
        boxShadow:
            "0 20px 60px rgba(0,0,0,0.28)",
    },

    emptyGlow: {
        position: "absolute",
        width: "250px",
        height: "250px",
        left: "50%",
        top: "-150px",
        transform: "translateX(-50%)",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(99,102,241,0.16), transparent 70%)",
        filter: "blur(8px)",
    },

    emptyIcon: {
        position: "relative",
        zIndex: 2,
        width: "68px",
        height: "68px",
        margin: "0 auto 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "20px",
        color: "#a5b4fc",
        background:
            "linear-gradient(145deg, rgba(79,70,229,0.17), rgba(124,58,237,0.07))",
        border:
            "1px solid rgba(129,140,248,0.17)",
    },

    emptyBadge: {
        position: "relative",
        zIndex: 2,
        display: "inline-block",
        marginBottom: "10px",
        color: "#818cf8",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1.3px",
    },

    emptyTitle: {
        position: "relative",
        zIndex: 2,
        margin: "0 0 9px",
        color: "#f1f5f9",
        fontSize: "23px",
        fontWeight: 750,
    },

    emptyText: {
        position: "relative",
        zIndex: 2,
        maxWidth: "560px",
        margin: "0 auto",
        color: "#8492a6",
        fontSize: "13px",
        lineHeight: 1.7,
    },

    primaryButton: {
        position: "relative",
        zIndex: 2,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
        marginTop: "22px",
        padding: "12px 18px",
        border:
            "1px solid rgba(129,140,248,0.22)",
        borderRadius: "10px",
        background:
            "linear-gradient(135deg, #4f46e5, #7c3aed)",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 700,
        boxShadow:
            "0 10px 28px rgba(79,70,229,0.22)",
    },

    /* =========================================================
       LOADING
    ========================================================= */

    loadingCard: {
        minHeight: "430px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "20px",
        background:
            "linear-gradient(145deg, rgba(19,27,46,0.94), rgba(10,16,30,0.97))",
        border:
            "1px solid rgba(148,163,184,0.13)",
        boxShadow:
            "0 20px 60px rgba(0,0,0,0.25)",
    },

    loadingIcon: {
        width: "62px",
        height: "62px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "18px",
        color: "#a78bfa",
        background:
            "rgba(99,102,241,0.10)",
        border:
            "1px solid rgba(129,140,248,0.16)",
    },

    loadingTitle: {
        margin: "18px 0 5px",
        color: "#f1f5f9",
        fontSize: "19px",
    },

    loadingText: {
        margin: 0,
        color: "#64748b",
        fontSize: "12px",
    },
};

export default HRJobs;