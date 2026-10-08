import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams,
    useLocation
} from "react-router-dom";

import api from "../../services/api";

import Navbar from "../../components/navbar/Navbar";
import PageContainer from "../../components/common/PageContainer";


function JobDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const location = useLocation();


    const [job, setJob] = useState(null);

    const [loading, setLoading] = useState(true);

    const [applying, setApplying] = useState(false);

    const [alreadyApplied, setAlreadyApplied] =
        useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");


    // =========================================================
    // DETERMINE WHETHER THIS IS HR OR CANDIDATE JOB DETAILS
    // =========================================================

    const isHRJob = location.pathname.startsWith(
        "/hr/jobs/"
    );


    // =========================================================
    // ROLE FOR COMMON NAVBAR
    // =========================================================

    const navbarRole = isHRJob
        ? "HR"
        : "CANDIDATE";


    // =========================================================
    // BACK NAVIGATION
    // =========================================================

    const handleBack = () => {

        if (isHRJob) {

            navigate("/hr/jobs");

        } else {

            navigate("/jobs");

        }
    };


    // =========================================================
    // LOAD JOB + APPLICATION STATUS
    // =========================================================

    useEffect(() => {

        let cancelled = false;


        const loadJob = async () => {

            try {

                setLoading(true);

                setError("");

                setMessage("");


                const token =
                    localStorage.getItem("token");


                if (!token) {

                    navigate("/login");

                    return;
                }


                // =================================================
                // LOAD JOB
                // =================================================

                const jobResponse = await api.get(
                    `/jobs/${id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                if (cancelled) {

                    return;
                }


                console.log(
                    "Job details:",
                    jobResponse.data
                );


                setJob(jobResponse.data);


                // =================================================
                // CHECK WHETHER ALREADY APPLIED
                // =================================================

                /*
                 * HR users do not need to check
                 * application status.
                 */

                if (!isHRJob) {

                    try {

                        const applicationResponse =
                            await api.get(
                                `/applications/check/${id}`,
                                {
                                    headers: {
                                        Authorization:
                                            `Bearer ${token}`
                                    }
                                }
                            );


                        if (!cancelled) {

                            setAlreadyApplied(
                                applicationResponse.data === true
                            );

                        }

                    } catch (applicationError) {

                        console.error(
                            "Failed to check application status:",
                            applicationError
                        );


                        if (!cancelled) {

                            setAlreadyApplied(false);

                        }
                    }
                }


            } catch (error) {

                console.error(
                    "Failed to load job:",
                    error
                );


                if (cancelled) {

                    return;
                }


                if (
                    error.response?.status === 401
                ) {

                    localStorage.removeItem(
                        "token"
                    );

                    navigate("/login");

                    return;
                }


                setError(
                    error.response?.data?.message ||
                    error.response?.data ||
                    "Failed to load job details."
                );


            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }
        };


        loadJob();


        return () => {

            cancelled = true;

        };


    }, [
        id,
        navigate,
        isHRJob
    ]);


    // =========================================================
    // APPLY FOR JOB
    // =========================================================

    const handleApply = async () => {

        if (alreadyApplied) {

            setError(
                "You have already applied for this job."
            );

            return;
        }


        if (!job || job.status !== "OPEN") {

            setError(
                "This job is no longer open for applications."
            );

            return;
        }


        try {

            setApplying(true);

            setMessage("");

            setError("");


            const token =
                localStorage.getItem("token");


            if (!token) {

                navigate("/login");

                return;
            }


            await api.post(

                "/applications",

                {
                    jobId: Number(id)
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );


            // =====================================================
            // APPLICATION SUCCESS
            // =====================================================

            setAlreadyApplied(true);


            setMessage(
                "Application submitted successfully! 🎉"
            );


        } catch (error) {

            console.error(
                "Application failed:",
                error
            );


            if (
                error.response?.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                navigate("/login");

                return;
            }


            setError(
                error.response?.data?.message ||
                error.response?.data ||
                "Failed to submit application."
            );


        } finally {

            setApplying(false);

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
            .replace(
                /\b\w/g,
                char => char.toUpperCase()
            );
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


        const numericSalary = Number(salary);


        if (Number.isNaN(numericSalary)) {

            return "Not specified";

        }


        return `₹${numericSalary.toLocaleString("en-IN")}`;
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div style={styles.page}>

                <div style={styles.backgroundGlowOne} />
                <div style={styles.backgroundGlowTwo} />

                <Navbar role={navbarRole} />

                <PageContainer maxWidth="900px">

                    <div style={styles.loadingWrapper}>

                        <div style={styles.loadingOrb}>
                            <span>✦</span>
                        </div>

                        <h2 style={styles.loadingTitle}>
                            Loading Job Details
                        </h2>

                        <p style={styles.loadingText}>
                            Preparing the opportunity details for you...
                        </p>

                        <div style={styles.loadingBar}>
                            <div style={styles.loadingBarProgress} />
                        </div>

                    </div>

                </PageContainer>

            </div>

        );
    }


    // =========================================================
    // ERROR WITHOUT JOB
    // =========================================================

    if (error && !job) {

        return (

            <div style={styles.page}>

                <div style={styles.backgroundGlowOne} />
                <div style={styles.backgroundGlowTwo} />

                <Navbar role={navbarRole} />

                <PageContainer maxWidth="900px">

                    <div style={styles.errorCard}>

                        <div style={styles.errorIconWrapper}>
                            <span style={styles.errorIcon}>
                                !
                            </span>
                        </div>

                        <div style={styles.errorEyebrow}>
                            SOMETHING WENT WRONG
                        </div>

                        <h2 style={styles.errorTitle}>
                            Unable to Load Job
                        </h2>

                        <p style={styles.errorText}>
                            {error}
                        </p>

                    </div>


                    <button
                        style={styles.backButton}
                        onClick={handleBack}
                    >
                        <span style={styles.backIcon}>
                            ←
                        </span>

                        {isHRJob
                            ? "Back to My Jobs"
                            : "Back to Jobs"}

                    </button>

                </PageContainer>

            </div>

        );
    }


    // =========================================================
    // NO JOB
    // =========================================================

    if (!job) {

        return (

            <div style={styles.page}>

                <div style={styles.backgroundGlowOne} />
                <div style={styles.backgroundGlowTwo} />

                <Navbar role={navbarRole} />

                <PageContainer maxWidth="900px">

                    <div style={styles.errorCard}>

                        <div style={styles.errorIconWrapper}>
                            <span style={styles.searchIcon}>
                                ?
                            </span>
                        </div>

                        <div style={styles.errorEyebrow}>
                            JOB NOT FOUND
                        </div>

                        <h2 style={styles.errorTitle}>
                            Job Not Found
                        </h2>

                        <p style={styles.errorText}>
                            The job you are looking for does not
                            exist or is no longer available.
                        </p>

                    </div>


                    <button
                        style={styles.backButton}
                        onClick={handleBack}
                    >
                        <span style={styles.backIcon}>
                            ←
                        </span>

                        {isHRJob
                            ? "Back to My Jobs"
                            : "Back to Jobs"}

                    </button>

                </PageContainer>

            </div>

        );
    }


    // =========================================================
    // JOB STATUS
    // =========================================================

    const isOpen =
        job.status === "OPEN";


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
                COMMON NAVBAR
            ================================================= */}

            <Navbar role={navbarRole} />


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <PageContainer maxWidth="900px">


                {/* =================================================
                    BACK BUTTON
                ================================================= */}

                <button
                    style={styles.backButton}
                    onClick={handleBack}
                >

                    <span style={styles.backIcon}>
                        ←
                    </span>

                    {isHRJob
                        ? "Back to My Jobs"
                        : "Back to Jobs"}

                </button>


                {/* =================================================
                    JOB CARD
                ================================================= */}

                <div style={styles.jobCard}>


                    {/* =================================================
                        TOP ACCENT
                    ================================================= */}

                    <div style={styles.topAccent} />


                    {/* =================================================
                        JOB HEADER
                    ================================================= */}

                    <div style={styles.cardHeader}>

                        <div style={styles.headerInfo}>

                            <div style={styles.jobEyebrow}>
                                {isHRJob
                                    ? "JOB MANAGEMENT"
                                    : "CAREER OPPORTUNITY"}
                            </div>


                            <h1 style={styles.title}>
                                {job.title ||
                                    "Untitled Job"}
                            </h1>


                            <div style={styles.companyRow}>

                                <div style={styles.companyIcon}>
                                    {(
                                        job.companyName ||
                                        "C"
                                    )
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <h3 style={styles.company}>

                                    {job.companyName ||
                                        "Company not specified"}

                                </h3>

                            </div>

                        </div>


                        {/* =================================================
                            STATUS
                        ================================================= */}

                        <div
                            style={{
                                ...styles.status,
                                background:
                                    isOpen
                                        ? "rgba(16, 185, 129, 0.12)"
                                        : "rgba(239, 68, 68, 0.12)",
                                border:
                                    isOpen
                                        ? "1px solid rgba(52, 211, 153, 0.25)"
                                        : "1px solid rgba(248, 113, 113, 0.25)",
                                color:
                                    isOpen
                                        ? "#6ee7b7"
                                        : "#fca5a5"
                            }}
                        >

                            <span
                                style={{
                                    ...styles.statusDot,
                                    background:
                                        isOpen
                                            ? "#34d399"
                                            : "#f87171"
                                }}
                            />

                            {job.status ||
                                "UNKNOWN"}

                        </div>

                    </div>


                    {/* =================================================
                        JOB INFORMATION
                    ================================================= */}

                    <div style={styles.infoGrid}>


                        {/* LOCATION */}

                        <div style={styles.infoItem}>

                            <div style={styles.infoIcon}>
                                📍
                            </div>

                            <div>

                                <span style={styles.infoLabel}>
                                    LOCATION
                                </span>

                                <strong style={styles.infoValue}>
                                    {job.location ||
                                        "Not specified"}
                                </strong>

                            </div>

                        </div>


                        {/* JOB TYPE */}

                        <div style={styles.infoItem}>

                            <div style={styles.infoIcon}>
                                💼
                            </div>

                            <div>

                                <span style={styles.infoLabel}>
                                    JOB TYPE
                                </span>

                                <strong style={styles.infoValue}>
                                    {formatJobType(
                                        job.jobType
                                    )}
                                </strong>

                            </div>

                        </div>


                        {/* SALARY */}

                        <div style={styles.infoItem}>

                            <div style={styles.infoIcon}>
                                ₹
                            </div>

                            <div>

                                <span style={styles.infoLabel}>
                                    SALARY
                                </span>

                                <strong style={styles.salaryValue}>
                                    {formatSalary(
                                        job.salary
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>


                    <div style={styles.divider} />


                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <section>

                        <div style={styles.sectionHeading}>

                            <div style={styles.sectionIcon}>
                                ✦
                            </div>

                            <h3 style={styles.sectionTitle}>
                                Job Description
                            </h3>

                        </div>


                        <div style={styles.descriptionBox}>

                            <p style={styles.description}>

                                {job.description ||
                                    "No description provided."}

                            </p>

                        </div>

                    </section>


                    {/* =================================================
                        HR INFORMATION
                    ================================================= */}

                    {job.hr && (

                        <div style={styles.hrBox}>

                            <div style={styles.hrHeader}>

                                <div style={styles.hrIcon}>
                                    👤
                                </div>

                                <div>

                                    <div style={styles.hrEyebrow}>
                                        POSTED BY
                                    </div>

                                    <h3 style={styles.hrTitle}>
                                        Hiring Team
                                    </h3>

                                </div>

                            </div>


                            <div style={styles.hrDetails}>

                                <div>

                                    <p style={styles.hrName}>

                                        <strong>

                                            {job.hr.firstName || ""}{" "}

                                            {job.hr.lastName || ""}

                                        </strong>

                                    </p>


                                    {job.hr.email && (

                                        <p style={styles.hrEmail}>

                                            ✉ {job.hr.email}

                                        </p>

                                    )}

                                </div>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        SUCCESS MESSAGE
                    ================================================= */}

                    {message && (

                        <div style={styles.success}>

                            <div style={styles.successIcon}>
                                ✓
                            </div>

                            <div>

                                <strong style={styles.successTitle}>
                                    Application Submitted
                                </strong>

                                <p style={styles.successText}>
                                    {message}
                                </p>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        ERROR MESSAGE
                    ================================================= */}

                    {error && (

                        <div style={styles.error}>

                            <div style={styles.inlineErrorIcon}>
                                !
                            </div>

                            <div>

                                <strong style={styles.inlineErrorTitle}>
                                    Unable to Complete Request
                                </strong>

                                <p style={styles.inlineErrorText}>
                                    {error}
                                </p>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        CANDIDATE APPLY SECTION
                    ================================================= */}

                    {!isHRJob && (

                        <>

                            <div style={styles.actions}>

                                <button
                                    style={{
                                        ...styles.applyButton,

                                        background:
                                            alreadyApplied
                                                ? "linear-gradient(135deg, #334155, #475569)"
                                                : !isOpen
                                                    ? "linear-gradient(135deg, #1e293b, #334155)"
                                                    : "linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #4f46e5 100%)",

                                        boxShadow:
                                            !alreadyApplied &&
                                            isOpen &&
                                            !applying
                                                ? "0 14px 35px rgba(99, 102, 241, 0.28)"
                                                : "none",

                                        cursor:
                                            applying ||
                                            alreadyApplied ||
                                            !isOpen
                                                ? "not-allowed"
                                                : "pointer",

                                        opacity:
                                            applying
                                                ? 0.72
                                                : 1
                                    }}

                                    onClick={handleApply}

                                    disabled={
                                        applying ||
                                        alreadyApplied ||
                                        !isOpen
                                    }
                                >

                                    <span style={styles.applyButtonIcon}>

                                        {applying
                                            ? "⏳"
                                            : alreadyApplied
                                                ? "✓"
                                                : isOpen
                                                    ? "↗"
                                                    : "🔒"}

                                    </span>


                                    {applying

                                        ? "Submitting Application..."

                                        : alreadyApplied

                                            ? "Already Applied"

                                            : isOpen

                                                ? "Apply for this Job"

                                                : "Job Closed"}

                                </button>

                            </div>


                            {/* =================================================
                                APPLICATION INFO
                            ================================================= */}

                            {alreadyApplied && (

                                <div
                                    style={
                                        styles.appliedInfo
                                    }
                                >

                                    <div style={styles.appliedContent}>

                                        <div style={styles.appliedIcon}>
                                            ✓
                                        </div>

                                        <div>

                                            <strong style={styles.appliedTitle}>
                                                Application Submitted
                                            </strong>

                                            <p style={styles.appliedText}>
                                                You have already submitted
                                                an application for this job.
                                            </p>

                                        </div>

                                    </div>


                                    <button
                                        style={
                                            styles.applicationsButton
                                        }

                                        onClick={() =>
                                            navigate(
                                                "/applications"
                                            )
                                        }
                                    >

                                        View My Applications

                                        <span style={styles.buttonArrow}>
                                            →
                                        </span>

                                    </button>

                                </div>

                            )}

                        </>

                    )}

                </div>

            </PageContainer>

        </div>

    );
}


/* =============================================================
   PREMIUM HIREAI STYLES
============================================================= */

const styles = {

    // =========================================================
    // PAGE
    // =========================================================

    page: {
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background:
            "radial-gradient(circle at 15% 10%, rgba(99,102,241,0.12), transparent 28%), radial-gradient(circle at 85% 20%, rgba(34,211,238,0.08), transparent 25%), linear-gradient(135deg, #050816 0%, #080d1c 45%, #0b1120 100%)",
        color: "#f8fafc",
        fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },


    // =========================================================
    // BACKGROUND GLOWS
    // =========================================================

    backgroundGlowOne: {
        position: "fixed",
        top: "-180px",
        left: "-160px",
        width: "420px",
        height: "420px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0) 70%)",
        pointerEvents: "none",
        zIndex: 0
    },


    backgroundGlowTwo: {
        position: "fixed",
        top: "25%",
        right: "-180px",
        width: "430px",
        height: "430px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(139,92,246,0.13) 0%, rgba(139,92,246,0) 70%)",
        pointerEvents: "none",
        zIndex: 0
    },


    backgroundGlowThree: {
        position: "fixed",
        bottom: "-220px",
        left: "35%",
        width: "480px",
        height: "480px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(34,211,238,0.07) 0%, rgba(34,211,238,0) 70%)",
        pointerEvents: "none",
        zIndex: 0
    },


    // =========================================================
    // BACK BUTTON
    // =========================================================

    backButton: {
        position: "relative",
        zIndex: 2,
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        padding: "10px 16px",
        marginBottom: "22px",
        border:
            "1px solid rgba(148,163,184,0.18)",
        borderRadius: "10px",
        background:
            "rgba(15,23,42,0.72)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "14px",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow:
            "0 8px 25px rgba(0,0,0,0.16)"
    },


    backIcon: {
        color: "#818cf8",
        fontSize: "17px",
        fontWeight: "700"
    },


    // =========================================================
    // JOB CARD
    // =========================================================

    jobCard: {
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        background:
            "linear-gradient(145deg, rgba(15,23,42,0.94), rgba(15,23,42,0.78))",
        border:
            "1px solid rgba(148,163,184,0.15)",
        borderRadius: "22px",
        padding: "34px",
        boxShadow:
            "0 30px 80px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.035)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)"
    },


    topAccent: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background:
            "linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)"
    },


    // =========================================================
    // HEADER
    // =========================================================

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "25px"
    },


    headerInfo: {
        minWidth: 0,
        flex: 1
    },


    jobEyebrow: {
        marginBottom: "9px",
        color: "#818cf8",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "1.8px"
    },


    title: {
        margin: 0,
        fontSize: "clamp(27px, 4vw, 38px)",
        lineHeight: "1.18",
        letterSpacing: "-0.8px",
        color: "#f8fafc",
        fontWeight: "750"
    },


    companyRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginTop: "15px"
    },


    companyIcon: {
        width: "34px",
        height: "34px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "10px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.16))",
        border:
            "1px solid rgba(129,140,248,0.22)",
        color: "#a5b4fc",
        fontSize: "14px",
        fontWeight: "800"
    },


    company: {
        margin: 0,
        color: "#cbd5e1",
        fontSize: "17px",
        fontWeight: "600"
    },


    // =========================================================
    // STATUS
    // =========================================================

    status: {
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        height: "fit-content",
        padding: "8px 13px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "0.6px",
        whiteSpace: "nowrap"
    },


    statusDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        boxShadow:
            "0 0 10px currentColor"
    },


    // =========================================================
    // INFO GRID
    // =========================================================

    infoGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
        gap: "13px",
        marginTop: "32px"
    },


    infoItem: {
        display: "flex",
        alignItems: "center",
        gap: "13px",
        minHeight: "72px",
        padding: "15px",
        background:
            "rgba(2,6,23,0.38)",
        border:
            "1px solid rgba(148,163,184,0.11)",
        borderRadius: "14px",
        color: "#f8fafc",
        boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.025)"
    },


    infoIcon: {
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "11px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(34,211,238,0.08))",
        border:
            "1px solid rgba(129,140,248,0.14)",
        color: "#a5b4fc",
        fontSize: "17px"
    },


    infoLabel: {
        display: "block",
        marginBottom: "5px",
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.2px"
    },


    infoValue: {
        display: "block",
        color: "#e2e8f0",
        fontSize: "14px",
        fontWeight: "650",
        lineHeight: "1.4"
    },


    salaryValue: {
        display: "block",
        color: "#67e8f9",
        fontSize: "15px",
        fontWeight: "750",
        lineHeight: "1.4"
    },


    // =========================================================
    // DIVIDER
    // =========================================================

    divider: {
        height: "1px",
        border: "none",
        background:
            "linear-gradient(90deg, transparent, rgba(148,163,184,0.15), transparent)",
        margin: "34px 0"
    },


    // =========================================================
    // SECTION
    // =========================================================

    sectionHeading: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "15px"
    },


    sectionIcon: {
        width: "29px",
        height: "29px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        background:
            "rgba(99,102,241,0.12)",
        border:
            "1px solid rgba(129,140,248,0.18)",
        color: "#818cf8",
        fontSize: "13px"
    },


    sectionTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "18px",
        fontWeight: "700"
    },


    descriptionBox: {
        padding: "19px",
        borderRadius: "14px",
        background:
            "rgba(2,6,23,0.27)",
        border:
            "1px solid rgba(148,163,184,0.09)"
    },


    description: {
        margin: 0,
        color: "#aebdce",
        lineHeight: "1.8",
        whiteSpace: "pre-line",
        fontSize: "14.5px"
    },


    // =========================================================
    // HR BOX
    // =========================================================

    hrBox: {
        marginTop: "27px",
        padding: "20px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.075), rgba(15,23,42,0.3))",
        border:
            "1px solid rgba(129,140,248,0.14)",
        borderRadius: "15px"
    },


    hrHeader: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "17px"
    },


    hrIcon: {
        width: "39px",
        height: "39px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "11px",
        background:
            "rgba(99,102,241,0.14)",
        border:
            "1px solid rgba(129,140,248,0.16)",
        fontSize: "17px"
    },


    hrEyebrow: {
        color: "#818cf8",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1.3px",
        marginBottom: "3px"
    },


    hrTitle: {
        margin: 0,
        color: "#e2e8f0",
        fontSize: "15px",
        fontWeight: "650"
    },


    hrDetails: {
        paddingLeft: "51px"
    },


    hrName: {
        margin: "0 0 6px",
        color: "#f8fafc",
        fontSize: "15px"
    },


    hrEmail: {
        margin: 0,
        color: "#94a3b8",
        fontSize: "13px"
    },


    // =========================================================
    // ACTIONS
    // =========================================================

    actions: {
        marginTop: "30px"
    },


    applyButton: {
        width: "100%",
        minHeight: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "15px 20px",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "13px",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: "750",
        letterSpacing: "0.1px",
        transition:
            "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease"
    },


    applyButtonIcon: {
        fontSize: "17px"
    },


    // =========================================================
    // APPLIED INFO
    // =========================================================

    appliedInfo: {
        marginTop: "15px",
        padding: "17px",
        background:
            "linear-gradient(135deg, rgba(16,185,129,0.09), rgba(15,23,42,0.4))",
        border:
            "1px solid rgba(52,211,153,0.16)",
        borderRadius: "14px",
        color: "#d1fae5",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "15px",
        flexWrap: "wrap"
    },


    appliedContent: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },


    appliedIcon: {
        width: "35px",
        height: "35px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        background:
            "rgba(16,185,129,0.16)",
        border:
            "1px solid rgba(52,211,153,0.22)",
        borderRadius: "10px",
        color: "#6ee7b7",
        fontWeight: "800"
    },


    appliedTitle: {
        color: "#d1fae5",
        fontSize: "14px"
    },


    appliedText: {
        margin: "4px 0 0",
        color: "#86efac",
        fontSize: "12px",
        lineHeight: "1.5"
    },


    applicationsButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "10px 14px",
        border:
            "1px solid rgba(99,102,241,0.28)",
        borderRadius: "9px",
        background:
            "rgba(99,102,241,0.13)",
        color: "#a5b4fc",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "12px"
    },


    buttonArrow: {
        fontSize: "15px"
    },


    // =========================================================
    // SUCCESS
    // =========================================================

    success: {
        marginTop: "20px",
        padding: "16px",
        background:
            "linear-gradient(135deg, rgba(16,185,129,0.10), rgba(5,150,105,0.05))",
        color: "#d1fae5",
        borderRadius: "13px",
        border:
            "1px solid rgba(52,211,153,0.18)",
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },


    successIcon: {
        width: "34px",
        height: "34px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "10px",
        background:
            "rgba(16,185,129,0.15)",
        color: "#6ee7b7",
        fontWeight: "800",
        fontSize: "16px"
    },


    successTitle: {
        display: "block",
        color: "#a7f3d0",
        fontSize: "13px"
    },


    successText: {
        margin: "3px 0 0",
        color: "#86efac",
        fontSize: "12px"
    },


    // =========================================================
    // ERROR
    // =========================================================

    error: {
        marginTop: "20px",
        padding: "16px",
        background:
            "linear-gradient(135deg, rgba(239,68,68,0.10), rgba(127,29,29,0.05))",
        color: "#fecaca",
        borderRadius: "13px",
        border:
            "1px solid rgba(248,113,113,0.18)",
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },


    inlineErrorIcon: {
        width: "34px",
        height: "34px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "10px",
        background:
            "rgba(239,68,68,0.14)",
        color: "#fca5a5",
        fontWeight: "800",
        fontSize: "16px"
    },


    inlineErrorTitle: {
        display: "block",
        color: "#fecaca",
        fontSize: "13px"
    },


    inlineErrorText: {
        margin: "3px 0 0",
        color: "#fca5a5",
        fontSize: "12px",
        lineHeight: "1.5"
    },


    // =========================================================
    // LOADING
    // =========================================================

    loadingWrapper: {
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        padding: "80px 30px",
        background:
            "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(15,23,42,0.72))",
        border:
            "1px solid rgba(148,163,184,0.13)",
        borderRadius: "22px",
        boxShadow:
            "0 25px 70px rgba(0,0,0,0.3)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)"
    },


    loadingOrb: {
        width: "65px",
        height: "65px",
        margin: "0 auto 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "20px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(34,211,238,0.08))",
        border:
            "1px solid rgba(129,140,248,0.22)",
        color: "#a5b4fc",
        fontSize: "25px",
        boxShadow:
            "0 15px 40px rgba(99,102,241,0.12)"
    },


    loadingTitle: {
        margin: "0 0 8px",
        color: "#f8fafc",
        fontSize: "22px",
        fontWeight: "700"
    },


    loadingText: {
        margin: 0,
        color: "#94a3b8",
        fontSize: "13px"
    },


    loadingBar: {
        width: "170px",
        height: "4px",
        margin: "25px auto 0",
        overflow: "hidden",
        borderRadius: "999px",
        background:
            "rgba(148,163,184,0.10)"
    },


    loadingBarProgress: {
        width: "45%",
        height: "100%",
        borderRadius: "999px",
        background:
            "linear-gradient(90deg, #6366f1, #22d3ee)",
        boxShadow:
            "0 0 15px rgba(99,102,241,0.5)"
    },


    // =========================================================
    // ERROR CARD
    // =========================================================

    errorCard: {
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        padding: "60px 30px",
        marginBottom: "20px",
        background:
            "linear-gradient(145deg, rgba(15,23,42,0.92), rgba(15,23,42,0.75))",
        border:
            "1px solid rgba(148,163,184,0.13)",
        borderRadius: "22px",
        boxShadow:
            "0 25px 70px rgba(0,0,0,0.3)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)"
    },


    errorIconWrapper: {
        width: "64px",
        height: "64px",
        margin: "0 auto 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "20px",
        background:
            "rgba(239,68,68,0.10)",
        border:
            "1px solid rgba(248,113,113,0.18)"
    },


    errorIcon: {
        width: "28px",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background:
            "rgba(239,68,68,0.18)",
        color: "#fca5a5",
        fontWeight: "800",
        fontSize: "16px"
    },


    searchIcon: {
        color: "#a5b4fc",
        fontSize: "28px",
        fontWeight: "800"
    },


    errorEyebrow: {
        marginBottom: "8px",
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.6px"
    },


    errorTitle: {
        margin: 0,
        color: "#f8fafc",
        fontSize: "23px",
        fontWeight: "700"
    },


    errorText: {
        maxWidth: "600px",
        margin: "11px auto 0",
        color: "#fca5a5",
        lineHeight: "1.7",
        fontSize: "13px"
    }

};


export default JobDetails;