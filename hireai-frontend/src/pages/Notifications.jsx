import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Notifications() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // ROLE-BASED DASHBOARD NAVIGATION
    // =========================================================

    const handleBackToDashboard = () => {
        const role = localStorage.getItem("role");

        switch (role?.toUpperCase()) {
            case "HR":
                navigate("/hr/dashboard");
                break;

            case "ADMIN":
                navigate("/admin/dashboard");
                break;

            case "CANDIDATE":
                // Correct Candidate Dashboard route
                navigate("/dashboard");
                break;

            default:
                // Safe fallback if role is missing/invalid
                navigate("/dashboard");
                break;
        }
    };

    // =========================================================
    // LOAD NOTIFICATIONS
    // =========================================================

    useEffect(() => {
        let mounted = true;

        const fetchNotifications = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    "/notifications/my"
                );

                if (!mounted) {
                    return;
                }

                setNotifications(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

                setError("");
            } catch (err) {
                console.error(
                    "Failed to load notifications:",
                    err
                );

                if (!mounted) {
                    return;
                }

                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    navigate("/login");
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    "Failed to load notifications."
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchNotifications();

        return () => {
            mounted = false;
        };
    }, [navigate]);

    // =========================================================
    // RETRY
    // =========================================================

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/notifications/my"
            );

            setNotifications(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load notifications:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load notifications."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // MARK ONE AS READ
    // =========================================================

    const markAsRead = async (id) => {
        try {
            await api.patch(
                `/notifications/${id}/read`
            );

            setNotifications((previous) =>
                previous.map((notification) =>
                    notification.id === id
                        ? {
                            ...notification,
                            isRead: true,
                        }
                        : notification
                )
            );
        } catch (err) {
            console.error(
                "Failed to mark notification as read:",
                err
            );
        }
    };

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    const markAllAsRead = async () => {
        try {
            await api.patch(
                "/notifications/read-all"
            );

            setNotifications((previous) =>
                previous.map((notification) => ({
                    ...notification,
                    isRead: true,
                }))
            );
        } catch (err) {
            console.error(
                "Failed to mark all notifications as read:",
                err
            );
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
    // FORMAT DATE
    // =========================================================

    const formatDate = (createdAt) => {
        if (!createdAt) {
            return "Recently";
        }

        const date = new Date(createdAt);

        if (Number.isNaN(date.getTime())) {
            return "Recently";
        }

        return date.toLocaleString();
    };

    // =========================================================
    // GET NOTIFICATION CONFIG
    // =========================================================

    const getNotificationConfig = (type) => {
        switch (type) {
            case "APPLICATION_SUBMITTED":
                return {
                    icon: "✉",
                    label: "Application",
                    background:
                        "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(79,70,229,0.08))",
                    color: "#a5b4fc",
                    border:
                        "rgba(129,140,248,0.22)",
                    glow:
                        "rgba(99,102,241,0.15)",
                };

            case "APPLICATION_SHORTLISTED":
                return {
                    icon: "★",
                    label: "Shortlisted",
                    background:
                        "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(217,119,6,0.07))",
                    color: "#fcd34d",
                    border:
                        "rgba(251,191,36,0.22)",
                    glow:
                        "rgba(245,158,11,0.12)",
                };

            case "INTERVIEW_SCHEDULED":
                return {
                    icon: "◷",
                    label: "Interview",
                    background:
                        "linear-gradient(135deg, rgba(34,211,238,0.16), rgba(6,182,212,0.07))",
                    color: "#67e8f9",
                    border:
                        "rgba(34,211,238,0.22)",
                    glow:
                        "rgba(34,211,238,0.12)",
                };

            case "INTERVIEW_COMPLETED":
                return {
                    icon: "✓",
                    label: "Completed",
                    background:
                        "linear-gradient(135deg, rgba(16,185,129,0.17), rgba(5,150,105,0.07))",
                    color: "#6ee7b7",
                    border:
                        "rgba(52,211,153,0.22)",
                    glow:
                        "rgba(52,211,153,0.12)",
                };

            case "APPLICATION_SELECTED":
                return {
                    icon: "✦",
                    label: "Selected",
                    background:
                        "linear-gradient(135deg, rgba(139,92,246,0.19), rgba(124,58,237,0.07))",
                    color: "#c4b5fd",
                    border:
                        "rgba(167,139,250,0.24)",
                    glow:
                        "rgba(139,92,246,0.14)",
                };

            case "APPLICATION_REJECTED":
                return {
                    icon: "×",
                    label: "Application",
                    background:
                        "linear-gradient(135deg, rgba(239,68,68,0.16), rgba(185,28,28,0.06))",
                    color: "#fda4af",
                    border:
                        "rgba(248,113,113,0.20)",
                    glow:
                        "rgba(239,68,68,0.10)",
                };

            default:
                return {
                    icon: "♢",
                    label: "Notification",
                    background:
                        "linear-gradient(135deg, rgba(148,163,184,0.14), rgba(71,85,105,0.06))",
                    color: "#cbd5e1",
                    border:
                        "rgba(148,163,184,0.18)",
                    glow:
                        "rgba(148,163,184,0.08)",
                };
        }
    };

    // =========================================================
    // COUNTS
    // =========================================================

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div style={styles.page}>

            {/* =================================================
                BACKGROUND GLOW EFFECTS
            ================================================= */}

            <div style={styles.backgroundGlowOne} />
            <div style={styles.backgroundGlowTwo} />
            <div style={styles.backgroundGlowThree} />

            {/* =================================================
                HEADER
            ================================================= */}

            <header style={styles.header}>

                <div
                    style={styles.headerInner}
                    className="hireai-header-inner"
                >

                    {/* BRAND */}

                    <div style={styles.brandSection}>

                        <div style={styles.logoMark}>
                            ✦
                        </div>

                        <div>

                            <h1 style={styles.logo}>
                                Hire
                                <span style={styles.logoAccent}>
                                    AI
                                </span>
                            </h1>

                            <p style={styles.subtitle}>
                                Notifications Center
                            </p>

                        </div>

                    </div>

                    {/* HEADER ACTIONS */}

                    <div
                        style={styles.headerButtons}
                        className="hireai-header-buttons"
                    >

                        <button
                            style={styles.profileButton}
                            className="hireai-profile-button"
                            onClick={() =>
                                navigate("/profile")
                            }
                        >
                            <span style={styles.buttonIcon}>
                                ◉
                            </span>

                            My Profile
                        </button>

                        <button
                            style={styles.logoutButton}
                            className="hireai-logout-button"
                            onClick={handleLogout}
                        >
                            <span style={styles.buttonIcon}>
                                ↪
                            </span>

                            Logout
                        </button>

                    </div>

                </div>

            </header>

            {/* =================================================
                MAIN
            ================================================= */}

            <main
                style={styles.container}
                className="hireai-container"
            >

                {/* =================================================
                    TOP NAVIGATION
                ================================================= */}

                <div style={styles.topNavigation}>

                    <button
                        style={styles.backButton}
                        onClick={handleBackToDashboard}
                    >
                        <span style={styles.backArrow}>
                            ←
                        </span>

                        Dashboard
                    </button>

                    <div style={styles.breadcrumb}>
                        Workspace

                        <span
                            style={
                                styles.breadcrumbSeparator
                            }
                        >
                            /
                        </span>

                        Notifications
                    </div>

                </div>

                {/* =================================================
                    TITLE SECTION
                ================================================= */}

                <section
                    style={styles.titleSection}
                    className="hireai-notification-title-section"
                >

                    <div>

                        <div style={styles.titleEyebrow}>

                            <span
                                style={
                                    styles.eyebrowDot
                                }
                            />

                            NOTIFICATION CENTER

                        </div>

                        <h2
                            style={styles.heading}
                            className="hireai-heading"
                        >

                            Stay{" "}

                            <span
                                style={
                                    styles.headingAccent
                                }
                            >
                                Updated
                            </span>

                        </h2>

                        <p style={styles.description}>
                            Stay informed about your job
                            applications, interview schedules,
                            and recruitment activity.
                        </p>

                    </div>

                    {/* SUMMARY */}

                    {!loading && !error && (
                        <div
                            style={styles.summaryContainer}
                            className="hireai-notification-summary"
                        >

                            <div
                                style={styles.summaryCard}
                                className="hireai-summary-card"
                            >

                                <div
                                    style={
                                        styles.summaryIcon
                                    }
                                >
                                    🔔
                                </div>

                                <div>

                                    <span
                                        style={
                                            styles.summaryLabel
                                        }
                                    >
                                        TOTAL
                                    </span>

                                    <strong
                                        style={
                                            styles.summaryValue
                                        }
                                    >
                                        {notifications.length}
                                    </strong>

                                </div>

                            </div>

                            <div
                                style={styles.summaryCard}
                                className="hireai-summary-card"
                            >

                                <div
                                    style={
                                        styles.unreadSummaryIcon
                                    }
                                >
                                    ●
                                </div>

                                <div>

                                    <span
                                        style={
                                            styles.summaryLabel
                                        }
                                    >
                                        UNREAD
                                    </span>

                                    <strong
                                        style={{
                                            ...styles.summaryValue,
                                            color:
                                                unreadCount > 0
                                                    ? "#67e8f9"
                                                    : "#94a3b8",
                                        }}
                                    >
                                        {unreadCount}
                                    </strong>

                                </div>

                            </div>

                        </div>
                    )}

                </section>

                {/* =================================================
                    MARK ALL AS READ
                ================================================= */}

                {!loading &&
                    !error &&
                    notifications.length > 0 &&
                    unreadCount > 0 && (

                        <div
                            style={
                                styles.actionContainer
                            }
                        >

                            <button
                                style={
                                    styles.markAllButton
                                }
                                onClick={markAllAsRead}
                            >
                                <span
                                    style={
                                        styles.markAllIcon
                                    }
                                >
                                    ✓
                                </span>

                                Mark All as Read

                            </button>

                        </div>
                    )}

                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div style={styles.messageCard}>

                        <div
                            style={
                                styles.loadingIconWrapper
                            }
                        >
                            <div
                                style={
                                    styles.loadingSpinner
                                }
                            />
                        </div>

                        <div
                            style={
                                styles.messageEyebrow
                            }
                        >
                            NOTIFICATION CENTER
                        </div>

                        <h3
                            style={
                                styles.messageTitle
                            }
                        >
                            Loading Notifications
                        </h3>

                        <p
                            style={
                                styles.emptyText
                            }
                        >
                            Please wait while we load
                            your latest notifications.
                        </p>

                    </div>
                )}

                {/* =================================================
                    ERROR
                ================================================= */}

                {!loading && error && (

                    <div style={styles.messageCard}>

                        <div
                            style={
                                styles.errorIconWrapper
                            }
                        >
                            !
                        </div>

                        <div
                            style={
                                styles.messageEyebrow
                            }
                        >
                            SOMETHING WENT WRONG
                        </div>

                        <h3
                            style={
                                styles.messageTitle
                            }
                        >
                            Unable to Load Notifications
                        </h3>

                        <p
                            style={
                                styles.errorText
                            }
                        >
                            {error}
                        </p>

                        <button
                            style={
                                styles.retryButton
                            }
                            onClick={
                                loadNotifications
                            }
                        >
                            <span>
                                Try Again
                            </span>

                            <span
                                style={
                                    styles.arrowIcon
                                }
                            >
                                →
                            </span>

                        </button>

                    </div>
                )}

                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                    !error &&
                    notifications.length === 0 && (

                        <div
                            style={
                                styles.emptyCard
                            }
                        >

                            <div
                                style={
                                    styles.emptyIconWrapper
                                }
                            >
                                <span
                                    style={
                                        styles.emptyIcon
                                    }
                                >
                                    🔔
                                </span>
                            </div>

                            <div
                                style={
                                    styles.emptyEyebrow
                                }
                            >
                                ALL CAUGHT UP
                            </div>

                            <h3
                                style={
                                    styles.emptyTitle
                                }
                            >
                                No Notifications
                            </h3>

                            <p
                                style={
                                    styles.emptyText
                                }
                            >
                                You don't have any
                                notifications yet. New
                                updates about your applications
                                and interviews will appear here.
                            </p>

                            <button
                                style={
                                    styles.dashboardButton
                                }
                                onClick={
                                    handleBackToDashboard
                                }
                            >
                                <span>
                                    Back to Dashboard
                                </span>

                                <span
                                    style={
                                        styles.arrowIcon
                                    }
                                >
                                    →
                                </span>

                            </button>

                        </div>
                    )}

                {/* =================================================
                    NOTIFICATION LIST
                ================================================= */}

                {!loading &&
                    !error &&
                    notifications.length > 0 && (

                        <section
                            style={
                                styles.notificationSection
                            }
                        >

                            {/* LIST HEADER */}

                            <div
                                style={
                                    styles.listHeader
                                }
                            >

                                <div>

                                    <div
                                        style={
                                            styles.listEyebrow
                                        }
                                    >
                                        RECENT ACTIVITY
                                    </div>

                                    <h3
                                        style={
                                            styles.listTitle
                                        }
                                    >
                                        Your Notifications
                                    </h3>

                                </div>

                                {unreadCount > 0 && (

                                    <div
                                        style={
                                            styles.unreadBadgeTop
                                        }
                                    >
                                        <span
                                            style={
                                                styles.unreadDot
                                            }
                                        />

                                        {unreadCount} Unread
                                    </div>

                                )}

                            </div>

                            {/* NOTIFICATIONS */}

                            <div
                                style={
                                    styles.notificationList
                                }
                            >

                                {notifications.map(
                                    (notification) => {

                                        const config =
                                            getNotificationConfig(
                                                notification.type
                                            );

                                        return (
                                            <div
                                                key={
                                                    notification.id
                                                }
                                                style={{
                                                    ...styles.notificationCard,
                                                    ...(notification.isRead
                                                        ? styles.readCard
                                                        : styles.unreadCard),
                                                }}
                                                className="hireai-notification-card"
                                                onClick={() => {

                                                    if (
                                                        !notification.isRead
                                                    ) {
                                                        markAsRead(
                                                            notification.id
                                                        );
                                                    }

                                                }}
                                            >

                                                {/* ACCENT */}

                                                <div
                                                    style={{
                                                        ...styles.cardAccent,
                                                        background:
                                                            config.color,
                                                        boxShadow:
                                                            `0 0 14px ${config.glow}`,
                                                    }}
                                                />

                                                {/* ICON */}

                                                <div
                                                    style={{
                                                        ...styles.notificationIcon,
                                                        background:
                                                            notification.isRead
                                                                ? "rgba(30,41,59,0.8)"
                                                                : config.background,
                                                        color:
                                                            notification.isRead
                                                                ? "#64748b"
                                                                : config.color,
                                                        border:
                                                            `1px solid ${
                                                                notification.isRead
                                                                    ? "rgba(148,163,184,0.10)"
                                                                    : config.border
                                                            }`,
                                                        boxShadow:
                                                            notification.isRead
                                                                ? "none"
                                                                : `0 8px 25px ${config.glow}`,
                                                    }}
                                                    className="hireai-notification-icon"
                                                >
                                                    {config.icon}
                                                </div>

                                                {/* CONTENT */}

                                                <div
                                                    style={
                                                        styles.notificationContent
                                                    }
                                                >

                                                    <div
                                                        style={
                                                            styles.titleRow
                                                        }
                                                    >

                                                        <div
                                                            style={
                                                                styles.typeLabel
                                                            }
                                                        >
                                                            {config.label}
                                                        </div>

                                                        {!notification.isRead && (

                                                            <span
                                                                style={
                                                                    styles.newBadge
                                                                }
                                                            >
                                                                <span
                                                                    style={
                                                                        styles.newBadgeDot
                                                                    }
                                                                />

                                                                NEW
                                                            </span>

                                                        )}

                                                    </div>

                                                    <h3
                                                        style={
                                                            styles.notificationTitle
                                                        }
                                                        className="hireai-notification-title"
                                                    >
                                                        {notification.title ||
                                                            "Notification"}
                                                    </h3>

                                                    <p
                                                        style={
                                                            styles.notificationMessage
                                                        }
                                                    >
                                                        {notification.message ||
                                                            "You have a new notification."}
                                                    </p>

                                                    <div
                                                        style={
                                                            styles.notificationFooter
                                                        }
                                                    >

                                                        <span
                                                            style={
                                                                styles.notificationTime
                                                            }
                                                        >
                                                            <span
                                                                style={
                                                                    styles.timeIcon
                                                                }
                                                            >
                                                                ◷
                                                            </span>

                                                            {formatDate(
                                                                notification.createdAt
                                                            )}
                                                        </span>

                                                        {!notification.isRead && (

                                                            <span
                                                                style={
                                                                    styles.clickHint
                                                                }
                                                            >
                                                                Click to mark as read
                                                            </span>

                                                        )}

                                                    </div>

                                                </div>

                                                {/* RIGHT INDICATOR */}

                                                <div
                                                    style={
                                                        styles.notificationArrow
                                                    }
                                                    className="hireai-notification-arrow"
                                                >
                                                    →
                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </section>
                    )}

            </main>

            {/* =================================================
                RESPONSIVE / ANIMATION CSS
            ================================================= */}

            <style>
                {`
                    @keyframes hireaiNotificationSpin {
                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }
                    }

                    @keyframes hireaiNotificationPulse {
                        0%, 100% {
                            opacity: 0.5;
                            transform: scale(1);
                        }

                        50% {
                            opacity: 1;
                            transform: scale(1.08);
                        }
                    }

                    @media (max-width: 850px) {
                        .hireai-notification-title-section {
                            flex-direction: column !important;
                            align-items: flex-start !important;
                        }

                        .hireai-notification-summary {
                            width: 100% !important;
                        }

                        .hireai-notification-card {
                            grid-template-columns: auto 1fr !important;
                        }

                        .hireai-notification-arrow {
                            display: none !important;
                        }
                    }

                    @media (max-width: 600px) {
                        .hireai-header-inner {
                            padding: 15px 18px !important;
                        }

                        .hireai-header-buttons {
                            gap: 6px !important;
                        }

                        .hireai-profile-button,
                        .hireai-logout-button {
                            padding: 8px 10px !important;
                            font-size: 11px !important;
                        }

                        .hireai-container {
                            padding: 25px 16px 50px !important;
                        }

                        .hireai-heading {
                            font-size: 34px !important;
                        }

                        .hireai-summary-container {
                            width: 100% !important;
                            display: grid !important;
                            grid-template-columns: 1fr 1fr !important;
                        }

                        .hireai-summary-card {
                            min-width: 0 !important;
                        }

                        .hireai-notification-card {
                            padding: 18px !important;
                            gap: 12px !important;
                        }

                        .hireai-notification-icon {
                            width: 42px !important;
                            height: 42px !important;
                        }

                        .hireai-notification-title {
                            font-size: 15px !important;
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
            "radial-gradient(circle at 15% 10%, rgba(99,102,241,0.12), transparent 30%), radial-gradient(circle at 85% 15%, rgba(34,211,238,0.08), transparent 28%), #060914",
        color: "#f8fafc",
        fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    // =========================================================
    // BACKGROUND GLOWS
    // =========================================================

    backgroundGlowOne: {
        position: "fixed",
        width: "430px",
        height: "430px",
        top: "-190px",
        left: "-170px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(99,102,241,0.17), transparent 68%)",
        filter: "blur(25px)",
        pointerEvents: "none",
        zIndex: 0,
    },

    backgroundGlowTwo: {
        position: "fixed",
        width: "520px",
        height: "520px",
        right: "-240px",
        top: "100px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(34,211,238,0.10), transparent 68%)",
        filter: "blur(35px)",
        pointerEvents: "none",
        zIndex: 0,
    },

    backgroundGlowThree: {
        position: "fixed",
        width: "430px",
        height: "430px",
        bottom: "-240px",
        left: "30%",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(139,92,246,0.10), transparent 68%)",
        filter: "blur(35px)",
        pointerEvents: "none",
        zIndex: 0,
    },

    // =========================================================
    // HEADER
    // =========================================================

    header: {
        position: "sticky",
        top: 0,
        zIndex: 20,
        background:
            "rgba(6,9,20,0.78)",
        borderBottom:
            "1px solid rgba(148,163,184,0.10)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
    },

    headerInner: {
        maxWidth: "1240px",
        margin: "0 auto",
        padding: "18px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
    },

    brandSection: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },

    logoMark: {
        width: "42px",
        height: "42px",
        borderRadius: "13px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#ffffff",
        fontSize: "20px",
        fontWeight: "800",
        boxShadow:
            "0 8px 28px rgba(99,102,241,0.28)",
    },

    logo: {
        margin: 0,
        fontSize: "24px",
        lineHeight: 1,
        fontWeight: "800",
        letterSpacing: "-0.7px",
        color: "#f8fafc",
    },

    logoAccent: {
        background:
            "linear-gradient(90deg, #818cf8, #22d3ee)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },

    subtitle: {
        margin: "5px 0 0",
        color: "#64748b",
        fontSize: "12px",
        letterSpacing: "0.2px",
    },

    headerButtons: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },

    profileButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 15px",
        border:
            "1px solid rgba(129,140,248,0.20)",
        borderRadius: "11px",
        background:
            "rgba(99,102,241,0.08)",
        color: "#c7d2fe",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
    },

    logoutButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 15px",
        border:
            "1px solid rgba(248,113,113,0.20)",
        borderRadius: "11px",
        background:
            "rgba(239,68,68,0.07)",
        color: "#fca5a5",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
    },

    buttonIcon: {
        fontSize: "13px",
        opacity: 0.9,
    },

    // =========================================================
    // CONTAINER
    // =========================================================

    container: {
        position: "relative",
        zIndex: 2,
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "35px 30px 70px",
    },

    // =========================================================
    // TOP NAVIGATION
    // =========================================================

    topNavigation: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        marginBottom: "32px",
        flexWrap: "wrap",
    },

    backButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "9px 14px",
        border:
            "1px solid rgba(148,163,184,0.14)",
        borderRadius: "10px",
        background:
            "rgba(15,23,42,0.68)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
    },

    backArrow: {
        fontSize: "16px",
        color: "#818cf8",
    },

    breadcrumb: {
        color: "#64748b",
        fontSize: "12px",
        letterSpacing: "0.2px",
    },

    breadcrumbSeparator: {
        margin: "0 8px",
        color: "#334155",
    },

    // =========================================================
    // TITLE
    // =========================================================

    titleSection: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "30px",
        marginBottom: "32px",
    },

    titleEyebrow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#818cf8",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "1.4px",
        marginBottom: "10px",
    },

    eyebrowDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#22d3ee",
        boxShadow:
            "0 0 12px rgba(34,211,238,0.8)",
    },

    heading: {
        margin: 0,
        fontSize: "42px",
        lineHeight: 1.1,
        fontWeight: "800",
        letterSpacing: "-1.5px",
        color: "#f8fafc",
    },

    headingAccent: {
        background:
            "linear-gradient(90deg, #818cf8, #22d3ee)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },

    description: {
        maxWidth: "650px",
        margin: "13px 0 0",
        color: "#94a3b8",
        lineHeight: 1.7,
        fontSize: "14px",
    },

    // =========================================================
    // SUMMARY
    // =========================================================

    summaryContainer: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
    },

    summaryCard: {
        minWidth: "125px",
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "13px 15px",
        borderRadius: "14px",
        border:
            "1px solid rgba(99,102,241,0.17)",
        background:
            "linear-gradient(145deg, rgba(30,41,59,0.72), rgba(15,23,42,0.62))",
        boxShadow:
            "0 15px 35px rgba(0,0,0,0.16)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
    },

    summaryIcon: {
        width: "35px",
        height: "35px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "10px",
        background:
            "rgba(99,102,241,0.12)",
        fontSize: "16px",
    },

    unreadSummaryIcon: {
        width: "35px",
        height: "35px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "10px",
        background:
            "rgba(34,211,238,0.09)",
        color: "#22d3ee",
        fontSize: "13px",
        animation:
            "hireaiNotificationPulse 2s ease-in-out infinite",
    },

    summaryLabel: {
        display: "block",
        color: "#64748b",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "0.8px",
        marginBottom: "2px",
    },

    summaryValue: {
        display: "block",
        color: "#f8fafc",
        fontSize: "19px",
        fontWeight: "800",
    },

    // =========================================================
    // ACTION
    // =========================================================

    actionContainer: {
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "16px",
    },

    markAllButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 15px",
        border:
            "1px solid rgba(34,211,238,0.18)",
        borderRadius: "10px",
        background:
            "rgba(34,211,238,0.06)",
        color: "#67e8f9",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "12px",
        boxShadow:
            "0 8px 20px rgba(34,211,238,0.05)",
    },

    markAllIcon: {
        fontSize: "13px",
        fontWeight: "900",
    },

    // =========================================================
    // MESSAGE
    // =========================================================

    messageCard: {
        maxWidth: "720px",
        margin: "20px auto 0",
        padding: "70px 35px",
        textAlign: "center",
        borderRadius: "20px",
        border:
            "1px solid rgba(148,163,184,0.13)",
        background:
            "linear-gradient(145deg, rgba(17,24,39,0.88), rgba(10,15,30,0.82))",
        boxShadow:
            "0 25px 70px rgba(0,0,0,0.25)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
    },

    loadingIconWrapper: {
        width: "60px",
        height: "60px",
        margin: "0 auto 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "18px",
        background:
            "rgba(99,102,241,0.10)",
        border:
            "1px solid rgba(129,140,248,0.18)",
    },

    loadingSpinner: {
        width: "25px",
        height: "25px",
        borderRadius: "50%",
        border:
            "3px solid rgba(129,140,248,0.18)",
        borderTopColor: "#818cf8",
        borderRightColor: "#22d3ee",
        animation:
            "hireaiNotificationSpin 0.9s linear infinite",
    },

    errorIconWrapper: {
        width: "60px",
        height: "60px",
        margin: "0 auto 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "18px",
        background:
            "rgba(239,68,68,0.10)",
        border:
            "1px solid rgba(248,113,113,0.20)",
        color: "#fca5a5",
        fontSize: "25px",
        fontWeight: "800",
    },

    messageEyebrow: {
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.4px",
        marginBottom: "8px",
    },

    messageTitle: {
        margin: "0 0 10px",
        fontSize: "23px",
        color: "#f8fafc",
    },

    emptyText: {
        maxWidth: "570px",
        margin: "0 auto",
        color: "#64748b",
        lineHeight: 1.7,
        fontSize: "14px",
    },

    errorText: {
        maxWidth: "570px",
        margin: "0 auto",
        color: "#fda4af",
        lineHeight: 1.7,
        fontSize: "14px",
    },

    retryButton: {
        marginTop: "25px",
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "11px 18px",
        border:
            "1px solid rgba(129,140,248,0.22)",
        borderRadius: "11px",
        background:
            "linear-gradient(135deg, #4f46e5, #6366f1)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "13px",
        boxShadow:
            "0 10px 25px rgba(79,70,229,0.22)",
    },

    arrowIcon: {
        fontSize: "16px",
    },

    // =========================================================
    // EMPTY
    // =========================================================

    emptyCard: {
        maxWidth: "720px",
        margin: "10px auto 0",
        padding: "75px 35px",
        textAlign: "center",
        borderRadius: "22px",
        border:
            "1px solid rgba(99,102,241,0.15)",
        background:
            "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.10), transparent 42%), linear-gradient(145deg, rgba(17,24,39,0.90), rgba(8,13,27,0.88))",
        boxShadow:
            "0 30px 80px rgba(0,0,0,0.28)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
    },

    emptyIconWrapper: {
        width: "78px",
        height: "78px",
        margin: "0 auto 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "22px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(34,211,238,0.07))",
        border:
            "1px solid rgba(129,140,248,0.20)",
        boxShadow:
            "0 15px 40px rgba(79,70,229,0.12)",
    },

    emptyIcon: {
        fontSize: "32px",
    },

    emptyEyebrow: {
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.5px",
        marginBottom: "9px",
    },

    emptyTitle: {
        margin: "0 0 12px",
        fontSize: "25px",
        color: "#f8fafc",
        letterSpacing: "-0.4px",
    },

    dashboardButton: {
        marginTop: "27px",
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 20px",
        border:
            "1px solid rgba(129,140,248,0.24)",
        borderRadius: "12px",
        background:
            "linear-gradient(135deg, #4f46e5, #6366f1)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "13px",
        boxShadow:
            "0 12px 30px rgba(79,70,229,0.22)",
    },

    // =========================================================
    // NOTIFICATION SECTION
    // =========================================================

    notificationSection: {
        width: "100%",
    },

    listHeader: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "20px",
        marginBottom: "18px",
    },

    listEyebrow: {
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.4px",
        marginBottom: "5px",
    },

    listTitle: {
        margin: 0,
        fontSize: "21px",
        fontWeight: "750",
        color: "#e2e8f0",
        letterSpacing: "-0.3px",
    },

    unreadBadgeTop: {
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "7px 12px",
        borderRadius: "20px",
        background:
            "rgba(34,211,238,0.07)",
        border:
            "1px solid rgba(34,211,238,0.15)",
        color: "#67e8f9",
        fontSize: "11px",
        fontWeight: "700",
        whiteSpace: "nowrap",
    },

    unreadDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#22d3ee",
        boxShadow:
            "0 0 9px rgba(34,211,238,0.8)",
    },

    notificationList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },

    // =========================================================
    // NOTIFICATION CARD
    // =========================================================

    notificationCard: {
        position: "relative",
        display: "grid",
        gridTemplateColumns: "58px 1fr 25px",
        alignItems: "center",
        gap: "16px",
        overflow: "hidden",
        padding: "19px 20px 19px 23px",
        borderRadius: "16px",
        cursor: "pointer",
        transition:
            "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
    },

    readCard: {
        border:
            "1px solid rgba(148,163,184,0.10)",
        background:
            "linear-gradient(145deg, rgba(17,24,39,0.82), rgba(10,15,30,0.76))",
        boxShadow:
            "0 12px 35px rgba(0,0,0,0.13)",
    },

    unreadCard: {
        border:
            "1px solid rgba(99,102,241,0.19)",
        background:
            "linear-gradient(145deg, rgba(19,28,49,0.92), rgba(10,16,31,0.86))",
        boxShadow:
            "0 15px 42px rgba(0,0,0,0.20), inset 0 1px 0 rgba(129,140,248,0.04)",
    },

    cardAccent: {
        position: "absolute",
        left: 0,
        top: "17px",
        bottom: "17px",
        width: "3px",
        borderRadius: "0 5px 5px 0",
    },

    notificationIcon: {
        width: "50px",
        height: "50px",
        borderRadius: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        fontWeight: "700",
        flexShrink: 0,
    },

    notificationContent: {
        minWidth: 0,
    },

    titleRow: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        flexWrap: "wrap",
        marginBottom: "5px",
    },

    typeLabel: {
        color: "#64748b",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1px",
        textTransform: "uppercase",
    },

    newBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 7px",
        borderRadius: "10px",
        background:
            "rgba(34,211,238,0.08)",
        border:
            "1px solid rgba(34,211,238,0.15)",
        color: "#67e8f9",
        fontSize: "8px",
        fontWeight: "800",
        letterSpacing: "0.6px",
    },

    newBadgeDot: {
        width: "5px",
        height: "5px",
        borderRadius: "50%",
        background: "#22d3ee",
        boxShadow:
            "0 0 7px rgba(34,211,238,0.8)",
    },

    notificationTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "16px",
        fontWeight: "700",
        lineHeight: 1.35,
    },

    notificationMessage: {
        margin: "7px 0 9px",
        color: "#94a3b8",
        fontSize: "13px",
        lineHeight: 1.65,
    },

    notificationFooter: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
    },

    notificationTime: {
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        color: "#475569",
        fontSize: "10px",
    },

    timeIcon: {
        color: "#6366f1",
        fontSize: "11px",
    },

    clickHint: {
        color: "#475569",
        fontSize: "9px",
        fontWeight: "600",
    },

    notificationArrow: {
        color: "#475569",
        fontSize: "18px",
        transition: "0.2s",
    },
};

export default Notifications;