import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    BriefcaseBusiness,
    CheckCircle2,
    Clock3,
    Eye,
    FileText,
    MapPin,
    ShieldCheck,
    X,
    AlertCircle,
    Building2,
    CalendarDays,
    UserRound,
    Mail,
    RefreshCw,
    LockKeyhole,
    Users,
} from "lucide-react";

import api from "../../services/api";

import "bootstrap/dist/css/bootstrap.min.css";

function AdminJobs() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedJob, setSelectedJob] = useState(null);

    const [closingJobId, setClosingJobId] = useState(null);
    const [jobToClose, setJobToClose] = useState(null);

    // =========================================================
    // FETCH ALL JOBS
    // GET /api/v1/admin/jobs
    // =========================================================

    useEffect(() => {
        let ignore = false;

        const fetchJobs = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/admin/jobs");

                console.log("Admin jobs:", response.data);

                if (!ignore) {
                    setJobs(
                        Array.isArray(response.data)
                            ? response.data
                            : Array.isArray(response.data?.content)
                              ? response.data.content
                              : Array.isArray(response.data?.data)
                                ? response.data.data
                                : []
                    );
                }
            } catch (err) {
                console.error("Failed to load admin jobs:", err);

                if (!ignore) {
                    if (
                        err.response?.status === 401 ||
                        err.response?.status === 403
                    ) {
                        setError(
                            "You are not authorized to view admin jobs."
                        );
                    } else {
                        setError(
                            err.response?.data?.message ||
                                "Unable to load jobs."
                        );
                    }
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchJobs();

        return () => {
            ignore = true;
        };
    }, []);

    // =========================================================
    // GET JOB DETAILS
    // GET /api/v1/admin/jobs/{id}
    // =========================================================

    const handleViewJob = async (id) => {
        try {
            setError("");

            const response = await api.get(`/admin/jobs/${id}`);

            console.log("Admin job details:", response.data);

            setSelectedJob(response.data);
        } catch (err) {
            console.error("Failed to load job details:", err);

            setError(
                err.response?.data?.message ||
                    "Unable to load job details."
            );
        }
    };

    // =========================================================
    // OPEN CLOSE CONFIRMATION
    // =========================================================

    const handleOpenCloseConfirmation = (job) => {
        setJobToClose(job);
    };

    // =========================================================
    // CLOSE CONFIRMATION MODAL
    // PUT /api/v1/admin/jobs/{id}/close
    // =========================================================

    const handleCloseJob = async () => {
        if (!jobToClose) {
            return;
        }

        const id = jobToClose.id;

        try {
            setClosingJobId(id);
            setError("");

            const response = await api.put(
                `/admin/jobs/${id}/close`
            );

            console.log("Job closed:", response.data);

            setJobs((previousJobs) =>
                previousJobs.map((job) =>
                    job.id === id
                        ? response.data
                        : job
                )
            );

            if (
                selectedJob &&
                selectedJob.id === id
            ) {
                setSelectedJob(response.data);
            }

            setJobToClose(null);
        } catch (err) {
            console.error("Failed to close job:", err);

            setError(
                err.response?.data?.message ||
                    "Unable to close job."
            );
        } finally {
            setClosingJobId(null);
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
    // REFRESH
    // =========================================================

    const handleRefresh = () => {
        window.location.reload();
    };

    // =========================================================
    // STATUS STYLE
    // =========================================================

    const getStatusStyle = (status) => {
        const normalizedStatus = String(status || "")
            .toUpperCase();

        if (
            normalizedStatus === "OPEN" ||
            normalizedStatus === "ACTIVE"
        ) {
            return {
                background:
                    "rgba(16, 185, 129, 0.12)",
                color: "#34d399",
                border:
                    "1px solid rgba(16, 185, 129, 0.30)",
                boxShadow:
                    "0 0 18px rgba(16, 185, 129, 0.06)",
            };
        }

        if (normalizedStatus === "CLOSED") {
            return {
                background:
                    "rgba(239, 68, 68, 0.12)",
                color: "#f87171",
                border:
                    "1px solid rgba(239, 68, 68, 0.28)",
                boxShadow:
                    "0 0 18px rgba(239, 68, 68, 0.05)",
            };
        }

        if (normalizedStatus === "DRAFT") {
            return {
                background:
                    "rgba(245, 158, 11, 0.12)",
                color: "#fbbf24",
                border:
                    "1px solid rgba(245, 158, 11, 0.28)",
                boxShadow:
                    "0 0 18px rgba(245, 158, 11, 0.05)",
            };
        }

        return {
            background:
                "rgba(148, 163, 184, 0.10)",
            color: "#cbd5e1",
            border:
                "1px solid rgba(148, 163, 184, 0.22)",
        };
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        try {
            return new Date(date).toLocaleString();
        } catch {
            return date;
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div style={styles.page}>
                {/* HEADER */}

                <header style={styles.header}>
                    <div>
                        <h1 style={styles.logo}>
                            HireAI <span>🚀</span>
                        </h1>

                        <p style={styles.subtitle}>
                            Admin Job Management
                        </p>
                    </div>

                    <div style={styles.headerButtons}>
                        <button
                            type="button"
                            style={styles.dashboardButton}
                            onClick={() =>
                                navigate("/admin/dashboard")
                            }
                        >
                            Admin Dashboard
                        </button>

                        <button
                            type="button"
                            style={styles.logoutButton}
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* LOADING */}

                <main style={styles.container}>
                    <div style={styles.loadingCard}>
                        <div style={styles.loadingIcon}>
                            <BriefcaseBusiness size={28} />
                        </div>

                        <h2 style={styles.loadingTitle}>
                            Loading Jobs
                        </h2>

                        <p style={styles.mutedText}>
                            Please wait while admin jobs are
                            being loaded.
                        </p>

                        <div style={styles.spinner} />
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
            {/* =================================================
                HEADER
            ================================================= */}

            <header style={styles.header}>
                <div>
                    <h1 style={styles.logo}>
                        HireAI <span>🚀</span>
                    </h1>

                    <p style={styles.subtitle}>
                        Admin Job Management
                    </p>
                </div>

                <div style={styles.headerButtons}>
                    <button
                        type="button"
                        style={styles.dashboardButton}
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        Admin Dashboard
                    </button>

                    <button
                        type="button"
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
                {/* =================================================
                    TOP NAVIGATION
                ================================================= */}

                <div style={styles.topNavigation}>
                    <button
                        type="button"
                        style={styles.backButton}
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        <ArrowLeft size={16} />

                        Back to Admin Dashboard
                    </button>

                    <div style={styles.systemStatus}>
                        <span style={styles.statusDot} />

                        System Active
                    </div>
                </div>

                {/* =================================================
                    TITLE
                ================================================= */}

                <div style={styles.titleSection}>
                    <div style={styles.titleIcon}>
                        <BriefcaseBusiness size={28} />
                    </div>

                    <div>
                        <h2 style={styles.heading}>
                            Manage Jobs
                        </h2>

                        <p style={styles.description}>
                            View and manage all jobs created
                            in HireAI.
                        </p>
                    </div>
                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div style={styles.errorBox}>
                        <div style={styles.errorIcon}>
                            <AlertCircle size={19} />
                        </div>

                        <div>
                            <div style={styles.errorTitle}>
                                Unable to load jobs
                            </div>

                            <div style={styles.errorMessage}>
                                {error}
                            </div>
                        </div>

                        <button
                            type="button"
                            style={styles.errorCloseButton}
                            onClick={() => setError("")}
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div style={styles.summaryGrid}>
                    {/* TOTAL JOBS */}

                    <div style={styles.summaryCard}>
                        <div>
                            <span style={styles.summaryLabel}>
                                TOTAL JOBS
                            </span>

                            <strong style={styles.summaryValue}>
                                {jobs.length}
                            </strong>

                            <span style={styles.summaryDescription}>
                                Registered job postings
                            </span>
                        </div>

                        <div
                            style={{
                                ...styles.summaryIcon,
                                background:
                                    "rgba(99, 102, 241, 0.12)",
                                color: "#818cf8",
                            }}
                        >
                            <BriefcaseBusiness size={23} />
                        </div>
                    </div>

                    {/* OPEN JOBS */}

                    <div style={styles.summaryCard}>
                        <div>
                            <span style={styles.summaryLabel}>
                                OPEN JOBS
                            </span>

                            <strong style={styles.summaryValue}>
                                {
                                    jobs.filter(
                                        (job) =>
                                            String(
                                                job.status ||
                                                    ""
                                            ).toUpperCase() ===
                                            "OPEN"
                                    ).length
                                }
                            </strong>

                            <span style={styles.summaryDescription}>
                                Currently accepting applications
                            </span>
                        </div>

                        <div
                            style={{
                                ...styles.summaryIcon,
                                background:
                                    "rgba(16, 185, 129, 0.11)",
                                color: "#34d399",
                            }}
                        >
                            <CheckCircle2 size={23} />
                        </div>
                    </div>

                    {/* CLOSED JOBS */}

                    <div style={styles.summaryCard}>
                        <div>
                            <span style={styles.summaryLabel}>
                                CLOSED JOBS
                            </span>

                            <strong style={styles.summaryValue}>
                                {
                                    jobs.filter(
                                        (job) =>
                                            String(
                                                job.status ||
                                                    ""
                                            ).toUpperCase() ===
                                            "CLOSED"
                                    ).length
                                }
                            </strong>

                            <span style={styles.summaryDescription}>
                                No longer accepting applications
                            </span>
                        </div>

                        <div
                            style={{
                                ...styles.summaryIcon,
                                background:
                                    "rgba(239, 68, 68, 0.10)",
                                color: "#f87171",
                            }}
                        >
                            <LockKeyhole size={23} />
                        </div>
                    </div>

                    {/* HR / EMPLOYER JOBS */}

                    <div style={styles.summaryCard}>
                        <div>
                            <span style={styles.summaryLabel}>
                                JOB MANAGEMENT
                            </span>

                            <strong
                                style={{
                                    ...styles.summaryValue,
                                    fontSize: "22px",
                                }}
                            >
                                Admin
                            </strong>

                            <span style={styles.summaryDescription}>
                                Centralized job administration
                            </span>
                        </div>

                        <div
                            style={{
                                ...styles.summaryIcon,
                                background:
                                    "rgba(168, 85, 247, 0.11)",
                                color: "#c084fc",
                            }}
                        >
                            <ShieldCheck size={23} />
                        </div>
                    </div>
                </div>

                {/* =================================================
                    JOBS TABLE CARD
                ================================================= */}

                <div style={styles.card}>
                    {/* CARD HEADER */}

                    <div style={styles.cardHeader}>
                        <div>
                            <div style={styles.sectionTitleRow}>
                                <span style={styles.titleIndicator} />

                                <h3 style={styles.sectionTitle}>
                                    All Jobs
                                </h3>
                            </div>

                            <p style={styles.sectionDescription}>
                                Manage all job postings created
                                by HireAI HR users.
                            </p>
                        </div>

                        <button
                            type="button"
                            style={styles.refreshButton}
                            onClick={handleRefresh}
                        >
                            <RefreshCw size={15} />

                            Refresh
                        </button>
                    </div>

                    {/* =================================================
                        EMPTY STATE
                    ================================================= */}

                    {jobs.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>
                                <BriefcaseBusiness size={30} />
                            </div>

                            <h3 style={styles.emptyTitle}>
                                No Jobs Found
                            </h3>

                            <p style={styles.mutedText}>
                                There are currently no jobs
                                available in HireAI.
                            </p>
                        </div>
                    ) : (
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>
                                            ID
                                        </th>

                                        <th style={styles.th}>
                                            JOB TITLE
                                        </th>

                                        <th style={styles.th}>
                                            COMPANY
                                        </th>

                                        <th style={styles.th}>
                                            LOCATION
                                        </th>

                                        <th style={styles.th}>
                                            TYPE
                                        </th>

                                        <th style={styles.th}>
                                            HR
                                        </th>

                                        <th style={styles.th}>
                                            STATUS
                                        </th>

                                        <th style={styles.th}>
                                            CREATED
                                        </th>

                                        <th style={styles.th}>
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {jobs.map((job, index) => {
                                        const normalizedStatus =
                                            String(
                                                job.status || ""
                                            ).toUpperCase();

                                        return (
                                            <tr
                                                key={job.id}
                                                style={{
                                                    ...styles.tr,
                                                    borderBottom:
                                                        index ===
                                                        jobs.length -
                                                            1
                                                            ? "none"
                                                            : "1px solid rgba(148, 163, 184, 0.08)",
                                                }}
                                            >
                                                {/* ID */}

                                                <td
                                                    style={{
                                                        ...styles.td,
                                                        color:
                                                            "#818cf8",
                                                        fontWeight:
                                                            "700",
                                                    }}
                                                >
                                                    #{job.id}
                                                </td>

                                                {/* JOB TITLE */}

                                                <td style={styles.td}>
                                                    <div
                                                        style={
                                                            styles.jobTitle
                                                        }
                                                    >
                                                        {job.title ||
                                                            "N/A"}
                                                    </div>

                                                    {job.description && (
                                                        <div
                                                            style={
                                                                styles.jobDescriptionPreview
                                                            }
                                                        >
                                                            {
                                                                job.description
                                                            }
                                                        </div>
                                                    )}
                                                </td>

                                                {/* COMPANY */}

                                                <td style={styles.td}>
                                                    <div
                                                        style={
                                                            styles.iconText
                                                        }
                                                    >
                                                        <Building2
                                                            size={
                                                                15
                                                            }
                                                        />

                                                        <span>
                                                            {job.companyName ||
                                                                "N/A"}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* LOCATION */}

                                                <td style={styles.td}>
                                                    <div
                                                        style={
                                                            styles.iconText
                                                        }
                                                    >
                                                        <MapPin
                                                            size={
                                                                15
                                                            }
                                                        />

                                                        <span>
                                                            {job.location ||
                                                                "N/A"}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* TYPE */}

                                                <td style={styles.td}>
                                                    <span
                                                        style={
                                                            styles.typeBadge
                                                        }
                                                    >
                                                        {
                                                            job.jobType ||
                                                                "N/A"
                                                        }
                                                    </span>
                                                </td>

                                                {/* HR */}

                                                <td style={styles.td}>
                                                    <div
                                                        style={
                                                            styles.hrName
                                                        }
                                                    >
                                                        <UserRound
                                                            size={
                                                                15
                                                            }
                                                        />

                                                        <span>
                                                            {job.hrName ||
                                                                "N/A"}
                                                        </span>
                                                    </div>

                                                    {job.hrEmail && (
                                                        <div
                                                            style={
                                                                styles.hrEmail
                                                            }
                                                        >
                                                            <Mail
                                                                size={
                                                                    11
                                                                }
                                                            />

                                                            {
                                                                job.hrEmail
                                                            }
                                                        </div>
                                                    )}
                                                </td>

                                                {/* STATUS */}

                                                <td style={styles.td}>
                                                    <span
                                                        style={{
                                                            ...styles.statusBadge,
                                                            ...getStatusStyle(
                                                                job.status
                                                            ),
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                width: "6px",
                                                                height: "6px",
                                                                borderRadius:
                                                                    "50%",
                                                                background:
                                                                    "currentColor",
                                                            }}
                                                        />

                                                        {job.status ||
                                                            "UNKNOWN"}
                                                    </span>
                                                </td>

                                                {/* CREATED */}

                                                <td style={styles.td}>
                                                    <div
                                                        style={
                                                            styles.createdDate
                                                        }
                                                    >
                                                        <CalendarDays
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        {formatDate(
                                                            job.createdAt
                                                        )}
                                                    </div>
                                                </td>

                                                {/* ACTIONS */}

                                                <td style={styles.td}>
                                                    <div
                                                        style={
                                                            styles.actionButtons
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            style={
                                                                styles.viewButton
                                                            }
                                                            onClick={() =>
                                                                handleViewJob(
                                                                    job.id
                                                                )
                                                            }
                                                        >
                                                            <Eye
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            View
                                                        </button>

                                                        {normalizedStatus !==
                                                            "CLOSED" && (
                                                            <button
                                                                type="button"
                                                                style={
                                                                    styles.closeButton
                                                                }
                                                                disabled={
                                                                    closingJobId ===
                                                                    job.id
                                                                }
                                                                onClick={() =>
                                                                    handleOpenCloseConfirmation(
                                                                        job
                                                                    )
                                                                }
                                                            >
                                                                <LockKeyhole
                                                                    size={
                                                                        14
                                                                    }
                                                                />

                                                                Close
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* =================================================
                        TABLE FOOTER
                    ================================================= */}

                    {jobs.length > 0 && (
                        <div style={styles.tableFooter}>
                            <div style={styles.footerText}>
                                Showing{" "}
                                <strong>
                                    {jobs.length}
                                </strong>{" "}
                                job
                                {jobs.length !== 1
                                    ? "s"
                                    : ""}
                            </div>

                            <div style={styles.footerActive}>
                                <CheckCircle2 size={14} />

                                <span>
                                    {
                                        jobs.filter(
                                            (job) =>
                                                String(
                                                    job.status ||
                                                        ""
                                                ).toUpperCase() ===
                                                "OPEN"
                                        ).length
                                    }{" "}
                                    open jobs
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* =================================================
                    JOB DETAILS
                ================================================= */}

                {selectedJob && (
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div>
                                <div style={styles.sectionTitleRow}>
                                    <span
                                        style={{
                                            ...styles.titleIndicator,
                                            background:
                                                "#34d399",
                                            boxShadow:
                                                "0 0 12px rgba(52, 211, 153, 0.8)",
                                        }}
                                    />

                                    <h3 style={styles.sectionTitle}>
                                        Job Details
                                    </h3>
                                </div>

                                <p style={styles.sectionDescription}>
                                    Detailed information for Job #
                                    {selectedJob.id}
                                </p>
                            </div>

                            <button
                                type="button"
                                style={
                                    styles.closeDetailsButton
                                }
                                onClick={() =>
                                    setSelectedJob(null)
                                }
                            >
                                <X size={15} />

                                Close
                            </button>
                        </div>

                        {/* DETAILS GRID */}

                        <div style={styles.detailsGrid}>
                            {/* JOB TITLE */}

                            <div style={styles.detailBox}>
                                <div style={styles.detailIcon}>
                                    <BriefcaseBusiness
                                        size={17}
                                    />
                                </div>

                                <div>
                                    <span style={styles.label}>
                                        Job Title
                                    </span>

                                    <strong
                                        style={
                                            styles.detailValue
                                        }
                                    >
                                        {selectedJob.title ||
                                            "N/A"}
                                    </strong>
                                </div>
                            </div>

                            {/* COMPANY */}

                            <div style={styles.detailBox}>
                                <div
                                    style={{
                                        ...styles.detailIcon,
                                        color: "#60a5fa",
                                        background:
                                            "rgba(59, 130, 246, 0.10)",
                                    }}
                                >
                                    <Building2 size={17} />
                                </div>

                                <div>
                                    <span style={styles.label}>
                                        Company
                                    </span>

                                    <strong
                                        style={
                                            styles.detailValue
                                        }
                                    >
                                        {selectedJob.companyName ||
                                            "N/A"}
                                    </strong>
                                </div>
                            </div>

                            {/* LOCATION */}

                            <div style={styles.detailBox}>
                                <div
                                    style={{
                                        ...styles.detailIcon,
                                        color: "#34d399",
                                        background:
                                            "rgba(16, 185, 129, 0.10)",
                                    }}
                                >
                                    <MapPin size={17} />
                                </div>

                                <div>
                                    <span style={styles.label}>
                                        Location
                                    </span>

                                    <strong
                                        style={
                                            styles.detailValue
                                        }
                                    >
                                        {selectedJob.location ||
                                            "N/A"}
                                    </strong>
                                </div>
                            </div>

                            {/* JOB TYPE */}

                            <div style={styles.detailBox}>
                                <div
                                    style={{
                                        ...styles.detailIcon,
                                        color: "#fbbf24",
                                        background:
                                            "rgba(245, 158, 11, 0.10)",
                                    }}
                                >
                                    <FileText size={17} />
                                </div>

                                <div>
                                    <span style={styles.label}>
                                        Job Type
                                    </span>

                                    <strong
                                        style={
                                            styles.detailValue
                                        }
                                    >
                                        {selectedJob.jobType ||
                                            "N/A"}
                                    </strong>
                                </div>
                            </div>

                            {/* STATUS */}

                            <div style={styles.detailBox}>
                                <div
                                    style={{
                                        ...styles.detailIcon,
                                        color: "#c084fc",
                                        background:
                                            "rgba(168, 85, 247, 0.10)",
                                    }}
                                >
                                    <CheckCircle2 size={17} />
                                </div>

                                <div>
                                    <span style={styles.label}>
                                        Status
                                    </span>

                                    <span
                                        style={{
                                            ...styles.statusBadge,
                                            ...getStatusStyle(
                                                selectedJob.status
                                            ),
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: "6px",
                                                height: "6px",
                                                borderRadius:
                                                    "50%",
                                                background:
                                                    "currentColor",
                                            }}
                                        />

                                        {selectedJob.status ||
                                            "UNKNOWN"}
                                    </span>
                                </div>
                            </div>

                            {/* HR ID */}

                            <div style={styles.detailBox}>
                                <div style={styles.detailIcon}>
                                    <Users size={17} />
                                </div>

                                <div>
                                    <span style={styles.label}>
                                        HR ID
                                    </span>

                                    <strong
                                        style={
                                            styles.detailValue
                                        }
                                    >
                                        {selectedJob.hrId ??
                                            "N/A"}
                                    </strong>
                                </div>
                            </div>

                            {/* HR NAME */}

                            <div style={styles.detailBox}>
                                <div
                                    style={{
                                        ...styles.detailIcon,
                                        color: "#60a5fa",
                                        background:
                                            "rgba(59, 130, 246, 0.10)",
                                    }}
                                >
                                    <UserRound size={17} />
                                </div>

                                <div>
                                    <span style={styles.label}>
                                        HR Name
                                    </span>

                                    <strong
                                        style={
                                            styles.detailValue
                                        }
                                    >
                                        {selectedJob.hrName ||
                                            "N/A"}
                                    </strong>
                                </div>
                            </div>

                            {/* HR EMAIL */}

                            <div style={styles.detailBox}>
                                <div
                                    style={{
                                        ...styles.detailIcon,
                                        color: "#34d399",
                                        background:
                                            "rgba(16, 185, 129, 0.10)",
                                    }}
                                >
                                    <Mail size={17} />
                                </div>

                                <div>
                                    <span style={styles.label}>
                                        HR Email
                                    </span>

                                    <strong
                                        style={{
                                            ...styles.detailValue,
                                            fontSize:
                                                "13px",
                                            wordBreak:
                                                "break-word",
                                        }}
                                    >
                                        {selectedJob.hrEmail ||
                                            "N/A"}
                                    </strong>
                                </div>
                            </div>

                            {/* CREATED */}

                            <div style={styles.detailBox}>
                                <div
                                    style={{
                                        ...styles.detailIcon,
                                        color: "#fbbf24",
                                        background:
                                            "rgba(245, 158, 11, 0.10)",
                                    }}
                                >
                                    <CalendarDays
                                        size={17}
                                    />
                                </div>

                                <div>
                                    <span style={styles.label}>
                                        Created At
                                    </span>

                                    <strong
                                        style={{
                                            ...styles.detailValue,
                                            fontSize:
                                                "13px",
                                        }}
                                    >
                                        {formatDate(
                                            selectedJob.createdAt
                                        )}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* DESCRIPTION */}

                        <div style={styles.descriptionBox}>
                            <div style={styles.descriptionHeader}>
                                <FileText size={17} />

                                <span>
                                    Job Description
                                </span>
                            </div>

                            <p style={styles.jobDescription}>
                                {selectedJob.description ||
                                    "No description available."}
                            </p>
                        </div>
                    </div>
                )}

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div style={styles.footer}>
                    HireAI Administration · Job Management
                </div>
            </main>

            {/* =================================================
                CLOSE JOB CONFIRMATION MODAL
            ================================================= */}

            {jobToClose && (
                <div
                    style={styles.modalOverlay}
                    onClick={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setJobToClose(null);
                        }
                    }}
                >
                    <div style={styles.confirmModal}>
                        <div style={styles.confirmIcon}>
                            <LockKeyhole size={26} />
                        </div>

                        <h3 style={styles.confirmTitle}>
                            Close this job?
                        </h3>

                        <p style={styles.confirmText}>
                            You are about to close:
                        </p>

                        <div style={styles.confirmJobBox}>
                            <div style={styles.confirmJobTitle}>
                                {jobToClose.title ||
                                    "Untitled Job"}
                            </div>

                            <div style={styles.confirmJobCompany}>
                                {jobToClose.companyName ||
                                    "Unknown Company"}
                            </div>
                        </div>

                        <p style={styles.confirmWarning}>
                            Once closed, this job will no longer
                            be available as an open position.
                        </p>

                        <div style={styles.confirmButtons}>
                            <button
                                type="button"
                                style={
                                    styles.cancelModalButton
                                }
                                onClick={() =>
                                    setJobToClose(null)
                                }
                                disabled={
                                    closingJobId !== null
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                style={
                                    styles.confirmCloseButton
                                }
                                onClick={handleCloseJob}
                                disabled={
                                    closingJobId !== null
                                }
                            >
                                {closingJobId !== null ? (
                                    <>
                                        <span
                                            style={
                                                styles.buttonSpinner
                                            }
                                        />

                                        Closing...
                                    </>
                                ) : (
                                    <>
                                        <LockKeyhole
                                            size={15}
                                        />

                                        Close Job
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* =============================================================
   PREMIUM STYLES
============================================================= */

const styles = {
    /* =========================================================
       PAGE
    ========================================================= */

    page: {
        minHeight: "100vh",
        background:
            "radial-gradient(circle at 10% 0%, #1e293b 0%, #111827 28%, #080d1c 65%, #030712 100%)",
        color: "#f8fafc",
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        position: "relative",
        overflowX: "hidden",
    },

    /* =========================================================
       HEADER
    ========================================================= */

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 36px",
        background:
            "linear-gradient(135deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.98))",
        borderBottom:
            "1px solid rgba(148, 163, 184, 0.14)",
        boxShadow:
            "0 15px 40px rgba(0, 0, 0, 0.20)",
        gap: "20px",
        position: "sticky",
        top: 0,
        zIndex: 20,
        backdropFilter: "blur(18px)",
    },

    logo: {
        margin: 0,
        fontSize: "25px",
        fontWeight: "800",
        letterSpacing: "-0.7px",
        color: "#f8fafc",
    },

    subtitle: {
        margin: "4px 0 0",
        color: "#94a3b8",
        fontSize: "12px",
        letterSpacing: "0.2px",
    },

    headerButtons: {
        display: "flex",
        gap: "9px",
        flexWrap: "wrap",
    },

    dashboardButton: {
        padding: "9px 15px",
        border: "1px solid rgba(96, 165, 250, 0.20)",
        borderRadius: "8px",
        background:
            "linear-gradient(135deg, #2563eb, #3b82f6)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "13px",
        boxShadow:
            "0 8px 22px rgba(37, 99, 235, 0.25)",
    },

    logoutButton: {
        padding: "9px 15px",
        border: "1px solid rgba(248, 113, 113, 0.18)",
        borderRadius: "8px",
        background:
            "linear-gradient(135deg, #dc2626, #ef4444)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "13px",
        boxShadow:
            "0 8px 22px rgba(220, 38, 38, 0.20)",
    },

    /* =========================================================
       CONTAINER
    ========================================================= */

    container: {
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "32px 24px 60px",
    },

    /* =========================================================
       TOP NAVIGATION
    ========================================================= */

    topNavigation: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        marginBottom: "30px",
        flexWrap: "wrap",
    },

    backButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 15px",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        borderRadius: "9px",
        background:
            "linear-gradient(145deg, rgba(71, 85, 105, 0.72), rgba(51, 65, 85, 0.62))",
        color: "#f8fafc",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
        boxShadow:
            "0 8px 24px rgba(0, 0, 0, 0.18)",
        backdropFilter: "blur(12px)",
    },

    systemStatus: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 13px",
        borderRadius: "999px",
        background:
            "rgba(16, 185, 129, 0.07)",
        border:
            "1px solid rgba(52, 211, 153, 0.18)",
        color: "#6ee7b7",
        fontSize: "12px",
        fontWeight: "600",
    },

    statusDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "#34d399",
        boxShadow:
            "0 0 12px rgba(52, 211, 153, 0.85)",
    },

    /* =========================================================
       TITLE
    ========================================================= */

    titleSection: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "15px",
        textAlign: "center",
        marginBottom: "30px",
    },

    titleIcon: {
        width: "58px",
        height: "58px",
        borderRadius: "17px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        background:
            "linear-gradient(135deg, #4f46e5, #7c3aed)",
        color: "#ffffff",
        boxShadow:
            "0 15px 35px rgba(79, 70, 229, 0.35)",
    },

    heading: {
        margin: 0,
        fontSize: "clamp(27px, 4vw, 35px)",
        fontWeight: "800",
        letterSpacing: "-0.9px",
        color: "#f8fafc",
    },

    description: {
        color: "#94a3b8",
        margin: "6px 0 0",
        fontSize: "14px",
    },

    /* =========================================================
       ERROR
    ========================================================= */

    errorBox: {
        display: "flex",
        alignItems: "center",
        gap: "13px",
        padding: "14px 16px",
        marginBottom: "22px",
        borderRadius: "14px",
        background:
            "linear-gradient(145deg, rgba(127, 29, 29, 0.34), rgba(69, 10, 10, 0.30))",
        border:
            "1px solid rgba(239, 68, 68, 0.30)",
        color: "#fecaca",
        boxShadow:
            "0 15px 35px rgba(0, 0, 0, 0.15)",
    },

    errorIcon: {
        width: "37px",
        height: "37px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "10px",
        background:
            "rgba(239, 68, 68, 0.12)",
        color: "#f87171",
    },

    errorTitle: {
        color: "#fca5a5",
        fontSize: "13px",
        fontWeight: "700",
        marginBottom: "2px",
    },

    errorMessage: {
        fontSize: "12px",
        color: "#fecaca",
    },

    errorCloseButton: {
        marginLeft: "auto",
        border: "none",
        background: "transparent",
        color: "#fca5a5",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5px",
    },

    /* =========================================================
       SUMMARY
    ========================================================= */

    summaryGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        gap: "14px",
        marginBottom: "22px",
    },

    summaryCard: {
        minHeight: "135px",
        padding: "21px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
        background:
            "linear-gradient(145deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.94))",
        border:
            "1px solid rgba(99, 102, 241, 0.18)",
        borderRadius: "17px",
        boxShadow:
            "0 18px 40px rgba(0, 0, 0, 0.24)",
        backdropFilter: "blur(15px)",
    },

    summaryLabel: {
        display: "block",
        color: "#94a3b8",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1px",
        marginBottom: "7px",
    },

    summaryValue: {
        display: "block",
        fontSize: "29px",
        fontWeight: "800",
        lineHeight: "1.1",
        color: "#f8fafc",
    },

    summaryDescription: {
        display: "block",
        color: "#64748b",
        fontSize: "11px",
        marginTop: "7px",
        lineHeight: "1.4",
    },

    summaryIcon: {
        width: "46px",
        height: "46px",
        borderRadius: "13px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },

    /* =========================================================
       MAIN CARD
    ========================================================= */

    card: {
        background:
            "linear-gradient(145deg, rgba(18, 28, 48, 0.98), rgba(7, 14, 29, 0.98))",
        border:
            "1px solid rgba(99, 102, 241, 0.18)",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow:
            "0 30px 70px rgba(0, 0, 0, 0.34), 0 0 45px rgba(79, 70, 229, 0.05)",
        backdropFilter: "blur(18px)",
        marginBottom: "22px",
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "18px",
        padding: "22px 23px",
        background:
            "linear-gradient(135deg, rgba(20, 31, 53, 0.98), rgba(10, 18, 36, 0.98))",
        borderBottom:
            "1px solid rgba(99, 102, 241, 0.14)",
        flexWrap: "wrap",
    },

    sectionTitleRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "4px",
    },

    titleIndicator: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#818cf8",
        boxShadow:
            "0 0 12px rgba(129, 140, 248, 0.8)",
        flexShrink: 0,
    },

    sectionTitle: {
        margin: 0,
        fontSize: "20px",
        fontWeight: "800",
        color: "#f8fafc",
        letterSpacing: "-0.3px",
    },

    sectionDescription: {
        margin: 0,
        color: "#64748b",
        fontSize: "12px",
    },

    refreshButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "7px",
        padding: "9px 13px",
        borderRadius: "9px",
        border:
            "1px solid rgba(148, 163, 184, 0.16)",
        background:
            "rgba(30, 41, 59, 0.78)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600",
    },

    /* =========================================================
       TABLE
    ========================================================= */

    tableWrapper: {
        overflowX: "auto",
        background:
            "linear-gradient(180deg, rgba(13, 22, 40, 0.98), rgba(8, 15, 30, 0.98))",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "1200px",
        color: "#e2e8f0",
    },

    th: {
        textAlign: "left",
        padding: "14px 12px",
        background:
            "linear-gradient(90deg, rgba(30, 41, 59, 0.88), rgba(23, 33, 54, 0.88))",
        borderBottom:
            "1px solid rgba(99, 102, 241, 0.16)",
        color: "#94a3b8",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "0.8px",
        whiteSpace: "nowrap",
    },

    tr: {
        background:
            "rgba(12, 21, 38, 0.72)",
        transition: "all 0.2s ease",
    },

    td: {
        padding: "15px 12px",
        color: "#e2e8f0",
        fontSize: "13px",
        verticalAlign: "middle",
    },

    jobTitle: {
        color: "#f1f5f9",
        fontSize: "13px",
        fontWeight: "700",
        lineHeight: "1.35",
        maxWidth: "230px",
    },

    jobDescriptionPreview: {
        color: "#64748b",
        fontSize: "10px",
        marginTop: "4px",
        maxWidth: "230px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    iconText: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        color: "#cbd5e1",
        whiteSpace: "nowrap",
    },

    typeBadge: {
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 9px",
        borderRadius: "7px",
        background:
            "rgba(99, 102, 241, 0.08)",
        border:
            "1px solid rgba(99, 102, 241, 0.16)",
        color: "#a5b4fc",
        fontSize: "10px",
        fontWeight: "700",
        whiteSpace: "nowrap",
    },

    hrName: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "#e2e8f0",
        fontSize: "12px",
        fontWeight: "600",
        whiteSpace: "nowrap",
    },

    hrEmail: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        color: "#64748b",
        fontSize: "10px",
        marginTop: "5px",
        whiteSpace: "nowrap",
    },

    statusBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        borderRadius: "999px",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "0.2px",
        whiteSpace: "nowrap",
    },

    createdDate: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "#94a3b8",
        fontSize: "11px",
        whiteSpace: "nowrap",
    },

    /* =========================================================
       ACTIONS
    ========================================================= */

    actionButtons: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        flexWrap: "wrap",
    },

    viewButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "7px 11px",
        border: "1px solid rgba(96, 165, 250, 0.18)",
        borderRadius: "7px",
        background:
            "linear-gradient(135deg, #2563eb, #3b82f6)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "11px",
        boxShadow:
            "0 7px 18px rgba(37, 99, 235, 0.20)",
    },

    closeButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "7px 11px",
        border: "1px solid rgba(248, 113, 113, 0.18)",
        borderRadius: "7px",
        background:
            "linear-gradient(135deg, #dc2626, #ef4444)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "11px",
        boxShadow:
            "0 7px 18px rgba(220, 38, 38, 0.17)",
    },

    /* =========================================================
       TABLE FOOTER
    ========================================================= */

    tableFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        padding: "12px 18px",
        borderTop:
            "1px solid rgba(99, 102, 241, 0.12)",
        background:
            "linear-gradient(90deg, rgba(7, 14, 29, 0.96), rgba(12, 20, 37, 0.96))",
        flexWrap: "wrap",
    },

    footerText: {
        color: "#64748b",
        fontSize: "11px",
    },

    footerActive: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "#64748b",
        fontSize: "11px",
    },

    /* =========================================================
       DETAILS
    ========================================================= */

    detailsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
        gap: "13px",
        padding: "22px",
    },

    detailBox: {
        display: "flex",
        alignItems: "flex-start",
        gap: "11px",
        padding: "15px",
        background:
            "linear-gradient(145deg, rgba(15, 23, 42, 0.90), rgba(8, 15, 30, 0.88))",
        border:
            "1px solid rgba(99, 102, 241, 0.13)",
        borderRadius: "12px",
    },

    detailIcon: {
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "10px",
        background:
            "rgba(99, 102, 241, 0.10)",
        color: "#818cf8",
    },

    label: {
        display: "block",
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "0.5px",
        marginBottom: "5px",
    },

    detailValue: {
        display: "block",
        color: "#e2e8f0",
        fontSize: "13px",
        fontWeight: "700",
        lineHeight: "1.4",
        wordBreak: "break-word",
    },

    closeDetailsButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 12px",
        border:
            "1px solid rgba(148, 163, 184, 0.16)",
        borderRadius: "8px",
        background:
            "rgba(51, 65, 85, 0.65)",
        color: "#e2e8f0",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: "700",
    },

    descriptionBox: {
        margin: "0 22px 22px",
        padding: "18px",
        background:
            "linear-gradient(145deg, rgba(15, 23, 42, 0.90), rgba(8, 15, 30, 0.88))",
        border:
            "1px solid rgba(99, 102, 241, 0.13)",
        borderRadius: "13px",
    },

    descriptionHeader: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        color: "#a5b4fc",
        fontSize: "12px",
        fontWeight: "700",
        marginBottom: "10px",
    },

    jobDescription: {
        color: "#cbd5e1",
        lineHeight: "1.7",
        whiteSpace: "pre-wrap",
        margin: 0,
        fontSize: "13px",
    },

    /* =========================================================
       EMPTY STATE
    ========================================================= */

    emptyState: {
        textAlign: "center",
        padding: "65px 20px",
        background:
            "linear-gradient(180deg, rgba(13, 22, 40, 0.98), rgba(8, 15, 30, 0.98))",
    },

    emptyIcon: {
        width: "65px",
        height: "65px",
        margin: "0 auto 16px",
        borderRadius: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(99, 102, 241, 0.10)",
        color: "#818cf8",
        border:
            "1px solid rgba(99, 102, 241, 0.16)",
    },

    emptyTitle: {
        margin: "0 0 7px",
        color: "#f1f5f9",
        fontSize: "20px",
        fontWeight: "800",
    },

    /* =========================================================
       LOADING
    ========================================================= */

    loadingCard: {
        maxWidth: "430px",
        margin: "80px auto 0",
        padding: "45px 30px",
        textAlign: "center",
        background:
            "linear-gradient(145deg, rgba(20, 30, 52, 0.96), rgba(8, 15, 30, 0.96))",
        border:
            "1px solid rgba(99, 102, 241, 0.22)",
        borderRadius: "24px",
        boxShadow:
            "0 30px 80px rgba(0, 0, 0, 0.45), 0 0 40px rgba(79, 70, 229, 0.08)",
        backdropFilter: "blur(20px)",
    },

    loadingIcon: {
        width: "64px",
        height: "64px",
        margin: "0 auto 20px",
        borderRadius: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg, #4f46e5, #7c3aed)",
        color: "#ffffff",
        boxShadow:
            "0 12px 35px rgba(99, 102, 241, 0.40)",
    },

    loadingTitle: {
        margin: "0 0 7px",
        fontSize: "22px",
        fontWeight: "800",
    },

    spinner: {
        width: "27px",
        height: "27px",
        margin: "22px auto 0",
        borderRadius: "50%",
        border:
            "3px solid rgba(129, 140, 248, 0.20)",
        borderTopColor: "#818cf8",
        animation: "spin 0.8s linear infinite",
    },

    /* =========================================================
       MUTED TEXT
    ========================================================= */

    mutedText: {
        color: "#94a3b8",
        lineHeight: "1.6",
        fontSize: "13px",
        margin: 0,
    },

    /* =========================================================
       CONFIRMATION MODAL
    ========================================================= */

    modalOverlay: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background:
            "rgba(2, 6, 23, 0.78)",
        backdropFilter: "blur(12px)",
    },

    confirmModal: {
        width: "100%",
        maxWidth: "460px",
        padding: "30px",
        borderRadius: "22px",
        background:
            "linear-gradient(145deg, rgba(20, 30, 52, 0.99), rgba(7, 14, 29, 0.99))",
        border:
            "1px solid rgba(239, 68, 68, 0.20)",
        boxShadow:
            "0 35px 90px rgba(0, 0, 0, 0.55), 0 0 50px rgba(239, 68, 68, 0.05)",
    },

    confirmIcon: {
        width: "56px",
        height: "56px",
        marginBottom: "18px",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(239, 68, 68, 0.10)",
        border:
            "1px solid rgba(239, 68, 68, 0.20)",
        color: "#f87171",
    },

    confirmTitle: {
        margin: "0 0 8px",
        color: "#f8fafc",
        fontSize: "22px",
        fontWeight: "800",
    },

    confirmText: {
        margin: "0 0 10px",
        color: "#94a3b8",
        fontSize: "13px",
    },

    confirmJobBox: {
        padding: "13px 15px",
        marginBottom: "13px",
        borderRadius: "11px",
        background:
            "rgba(15, 23, 42, 0.90)",
        border:
            "1px solid rgba(148, 163, 184, 0.12)",
    },

    confirmJobTitle: {
        color: "#f1f5f9",
        fontSize: "14px",
        fontWeight: "700",
    },

    confirmJobCompany: {
        color: "#64748b",
        fontSize: "11px",
        marginTop: "4px",
    },

    confirmWarning: {
        margin: "0",
        color: "#fca5a5",
        fontSize: "12px",
        lineHeight: "1.6",
    },

    confirmButtons: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "9px",
        marginTop: "24px",
    },

    cancelModalButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "9px 15px",
        borderRadius: "8px",
        border:
            "1px solid rgba(148, 163, 184, 0.18)",
        background:
            "rgba(51, 65, 85, 0.65)",
        color: "#e2e8f0",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "700",
    },

    confirmCloseButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "7px",
        padding: "9px 15px",
        borderRadius: "8px",
        border:
            "1px solid rgba(248, 113, 113, 0.20)",
        background:
            "linear-gradient(135deg, #dc2626, #ef4444)",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "700",
        boxShadow:
            "0 8px 20px rgba(220, 38, 38, 0.20)",
    },

    buttonSpinner: {
        width: "13px",
        height: "13px",
        borderRadius: "50%",
        border:
            "2px solid rgba(255, 255, 255, 0.35)",
        borderTopColor: "#ffffff",
        animation: "spin 0.7s linear infinite",
    },

    /* =========================================================
       FOOTER
    ========================================================= */

    footer: {
        textAlign: "center",
        color: "#475569",
        fontSize: "11px",
        marginTop: "25px",
    },
};

export default AdminJobs;