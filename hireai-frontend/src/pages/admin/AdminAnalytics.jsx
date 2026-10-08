import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    BarChart3,
    CheckCircle2,
    ClipboardList,
    FileText,
    Mic2,
    Star,
    Trophy,
    XCircle,
    TrendingUp,
    Activity,
    Users,
    Target,
} from "lucide-react";

import api from "../../services/api";


function AdminAnalytics() {

    const navigate = useNavigate();

    const [statistics, setStatistics] = useState({
        total: 0,
        applied: 0,
        shortlisted: 0,
        interview: 0,
        hired: 0,
        rejected: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =========================================================
    // LOAD ANALYTICS
    // =========================================================

    useEffect(() => {

        let ignore = false;

        const loadAnalytics = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await api.get(
                    "/admin/applications/statistics"
                );

                console.log(
                    "Admin analytics:",
                    response.data
                );

                if (!ignore) {

                    setStatistics({

                        total:
                            response.data?.total ?? 0,

                        applied:
                            response.data?.applied ?? 0,

                        shortlisted:
                            response.data?.shortlisted ?? 0,

                        interview:
                            response.data?.interview ?? 0,

                        hired:
                            response.data?.hired ?? 0,

                        rejected:
                            response.data?.rejected ?? 0

                    });

                }

            } catch (err) {

                console.error(
                    "Failed to load analytics:",
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
                            "Access denied. Only administrators can view analytics."
                        );

                        return;
                    }


                    // =================================================
                    // OTHER ERROR
                    // =================================================

                    setError(
                        err.response?.data?.message ||
                        "Unable to load analytics."
                    );
                }

            } finally {

                if (!ignore) {

                    setLoading(false);

                }

            }

        };

        loadAnalytics();

        return () => {

            ignore = true;

        };

    }, [navigate]);


    // =========================================================
    // CALCULATE PERCENTAGE
    // =========================================================

    const getPercentage = (value) => {

        if (!statistics.total) {

            return 0;

        }

        return Math.round(
            (value / statistics.total) * 100
        );

    };


    // =========================================================
    // BACK
    // =========================================================

    const handleBack = () => {

        navigate("/admin/dashboard");

    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div style={styles.page}>

                <div style={styles.loadingGlowOne} />
                <div style={styles.loadingGlowTwo} />

                <div style={styles.centerMessage}>

                    <div style={styles.loadingIconWrapper}>
                        <BarChart3
                            size={34}
                            strokeWidth={1.8}
                        />
                    </div>

                    <h1 style={styles.loadingTitle}>
                        Admin Analytics
                    </h1>

                    <p style={styles.loadingText}>
                        Preparing your analytics dashboard...
                    </p>

                    <div style={styles.loadingBar}>
                        <div style={styles.loadingBarInner} />
                    </div>

                </div>

            </div>

        );

    }


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div style={styles.page}>

            {/* =====================================================
                BACKGROUND DECORATION
            ===================================================== */}

            <div style={styles.backgroundGlowTop} />
            <div style={styles.backgroundGlowBottom} />


            <main style={styles.container}>

                {/* =================================================
                    TOP NAVIGATION
                ================================================= */}

                <div style={styles.topBar}>

                    <button
                        onClick={handleBack}
                        style={styles.backButton}
                    >

                        <ArrowLeft size={17} />

                        <span>
                            Admin Dashboard
                        </span>

                    </button>

                    <div style={styles.topBadge}>

                        <BarChart3 size={15} />

                        <span>
                            Analytics
                        </span>

                    </div>

                </div>


                {/* =================================================
                    HEADER
                ================================================= */}

                <div style={styles.header}>

                    <div style={styles.headerLeft}>

                        <div style={styles.headerIcon}>

                            <BarChart3
                                size={30}
                                strokeWidth={1.8}
                            />

                        </div>

                        <div>

                            <div style={styles.eyebrow}>
                                HIREAI ADMINISTRATION
                            </div>

                            <h1 style={styles.heading}>
                                Application Analytics
                            </h1>

                            <p style={styles.subtitle}>
                                Monitor application performance,
                                hiring progress and recruitment
                                activity across HireAI.
                            </p>

                        </div>

                    </div>

                    <div style={styles.headerStatus}>

                        <div style={styles.statusDot} />

                        <span>
                            Live Statistics
                        </span>

                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div style={styles.errorBox}>

                        <div style={styles.errorIcon}>
                            <XCircle size={20} />
                        </div>

                        <div>

                            <strong style={styles.errorTitle}>
                                Unable to load analytics
                            </strong>

                            <p style={styles.errorMessage}>
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* =================================================
                    OVERVIEW SECTION
                ================================================= */}

                <section>

                    <div style={styles.sectionHeading}>

                        <div>

                            <h2 style={styles.sectionTitle}>
                                Overview
                            </h2>

                            <p style={styles.sectionSubtitle}>
                                Current application statistics
                            </p>

                        </div>

                    </div>


                    <div style={styles.statsGrid}>


                        {/* TOTAL APPLICATIONS */}

                        <div
                            style={{
                                ...styles.statCard,
                                ...styles.statCardPrimary
                            }}
                        >

                            <div style={styles.statCardTop}>

                                <div
                                    style={{
                                        ...styles.statIcon,
                                        background:
                                            "linear-gradient(135deg, #7c3aed, #a855f7)"
                                    }}
                                >
                                    <ClipboardList
                                        size={21}
                                    />
                                </div>

                                <div style={styles.statTrend}>
                                    <Activity size={13} />
                                    <span>Overview</span>
                                </div>

                            </div>

                            <span style={styles.statLabel}>
                                Total Applications
                            </span>

                            <strong style={styles.statValue}>
                                {statistics.total}
                            </strong>

                            <p style={styles.statDescription}>
                                Applications received across all
                                available positions.
                            </p>

                        </div>


                        {/* APPLIED */}

                        <div style={styles.statCard}>

                            <div style={styles.statCardTop}>

                                <div
                                    style={{
                                        ...styles.statIcon,
                                        background:
                                            "linear-gradient(135deg, #2563eb, #3b82f6)"
                                    }}
                                >
                                    <FileText size={21} />
                                </div>

                            </div>

                            <span style={styles.statLabel}>
                                Applied
                            </span>

                            <strong style={styles.statValue}>
                                {statistics.applied}
                            </strong>

                            <div style={styles.miniProgressBackground}>

                                <div
                                    style={{
                                        ...styles.miniProgress,
                                        width: `${getPercentage(
                                            statistics.applied
                                        )}%`,
                                        background:
                                            "linear-gradient(90deg, #2563eb, #60a5fa)"
                                    }}
                                />

                            </div>

                            <span style={styles.miniPercentage}>
                                {getPercentage(
                                    statistics.applied
                                )}% of total applications
                            </span>

                        </div>


                        {/* SHORTLISTED */}

                        <div style={styles.statCard}>

                            <div style={styles.statCardTop}>

                                <div
                                    style={{
                                        ...styles.statIcon,
                                        background:
                                            "linear-gradient(135deg, #b45309, #f59e0b)"
                                    }}
                                >
                                    <Star size={21} />
                                </div>

                            </div>

                            <span style={styles.statLabel}>
                                Shortlisted
                            </span>

                            <strong style={styles.statValue}>
                                {statistics.shortlisted}
                            </strong>

                            <div style={styles.miniProgressBackground}>

                                <div
                                    style={{
                                        ...styles.miniProgress,
                                        width: `${getPercentage(
                                            statistics.shortlisted
                                        )}%`,
                                        background:
                                            "linear-gradient(90deg, #d97706, #fbbf24)"
                                    }}
                                />

                            </div>

                            <span style={styles.miniPercentage}>
                                {getPercentage(
                                    statistics.shortlisted
                                )}% of total applications
                            </span>

                        </div>


                        {/* INTERVIEWS */}

                        <div style={styles.statCard}>

                            <div style={styles.statCardTop}>

                                <div
                                    style={{
                                        ...styles.statIcon,
                                        background:
                                            "linear-gradient(135deg, #6d28d9, #8b5cf6)"
                                    }}
                                >
                                    <Mic2 size={21} />
                                </div>

                            </div>

                            <span style={styles.statLabel}>
                                Interviews
                            </span>

                            <strong style={styles.statValue}>
                                {statistics.interview}
                            </strong>

                            <div style={styles.miniProgressBackground}>

                                <div
                                    style={{
                                        ...styles.miniProgress,
                                        width: `${getPercentage(
                                            statistics.interview
                                        )}%`,
                                        background:
                                            "linear-gradient(90deg, #7c3aed, #a78bfa)"
                                    }}
                                />

                            </div>

                            <span style={styles.miniPercentage}>
                                {getPercentage(
                                    statistics.interview
                                )}% of total applications
                            </span>

                        </div>


                        {/* HIRED */}

                        <div style={styles.statCard}>

                            <div style={styles.statCardTop}>

                                <div
                                    style={{
                                        ...styles.statIcon,
                                        background:
                                            "linear-gradient(135deg, #047857, #10b981)"
                                    }}
                                >
                                    <Trophy size={21} />
                                </div>

                            </div>

                            <span style={styles.statLabel}>
                                Hired
                            </span>

                            <strong style={styles.statValue}>
                                {statistics.hired}
                            </strong>

                            <div style={styles.miniProgressBackground}>

                                <div
                                    style={{
                                        ...styles.miniProgress,
                                        width: `${getPercentage(
                                            statistics.hired
                                        )}%`,
                                        background:
                                            "linear-gradient(90deg, #059669, #34d399)"
                                    }}
                                />

                            </div>

                            <span style={styles.miniPercentage}>
                                {getPercentage(
                                    statistics.hired
                                )}% of total applications
                            </span>

                        </div>


                        {/* REJECTED */}

                        <div style={styles.statCard}>

                            <div style={styles.statCardTop}>

                                <div
                                    style={{
                                        ...styles.statIcon,
                                        background:
                                            "linear-gradient(135deg, #b91c1c, #ef4444)"
                                    }}
                                >
                                    <XCircle size={21} />
                                </div>

                            </div>

                            <span style={styles.statLabel}>
                                Rejected
                            </span>

                            <strong style={styles.statValue}>
                                {statistics.rejected}
                            </strong>

                            <div style={styles.miniProgressBackground}>

                                <div
                                    style={{
                                        ...styles.miniProgress,
                                        width: `${getPercentage(
                                            statistics.rejected
                                        )}%`,
                                        background:
                                            "linear-gradient(90deg, #dc2626, #f87171)"
                                    }}
                                />

                            </div>

                            <span style={styles.miniPercentage}>
                                {getPercentage(
                                    statistics.rejected
                                )}% of total applications
                            </span>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    APPLICATION PIPELINE
                ================================================= */}

                <section style={styles.card}>

                    <div style={styles.cardHeader}>

                        <div style={styles.cardTitleArea}>

                            <div style={styles.cardIcon}>

                                <TrendingUp
                                    size={20}
                                />

                            </div>

                            <div>

                                <h2 style={styles.sectionTitle}>
                                    Application Pipeline
                                </h2>

                                <p style={styles.sectionSubtitle}>
                                    Current distribution of applications
                                    across hiring stages.
                                </p>

                            </div>

                        </div>

                        <div style={styles.totalPill}>

                            <Users size={14} />

                            <span>
                                {statistics.total} Total
                            </span>

                        </div>

                    </div>


                    <div style={styles.pipelineContainer}>


                        {/* APPLIED */}

                        <div style={styles.progressRow}>

                            <div style={styles.progressHeader}>

                                <div style={styles.progressName}>

                                    <span
                                        style={{
                                            ...styles.progressDot,
                                            backgroundColor: "#3b82f6"
                                        }}
                                    />

                                    <span>
                                        Applied
                                    </span>

                                </div>

                                <strong>
                                    {statistics.applied}
                                    {" "}
                                    <span style={styles.progressPercent}>
                                        ({getPercentage(
                                            statistics.applied
                                        )}%)
                                    </span>
                                </strong>

                            </div>

                            <div style={styles.progressBackground}>

                                <div
                                    style={{
                                        ...styles.progressBar,
                                        width: `${getPercentage(
                                            statistics.applied
                                        )}%`,
                                        background:
                                            "linear-gradient(90deg, #2563eb, #60a5fa)"
                                    }}
                                />

                            </div>

                        </div>


                        {/* SHORTLISTED */}

                        <div style={styles.progressRow}>

                            <div style={styles.progressHeader}>

                                <div style={styles.progressName}>

                                    <span
                                        style={{
                                            ...styles.progressDot,
                                            backgroundColor: "#f59e0b"
                                        }}
                                    />

                                    <span>
                                        Shortlisted
                                    </span>

                                </div>

                                <strong>
                                    {statistics.shortlisted}
                                    {" "}
                                    <span style={styles.progressPercent}>
                                        ({getPercentage(
                                            statistics.shortlisted
                                        )}%)
                                    </span>
                                </strong>

                            </div>

                            <div style={styles.progressBackground}>

                                <div
                                    style={{
                                        ...styles.progressBar,
                                        width: `${getPercentage(
                                            statistics.shortlisted
                                        )}%`,
                                        background:
                                            "linear-gradient(90deg, #d97706, #fbbf24)"
                                    }}
                                />

                            </div>

                        </div>


                        {/* INTERVIEW */}

                        <div style={styles.progressRow}>

                            <div style={styles.progressHeader}>

                                <div style={styles.progressName}>

                                    <span
                                        style={{
                                            ...styles.progressDot,
                                            backgroundColor: "#8b5cf6"
                                        }}
                                    />

                                    <span>
                                        Interview
                                    </span>

                                </div>

                                <strong>
                                    {statistics.interview}
                                    {" "}
                                    <span style={styles.progressPercent}>
                                        ({getPercentage(
                                            statistics.interview
                                        )}%)
                                    </span>
                                </strong>

                            </div>

                            <div style={styles.progressBackground}>

                                <div
                                    style={{
                                        ...styles.progressBar,
                                        width: `${getPercentage(
                                            statistics.interview
                                        )}%`,
                                        background:
                                            "linear-gradient(90deg, #7c3aed, #a78bfa)"
                                    }}
                                />

                            </div>

                        </div>


                        {/* HIRED */}

                        <div style={styles.progressRow}>

                            <div style={styles.progressHeader}>

                                <div style={styles.progressName}>

                                    <span
                                        style={{
                                            ...styles.progressDot,
                                            backgroundColor: "#10b981"
                                        }}
                                    />

                                    <span>
                                        Hired
                                    </span>

                                </div>

                                <strong>
                                    {statistics.hired}
                                    {" "}
                                    <span style={styles.progressPercent}>
                                        ({getPercentage(
                                            statistics.hired
                                        )}%)
                                    </span>
                                </strong>

                            </div>

                            <div style={styles.progressBackground}>

                                <div
                                    style={{
                                        ...styles.progressBar,
                                        width: `${getPercentage(
                                            statistics.hired
                                        )}%`,
                                        background:
                                            "linear-gradient(90deg, #059669, #34d399)"
                                    }}
                                />

                            </div>

                        </div>


                        {/* REJECTED */}

                        <div
                            style={{
                                ...styles.progressRow,
                                marginBottom: 0
                            }}
                        >

                            <div style={styles.progressHeader}>

                                <div style={styles.progressName}>

                                    <span
                                        style={{
                                            ...styles.progressDot,
                                            backgroundColor: "#ef4444"
                                        }}
                                    />

                                    <span>
                                        Rejected
                                    </span>

                                </div>

                                <strong>
                                    {statistics.rejected}
                                    {" "}
                                    <span style={styles.progressPercent}>
                                        ({getPercentage(
                                            statistics.rejected
                                        )}%)
                                    </span>
                                </strong>

                            </div>

                            <div style={styles.progressBackground}>

                                <div
                                    style={{
                                        ...styles.progressBar,
                                        width: `${getPercentage(
                                            statistics.rejected
                                        )}%`,
                                        background:
                                            "linear-gradient(90deg, #dc2626, #f87171)"
                                    }}
                                />

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    PERFORMANCE SUMMARY
                ================================================= */}

                <section>

                    <div style={styles.sectionHeading}>

                        <div>

                            <h2 style={styles.sectionTitle}>
                                Performance Summary
                            </h2>

                            <p style={styles.sectionSubtitle}>
                                Key recruitment performance indicators.
                            </p>

                        </div>

                    </div>


                    <div style={styles.summaryGrid}>


                        {/* HIRING SUCCESS */}

                        <div style={styles.summaryCard}>

                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    background:
                                        "linear-gradient(135deg, #047857, #10b981)"
                                }}
                            >
                                <Trophy size={20} />
                            </div>

                            <span style={styles.summaryLabel}>
                                Hiring Success
                            </span>

                            <strong style={styles.summaryValue}>
                                {getPercentage(
                                    statistics.hired
                                )}%
                            </strong>

                            <p style={styles.summaryText}>
                                Percentage of total applications
                                that resulted in a hire.
                            </p>

                        </div>


                        {/* INTERVIEW RATE */}

                        <div style={styles.summaryCard}>

                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    background:
                                        "linear-gradient(135deg, #6d28d9, #8b5cf6)"
                                }}
                            >
                                <Mic2 size={20} />
                            </div>

                            <span style={styles.summaryLabel}>
                                Interview Rate
                            </span>

                            <strong style={styles.summaryValue}>
                                {getPercentage(
                                    statistics.interview
                                )}%
                            </strong>

                            <p style={styles.summaryText}>
                                Percentage of applications
                                currently at interview stage.
                            </p>

                        </div>


                        {/* REJECTION RATE */}

                        <div style={styles.summaryCard}>

                            <div
                                style={{
                                    ...styles.summaryIcon,
                                    background:
                                        "linear-gradient(135deg, #b91c1c, #ef4444)"
                                }}
                            >
                                <XCircle size={20} />
                            </div>

                            <span style={styles.summaryLabel}>
                                Rejection Rate
                            </span>

                            <strong style={styles.summaryValue}>
                                {getPercentage(
                                    statistics.rejected
                                )}%
                            </strong>

                            <p style={styles.summaryText}>
                                Percentage of applications
                                that were rejected.
                            </p>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    STATUS BREAKDOWN
                ================================================= */}

                <section style={styles.card}>

                    <div style={styles.cardHeader}>

                        <div style={styles.cardTitleArea}>

                            <div style={styles.cardIcon}>

                                <Target size={20} />

                            </div>

                            <div>

                                <h2 style={styles.sectionTitle}>
                                    Status Breakdown
                                </h2>

                                <p style={styles.sectionSubtitle}>
                                    Application count by current status.
                                </p>

                            </div>

                        </div>

                    </div>


                    <div style={styles.breakdownGrid}>


                        {/* APPLIED */}

                        <div
                            style={{
                                ...styles.breakdownItem,
                                borderTop:
                                    "3px solid #3b82f6"
                            }}
                        >

                            <div style={styles.breakdownTop}>

                                <span style={styles.breakdownLabel}>
                                    APPLIED
                                </span>

                                <FileText
                                    size={17}
                                    color="#60a5fa"
                                />

                            </div>

                            <strong style={styles.breakdownValue}>
                                {statistics.applied}
                            </strong>

                            <span style={styles.breakdownPercentage}>
                                {getPercentage(
                                    statistics.applied
                                )}% of total
                            </span>

                        </div>


                        {/* SHORTLISTED */}

                        <div
                            style={{
                                ...styles.breakdownItem,
                                borderTop:
                                    "3px solid #f59e0b"
                            }}
                        >

                            <div style={styles.breakdownTop}>

                                <span style={styles.breakdownLabel}>
                                    SHORTLISTED
                                </span>

                                <Star
                                    size={17}
                                    color="#fbbf24"
                                />

                            </div>

                            <strong style={styles.breakdownValue}>
                                {statistics.shortlisted}
                            </strong>

                            <span style={styles.breakdownPercentage}>
                                {getPercentage(
                                    statistics.shortlisted
                                )}% of total
                            </span>

                        </div>


                        {/* INTERVIEW */}

                        <div
                            style={{
                                ...styles.breakdownItem,
                                borderTop:
                                    "3px solid #8b5cf6"
                            }}
                        >

                            <div style={styles.breakdownTop}>

                                <span style={styles.breakdownLabel}>
                                    INTERVIEW
                                </span>

                                <Mic2
                                    size={17}
                                    color="#a78bfa"
                                />

                            </div>

                            <strong style={styles.breakdownValue}>
                                {statistics.interview}
                            </strong>

                            <span style={styles.breakdownPercentage}>
                                {getPercentage(
                                    statistics.interview
                                )}% of total
                            </span>

                        </div>


                        {/* HIRED */}

                        <div
                            style={{
                                ...styles.breakdownItem,
                                borderTop:
                                    "3px solid #10b981"
                            }}
                        >

                            <div style={styles.breakdownTop}>

                                <span style={styles.breakdownLabel}>
                                    HIRED
                                </span>

                                <CheckCircle2
                                    size={17}
                                    color="#34d399"
                                />

                            </div>

                            <strong style={styles.breakdownValue}>
                                {statistics.hired}
                            </strong>

                            <span style={styles.breakdownPercentage}>
                                {getPercentage(
                                    statistics.hired
                                )}% of total
                            </span>

                        </div>


                        {/* REJECTED */}

                        <div
                            style={{
                                ...styles.breakdownItem,
                                borderTop:
                                    "3px solid #ef4444"
                            }}
                        >

                            <div style={styles.breakdownTop}>

                                <span style={styles.breakdownLabel}>
                                    REJECTED
                                </span>

                                <XCircle
                                    size={17}
                                    color="#f87171"
                                />

                            </div>

                            <strong style={styles.breakdownValue}>
                                {statistics.rejected}
                            </strong>

                            <span style={styles.breakdownPercentage}>
                                {getPercentage(
                                    statistics.rejected
                                )}% of total
                            </span>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    FOOTER INSIGHT
                ================================================= */}

                <div style={styles.insightCard}>

                    <div style={styles.insightIcon}>

                        <BarChart3 size={22} />

                    </div>

                    <div>

                        <strong style={styles.insightTitle}>
                            Recruitment Overview
                        </strong>

                        <p style={styles.insightText}>
                            HireAI is currently tracking{" "}
                            <strong>
                                {statistics.total}
                            </strong>{" "}
                            total applications across the
                            recruitment pipeline.
                        </p>

                    </div>

                </div>

            </main>

        </div>

    );
}


