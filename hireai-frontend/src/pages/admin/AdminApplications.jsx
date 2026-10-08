import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    Mail,
    ShieldCheck,
    UserRound,
    X,
    Eye,
    Loader2,
    AlertCircle,
    Building2,
    Hash,
    MapPin,
    Users,
    Sparkles,
    RefreshCw,
} from "lucide-react";

import api from "../../services/api";


function AdminApplications() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [statistics, setStatistics] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedApplication, setSelectedApplication] =
        useState(null);

    const [loadingDetails, setLoadingDetails] =
        useState(false);


    // =========================================================
    // LOAD APPLICATIONS + STATISTICS
    // =========================================================

    useEffect(() => {

        let ignore = false;

        const fetchData = async () => {

            try {

                setLoading(true);
                setError("");

                const [
                    applicationsResponse,
                    statisticsResponse
                ] = await Promise.all([

                    api.get("/admin/applications"),

                    api.get("/admin/applications/statistics")

                ]);


                console.log(
                    "Admin applications:",
                    applicationsResponse.data
                );

                console.log(
                    "Application statistics:",
                    statisticsResponse.data
                );


                if (!ignore) {

                    if (
                        Array.isArray(
                            applicationsResponse.data
                        )
                    ) {

                        setApplications(
                            applicationsResponse.data
                        );

                    } else {

                        setApplications([]);

                    }


                    setStatistics(
                        statisticsResponse.data || {}
                    );

                }

            } catch (err) {

                console.error(
                    "Failed to load admin applications:",
                    err
                );


                if (!ignore) {

                    // =================================================
                    // UNAUTHORIZED
                    // =================================================

                    if (
                        err.response?.status === 401
                    ) {

                        localStorage.removeItem(
                            "token"
                        );

                        localStorage.removeItem(
                            "role"
                        );

                        navigate("/login");

                        return;
                    }


                    // =================================================
                    // FORBIDDEN
                    // =================================================

                    if (
                        err.response?.status === 403
                    ) {

                        setError(
                            "Access denied. Only administrators can view applications."
                        );

                        return;
                    }


                    // =================================================
                    // OTHER ERROR
                    // =================================================

                    setError(
                        err.response?.data?.message ||
                        "Unable to load applications."
                    );

                }

            } finally {

                if (!ignore) {

                    setLoading(false);

                }

            }

        };


        fetchData();


        return () => {

            ignore = true;

        };

    }, [navigate]);


    // =========================================================
    // VIEW APPLICATION DETAILS
    // =========================================================

    const handleViewDetails = async (id) => {

        if (!id) {
            return;
        }

        try {

            setError("");
            setLoadingDetails(true);

            const response = await api.get(
                `/admin/applications/${id}`
            );


            console.log(
                "Application details:",
                response.data
            );


            setSelectedApplication(
                response.data
            );

        } catch (err) {

            console.error(
                "Failed to load application details:",
                err
            );


            // =================================================
            // UNAUTHORIZED
            // =================================================

            if (
                err.response?.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "role"
                );

                navigate("/login");

                return;
            }


            // =================================================
            // FORBIDDEN
            // =================================================

            if (
                err.response?.status === 403
            ) {

                setError(
                    "Access denied. Only administrators can view application details."
                );

                return;
            }


            // =================================================
            // OTHER ERROR
            // =================================================

            setError(
                err.response?.data?.message ||
                "Unable to load application details."
            );

        } finally {

            setLoadingDetails(false);

        }

    };


    // =========================================================
    // CLOSE DETAILS
    // =========================================================

    const handleCloseDetails = () => {

        setSelectedApplication(null);

    };


    // =========================================================
    // BACK TO ADMIN DASHBOARD
    // =========================================================

    const handleBack = () => {

        navigate("/admin/dashboard");

    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {

        if (!date) {

            return "N/A";

        }


        try {

            return new Date(
                date
            ).toLocaleString();

        } catch {

            return date;

        }

    };


    // =========================================================
    // STATUS CONFIG
    // =========================================================

    const getStatusConfig = (status) => {

        const normalizedStatus =
            String(status || "")
                .toUpperCase()
                .trim();


        switch (normalizedStatus) {

            case "APPLIED":

                return {

                    label: "APPLIED",

                    background:
                        "rgba(37, 99, 235, 0.16)",

                    border:
                        "rgba(59, 130, 246, 0.35)",

                    color:
                        "#93c5fd",

                    icon:
                        <FileText size={13} />

                };


            case "SHORTLISTED":

                return {

                    label: "SHORTLISTED",

                    background:
                        "rgba(245, 158, 11, 0.14)",

                    border:
                        "rgba(245, 158, 11, 0.35)",

                    color:
                        "#fbbf24",

                    icon:
                        <Sparkles size={13} />

                };


            case "INTERVIEW":

                return {

                    label: "INTERVIEW",

                    background:
                        "rgba(139, 92, 246, 0.16)",

                    border:
                        "rgba(139, 92, 246, 0.38)",

                    color:
                        "#c4b5fd",

                    icon:
                        <Clock3 size={13} />

                };


            case "HIRED":

                return {

                    label: "HIRED",

                    background:
                        "rgba(16, 185, 129, 0.15)",

                    border:
                        "rgba(16, 185, 129, 0.35)",

                    color:
                        "#6ee7b7",

                    icon:
                        <CheckCircle2 size={13} />

                };


            case "REJECTED":

                return {

                    label: "REJECTED",

                    background:
                        "rgba(239, 68, 68, 0.14)",

                    border:
                        "rgba(239, 68, 68, 0.35)",

                    color:
                        "#fca5a5",

                    icon:
                        <X size={13} />

                };


            default:

                return {

                    label:
                        normalizedStatus ||
                        "UNKNOWN",

                    background:
                        "rgba(100, 116, 139, 0.18)",

                    border:
                        "rgba(100, 116, 139, 0.35)",

                    color:
                        "#cbd5e1",

                    icon:
                        <AlertCircle size={13} />

                };

        }

    };


    // =========================================================
    // STATISTICS VALUE
    // =========================================================

    const getStatistic = (...keys) => {

        for (const key of keys) {

            if (
                statistics[key] !== undefined &&
                statistics[key] !== null
            ) {

                return statistics[key];

            }

        }

        return 0;

    };


    // =========================================================
    // STATISTICS CONFIG
    // =========================================================

    const statisticCards = [

        {
            label: "Total Applications",
            value: getStatistic(
                "total",
                "totalApplications",
                "count"
            ),
            icon: <FileText size={21} />,
            className: "stat-total"
        },

        {
            label: "Applied",
            value: getStatistic(
                "applied",
                "APPLIED"
            ),
            icon: <FileText size={21} />,
            className: "stat-applied"
        },

        {
            label: "Shortlisted",
            value: getStatistic(
                "shortlisted",
                "SHORTLISTED"
            ),
            icon: <Sparkles size={21} />,
            className: "stat-shortlisted"
        },

        {
            label: "Interview",
            value: getStatistic(
                "interview",
                "INTERVIEW"
            ),
            icon: <Clock3 size={21} />,
            className: "stat-interview"
        },

        {
            label: "Hired",
            value: getStatistic(
                "hired",
                "HIRED"
            ),
            icon: <CheckCircle2 size={21} />,
            className: "stat-hired"
        },

        {
            label: "Rejected",
            value: getStatistic(
                "rejected",
                "REJECTED"
            ),
            icon: <X size={21} />,
            className: "stat-rejected"
        }

    ];


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="admin-applications-page">

                <style>{styles}</style>


                <div className="loading-container">

                    <div className="loading-card">

                        <div className="loading-logo">
                            HireAI
                            <span>🚀</span>
                        </div>


                        <div className="loading-spinner">

                            <Loader2
                                size={30}
                            />

                        </div>


                        <h2>
                            Loading Applications
                        </h2>


                        <p>
                            Please wait while we load
                            the admin application data.
                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="admin-applications-page">

            <style>{styles}</style>


            {/* =================================================
                TOP ACCENT
            ================================================= */}

            <div className="top-accent" />


            <main className="applications-container">


                {/* =================================================
                    PAGE TOP
                ================================================= */}

                <div className="page-top">


                    <button
                        type="button"
                        className="back-button"
                        onClick={handleBack}
                    >

                        <ArrowLeft
                            size={17}
                        />

                        <span>
                            Back to Admin Dashboard
                        </span>

                    </button>


                    <div className="page-heading">

                        <div className="heading-icon">

                            <BriefcaseBusiness
                                size={25}
                            />

                        </div>


                        <div>

                            <div className="heading-eyebrow">

                                <ShieldCheck
                                    size={14}
                                />

                                ADMIN MANAGEMENT

                            </div>


                            <h1>
                                Admin Applications
                            </h1>


                            <p>
                                View and monitor all job
                                applications across HireAI.
                            </p>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="error-box">

                        <div className="error-icon">

                            <AlertCircle
                                size={19}
                            />

                        </div>


                        <div>

                            <strong>
                                Unable to complete request
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="statistics-grid">

                    {statisticCards.map(
                        (stat) => (

                            <div
                                key={stat.label}
                                className={`stat-card ${stat.className}`}
                            >

                                <div className="stat-top">

                                    <div className="stat-icon">

                                        {stat.icon}

                                    </div>

                                    <span className="stat-label">

                                        {stat.label}

                                    </span>

                                </div>


                                <div className="stat-value">

                                    {stat.value}

                                </div>

                            </div>

                        )
                    )}

                </section>


                {/* =================================================
                    APPLICATIONS CARD
                ================================================= */}

                <section className="applications-card">


                    {/* =================================================
                        CARD HEADER
                    ================================================= */}

                    <div className="applications-card-header">

                        <div>

                            <div className="section-eyebrow">

                                <Users
                                    size={14}
                                />

                                APPLICATION MANAGEMENT

                            </div>


                            <h2>
                                All Applications
                            </h2>


                            <p>
                                Review candidate applications
                                submitted across all HireAI jobs.
                            </p>

                        </div>


                        <div className="application-count">

                            <span className="count-number">
                                {applications.length}
                            </span>

                            <span className="count-label">
                                {applications.length === 1
                                    ? "Application"
                                    : "Applications"}
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        TABLE
                    ================================================= */}

                    {applications.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">

                                <FileText
                                    size={30}
                                />

                            </div>


                            <h3>
                                No Applications Found
                            </h3>


                            <p>
                                There are currently no
                                applications in the system.
                            </p>

                        </div>

                    ) : (

                        <div className="table-container">

                            <table className="applications-table">

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Candidate
                                        </th>

                                        <th>
                                            Job
                                        </th>

                                        <th>
                                            Company
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Applied At
                                        </th>

                                        <th className="action-column">
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {applications.map(
                                        (
                                            application,
                                            index
                                        ) => {

                                            const status =
                                                getStatusConfig(
                                                    application.status
                                                );


                                            return (

                                                <tr
                                                    key={
                                                        application.id ||
                                                        index
                                                    }
                                                >


                                                    {/* ID */}

                                                    <td>

                                                        <div className="application-id">

                                                            #

                                                            {
                                                                application.id ||
                                                                "N/A"
                                                            }

                                                        </div>

                                                    </td>


                                                    {/* CANDIDATE */}

                                                    <td>

                                                        <div className="candidate-cell">

                                                            <div className="candidate-avatar">

                                                                <UserRound
                                                                    size={17}
                                                                />

                                                            </div>


                                                            <div className="candidate-info">

                                                                <strong>

                                                                    {
                                                                        application.candidateName ||
                                                                        "N/A"
                                                                    }

                                                                </strong>


                                                                <span>

                                                                    <Mail
                                                                        size={12}
                                                                    />

                                                                    {
                                                                        application.candidateEmail ||
                                                                        "N/A"
                                                                    }

                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* JOB */}

                                                    <td>

                                                        <div className="job-cell">

                                                            <BriefcaseBusiness
                                                                size={16}
                                                            />

                                                            <span>

                                                                {
                                                                    application.jobTitle ||
                                                                    "N/A"
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* COMPANY */}

                                                    <td>

                                                        <div className="company-cell">

                                                            <Building2
                                                                size={15}
                                                            />

                                                            <span>

                                                                {
                                                                    application.companyName ||
                                                                    "N/A"
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className="status-badge"
                                                            style={{
                                                                backgroundColor:
                                                                    status.background,

                                                                borderColor:
                                                                    status.border,

                                                                color:
                                                                    status.color
                                                            }}
                                                        >

                                                            {status.icon}

                                                            {
                                                                status.label
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* DATE */}

                                                    <td>

                                                        <div className="date-cell">

                                                            <CalendarDays
                                                                size={15}
                                                            />

                                                            <span>

                                                                {
                                                                    formatDate(
                                                                        application.appliedAt
                                                                    )
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="view-button"
                                                            onClick={() =>
                                                                handleViewDetails(
                                                                    application.id
                                                                )
                                                            }
                                                            disabled={
                                                                loadingDetails
                                                            }
                                                        >

                                                            {loadingDetails ? (

                                                                <Loader2
                                                                    size={15}
                                                                    className="spin"
                                                                />

                                                            ) : (

                                                                <Eye
                                                                    size={15}
                                                                />

                                                            )}

                                                            <span>
                                                                View
                                                            </span>

                                                        </button>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>


            {/* =================================================
                APPLICATION DETAILS MODAL
            ================================================= */}

            {selectedApplication && (

                <div
                    className="modal-overlay"
                    onClick={
                        handleCloseDetails
                    }
                >

                    <div
                        className="application-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* =================================================
                            MODAL HEADER
                        ================================================= */}

                        <div className="modal-header">

                            <div className="modal-title-area">

                                <div className="modal-icon">

                                    <FileText
                                        size={23}
                                    />

                                </div>


                                <div>

                                    <div className="modal-eyebrow">

                                        APPLICATION DETAILS

                                    </div>


                                    <h2>
                                        Application Details
                                    </h2>


                                    <p>

                                        Application #

                                        {
                                            selectedApplication.id ??
                                            "N/A"
                                        }

                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="modal-close-icon"
                                onClick={
                                    handleCloseDetails
                                }
                            >

                                <X
                                    size={19}
                                />

                            </button>

                        </div>


                        {/* =================================================
                            MODAL STATUS
                        ================================================= */}

                        <div className="modal-status-row">

                            <div>

                                <span className="modal-status-label">
                                    Current Status
                                </span>

                                <span
                                    className="status-badge large"
                                    style={{
                                        backgroundColor:
                                            getStatusConfig(
                                                selectedApplication.status
                                            ).background,

                                        borderColor:
                                            getStatusConfig(
                                                selectedApplication.status
                                            ).border,

                                        color:
                                            getStatusConfig(
                                                selectedApplication.status
                                            ).color
                                    }}
                                >

                                    {
                                        getStatusConfig(
                                            selectedApplication.status
                                        ).icon
                                    }

                                    {
                                        getStatusConfig(
                                            selectedApplication.status
                                        ).label
                                    }

                                </span>

                            </div>


                            <div className="modal-date">

                                <CalendarDays
                                    size={16}
                                />

                                <div>

                                    <span>
                                        Applied At
                                    </span>

                                    <strong>

                                        {
                                            formatDate(
                                                selectedApplication.appliedAt
                                            )
                                        }

                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            DETAILS
                        ================================================= */}

                        <div className="details-section">


                            <div className="details-section-title">

                                <UserRound
                                    size={17}
                                />

                                Candidate Information

                            </div>


                            <div className="detail-grid">


                                {/* Candidate */}

                                <div className="detail-item">

                                    <span>
                                        Candidate
                                    </span>

                                    <strong>

                                        {
                                            selectedApplication.candidateName ||
                                            "N/A"
                                        }

                                    </strong>

                                </div>


                                {/* Email */}

                                <div className="detail-item">

                                    <span>
                                        Candidate Email
                                    </span>

                                    <strong>

                                        {
                                            selectedApplication.candidateEmail ||
                                            "N/A"
                                        }

                                    </strong>

                                </div>


                                {/* Candidate ID */}

                                <div className="detail-item">

                                    <span>
                                        Candidate ID
                                    </span>

                                    <strong>

                                        {
                                            selectedApplication.candidateId ??
                                            "N/A"
                                        }

                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div className="details-section">


                            <div className="details-section-title">

                                <BriefcaseBusiness
                                    size={17}
                                />

                                Job Information

                            </div>


                            <div className="detail-grid">


                                {/* Job */}

                                <div className="detail-item">

                                    <span>
                                        Job
                                    </span>

                                    <strong>

                                        {
                                            selectedApplication.jobTitle ||
                                            "N/A"
                                        }

                                    </strong>

                                </div>


                                {/* Job ID */}

                                <div className="detail-item">

                                    <span>
                                        Job ID
                                    </span>

                                    <strong>

                                        {
                                            selectedApplication.jobId ??
                                            "N/A"
                                        }

                                    </strong>

                                </div>


                                {/* Company */}

                                <div className="detail-item">

                                    <span>
                                        Company
                                    </span>

                                    <strong>

                                        {
                                            selectedApplication.companyName ||
                                            "N/A"
                                        }

                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            MODAL FOOTER
                        ================================================= */}

                        <div className="modal-footer">

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={
                                    handleCloseDetails
                                }
                            >

                                <X
                                    size={16}
                                />

                                Close Details

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


// =============================================================
// PREMIUM STYLES
// =============================================================

const styles = `

/* ============================================================
   GLOBAL PAGE
============================================================ */

* {
    box-sizing: border-box;
}


.admin-applications-page {

    min-height: 100vh;

    background:
        radial-gradient(
            circle at 10% 0%,
            rgba(37, 99, 235, 0.08),
            transparent 28%
        ),
        radial-gradient(
            circle at 90% 10%,
            rgba(124, 58, 237, 0.07),
            transparent 25%
        ),
        #0b1220;

    color: #f8fafc;

    font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

    min-height: 100vh;
}


/* ============================================================
   TOP ACCENT
============================================================ */

.top-accent {

    height: 2px;

    width: 100%;

    background:
        linear-gradient(
            90deg,
            #2563eb,
            #6366f1,
            #8b5cf6,
            #2563eb
        );
}


/* ============================================================
   MAIN CONTAINER
============================================================ */

.applications-container {

    width: min(
        calc(100% - 50px),
        1280px
    );

    margin: 0 auto;

    padding: 32px 0 60px;

}


/* ============================================================
   PAGE TOP
============================================================ */

.page-top {

    margin-bottom: 28px;

}


.back-button {

    display: inline-flex;

    align-items: center;

    gap: 8px;

    padding: 10px 15px;

    margin-bottom: 28px;

    border: 1px solid
        rgba(148, 163, 184, 0.18);

    border-radius: 8px;

    background:
        rgba(51, 65, 85, 0.75);

    color: #f8fafc;

    font-size: 13px;

    font-weight: 700;

    cursor: pointer;

    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;

}


.back-button:hover {

    background:
        rgba(71, 85, 105, 0.9);

    border-color:
        rgba(148, 163, 184, 0.32);

    transform:
        translateY(-1px);

}


.page-heading {

    display: flex;

    align-items: center;

    gap: 17px;

}


.heading-icon {

    width: 50px;

    height: 50px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 13px;

    background:
        linear-gradient(
            135deg,
            rgba(37, 99, 235, 0.18),
            rgba(99, 102, 241, 0.16)
        );

    border:
        1px solid
        rgba(96, 165, 250, 0.25);

    color: #93c5fd;

    box-shadow:
        0 8px 30px
        rgba(37, 99, 235, 0.08);

}


.heading-eyebrow {

    display: flex;

    align-items: center;

    gap: 6px;

    margin-bottom: 5px;

    color: #60a5fa;

    font-size: 11px;

    font-weight: 800;

    letter-spacing: 0.12em;

}


.page-heading h1 {

    margin: 0;

    font-size: 30px;

    line-height: 1.2;

    font-weight: 750;

    letter-spacing: -0.025em;

    color: #f8fafc;

}


.page-heading p {

    margin:
        7px 0 0;

    color: #94a3b8;

    font-size: 14px;

}


/* ============================================================
   ERROR
============================================================ */

.error-box {

    display: flex;

    align-items: flex-start;

    gap: 12px;

    margin-bottom: 22px;

    padding: 15px 17px;

    border:
        1px solid
        rgba(239, 68, 68, 0.30);

    border-radius: 10px;

    background:
        rgba(127, 29, 29, 0.20);

    color: #fecaca;

}


.error-icon {

    display: flex;

    align-items: center;

    justify-content: center;

    width: 30px;

    height: 30px;

    flex-shrink: 0;

    border-radius: 8px;

    background:
        rgba(239, 68, 68, 0.14);

    color: #f87171;

}


.error-box strong {

    display: block;

    margin-bottom: 3px;

    color: #fca5a5;

    font-size: 13px;

}


.error-box p {

    margin: 0;

    color: #fecaca;

    font-size: 13px;

}


/* ============================================================
   STATISTICS
============================================================ */

.statistics-grid {

    display: grid;

    grid-template-columns:
        repeat(
            6,
            minmax(0, 1fr)
        );

    gap: 13px;

    margin-bottom: 22px;

}


.stat-card {

    position: relative;

    overflow: hidden;

    min-height: 125px;

    padding: 18px;

    border:
        1px solid
        rgba(71, 85, 105, 0.55);

    border-radius: 11px;

    background:
        linear-gradient(
            145deg,
            #1b2637,
            #172131
        );

    box-shadow:
        0 8px 24px
        rgba(0, 0, 0, 0.14);

    transition:
        transform 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease;

}


.stat-card:hover {

    transform:
        translateY(-2px);

    border-color:
        rgba(96, 165, 250, 0.28);

    box-shadow:
        0 12px 30px
        rgba(0, 0, 0, 0.20);

}


.stat-card::after {

    content: "";

    position: absolute;

    right: -25px;

    bottom: -35px;

    width: 100px;

    height: 100px;

    border-radius: 50%;

    background:
        rgba(59, 130, 246, 0.05);

}


.stat-top {

    display: flex;

    align-items: center;

    gap: 10px;

}


.stat-icon {

    width: 34px;

    height: 34px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 9px;

    background:
        rgba(59, 130, 246, 0.12);

    color: #93c5fd;

}


.stat-label {

    color: #94a3b8;

    font-size: 12px;

    font-weight: 600;

    line-height: 1.3;

}


.stat-value {

    margin-top: 16px;

    font-size: 29px;

    font-weight: 750;

    line-height: 1;

    color: #f8fafc;

}


.stat-total .stat-icon {

    color: #93c5fd;

    background:
        rgba(59, 130, 246, 0.13);

}


.stat-applied .stat-icon {

    color: #60a5fa;

    background:
        rgba(37, 99, 235, 0.13);

}


.stat-shortlisted .stat-icon {

    color: #fbbf24;

    background:
        rgba(245, 158, 11, 0.12);

}


.stat-interview .stat-icon {

    color: #c4b5fd;

    background:
        rgba(139, 92, 246, 0.13);

}


.stat-hired .stat-icon {

    color: #6ee7b7;

    background:
        rgba(16, 185, 129, 0.12);

}


.stat-rejected .stat-icon {

    color: #fca5a5;

    background:
        rgba(239, 68, 68, 0.12);

}


/* ============================================================
   APPLICATIONS CARD
============================================================ */

.applications-card {

    overflow: hidden;

    border:
        1px solid
        rgba(71, 85, 105, 0.60);

    border-radius: 12px;

    background:
        linear-gradient(
            145deg,
            #1b2637,
            #182333
        );

    box-shadow:
        0 15px 40px
        rgba(0, 0, 0, 0.16);

}


.applications-card-header {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 20px;

    padding: 23px 24px;

    border-bottom:
        1px solid
        rgba(71, 85, 105, 0.50);

}


.section-eyebrow {

    display: flex;

    align-items: center;

    gap: 6px;

    margin-bottom: 6px;

    color: #64748b;

    font-size: 10px;

    font-weight: 800;

    letter-spacing: 0.12em;

}


.applications-card-header h2 {

    margin: 0;

    font-size: 20px;

    font-weight: 750;

    color: #f8fafc;

}


.applications-card-header p {

    margin:
        5px 0 0;

    color: #94a3b8;

    font-size: 12px;

}


.application-count {

    display: flex;

    align-items: center;

    gap: 8px;

    padding: 8px 12px;

    border:
        1px solid
        rgba(71, 85, 105, 0.55);

    border-radius: 8px;

    background:
        rgba(15, 23, 42, 0.55);

}


.count-number {

    color: #dbeafe;

    font-size: 15px;

    font-weight: 750;

}


.count-label {

    color: #64748b;

    font-size: 11px;

    font-weight: 600;

}


/* ============================================================
   TABLE
============================================================ */

.table-container {

    width: 100%;

    overflow-x: auto;

}


.applications-table {

    width: 100%;

    min-width: 1080px;

    border-collapse: collapse;

}


.applications-table thead {

    background:
        rgba(15, 23, 42, 0.78);

}


.applications-table th {

    padding:
        13px 14px;

    text-align: left;

    color: #94a3b8;

    font-size: 10px;

    font-weight: 800;

    letter-spacing: 0.06em;

    text-transform: uppercase;

    white-space: nowrap;

    border-bottom:
        1px solid
        rgba(71, 85, 105, 0.48);

}


.applications-table th:first-child {

    padding-left: 24px;

}


.applications-table td {

    padding:
        16px 14px;

    color: #e2e8f0;

    font-size: 13px;

    vertical-align: middle;

    border-bottom:
        1px solid
        rgba(71, 85, 105, 0.40);

}


.applications-table td:first-child {

    padding-left: 24px;

}


.applications-table tbody tr {

    transition:
        background 0.18s ease;

}


.applications-table tbody tr:hover {

    background:
        rgba(51, 65, 85, 0.20);

}


.applications-table tbody tr:last-child td {

    border-bottom: none;

}


/* ============================================================
   APPLICATION ID
============================================================ */

.application-id {

    color: #93c5fd;

    font-size: 13px;

    font-weight: 700;

}


/* ============================================================
   CANDIDATE
============================================================ */

.candidate-cell {

    display: flex;

    align-items: center;

    gap: 11px;

    min-width: 190px;

}


.candidate-avatar {

    width: 36px;

    height: 36px;

    flex-shrink: 0;

    display: flex;

    align-items: center;

    justify-content: center;

    border:
        1px solid
        rgba(96, 165, 250, 0.20);

    border-radius: 9px;

    background:
        linear-gradient(
            135deg,
            rgba(37, 99, 235, 0.20),
            rgba(99, 102, 241, 0.15)
        );

    color: #93c5fd;

}


.candidate-info {

    min-width: 0;

}


.candidate-info strong {

    display: block;

    max-width: 180px;

    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;

    color: #f1f5f9;

    font-size: 13px;

    font-weight: 700;

}


.candidate-info span {

    display: flex;

    align-items: center;

    gap: 4px;

    margin-top: 4px;

    max-width: 180px;

    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;

    color: #64748b;

    font-size: 10px;

}


/* ============================================================
   JOB
============================================================ */

.job-cell {

    display: flex;

    align-items: center;

    gap: 8px;

    min-width: 185px;

    color: #dbeafe;

}


.job-cell svg {

    flex-shrink: 0;

    color: #64748b;

}


.job-cell span {

    line-height: 1.4;

}


/* ============================================================
   COMPANY
============================================================ */

.company-cell {

    display: flex;

    align-items: center;

    gap: 7px;

    min-width: 130px;

    color: #cbd5e1;

}


.company-cell svg {

    flex-shrink: 0;

    color: #64748b;

}


/* ============================================================
   STATUS
============================================================ */

.status-badge {

    display: inline-flex;

    align-items: center;

    justify-content: center;

    gap: 6px;

    padding:
        6px 9px;

    border:
        1px solid;

    border-radius: 999px;

    font-size: 9px;

    font-weight: 800;

    letter-spacing: 0.03em;

    white-space: nowrap;

}


.status-badge.large {

    padding:
        7px 11px;

    font-size: 10px;

}


/* ============================================================
   DATE
============================================================ */

.date-cell {

    display: flex;

    align-items: center;

    gap: 7px;

    min-width: 155px;

    color: #94a3b8;

    font-size: 11px;

}


.date-cell svg {

    flex-shrink: 0;

    color: #64748b;

}


/* ============================================================
   VIEW BUTTON
============================================================ */

.view-button {

    display: inline-flex;

    align-items: center;

    justify-content: center;

    gap: 7px;

    min-width: 73px;

    padding:
        8px 12px;

    border: 1px solid
        rgba(96, 165, 250, 0.25);

    border-radius: 7px;

    background:
        linear-gradient(
            135deg,
            #2563eb,
            #315fd7
        );

    color: white;

    font-size: 11px;

    font-weight: 750;

    cursor: pointer;

    box-shadow:
        0 4px 12px
        rgba(37, 99, 235, 0.15);

    transition:
        transform 0.18s ease,
        box-shadow 0.18s ease,
        background 0.18s ease;

}


.view-button:hover:not(:disabled) {

    transform:
        translateY(-1px);

    background:
        linear-gradient(
            135deg,
            #3b82f6,
            #4f67e8
        );

    box-shadow:
        0 7px 17px
        rgba(37, 99, 235, 0.25);

}


.view-button:disabled {

    opacity: 0.65;

    cursor: not-allowed;

}


/* ============================================================
   EMPTY STATE
============================================================ */

.empty-state {

    padding:
        75px 25px;

    text-align: center;

}


.empty-icon {

    width: 64px;

    height: 64px;

    display: flex;

    align-items: center;

    justify-content: center;

    margin:
        0 auto 18px;

    border:
        1px solid
        rgba(96, 165, 250, 0.18);

    border-radius: 16px;

    background:
        rgba(37, 99, 235, 0.09);

    color: #64748b;

}


.empty-state h3 {

    margin: 0 0 7px;

    color: #e2e8f0;

    font-size: 17px;

}


.empty-state p {

    margin: 0;

    color: #64748b;

    font-size: 13px;

}


/* ============================================================
   MODAL OVERLAY
============================================================ */

.modal-overlay {

    position: fixed;

    inset: 0;

    z-index: 1000;

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 25px;

    background:
        rgba(2, 6, 23, 0.80);

    backdrop-filter:
        blur(8px);

}


/* ============================================================
   MODAL
============================================================ */

.application-modal {

    width: 100%;

    max-width: 800px;

    max-height: 90vh;

    overflow-y: auto;

    border:
        1px solid
        rgba(100, 116, 139, 0.45);

    border-radius: 15px;

    background:
        linear-gradient(
            145deg,
            #1c283a,
            #151f30
        );

    box-shadow:
        0 30px 90px
        rgba(0, 0, 0, 0.50);

    animation:
        modalEnter 0.22s ease-out;

}


@keyframes modalEnter {

    from {

        opacity: 0;

        transform:
            translateY(12px)
            scale(0.98);

    }

    to {

        opacity: 1;

        transform:
            translateY(0)
            scale(1);

    }

}


/* ============================================================
   MODAL HEADER
============================================================ */

.modal-header {

    display: flex;

    align-items: flex-start;

    justify-content: space-between;

    gap: 20px;

    padding: 23px;

    border-bottom:
        1px solid
        rgba(71, 85, 105, 0.50);

}


.modal-title-area {

    display: flex;

    align-items: center;

    gap: 13px;

}


.modal-icon {

    width: 45px;

    height: 45px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border:
        1px solid
        rgba(96, 165, 250, 0.22);

    border-radius: 11px;

    background:
        rgba(37, 99, 235, 0.13);

    color: #93c5fd;

}


.modal-eyebrow {

    margin-bottom: 4px;

    color: #60a5fa;

    font-size: 9px;

    font-weight: 800;

    letter-spacing: 0.12em;

}


.modal-title-area h2 {

    margin: 0;

    color: #f8fafc;

    font-size: 21px;

    font-weight: 750;

}


.modal-title-area p {

    margin:
        5px 0 0;

    color: #64748b;

    font-size: 11px;

}


.modal-close-icon {

    width: 34px;

    height: 34px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border:
        1px solid
        rgba(71, 85, 105, 0.50);

    border-radius: 8px;

    background:
        rgba(51, 65, 85, 0.55);

    color: #94a3b8;

    cursor: pointer;

    transition:
        background 0.18s ease,
        color 0.18s ease;

}


.modal-close-icon:hover {

    background:
        rgba(71, 85, 105, 0.85);

    color: #f8fafc;

}


/* ============================================================
   MODAL STATUS ROW
============================================================ */

.modal-status-row {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 20px;

    margin:
        20px 23px;

    padding:
        15px 17px;

    border:
        1px solid
        rgba(71, 85, 105, 0.40);

    border-radius: 10px;

    background:
        rgba(15, 23, 42, 0.48);

}


.modal-status-label {

    display: block;

    margin-bottom: 7px;

    color: #64748b;

    font-size: 10px;

    font-weight: 700;

    text-transform: uppercase;

    letter-spacing: 0.07em;

}


.modal-date {

    display: flex;

    align-items: center;

    gap: 9px;

    color: #64748b;

}


.modal-date > svg {

    color: #60a5fa;

}


.modal-date span {

    display: block;

    margin-bottom: 3px;

    font-size: 9px;

    text-transform: uppercase;

    letter-spacing: 0.05em;

}


.modal-date strong {

    display: block;

    color: #cbd5e1;

    font-size: 11px;

    font-weight: 600;

}


/* ============================================================
   DETAILS SECTION
============================================================ */

.details-section {

    margin:
        0 23px 20px;

    padding:
        18px;

    border:
        1px solid
        rgba(71, 85, 105, 0.40);

    border-radius: 10px;

    background:
        rgba(15, 23, 42, 0.35);

}


.details-section-title {

    display: flex;

    align-items: center;

    gap: 7px;

    margin-bottom: 15px;

    color: #cbd5e1;

    font-size: 12px;

    font-weight: 750;

}


.details-section-title svg {

    color: #60a5fa;

}


.detail-grid {

    display: grid;

    grid-template-columns:
        repeat(
            2,
            minmax(0, 1fr)
        );

    gap: 11px;

}


.detail-item {

    min-height: 65px;

    padding: 12px;

    border:
        1px solid
        rgba(71, 85, 105, 0.32);

    border-radius: 8px;

    background:
        rgba(30, 41, 59, 0.48);

}


.detail-item span {

    display: block;

    margin-bottom: 6px;

    color: #64748b;

    font-size: 10px;

    font-weight: 600;

}


.detail-item strong {

    display: block;

    color: #e2e8f0;

    font-size: 12px;

    line-height: 1.4;

    word-break: break-word;

}


/* ============================================================
   MODAL FOOTER
============================================================ */

.modal-footer {

    display: flex;

    justify-content: flex-end;

    padding:
        0 23px 23px;

}


.modal-close-button {

    display: inline-flex;

    align-items: center;

    justify-content: center;

    gap: 7px;

    padding:
        9px 15px;

    border:
        1px solid
        rgba(71, 85, 105, 0.55);

    border-radius: 7px;

    background:
        rgba(51, 65, 85, 0.65);

    color: #e2e8f0;

    font-size: 11px;

    font-weight: 700;

    cursor: pointer;

    transition:
        background 0.18s ease;

}


.modal-close-button:hover {

    background:
        rgba(71, 85, 105, 0.90);

}


/* ============================================================
   LOADING
============================================================ */

.loading-container {

    min-height: 100vh;

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 25px;

}


.loading-card {

    width: 100%;

    max-width: 420px;

    padding: 40px;

    text-align: center;

    border:
        1px solid
        rgba(71, 85, 105, 0.55);

    border-radius: 15px;

    background:
        linear-gradient(
            145deg,
            #1b2637,
            #172131
        );

    box-shadow:
        0 25px 70px
        rgba(0, 0, 0, 0.30);

}


.loading-logo {

    margin-bottom: 28px;

    color: #f8fafc;

    font-size: 25px;

    font-weight: 800;

}


.loading-logo span {

    margin-left: 5px;

}


.loading-spinner {

    width: 60px;

    height: 60px;

    display: flex;

    align-items: center;

    justify-content: center;

    margin: 0 auto 20px;

    border:
        1px solid
        rgba(96, 165, 250, 0.25);

    border-radius: 16px;

    background:
        rgba(37, 99, 235, 0.10);

    color: #60a5fa;

}


.loading-card h2 {

    margin: 0 0 7px;

    color: #f8fafc;

    font-size: 20px;

}


.loading-card p {

    margin: 0;

    color: #64748b;

    font-size: 13px;

    line-height: 1.6;

}


.spin {

    animation:
        spin 0.9s linear infinite;

}


@keyframes spin {

    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }

}


/* ============================================================
   RESPONSIVE
============================================================ */

@media (max-width: 1100px) {

    .statistics-grid {

        grid-template-columns:
            repeat(
                3,
                minmax(0, 1fr)
            );

    }

}


@media (max-width: 700px) {

    .applications-container {

        width:
            calc(100% - 28px);

        padding-top: 22px;

    }


    .page-heading {

        align-items: flex-start;

    }


    .heading-icon {

        width: 43px;

        height: 43px;

    }


    .page-heading h1 {

        font-size: 24px;

    }


    .page-heading p {

        font-size: 12px;

    }


    .statistics-grid {

        grid-template-columns:
            repeat(
                2,
                minmax(0, 1fr)
            );

    }


    .stat-card {

        min-height: 112px;

        padding: 15px;

    }


    .stat-value {

        font-size: 25px;

    }


    .applications-card-header {

        align-items: flex-start;

        flex-direction: column;

    }


    .application-count {

        width: 100%;

        justify-content: center;

    }


    .modal-overlay {

        padding: 12px;

    }


    .modal-status-row {

        align-items: flex-start;

        flex-direction: column;

    }


    .detail-grid {

        grid-template-columns:
            1fr;

    }

}


@media (max-width: 450px) {

    .statistics-grid {

        grid-template-columns:
            1fr;

    }


    .page-heading {

        gap: 11px;

    }


    .heading-icon {

        display: none;

    }


    .back-button {

        width: 100%;

        justify-content: center;

    }


    .applications-card-header {

        padding: 18px;

    }


    .applications-table td:first-child,
    .applications-table th:first-child {

        padding-left: 18px;

    }


    .modal-header {

        padding: 18px;

    }


    .modal-status-row {

        margin:
            16px 18px;

    }


    .details-section {

        margin:
            0 18px 16px;

        padding: 14px;

    }


    .modal-footer {

        padding:
            0 18px 18px;

    }

}

`;


export default AdminApplications;