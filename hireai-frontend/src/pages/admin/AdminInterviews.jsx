import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AdminInterviews() {
    const navigate = useNavigate();

    const [interviews, setInterviews] = useState([]);
    const [statistics, setStatistics] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedInterview, setSelectedInterview] =
        useState(null);

    const [detailsLoading, setDetailsLoading] =
        useState(false);

    // =========================================================
    // LOAD INTERVIEWS + STATISTICS
    // =========================================================

    useEffect(() => {
        let ignore = false;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    interviewsResponse,
                    statisticsResponse
                ] = await Promise.all([
                    api.get("/interviews/admin"),
                    api.get("/interviews/admin/statistics")
                ]);

                console.log(
                    "Admin interviews:",
                    interviewsResponse.data
                );

                console.log(
                    "Interview statistics:",
                    statisticsResponse.data
                );

                if (!ignore) {
                    if (
                        Array.isArray(
                            interviewsResponse.data
                        )
                    ) {
                        setInterviews(
                            interviewsResponse.data
                        );
                    } else {
                        setInterviews([]);
                    }

                    setStatistics(
                        statisticsResponse.data || {}
                    );
                }
            } catch (err) {
                console.error(
                    "Failed to load admin interviews:",
                    err
                );

                if (!ignore) {
                    // =================================================
                    // UNAUTHORIZED
                    // =================================================

                    if (
                        err.response?.status === 401
                    ) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("role");

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
                            "Access denied. Only administrators can view interviews."
                        );

                        return;
                    }

                    // =================================================
                    // OTHER ERROR
                    // =================================================

                    setError(
                        err.response?.data?.message ||
                        "Unable to load interviews."
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
    // VIEW INTERVIEW DETAILS
    // =========================================================

    const handleViewDetails = async (id) => {
        try {
            setDetailsLoading(true);
            setError("");

            const response = await api.get(
                `/interviews/admin/${id}`
            );

            console.log(
                "Interview details:",
                response.data
            );

            setSelectedInterview(
                response.data
            );
        } catch (err) {
            console.error(
                "Failed to load interview details:",
                err
            );

            // =================================================
            // UNAUTHORIZED
            // =================================================

            if (
                err.response?.status === 401
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");

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
                    "Access denied. Only administrators can view interview details."
                );

                return;
            }

            // =================================================
            // OTHER ERROR
            // =================================================

            setError(
                err.response?.data?.message ||
                "Unable to load interview details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    // =========================================================
    // CLOSE DETAILS
    // =========================================================

    const handleCloseDetails = () => {
        setSelectedInterview(null);
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
            return new Date(date).toLocaleString();
        } catch {
            return date;
        }
    };

    // =========================================================
    // STATUS STYLE
    // =========================================================

    const getStatusStyle = (status) => {
        const normalizedStatus =
            String(status || "")
                .toUpperCase()
                .trim();

        switch (normalizedStatus) {
            case "NOT_STARTED":
                return {
                    backgroundColor:
                        "rgba(100, 116, 139, 0.16)",
                    color: "#cbd5e1",
                    border:
                        "1px solid rgba(148, 163, 184, 0.28)"
                };

            case "IN_PROGRESS":
                return {
                    backgroundColor:
                        "rgba(245, 158, 11, 0.14)",
                    color: "#fbbf24",
                    border:
                        "1px solid rgba(245, 158, 11, 0.28)"
                };

            case "COMPLETED":
                return {
                    backgroundColor:
                        "rgba(34, 197, 94, 0.14)",
                    color: "#4ade80",
                    border:
                        "1px solid rgba(34, 197, 94, 0.28)"
                };

            case "CANCELLED":
                return {
                    backgroundColor:
                        "rgba(239, 68, 68, 0.14)",
                    color: "#f87171",
                    border:
                        "1px solid rgba(239, 68, 68, 0.28)"
                };

            default:
                return {
                    backgroundColor:
                        "rgba(100, 116, 139, 0.16)",
                    color: "#cbd5e1",
                    border:
                        "1px solid rgba(148, 163, 184, 0.28)"
                };
        }
    };

    // =========================================================
    // STATUS LABEL
    // =========================================================

    const getStatusLabel = (status) => {
        const normalizedStatus =
            String(status || "")
                .toUpperCase()
                .trim();

        switch (normalizedStatus) {
            case "NOT_STARTED":
                return "Not Started";

            case "IN_PROGRESS":
                return "In Progress";

            case "COMPLETED":
                return "Completed";

            case "CANCELLED":
                return "Cancelled";

            default:
                return status || "N/A";
        }
    };

    // =========================================================
    // SCORE STYLE
    // =========================================================

    const getScoreStyle = (score) => {
        const value = Number(score || 0);

        if (value >= 80) {
            return {
                color: "#4ade80",
                fontWeight: "800"
            };
        }

        if (value >= 60) {
            return {
                color: "#facc15",
                fontWeight: "800"
            };
        }

        return {
            color: "#f87171",
            fontWeight: "800"
        };
    };

    // =========================================================
    // SCORE BACKGROUND
    // =========================================================

    const getScoreCardStyle = (score) => {
        const value = Number(score || 0);

        if (value >= 80) {
            return {
                backgroundColor:
                    "rgba(34, 197, 94, 0.10)",
                border:
                    "1px solid rgba(34, 197, 94, 0.22)"
            };
        }

        if (value >= 60) {
            return {
                backgroundColor:
                    "rgba(250, 204, 21, 0.10)",
                border:
                    "1px solid rgba(250, 204, 21, 0.22)"
            };
        }

        return {
            backgroundColor:
                "rgba(239, 68, 68, 0.10)",
            border:
                "1px solid rgba(239, 68, 68, 0.22)"
        };
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
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div style={styles.page}>
                <div style={styles.loadingBackgroundGlow} />

                <div style={styles.centerMessage}>
                    <div style={styles.loadingSpinner}>
                        <div style={styles.spinnerRing} />
                    </div>

                    <h1 style={styles.loadingTitle}>
                        Admin Interviews
                    </h1>

                    <p style={styles.loadingSubtitle}>
                        Loading interview analytics...
                    </p>
                </div>
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

            <main style={styles.container}>
                {/* =================================================
                    BACK BUTTON
                ================================================= */}

                <button
                    onClick={handleBack}
                    style={styles.backButton}
                >
                    <span style={styles.backArrow}>
                        ←
                    </span>

                    Back to Admin Dashboard
                </button>

                {/* =================================================
                    HEADER
                ================================================= */}

                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <div style={styles.headerIcon}>
                            🎤
                        </div>

                        <div>
                            <div style={styles.pageLabel}>
                                AI INTERVIEW MANAGEMENT
                            </div>

                            <h1 style={styles.heading}>
                                Admin Interviews
                            </h1>

                            <p style={styles.subtitle}>
                                View, monitor and analyze all AI
                                interviews across HireAI.
                            </p>
                        </div>
                    </div>

                    <div style={styles.headerBadge}>
                        <span style={styles.headerBadgeDot} />

                        Live Interview Data
                    </div>
                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div style={styles.errorBox}>
                        <div style={styles.errorIcon}>
                            !
                        </div>

                        <div>
                            <strong style={styles.errorTitle}>
                                Unable to complete request
                            </strong>

                            <p style={styles.errorText}>
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div style={styles.statsGrid}>
                    {/* TOTAL */}

                    <div
                        style={{
                            ...styles.statCard,
                            ...styles.statCardBlue
                        }}
                    >
                        <div style={styles.statTop}>
                            <div
                                style={{
                                    ...styles.statIcon,
                                    backgroundColor:
                                        "rgba(59, 130, 246, 0.14)",
                                    color: "#60a5fa"
                                }}
                            >
                                ◉
                            </div>

                            <span style={styles.statMiniLabel}>
                                OVERVIEW
                            </span>
                        </div>

                        <span style={styles.statLabel}>
                            Total Interviews
                        </span>

                        <strong style={styles.statValue}>
                            {getStatistic(
                                "totalInterviews",
                                "total"
                            )}
                        </strong>

                        <div style={styles.statAccentBlue} />
                    </div>

                    {/* COMPLETED */}

                    <div
                        style={{
                            ...styles.statCard,
                            ...styles.statCardGreen
                        }}
                    >
                        <div style={styles.statTop}>
                            <div
                                style={{
                                    ...styles.statIcon,
                                    backgroundColor:
                                        "rgba(34, 197, 94, 0.14)",
                                    color: "#4ade80"
                                }}
                            >
                                ✓
                            </div>

                            <span style={styles.statMiniLabel}>
                                SUCCESS
                            </span>
                        </div>

                        <span style={styles.statLabel}>
                            Completed
                        </span>

                        <strong style={styles.statValue}>
                            {getStatistic(
                                "completedInterviews",
                                "completed"
                            )}
                        </strong>

                        <div style={styles.statAccentGreen} />
                    </div>

                    {/* IN PROGRESS */}

                    <div
                        style={{
                            ...styles.statCard,
                            ...styles.statCardAmber
                        }}
                    >
                        <div style={styles.statTop}>
                            <div
                                style={{
                                    ...styles.statIcon,
                                    backgroundColor:
                                        "rgba(245, 158, 11, 0.14)",
                                    color: "#fbbf24"
                                }}
                            >
                                ◌
                            </div>

                            <span style={styles.statMiniLabel}>
                                ACTIVE
                            </span>
                        </div>

                        <span style={styles.statLabel}>
                            In Progress
                        </span>

                        <strong style={styles.statValue}>
                            {getStatistic(
                                "inProgressInterviews",
                                "inProgress"
                            )}
                        </strong>

                        <div style={styles.statAccentAmber} />
                    </div>

                    {/* AVERAGE SCORE */}

                    <div
                        style={{
                            ...styles.statCard,
                            ...styles.statCardPurple
                        }}
                    >
                        <div style={styles.statTop}>
                            <div
                                style={{
                                    ...styles.statIcon,
                                    backgroundColor:
                                        "rgba(139, 92, 246, 0.14)",
                                    color: "#a78bfa"
                                }}
                            >
                                ★
                            </div>

                            <span style={styles.statMiniLabel}>
                                PERFORMANCE
                            </span>
                        </div>

                        <span style={styles.statLabel}>
                            Average Score
                        </span>

                        <strong style={styles.statValue}>
                            {getStatistic(
                                "averageScore"
                            )}
                        </strong>

                        <div style={styles.statAccentPurple} />
                    </div>

                    {/* HIGHEST SCORE */}

                    <div
                        style={{
                            ...styles.statCard,
                            ...styles.statCardCyan
                        }}
                    >
                        <div style={styles.statTop}>
                            <div
                                style={{
                                    ...styles.statIcon,
                                    backgroundColor:
                                        "rgba(6, 182, 212, 0.14)",
                                    color: "#22d3ee"
                                }}
                            >
                                ↑
                            </div>

                            <span style={styles.statMiniLabel}>
                                PEAK
                            </span>
                        </div>

                        <span style={styles.statLabel}>
                            Highest Score
                        </span>

                        <strong style={styles.statValue}>
                            {getStatistic(
                                "highestScore"
                            )}
                        </strong>

                        <div style={styles.statAccentCyan} />
                    </div>

                    {/* LOWEST SCORE */}

                    <div
                        style={{
                            ...styles.statCard,
                            ...styles.statCardRose
                        }}
                    >
                        <div style={styles.statTop}>
                            <div
                                style={{
                                    ...styles.statIcon,
                                    backgroundColor:
                                        "rgba(244, 63, 94, 0.14)",
                                    color: "#fb7185"
                                }}
                            >
                                ↓
                            </div>

                            <span style={styles.statMiniLabel}>
                                LOWEST
                            </span>
                        </div>

                        <span style={styles.statLabel}>
                            Lowest Score
                        </span>

                        <strong style={styles.statValue}>
                            {getStatistic(
                                "lowestScore"
                            )}
                        </strong>

                        <div style={styles.statAccentRose} />
                    </div>
                </div>

                {/* =================================================
                    INTERVIEWS TABLE
                ================================================= */}

                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div>
                            <div style={styles.sectionEyebrow}>
                                INTERVIEW ACTIVITY
                            </div>

                            <h2 style={styles.sectionTitle}>
                                All Interviews
                            </h2>
                        </div>

                        <div style={styles.applicationCount}>
                            <span style={styles.countNumber}>
                                {interviews.length}
                            </span>

                            interview
                            {interviews.length !== 1
                                ? "s"
                                : ""}
                        </div>
                    </div>

                    {interviews.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>
                                🎤
                            </div>

                            <h3 style={styles.emptyTitle}>
                                No Interviews Found
                            </h3>

                            <p style={styles.emptyText}>
                                There are currently no
                                interviews in the system.
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
                                            Job
                                        </th>

                                        <th style={styles.th}>
                                            Status
                                        </th>

                                        <th style={styles.th}>
                                            Questions
                                        </th>

                                        <th style={styles.th}>
                                            Score
                                        </th>

                                        <th style={styles.th}>
                                            Started At
                                        </th>

                                        <th style={styles.th}>
                                            Completed At
                                        </th>

                                        <th style={styles.th}>
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {interviews.map(
                                        (
                                            interview,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    interview.id ||
                                                    index
                                                }
                                                style={
                                                    styles.tr
                                                }
                                            >
                                                {/* ID */}

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    <span
                                                        style={
                                                            styles.idBadge
                                                        }
                                                    >
                                                        #
                                                        {
                                                            interview.id ||
                                                            "N/A"
                                                        }
                                                    </span>
                                                </td>

                                                {/* JOB */}

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    <div
                                                        style={
                                                            styles.jobCell
                                                        }
                                                    >
                                                        <strong
                                                            style={
                                                                styles.jobTitle
                                                            }
                                                        >
                                                            {
                                                                interview.jobTitle ||
                                                                "N/A"
                                                            }
                                                        </strong>

                                                        <span
                                                            style={
                                                                styles.jobId
                                                            }
                                                        >
                                                            Job ID:{" "}
                                                            {
                                                                interview.jobId ??
                                                                "N/A"
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* STATUS */}

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    <span
                                                        style={{
                                                            ...styles.statusBadge,
                                                            ...getStatusStyle(
                                                                interview.status
                                                            )
                                                        }}
                                                    >
                                                        <span
                                                            style={
                                                                styles.statusDot
                                                            }
                                                        />

                                                        {
                                                            getStatusLabel(
                                                                interview.status
                                                            )
                                                        }
                                                    </span>
                                                </td>

                                                {/* QUESTIONS */}

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    <span
                                                        style={
                                                            styles.questionCount
                                                        }
                                                    >
                                                        {
                                                            interview.totalQuestions ??
                                                            0
                                                        }
                                                    </span>
                                                </td>

                                                {/* SCORE */}

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    <div
                                                        style={{
                                                            ...styles.scorePill,
                                                            ...getScoreCardStyle(
                                                                interview.score
                                                            )
                                                        }}
                                                    >
                                                        <strong
                                                            style={getScoreStyle(
                                                                interview.score
                                                            )}
                                                        >
                                                            {
                                                                interview.score ??
                                                                0
                                                            }
                                                        </strong>

                                                        <span
                                                            style={
                                                                styles.scoreMax
                                                            }
                                                        >
                                                            /100
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* STARTED */}

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    <span
                                                        style={
                                                            styles.dateText
                                                        }
                                                    >
                                                        {
                                                            formatDate(
                                                                interview.startedAt
                                                            )
                                                        }
                                                    </span>
                                                </td>

                                                {/* COMPLETED */}

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    <span
                                                        style={
                                                            styles.dateText
                                                        }
                                                    >
                                                        {
                                                            formatDate(
                                                                interview.completedAt
                                                            )
                                                        }
                                                    </span>
                                                </td>

                                                {/* ACTION */}

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    <button
                                                        onClick={() =>
                                                            handleViewDetails(
                                                                interview.id
                                                            )
                                                        }
                                                        style={
                                                            styles.viewButton
                                                        }
                                                    >
                                                        View Details
                                                        <span>
                                                            →
                                                        </span>
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* =================================================
                    INTERVIEW DETAILS MODAL
                ================================================= */}

                {selectedInterview && (
                    <div
                        style={
                            styles.modalOverlay
                        }
                        onClick={
                            handleCloseDetails
                        }
                    >
                        <div
                            style={
                                styles.modal
                            }
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                            {/* =================================================
                                MODAL HEADER
                            ================================================= */}

                            <div
                                style={
                                    styles.modalHeader
                                }
                            >
                                <div
                                    style={
                                        styles.modalHeaderContent
                                    }
                                >
                                    <div
                                        style={
                                            styles.modalIcon
                                        }
                                    >
                                        🎤
                                    </div>

                                    <div>
                                        <div
                                            style={
                                                styles.modalEyebrow
                                            }
                                        >
                                            AI INTERVIEW
                                            REVIEW
                                        </div>

                                        <h2
                                            style={
                                                styles.modalTitle
                                            }
                                        >
                                            Interview Details
                                        </h2>

                                        <p
                                            style={
                                                styles.modalSubtitle
                                            }
                                        >
                                            Interview #
                                            {
                                                selectedInterview.id
                                            }
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={
                                        handleCloseDetails
                                    }
                                    style={
                                        styles.closeButton
                                    }
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* =================================================
                                SUMMARY
                            ================================================= */}

                            <div
                                style={
                                    styles.modalSummary
                                }
                            >
                                <div
                                    style={
                                        styles.summaryItem
                                    }
                                >
                                    <span
                                        style={
                                            styles.summaryLabel
                                        }
                                    >
                                        STATUS
                                    </span>

                                    <span
                                        style={{
                                            ...styles.statusBadge,
                                            ...getStatusStyle(
                                                selectedInterview.status
                                            )
                                        }}
                                    >
                                        <span
                                            style={
                                                styles.statusDot
                                            }
                                        />

                                        {
                                            getStatusLabel(
                                                selectedInterview.status
                                            )
                                        }
                                    </span>
                                </div>

                                <div
                                    style={
                                        styles.summaryDivider
                                    }
                                />

                                <div
                                    style={
                                        styles.summaryItem
                                    }
                                >
                                    <span
                                        style={
                                            styles.summaryLabel
                                        }
                                    >
                                        SCORE
                                    </span>

                                    <strong
                                        style={{
                                            ...styles.summaryScore,
                                            ...getScoreStyle(
                                                selectedInterview.score
                                            )
                                        }}
                                    >
                                        {
                                            selectedInterview.score ??
                                            0
                                        }
                                        /100
                                    </strong>
                                </div>

                                <div
                                    style={
                                        styles.summaryDivider
                                    }
                                />

                                <div
                                    style={
                                        styles.summaryItem
                                    }
                                >
                                    <span
                                        style={
                                            styles.summaryLabel
                                        }
                                    >
                                        QUESTIONS
                                    </span>

                                    <strong
                                        style={
                                            styles.summaryValue
                                        }
                                    >
                                        {
                                            selectedInterview.totalQuestions ??
                                            0
                                        }
                                    </strong>
                                </div>
                            </div>

                            {/* =================================================
                                DETAILS
                            ================================================= */}

                            <div
                                style={
                                    styles.detailGrid
                                }
                            >
                                {/* JOB */}

                                <div
                                    style={
                                        styles.detailBox
                                    }
                                >
                                    <span
                                        style={
                                            styles.detailLabel
                                        }
                                    >
                                        Job
                                    </span>

                                    <strong
                                        style={
                                            styles.detailValue
                                        }
                                    >
                                        {
                                            selectedInterview.jobTitle ||
                                            "N/A"
                                        }
                                    </strong>
                                </div>

                                {/* JOB ID */}

                                <div
                                    style={
                                        styles.detailBox
                                    }
                                >
                                    <span
                                        style={
                                            styles.detailLabel
                                        }
                                    >
                                        Job ID
                                    </span>

                                    <strong
                                        style={
                                            styles.detailValue
                                        }
                                    >
                                        {
                                            selectedInterview.jobId ??
                                            "N/A"
                                        }
                                    </strong>
                                </div>

                                {/* STARTED */}

                                <div
                                    style={
                                        styles.detailBox
                                    }
                                >
                                    <span
                                        style={
                                            styles.detailLabel
                                        }
                                    >
                                        Started At
                                    </span>

                                    <strong
                                        style={
                                            styles.detailValue
                                        }
                                    >
                                        {
                                            formatDate(
                                                selectedInterview.startedAt
                                            )
                                        }
                                    </strong>
                                </div>

                                {/* COMPLETED */}

                                <div
                                    style={
                                        styles.detailBox
                                    }
                                >
                                    <span
                                        style={
                                            styles.detailLabel
                                        }
                                    >
                                        Completed At
                                    </span>

                                    <strong
                                        style={
                                            styles.detailValue
                                        }
                                    >
                                        {
                                            formatDate(
                                                selectedInterview.completedAt
                                            )
                                        }
                                    </strong>
                                </div>
                            </div>

                            {/* =================================================
                                OVERALL AI FEEDBACK
                            ================================================= */}

                            <div
                                style={
                                    styles.feedbackBox
                                }
                            >
                                <div
                                    style={
                                        styles.feedbackHeader
                                    }
                                >
                                    <div
                                        style={
                                            styles.feedbackIcon
                                        }
                                    >
                                        ✦
                                    </div>

                                    <div>
                                        <span
                                            style={
                                                styles.feedbackEyebrow
                                            }
                                        >
                                            AI ANALYSIS
                                        </span>

                                        <h3
                                            style={
                                                styles.feedbackTitle
                                            }
                                        >
                                            Overall AI Feedback
                                        </h3>
                                    </div>
                                </div>

                                <p
                                    style={
                                        styles.feedbackText
                                    }
                                >
                                    {
                                        selectedInterview.overallFeedback ||
                                        "No overall feedback available."
                                    }
                                </p>
                            </div>

                            {/* =================================================
                                QUESTIONS & ANSWERS
                            ================================================= */}

                            <div
                                style={
                                    styles.questionsSection
                                }
                            >
                                <div
                                    style={
                                        styles.questionsSectionHeader
                                    }
                                >
                                    <div>
                                        <div
                                            style={
                                                styles.sectionEyebrow
                                            }
                                        >
                                            INTERVIEW CONTENT
                                        </div>

                                        <h3
                                            style={
                                                styles.questionsTitle
                                            }
                                        >
                                            Interview Questions
                                        </h3>
                                    </div>

                                    <span
                                        style={
                                            styles.questionsCountBadge
                                        }
                                    >
                                        {
                                            selectedInterview
                                                .questions
                                                ?.length || 0
                                        }{" "}
                                        Questions
                                    </span>
                                </div>

                                {detailsLoading ? (
                                    <div
                                        style={
                                            styles.detailsLoading
                                        }
                                    >
                                        <div
                                            style={
                                                styles.smallSpinner
                                            }
                                        />

                                        <p
                                            style={
                                                styles.loadingText
                                            }
                                        >
                                            Loading interview
                                            details...
                                        </p>
                                    </div>
                                ) : selectedInterview.questions &&
                                  selectedInterview.questions
                                      .length > 0 ? (
                                    selectedInterview.questions.map(
                                        (
                                            question,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    question.id ||
                                                    index
                                                }
                                                style={
                                                    styles.questionCard
                                                }
                                            >
                                                {/* QUESTION HEADER */}

                                                <div
                                                    style={
                                                        styles.questionHeader
                                                    }
                                                >
                                                    <div
                                                        style={
                                                            styles.questionNumber
                                                        }
                                                    >
                                                        Q
                                                        {
                                                            question.questionNumber ??
                                                            index +
                                                                1
                                                        }
                                                    </div>

                                                    <span
                                                        style={
                                                            styles.questionType
                                                        }
                                                    >
                                                        {
                                                            question.questionType ||
                                                            "N/A"
                                                        }
                                                    </span>
                                                </div>

                                                {/* QUESTION */}

                                                <div
                                                    style={
                                                        styles.questionBlock
                                                    }
                                                >
                                                    <span
                                                        style={
                                                            styles.questionLabel
                                                        }
                                                    >
                                                        Question
                                                    </span>

                                                    <p
                                                        style={
                                                            styles.questionText
                                                        }
                                                    >
                                                        {
                                                            question.question ||
                                                            "N/A"
                                                        }
                                                    </p>
                                                </div>

                                                {/* ANSWER */}

                                                <div
                                                    style={
                                                        styles.answerBlock
                                                    }
                                                >
                                                    <span
                                                        style={
                                                            styles.questionLabel
                                                        }
                                                    >
                                                        Candidate
                                                        Answer
                                                    </span>

                                                    <p
                                                        style={
                                                            styles.answerText
                                                        }
                                                    >
                                                        {
                                                            question.candidateAnswer ||
                                                            "No answer provided."
                                                        }
                                                    </p>
                                                </div>

                                                {/* SCORE + FEEDBACK */}

                                                <div
                                                    style={
                                                        styles.answerFooter
                                                    }
                                                >
                                                    <div
                                                        style={
                                                            styles.questionScore
                                                        }
                                                    >
                                                        <span
                                                            style={
                                                                styles.footerLabel
                                                            }
                                                        >
                                                            Score
                                                        </span>

                                                        <strong
                                                            style={getScoreStyle(
                                                                question.score
                                                            )}
                                                        >
                                                            {
                                                                question.score ??
                                                                0
                                                            }
                                                            /100
                                                        </strong>
                                                    </div>

                                                    <div
                                                        style={
                                                            styles.questionFeedback
                                                        }
                                                    >
                                                        <span
                                                            style={
                                                                styles.footerLabel
                                                            }
                                                        >
                                                            AI Feedback
                                                        </span>

                                                        <span
                                                            style={
                                                                styles.feedbackValue
                                                            }
                                                        >
                                                            {
                                                                question.feedback ||
                                                                "No feedback available."
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <div
                                        style={
                                            styles.noQuestions
                                        }
                                    >
                                        <div
                                            style={
                                                styles.noQuestionsIcon
                                            }
                                        >
                                            🎤
                                        </div>

                                        <strong
                                            style={
                                                styles.noQuestionsTitle
                                            }
                                        >
                                            No Interview
                                            Questions
                                        </strong>

                                        <p
                                            style={
                                                styles.noQuestionsText
                                            }
                                        >
                                            No interview
                                            questions are
                                            available for
                                            this session.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* =================================================
                                CLOSE
                            ================================================= */}

                            <div
                                style={
                                    styles.modalFooter
                                }
                            >
                                <button
                                    onClick={
                                        handleCloseDetails
                                    }
                                    style={
                                        styles.modalCloseButton
                                    }
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// =============================================================
// PREMIUM HIREAI STYLES
// =============================================================

const styles = {
    // =========================================================
    // PAGE
    // =========================================================

    page: {
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
            "radial-gradient(circle at 15% 10%, rgba(59, 130, 246, 0.08), transparent 30%), radial-gradient(circle at 85% 20%, rgba(124, 58, 237, 0.08), transparent 30%), #0b1120",
        color: "#f8fafc",
        fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "32px 0 60px",
        boxSizing: "border-box"
    },

    backgroundGlowOne: {
        position: "fixed",
        width: "420px",
        height: "420px",
        borderRadius: "50%",
        background:
            "rgba(37, 99, 235, 0.08)",
        filter: "blur(100px)",
        top: "-180px",
        left: "-160px",
        pointerEvents: "none"
    },

    backgroundGlowTwo: {
        position: "fixed",
        width: "450px",
        height: "450px",
        borderRadius: "50%",
        background:
            "rgba(124, 58, 237, 0.07)",
        filter: "blur(110px)",
        bottom: "-220px",
        right: "-170px",
        pointerEvents: "none"
    },

    loadingBackgroundGlow: {
        position: "fixed",
        inset: 0,
        background:
            "radial-gradient(circle at center, rgba(59, 130, 246, 0.08), transparent 40%)",
        pointerEvents: "none"
    },

    // =========================================================
    // CONTAINER
    // =========================================================

    container: {
        width: "100%",
        maxWidth: "1440px",
        margin: "0 auto",
        padding: "0 32px",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 1
    },

    // =========================================================
    // LOADING
    // =========================================================

    centerMessage: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        position: "relative",
        zIndex: 2
    },

    loadingSpinner: {
        width: "58px",
        height: "58px",
        borderRadius: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(124, 58, 237, 0.16))",
        border:
            "1px solid rgba(96, 165, 250, 0.25)",
        marginBottom: "22px"
    },

    spinnerRing: {
        width: "25px",
        height: "25px",
        borderRadius: "50%",
        border:
            "3px solid rgba(148, 163, 184, 0.25)",
        borderTopColor: "#60a5fa"
    },

    loadingTitle: {
        margin: 0,
        fontSize: "26px",
        fontWeight: "750",
        letterSpacing: "-0.5px"
    },

    loadingSubtitle: {
        marginTop: "8px",
        color: "#94a3b8",
        fontSize: "14px"
    },

    // =========================================================
    // BACK BUTTON
    // =========================================================

    backButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        padding: "11px 17px",
        marginBottom: "28px",
        border:
            "1px solid rgba(148, 163, 184, 0.16)",
        borderRadius: "10px",
        background:
            "rgba(30, 41, 59, 0.72)",
        color: "#e2e8f0",
        cursor: "pointer",
        fontWeight: "650",
        fontSize: "13px",
        boxShadow:
            "0 10px 30px rgba(0, 0, 0, 0.18)",
        backdropFilter: "blur(14px)"
    },

    backArrow: {
        color: "#60a5fa",
        fontSize: "17px"
    },

    // =========================================================
    // HEADER
    // =========================================================

    header: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "25px",
        marginBottom: "30px",
        flexWrap: "wrap"
    },

    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "16px"
    },

    headerIcon: {
        width: "58px",
        height: "58px",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "25px",
        background:
            "linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(124, 58, 237, 0.18))",
        border:
            "1px solid rgba(96, 165, 250, 0.20)",
        boxShadow:
            "0 12px 30px rgba(37, 99, 235, 0.12)"
    },

    pageLabel: {
        color: "#60a5fa",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.6px",
        marginBottom: "6px"
    },

    heading: {
        margin: 0,
        fontSize: "31px",
        lineHeight: "1.15",
        fontWeight: "780",
        letterSpacing: "-0.7px",
        color: "#f8fafc"
    },

    subtitle: {
        margin: "8px 0 0",
        color: "#94a3b8",
        fontSize: "14px"
    },

    headerBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "9px 13px",
        borderRadius: "999px",
        background:
            "rgba(15, 23, 42, 0.65)",
        border:
            "1px solid rgba(96, 165, 250, 0.16)",
        color: "#cbd5e1",
        fontSize: "12px",
        fontWeight: "650"
    },

    headerBadgeDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        backgroundColor: "#4ade80",
        boxShadow:
            "0 0 0 4px rgba(74, 222, 128, 0.08)"
    },

    // =========================================================
    // ERROR
    // =========================================================

    errorBox: {
        display: "flex",
        alignItems: "flex-start",
        gap: "13px",
        background:
            "rgba(127, 29, 29, 0.22)",
        border:
            "1px solid rgba(248, 113, 113, 0.24)",
        color: "#fecaca",
        padding: "15px 17px",
        borderRadius: "12px",
        marginBottom: "22px",
        backdropFilter: "blur(12px)"
    },

    errorIcon: {
        width: "25px",
        height: "25px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor:
            "rgba(239, 68, 68, 0.16)",
        color: "#f87171",
        fontWeight: "800"
    },

    errorTitle: {
        display: "block",
        color: "#fecaca",
        fontSize: "13px",
        marginBottom: "3px"
    },

    errorText: {
        margin: 0,
        color: "#fca5a5",
        fontSize: "13px"
    },

    // =========================================================
    // STATISTICS
    // =========================================================

    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
        gap: "14px",
        marginBottom: "25px"
    },

    statCard: {
        position: "relative",
        overflow: "hidden",
        minHeight: "155px",
        background:
            "linear-gradient(145deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.92))",
        border:
            "1px solid rgba(148, 163, 184, 0.12)",
        borderRadius: "15px",
        padding: "18px 19px",
        boxSizing: "border-box",
        boxShadow:
            "0 15px 40px rgba(0, 0, 0, 0.16)"
    },

    statCardBlue: {
        borderTop:
            "1px solid rgba(59, 130, 246, 0.24)"
    },

    statCardGreen: {
        borderTop:
            "1px solid rgba(34, 197, 94, 0.24)"
    },

    statCardAmber: {
        borderTop:
            "1px solid rgba(245, 158, 11, 0.24)"
    },

    statCardPurple: {
        borderTop:
            "1px solid rgba(139, 92, 246, 0.24)"
    },

    statCardCyan: {
        borderTop:
            "1px solid rgba(6, 182, 212, 0.24)"
    },

    statCardRose: {
        borderTop:
            "1px solid rgba(244, 63, 94, 0.24)"
    },

    statTop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "18px"
    },

    statIcon: {
        width: "34px",
        height: "34px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "15px",
        fontWeight: "800"
    },

    statMiniLabel: {
        color: "#64748b",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1.2px"
    },

    statLabel: {
        display: "block",
        color: "#94a3b8",
        fontSize: "12px",
        marginBottom: "7px",
        fontWeight: "550"
    },

    statValue: {
        display: "block",
        fontSize: "28px",
        lineHeight: "1",
        color: "#f8fafc",
        fontWeight: "780",
        letterSpacing: "-0.6px"
    },

    statAccentBlue: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "2px",
        background:
            "linear-gradient(90deg, #3b82f6, transparent)"
    },

    statAccentGreen: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "2px",
        background:
            "linear-gradient(90deg, #22c55e, transparent)"
    },

    statAccentAmber: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "2px",
        background:
            "linear-gradient(90deg, #f59e0b, transparent)"
    },

    statAccentPurple: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "2px",
        background:
            "linear-gradient(90deg, #8b5cf6, transparent)"
    },

    statAccentCyan: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "2px",
        background:
            "linear-gradient(90deg, #06b6d4, transparent)"
    },

    statAccentRose: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "2px",
        background:
            "linear-gradient(90deg, #f43f5e, transparent)"
    },

    // =========================================================
    // MAIN CARD
    // =========================================================

    card: {
        background:
            "linear-gradient(145deg, rgba(30, 41, 59, 0.94), rgba(15, 23, 42, 0.94))",
        border:
            "1px solid rgba(148, 163, 184, 0.13)",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "25px",
        boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.18)",
        backdropFilter: "blur(18px)"
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "15px",
        marginBottom: "20px"
    },

    sectionEyebrow: {
        color: "#60a5fa",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1.5px",
        marginBottom: "5px"
    },

    sectionTitle: {
        margin: 0,
        fontSize: "20px",
        fontWeight: "730",
        color: "#f8fafc",
        letterSpacing: "-0.3px"
    },

    applicationCount: {
        display: "inline-flex",
        alignItems: "baseline",
        gap: "5px",
        color: "#64748b",
        fontSize: "12px"
    },

    countNumber: {
        color: "#cbd5e1",
        fontSize: "16px",
        fontWeight: "750"
    },

    // =========================================================
    // TABLE
    // =========================================================

    tableWrapper: {
        width: "100%",
        overflowX: "auto",
        borderRadius: "11px",
        border:
            "1px solid rgba(148, 163, 184, 0.08)"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "1180px"
    },

    th: {
        padding: "14px 15px",
        textAlign: "left",
        background:
            "rgba(15, 23, 42, 0.88)",
        color: "#64748b",
        borderBottom:
            "1px solid rgba(148, 163, 184, 0.10)",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "0.8px",
        textTransform: "uppercase",
        whiteSpace: "nowrap"
    },

    tr: {
        borderBottom:
            "1px solid rgba(148, 163, 184, 0.08)"
    },

    td: {
        padding: "16px 15px",
        color: "#cbd5e1",
        verticalAlign: "middle",
        fontSize: "13px"
    },

    idBadge: {
        color: "#94a3b8",
        fontWeight: "700",
        fontSize: "12px"
    },

    jobCell: {
        display: "flex",
        flexDirection: "column",
        gap: "5px"
    },

    jobTitle: {
        color: "#e2e8f0",
        fontSize: "13px",
        fontWeight: "650"
    },

    jobId: {
        color: "#64748b",
        fontSize: "11px"
    },

    statusBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        borderRadius: "999px",
        fontSize: "10px",
        fontWeight: "800",
        whiteSpace: "nowrap"
    },

    statusDot: {
        width: "5px",
        height: "5px",
        borderRadius: "50%",
        backgroundColor: "currentColor"
    },

    questionCount: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "31px",
        height: "27px",
        padding: "0 8px",
        borderRadius: "8px",
        backgroundColor:
            "rgba(59, 130, 246, 0.09)",
        border:
            "1px solid rgba(59, 130, 246, 0.14)",
        color: "#93c5fd",
        fontWeight: "750",
        fontSize: "12px"
    },

    scorePill: {
        display: "inline-flex",
        alignItems: "baseline",
        gap: "1px",
        padding: "6px 9px",
        borderRadius: "8px"
    },

    scoreMax: {
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "650"
    },

    dateText: {
        color: "#94a3b8",
        fontSize: "11px",
        whiteSpace: "nowrap"
    },

    viewButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "7px",
        padding: "8px 12px",
        border: "1px solid rgba(96, 165, 250, 0.20)",
        borderRadius: "8px",
        background:
            "linear-gradient(135deg, rgba(37, 99, 235, 0.90), rgba(79, 70, 229, 0.90))",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "11px",
        boxShadow:
            "0 8px 20px rgba(37, 99, 235, 0.15)"
    },

    // =========================================================
    // EMPTY
    // =========================================================

    emptyState: {
        textAlign: "center",
        padding: "70px 20px",
        color: "#94a3b8"
    },

    emptyIcon: {
        width: "64px",
        height: "64px",
        margin: "0 auto 17px",
        borderRadius: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "27px",
        background:
            "rgba(59, 130, 246, 0.08)",
        border:
            "1px solid rgba(96, 165, 250, 0.12)"
    },

    emptyTitle: {
        margin: 0,
        color: "#e2e8f0",
        fontSize: "17px"
    },

    emptyText: {
        margin: "8px 0 0",
        color: "#64748b",
        fontSize: "13px"
    },

    // =========================================================
    // MODAL
    // =========================================================

    modalOverlay: {
        position: "fixed",
        inset: 0,
        backgroundColor:
            "rgba(2, 6, 23, 0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 1000,
        backdropFilter: "blur(10px)",
        boxSizing: "border-box"
    },

    modal: {
        width: "100%",
        maxWidth: "1050px",
        maxHeight: "92vh",
        overflowY: "auto",
        background:
            "linear-gradient(145deg, #1e293b, #0f172a)",
        border:
            "1px solid rgba(148, 163, 184, 0.16)",
        borderRadius: "20px",
        padding: "28px",
        boxSizing: "border-box",
        boxShadow:
            "0 35px 100px rgba(0, 0, 0, 0.55)"
    },

    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
        paddingBottom: "22px",
        borderBottom:
            "1px solid rgba(148, 163, 184, 0.10)",
        marginBottom: "20px"
    },

    modalHeaderContent: {
        display: "flex",
        alignItems: "center",
        gap: "14px"
    },

    modalIcon: {
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "21px",
        background:
            "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(124, 58, 237, 0.15))",
        border:
            "1px solid rgba(96, 165, 250, 0.17)"
    },

    modalEyebrow: {
        color: "#60a5fa",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1.4px",
        marginBottom: "4px"
    },

    modalTitle: {
        margin: 0,
        fontSize: "23px",
        fontWeight: "760",
        color: "#f8fafc"
    },

    modalSubtitle: {
        color: "#64748b",
        margin: "5px 0 0",
        fontSize: "12px"
    },

    closeButton: {
        width: "37px",
        height: "37px",
        flexShrink: 0,
        border:
            "1px solid rgba(148, 163, 184, 0.12)",
        borderRadius: "10px",
        backgroundColor:
            "rgba(15, 23, 42, 0.70)",
        color: "#94a3b8",
        cursor: "pointer",
        fontSize: "15px"
    },

    // =========================================================
    // MODAL SUMMARY
    // =========================================================

    modalSummary: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
        gap: "0",
        background:
            "rgba(15, 23, 42, 0.55)",
        border:
            "1px solid rgba(148, 163, 184, 0.09)",
        borderRadius: "13px",
        marginBottom: "20px",
        overflow: "hidden"
    },

    summaryItem: {
        padding: "15px 18px",
        display: "flex",
        flexDirection: "column",
        gap: "7px"
    },

    summaryDivider: {
        width: "1px",
        backgroundColor:
            "rgba(148, 163, 184, 0.08)",
        alignSelf: "stretch"
    },

    summaryLabel: {
        color: "#64748b",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1px"
    },

    summaryValue: {
        color: "#e2e8f0",
        fontSize: "18px",
        fontWeight: "750"
    },

    summaryScore: {
        fontSize: "18px"
    },

    // =========================================================
    // DETAIL GRID
    // =========================================================

    detailGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        gap: "12px"
    },

    detailBox: {
        background:
            "rgba(15, 23, 42, 0.55)",
        border:
            "1px solid rgba(148, 163, 184, 0.09)",
        borderRadius: "11px",
        padding: "15px",
        display: "flex",
        flexDirection: "column",
        gap: "7px"
    },

    detailLabel: {
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "750",
        textTransform: "uppercase",
        letterSpacing: "0.7px"
    },

    detailValue: {
        color: "#e2e8f0",
        fontSize: "13px",
        fontWeight: "600",
        lineHeight: "1.45"
    },

    // =========================================================
    // AI FEEDBACK
    // =========================================================

    feedbackBox: {
        background:
            "linear-gradient(135deg, rgba(59, 130, 246, 0.07), rgba(124, 58, 237, 0.07))",
        border:
            "1px solid rgba(96, 165, 250, 0.13)",
        borderRadius: "13px",
        padding: "19px",
        marginTop: "20px"
    },

    feedbackHeader: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        marginBottom: "13px"
    },

    feedbackIcon: {
        width: "34px",
        height: "34px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(124, 58, 237, 0.12)",
        color: "#a78bfa",
        fontSize: "15px"
    },

    feedbackEyebrow: {
        display: "block",
        color: "#818cf8",
        fontSize: "8px",
        fontWeight: "800",
        letterSpacing: "1.3px",
        marginBottom: "3px"
    },

    feedbackTitle: {
        margin: 0,
        color: "#e2e8f0",
        fontSize: "15px",
        fontWeight: "700"
    },

    feedbackText: {
        color: "#cbd5e1",
        lineHeight: "1.7",
        margin: 0,
        fontSize: "13px"
    },

    // =========================================================
    // QUESTIONS
    // =========================================================

    questionsSection: {
        marginTop: "26px"
    },

    questionsSectionHeader: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "15px",
        marginBottom: "15px"
    },

    questionsTitle: {
        margin: 0,
        color: "#f8fafc",
        fontSize: "19px",
        fontWeight: "730"
    },

    questionsCountBadge: {
        padding: "7px 10px",
        borderRadius: "8px",
        background:
            "rgba(59, 130, 246, 0.08)",
        border:
            "1px solid rgba(59, 130, 246, 0.13)",
        color: "#93c5fd",
        fontSize: "10px",
        fontWeight: "750"
    },

    questionCard: {
        background:
            "rgba(15, 23, 42, 0.62)",
        border:
            "1px solid rgba(148, 163, 184, 0.09)",
        borderRadius: "13px",
        padding: "18px",
        marginBottom: "12px"
    },

    questionHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "17px"
    },

    questionNumber: {
        width: "34px",
        height: "34px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg, rgba(59, 130, 246, 0.14), rgba(124, 58, 237, 0.14))",
        border:
            "1px solid rgba(96, 165, 250, 0.14)",
        color: "#93c5fd",
        fontSize: "11px",
        fontWeight: "800"
    },

    questionType: {
        backgroundColor:
            "rgba(100, 116, 139, 0.10)",
        color: "#94a3b8",
        border:
            "1px solid rgba(148, 163, 184, 0.10)",
        padding: "5px 9px",
        borderRadius: "999px",
        fontSize: "9px",
        fontWeight: "750",
        textTransform: "uppercase"
    },

    questionBlock: {
        marginBottom: "15px"
    },

    answerBlock: {
        background:
            "rgba(30, 41, 59, 0.50)",
        border:
            "1px solid rgba(148, 163, 184, 0.07)",
        borderRadius: "10px",
        padding: "13px",
        marginBottom: "15px"
    },

    questionLabel: {
        display: "block",
        color: "#64748b",
        fontSize: "9px",
        marginBottom: "7px",
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: "0.9px"
    },

    questionText: {
        color: "#e2e8f0",
        lineHeight: "1.6",
        margin: 0,
        fontSize: "13px"
    },

    answerText: {
        color: "#cbd5e1",
        lineHeight: "1.6",
        margin: 0,
        fontSize: "13px"
    },

    answerFooter: {
        borderTop:
            "1px solid rgba(148, 163, 184, 0.08)",
        paddingTop: "13px",
        display: "grid",
        gridTemplateColumns:
            "120px minmax(0, 1fr)",
        gap: "15px",
        color: "#cbd5e1",
        fontSize: "12px",
        lineHeight: "1.5"
    },

    questionScore: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },

    questionFeedback: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },

    footerLabel: {
        color: "#64748b",
        fontSize: "9px",
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: "0.7px"
    },

    feedbackValue: {
        color: "#cbd5e1",
        fontSize: "12px"
    },

    // =========================================================
    // DETAILS LOADING
    // =========================================================

    detailsLoading: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "40px"
    },

    smallSpinner: {
        width: "25px",
        height: "25px",
        borderRadius: "50%",
        border:
            "3px solid rgba(148, 163, 184, 0.18)",
        borderTopColor: "#60a5fa",
        marginBottom: "12px"
    },

    loadingText: {
        color: "#64748b",
        textAlign: "center",
        padding: "0",
        margin: 0,
        fontSize: "12px"
    },

    // =========================================================
    // NO QUESTIONS
    // =========================================================

    noQuestions: {
        background:
            "rgba(15, 23, 42, 0.55)",
        border:
            "1px solid rgba(148, 163, 184, 0.08)",
        borderRadius: "11px",
        padding: "35px 20px",
        textAlign: "center",
        color: "#64748b"
    },

    noQuestionsIcon: {
        fontSize: "27px",
        marginBottom: "10px"
    },

    noQuestionsTitle: {
        display: "block",
        color: "#cbd5e1",
        fontSize: "13px"
    },

    noQuestionsText: {
        margin: "6px 0 0",
        color: "#64748b",
        fontSize: "12px"
    },

    // =========================================================
    // MODAL FOOTER
    // =========================================================

    modalFooter: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "25px",
        paddingTop: "20px",
        borderTop:
            "1px solid rgba(148, 163, 184, 0.08)"
    },

    modalCloseButton: {
        padding: "10px 17px",
        border:
            "1px solid rgba(148, 163, 184, 0.12)",
        borderRadius: "9px",
        background:
            "rgba(51, 65, 85, 0.60)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: "650",
        fontSize: "12px"
    }
};

export default AdminInterviews;