// =============================================================
// PREMIUM STYLES
// =============================================================

const styles = {

    // =========================================================
    // PAGE
    // =========================================================

    page: {
        minHeight: "100vh",
        background:
            "radial-gradient(circle at 10% 0%, rgba(124,58,237,0.12), transparent 28%), radial-gradient(circle at 90% 10%, rgba(190,24,93,0.10), transparent 25%), #090d18",
        color: "#f8fafc",
        fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "32px 0 60px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden"
    },


    // =========================================================
    // BACKGROUND GLOWS
    // =========================================================

    backgroundGlowTop: {
        position: "fixed",
        width: "420px",
        height: "420px",
        borderRadius: "50%",
        background:
            "rgba(124, 58, 237, 0.07)",
        filter: "blur(100px)",
        top: "-180px",
        right: "-120px",
        pointerEvents: "none"
    },


    backgroundGlowBottom: {
        position: "fixed",
        width: "380px",
        height: "380px",
        borderRadius: "50%",
        background:
            "rgba(190, 24, 93, 0.055)",
        filter: "blur(100px)",
        bottom: "-180px",
        left: "-120px",
        pointerEvents: "none"
    },


    loadingGlowOne: {
        position: "fixed",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background:
            "rgba(124, 58, 237, 0.10)",
        filter: "blur(100px)",
        top: "-150px",
        right: "-100px"
    },


    loadingGlowTwo: {
        position: "fixed",
        width: "350px",
        height: "350px",
        borderRadius: "50%",
        background:
            "rgba(190, 24, 93, 0.08)",
        filter: "blur(100px)",
        bottom: "-120px",
        left: "-100px"
    },


    // =========================================================
    // CONTAINER
    // =========================================================

    container: {
        width: "100%",
        maxWidth: "1380px",
        margin: "0 auto",
        padding: "0 32px",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 1
    },


    // =========================================================
    // TOP BAR
    // =========================================================

    topBar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "35px"
    },


    backButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        padding: "10px 16px",
        border: "1px solid rgba(148,163,184,0.15)",
        borderRadius: "10px",
        background:
            "rgba(15, 23, 42, 0.75)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
        boxShadow:
            "0 8px 25px rgba(0,0,0,0.16)",
        backdropFilter: "blur(14px)"
    },


    topBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "8px 13px",
        borderRadius: "999px",
        background:
            "rgba(124,58,237,0.10)",
        border:
            "1px solid rgba(139,92,246,0.22)",
        color: "#c4b5fd",
        fontSize: "12px",
        fontWeight: "600"
    },


    // =========================================================
    // HEADER
    // =========================================================

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "25px",
        marginBottom: "38px",
        padding:
            "30px 32px",
        borderRadius: "20px",
        border:
            "1px solid rgba(148,163,184,0.12)",
        background:
            "linear-gradient(135deg, rgba(30,41,59,0.72), rgba(15,23,42,0.72))",
        boxShadow:
            "0 25px 70px rgba(0,0,0,0.24)",
        backdropFilter: "blur(18px)"
    },


    headerLeft: {
        display: "flex",
        alignItems: "flex-start",
        gap: "18px"
    },


    headerIcon: {
        width: "58px",
        height: "58px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "15px",
        color: "#ddd6fe",
        background:
            "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(190,24,93,0.82))",
        boxShadow:
            "0 12px 35px rgba(124,58,237,0.28)"
    },


    eyebrow: {
        color: "#a78bfa",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "1.8px",
        marginBottom: "7px"
    },


    heading: {
        margin: 0,
        fontSize: "32px",
        lineHeight: "1.2",
        fontWeight: "750",
        letterSpacing: "-0.7px",
        color: "#f8fafc"
    },


    subtitle: {
        margin:
            "9px 0 0",
        maxWidth: "700px",
        color: "#94a3b8",
        fontSize: "14px",
        lineHeight: "1.65"
    },


    headerStatus: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "9px 13px",
        borderRadius: "999px",
        background:
            "rgba(16,185,129,0.08)",
        border:
            "1px solid rgba(16,185,129,0.18)",
        color: "#86efac",
        fontSize: "12px",
        fontWeight: "600",
        whiteSpace: "nowrap"
    },


    statusDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        backgroundColor: "#34d399",
        boxShadow:
            "0 0 10px rgba(52,211,153,0.75)"
    },


    // =========================================================
    // ERROR
    // =========================================================

    errorBox: {
        display: "flex",
        alignItems: "flex-start",
        gap: "13px",
        padding: "16px 18px",
        marginBottom: "25px",
        borderRadius: "14px",
        background:
            "rgba(127,29,29,0.22)",
        border:
            "1px solid rgba(248,113,113,0.25)",
        color: "#fecaca"
    },


    errorIcon: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#f87171"
    },


    errorTitle: {
        display: "block",
        color: "#fca5a5",
        fontSize: "14px",
        marginBottom: "4px"
    },


    errorMessage: {
        margin: 0,
        color: "#fca5a5",
        fontSize: "13px",
        lineHeight: "1.5"
    },


    // =========================================================
    // SECTION
    // =========================================================

    sectionHeading: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "17px"
    },


    sectionTitle: {
        margin: 0,
        color: "#f8fafc",
        fontSize: "20px",
        fontWeight: "700",
        letterSpacing: "-0.2px"
    },


    sectionSubtitle: {
        margin:
            "6px 0 0",
        color: "#64748b",
        fontSize: "13px",
        lineHeight: "1.5"
    },


    // =========================================================
    // STATISTICS
    // =========================================================

    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(205px, 1fr))",
        gap: "15px",
        marginBottom: "32px"
    },


    statCard: {
        minHeight: "195px",
        padding: "21px",
        borderRadius: "17px",
        border:
            "1px solid rgba(148,163,184,0.11)",
        background:
            "linear-gradient(145deg, rgba(30,41,59,0.78), rgba(15,23,42,0.86))",
        boxShadow:
            "0 15px 40px rgba(0,0,0,0.18)",
        boxSizing: "border-box",
        transition:
            "transform 0.2s ease, border-color 0.2s ease"
    },


    statCardPrimary: {
        background:
            "linear-gradient(145deg, rgba(49,46,129,0.40), rgba(30,41,59,0.85))",
        border:
            "1px solid rgba(139,92,246,0.22)"
    },


    statCardTop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "19px"
    },


    statIcon: {
        width: "43px",
        height: "43px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        color: "#fff",
        boxShadow:
            "0 8px 22px rgba(0,0,0,0.2)"
    },


    statTrend: {
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.7px"
    },


    statLabel: {
        display: "block",
        color: "#94a3b8",
        fontSize: "12px",
        fontWeight: "600",
        marginBottom: "5px"
    },


    statValue: {
        display: "block",
        color: "#f8fafc",
        fontSize: "30px",
        lineHeight: "1.15",
        fontWeight: "750",
        letterSpacing: "-0.7px"
    },


    statDescription: {
        margin:
            "9px 0 0",
        color: "#64748b",
        fontSize: "11px",
        lineHeight: "1.5"
    },


    miniProgressBackground: {
        width: "100%",
        height: "5px",
        marginTop: "17px",
        backgroundColor: "rgba(51,65,85,0.75)",
        borderRadius: "999px",
        overflow: "hidden"
    },


    miniProgress: {
        height: "100%",
        borderRadius: "999px",
        transition:
            "width 0.5s ease"
    },


    miniPercentage: {
        display: "block",
        marginTop: "8px",
        color: "#64748b",
        fontSize: "10px"
    },


    // =========================================================
    // CARD
    // =========================================================

    card: {
        padding: "27px",
        marginBottom: "30px",
        borderRadius: "18px",
        border:
            "1px solid rgba(148,163,184,0.11)",
        background:
            "linear-gradient(145deg, rgba(30,41,59,0.76), rgba(15,23,42,0.86))",
        boxShadow:
            "0 20px 55px rgba(0,0,0,0.20)",
        backdropFilter: "blur(18px)",
        boxSizing: "border-box"
    },


    cardHeader: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "20px",
        marginBottom: "28px"
    },


    cardTitleArea: {
        display: "flex",
        alignItems: "flex-start",
        gap: "13px"
    },


    cardIcon: {
        width: "39px",
        height: "39px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "11px",
        color: "#c4b5fd",
        background:
            "rgba(124,58,237,0.13)",
        border:
            "1px solid rgba(139,92,246,0.18)"
    },


    totalPill: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 11px",
        borderRadius: "999px",
        background:
            "rgba(51,65,85,0.35)",
        border:
            "1px solid rgba(148,163,184,0.10)",
        color: "#94a3b8",
        fontSize: "11px",
        fontWeight: "600",
        whiteSpace: "nowrap"
    },


    // =========================================================
    // PIPELINE
    // =========================================================

    pipelineContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "23px"
    },


    progressRow: {
        width: "100%"
    },


    progressHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "15px",
        marginBottom: "9px",
        color: "#e2e8f0",
        fontSize: "13px"
    },


    progressName: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        fontWeight: "600"
    },


    progressDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        boxShadow:
            "0 0 8px rgba(255,255,255,0.10)"
    },


    progressPercent: {
        color: "#64748b",
        fontWeight: "500"
    },


    progressBackground: {
        width: "100%",
        height: "9px",
        background:
            "rgba(15,23,42,0.85)",
        border:
            "1px solid rgba(148,163,184,0.08)",
        borderRadius: "999px",
        overflow: "hidden"
    },


    progressBar: {
        height: "100%",
        minWidth: "0",
        borderRadius: "999px",
        transition:
            "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow:
            "0 0 14px rgba(124,58,237,0.12)"
    },


    // =========================================================
    // SUMMARY
    // =========================================================

    summaryGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "15px",
        marginBottom: "30px"
    },


    summaryCard: {
        padding: "24px",
        borderRadius: "17px",
        border:
            "1px solid rgba(148,163,184,0.11)",
        background:
            "linear-gradient(145deg, rgba(30,41,59,0.72), rgba(15,23,42,0.88))",
        boxShadow:
            "0 15px 40px rgba(0,0,0,0.16)"
    },


    summaryIcon: {
        width: "42px",
        height: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        color: "#fff",
        marginBottom: "18px",
        boxShadow:
            "0 8px 20px rgba(0,0,0,0.20)"
    },


    summaryLabel: {
        display: "block",
        color: "#94a3b8",
        fontSize: "12px",
        fontWeight: "600",
        marginBottom: "6px"
    },


    summaryValue: {
        display: "block",
        color: "#f8fafc",
        fontSize: "34px",
        lineHeight: "1.1",
        fontWeight: "750",
        letterSpacing: "-1px"
    },


    summaryText: {
        color: "#64748b",
        fontSize: "12px",
        lineHeight: "1.6",
        margin:
            "9px 0 0"
    },


    // =========================================================
    // BREAKDOWN
    // =========================================================

    breakdownGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(170px, 1fr))",
        gap: "12px"
    },


    breakdownItem: {
        minHeight: "125px",
        padding: "18px",
        background:
            "rgba(9,13,24,0.65)",
        borderRight:
            "1px solid rgba(148,163,184,0.08)",
        borderBottom:
            "1px solid rgba(148,163,184,0.08)",
        borderLeft:
            "1px solid rgba(148,163,184,0.08)",
        borderRadius: "10px",
        boxSizing: "border-box"
    },


    breakdownTop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "15px"
    },


    breakdownLabel: {
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1px"
    },


    breakdownValue: {
        display: "block",
        color: "#f8fafc",
        fontSize: "27px",
        lineHeight: "1.1",
        fontWeight: "750"
    },


    breakdownPercentage: {
        display: "block",
        marginTop: "6px",
        color: "#475569",
        fontSize: "10px"
    },


    // =========================================================
    // INSIGHT
    // =========================================================

    insightCard: {
        display: "flex",
        alignItems: "flex-start",
        gap: "15px",
        padding: "20px 22px",
        marginTop: "5px",
        borderRadius: "15px",
        background:
            "linear-gradient(135deg, rgba(124,58,237,0.11), rgba(190,24,93,0.07))",
        border:
            "1px solid rgba(139,92,246,0.16)"
    },


    insightIcon: {
        width: "42px",
        height: "42px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "11px",
        color: "#c4b5fd",
        background:
            "rgba(124,58,237,0.15)"
    },


    insightTitle: {
        display: "block",
        color: "#ddd6fe",
        fontSize: "13px",
        marginBottom: "5px"
    },


    insightText: {
        margin: 0,
        color: "#94a3b8",
        fontSize: "12px",
        lineHeight: "1.6"
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


    loadingIconWrapper: {
        width: "70px",
        height: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "20px",
        color: "#c4b5fd",
        background:
            "linear-gradient(135deg, rgba(124,58,237,0.20), rgba(190,24,93,0.12))",
        border:
            "1px solid rgba(139,92,246,0.22)",
        boxShadow:
            "0 15px 45px rgba(124,58,237,0.18)",
        marginBottom: "20px"
    },


    loadingTitle: {
        margin: 0,
        color: "#f8fafc",
        fontSize: "24px",
        fontWeight: "700"
    },


    loadingText: {
        margin:
            "8px 0 20px",
        color: "#64748b",
        fontSize: "13px"
    },


    loadingBar: {
        width: "180px",
        height: "4px",
        background:
            "rgba(51,65,85,0.7)",
        borderRadius: "999px",
        overflow: "hidden"
    },


    loadingBarInner: {
        width: "55%",
        height: "100%",
        borderRadius: "999px",
        background:
            "linear-gradient(90deg, #7c3aed, #c026d3)",
        animation:
            "analyticsLoading 1.3s ease-in-out infinite"
    }

};


export default AdminAnalytics;