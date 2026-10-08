import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
    ArrowLeft,
    BriefcaseBusiness,
    Building2,
    MapPin,
    Briefcase,
    IndianRupee,
    FileText,
    CheckCircle2,
    AlertCircle,
    UserCircle,
    LogOut,
    Sparkles
} from "lucide-react";

function CreateJob() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        companyName: "",
        location: "",
        jobType: "FULL_TIME",
        salary: "",
        description: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");


    // =========================================================
    // HANDLE INPUT
    // =========================================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        // Clear messages while typing
        if (error) {
            setError("");
        }

        if (message) {
            setMessage("");
        }
    };


    // =========================================================
    // CREATE JOB
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");


        // ---------------------------------------------------------
        // VALIDATION
        // ---------------------------------------------------------

        if (!formData.title.trim()) {

            setError("Job title is required.");
            return;
        }

        if (!formData.companyName.trim()) {

            setError("Company name is required.");
            return;
        }

        if (!formData.location.trim()) {

            setError("Location is required.");
            return;
        }

        if (!formData.description.trim()) {

            setError("Job description is required.");
            return;
        }


        const token = localStorage.getItem("token");

        if (!token) {

            navigate("/login");
            return;
        }


        try {

            setLoading(true);


            const requestData = {
                title: formData.title.trim(),
                companyName: formData.companyName.trim(),
                location: formData.location.trim(),
                jobType: formData.jobType,
                salary: formData.salary
                    ? Number(formData.salary)
                    : null,
                description: formData.description.trim()
            };


            console.log(
                "Creating job:",
                requestData
            );


            const response = await api.post(
                "/jobs",
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            console.log(
                "Job created:",
                response.data
            );


            setMessage(
                "Job posted successfully."
            );


            // ---------------------------------------------------------
            // RETURN TO JOB LIST
            // ---------------------------------------------------------

            setTimeout(() => {

                navigate("/hr/jobs");

            }, 1000);


        } catch (err) {

            console.error(
                "Failed to create job:",
                err
            );


            // ---------------------------------------------------------
            // UNAUTHORIZED
            // ---------------------------------------------------------

            if (err.response?.status === 401) {

                localStorage.removeItem("token");

                navigate("/login");

                return;
            }


            // ---------------------------------------------------------
            // FORBIDDEN
            // ---------------------------------------------------------

            if (err.response?.status === 403) {

                setError(
                    "You are not authorized to create jobs."
                );

                return;
            }


            // ---------------------------------------------------------
            // OTHER ERRORS
            // ---------------------------------------------------------

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to create job."
            );


        } finally {

            setLoading(false);
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
    // PAGE
    // =========================================================

    return (

        <div style={styles.page}>

            {/* =================================================
                DECORATIVE BACKGROUND
            ================================================= */}

            <div style={styles.backgroundGlowOne} />
            <div style={styles.backgroundGlowTwo} />


            {/* =================================================
                HEADER
            ================================================= */}

            <header style={styles.header}>

                <div style={styles.headerInner}>

                    {/* BRAND */}

                    <div style={styles.brandSection}>

                        <div style={styles.brandIcon}>
                            <Sparkles size={20} />
                        </div>

                        <div>

                            <h1 style={styles.logo}>
                                Hire<span style={styles.logoAccent}>AI</span>
                            </h1>

                            <p style={styles.subtitle}>
                                HR Recruitment Platform
                            </p>

                        </div>

                    </div>


                    {/* HEADER ACTIONS */}

                    <div style={styles.headerButtons}>

                        <button
                            type="button"
                            style={styles.profileButton}
                            onClick={() =>
                                navigate("/profile")
                            }
                        >
                            <UserCircle size={17} />
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
                        navigate("/hr/jobs")
                    }
                >
                    <ArrowLeft size={17} />
                    <span>Back to My Jobs</span>
                </button>


                {/* =================================================
                    PAGE INTRO
                ================================================= */}

                <div style={styles.titleSection}>

                    <div style={styles.titleIcon}>
                        <BriefcaseBusiness size={25} />
                    </div>

                    <div>

                        <div style={styles.pageEyebrow}>
                            JOB MANAGEMENT
                        </div>

                        <h2 style={styles.heading}>
                            Post a New Job
                        </h2>

                        <p style={styles.description}>
                            Create a professional job listing and
                            start connecting with qualified candidates.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    SUCCESS MESSAGE
                ================================================= */}

                {message && (

                    <div style={styles.success}>

                        <div style={styles.alertIconSuccess}>
                            <CheckCircle2 size={19} />
                        </div>

                        <div>

                            <strong style={styles.successTitle}>
                                Job Posted Successfully
                            </strong>

                            <p style={styles.successText}>
                                Your job has been created and will
                                now be available to candidates.
                            </p>

                        </div>

                    </div>

                )}


                {/* =================================================
                    ERROR MESSAGE
                ================================================= */}

                {error && (

                    <div style={styles.error}>

                        <div style={styles.alertIconError}>
                            <AlertCircle size={19} />
                        </div>

                        <div>

                            <strong style={styles.errorTitle}>
                                Unable to Post Job
                            </strong>

                            <p style={styles.errorText}>
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* =================================================
                    FORM CARD
                ================================================= */}

                <form
                    style={styles.form}
                    onSubmit={handleSubmit}
                >

                    {/* =================================================
                        FORM HEADER
                    ================================================= */}

                    <div style={styles.formHeader}>

                        <div>

                            <h3 style={styles.formTitle}>
                                Job Information
                            </h3>

                            <p style={styles.formSubtitle}>
                                Provide the details candidates need
                                to understand this opportunity.
                            </p>

                        </div>

                        <div style={styles.requiredBadge}>
                            * Required
                        </div>

                    </div>


                    <div style={styles.divider} />


                    {/* =================================================
                        BASIC INFORMATION
                    ================================================= */}

                    <div style={styles.sectionTitle}>

                        <div style={styles.sectionIcon}>
                            <Briefcase size={17} />
                        </div>

                        <div>

                            <h4 style={styles.sectionHeading}>
                                Basic Information
                            </h4>

                            <p style={styles.sectionDescription}>
                                Tell candidates what position you are hiring for.
                            </p>

                        </div>

                    </div>


                    <div style={styles.twoColumnGrid}>

                        {/* JOB TITLE */}

                        <div style={styles.formGroup}>

                            <label style={styles.label}>
                                Job Title
                                <span style={styles.required}>
                                    *
                                </span>
                            </label>

                            <div style={styles.inputWrapper}>

                                <Briefcase
                                    size={17}
                                    style={styles.inputIcon}
                                />

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Java Backend Developer"
                                    style={styles.input}
                                />

                            </div>

                        </div>


                        {/* COMPANY */}

                        <div style={styles.formGroup}>

                            <label style={styles.label}>
                                Company Name
                                <span style={styles.required}>
                                    *
                                </span>
                            </label>

                            <div style={styles.inputWrapper}>

                                <Building2
                                    size={17}
                                    style={styles.inputIcon}
                                />

                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="e.g. HireAI Technologies"
                                    style={styles.input}
                                />

                            </div>

                        </div>


                        {/* LOCATION */}

                        <div style={styles.formGroup}>

                            <label style={styles.label}>
                                Location
                                <span style={styles.required}>
                                    *
                                </span>
                            </label>

                            <div style={styles.inputWrapper}>

                                <MapPin
                                    size={17}
                                    style={styles.inputIcon}
                                />

                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Bhubaneswar, Odisha"
                                    style={styles.input}
                                />

                            </div>

                        </div>


                        {/* JOB TYPE */}

                        <div style={styles.formGroup}>

                            <label style={styles.label}>
                                Job Type
                                <span style={styles.required}>
                                    *
                                </span>
                            </label>

                            <div style={styles.inputWrapper}>

                                <BriefcaseBusiness
                                    size={17}
                                    style={styles.inputIcon}
                                />

                                <select
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleChange}
                                    style={styles.select}
                                >

                                    <option value="FULL_TIME">
                                        Full Time
                                    </option>

                                    <option value="PART_TIME">
                                        Part Time
                                    </option>

                                    <option value="CONTRACT">
                                        Contract
                                    </option>

                                    <option value="INTERNSHIP">
                                        Internship
                                    </option>

                                    <option value="FREELANCE">
                                        Freelance
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* SALARY */}

                        <div style={styles.formGroup}>

                            <label style={styles.label}>
                                Annual Salary
                            </label>

                            <div style={styles.inputWrapper}>

                                <IndianRupee
                                    size={17}
                                    style={styles.inputIcon}
                                />

                                <input
                                    type="number"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="e.g. 600000"
                                    min="0"
                                    style={styles.input}
                                />

                            </div>

                            <small style={styles.helpText}>
                                Enter the expected annual salary in INR.
                            </small>

                        </div>

                    </div>


                    {/* =================================================
                        JOB DESCRIPTION
                    ================================================= */}

                    <div style={styles.sectionTitle}>

                        <div style={styles.sectionIcon}>
                            <FileText size={17} />
                        </div>

                        <div>

                            <h4 style={styles.sectionHeading}>
                                Job Description
                            </h4>

                            <p style={styles.sectionDescription}>
                                Explain the responsibilities, requirements
                                and skills needed for this position.
                            </p>

                        </div>

                    </div>


                    <div style={styles.formGroup}>

                        <label style={styles.label}>
                            Description
                            <span style={styles.required}>
                                *
                            </span>
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder={
                                "Describe the role, responsibilities, " +
                                "requirements, qualifications, skills, " +
                                "experience and other important details..."
                            }
                            rows="10"
                            style={styles.textarea}
                        />

                        <div style={styles.textareaFooter}>

                            <span style={styles.helpText}>
                                Make the description clear and informative
                                for potential candidates.
                            </span>

                            <span style={styles.characterCount}>
                                {formData.description.length} characters
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        FORM ACTIONS
                    ================================================= */}

                    <div style={styles.actions}>

                        <button
                            type="button"
                            style={
                                loading
                                    ? styles.cancelButtonDisabled
                                    : styles.cancelButton
                            }
                            onClick={() =>
                                navigate("/hr/jobs")
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            style={
                                loading
                                    ? styles.disabledButton
                                    : styles.submitButton
                            }
                            disabled={loading}
                        >

                            {loading ? (

                                <>
                                    <span style={styles.spinner} />
                                    Posting Job...
                                </>

                            ) : (

                                <>
                                    <CheckCircle2 size={17} />
                                    Post Job
                                </>

                            )}

                        </button>

                    </div>

                </form>


                {/* =================================================
                    BOTTOM INFORMATION
                ================================================= */}

                <div style={styles.bottomHint}>

                    <Sparkles
                        size={16}
                        style={styles.bottomHintIcon}
                    />

                    <span>
                        A clear and detailed job description helps
                        candidates understand the opportunity better.
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
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
            "radial-gradient(circle at 10% 0%, rgba(99,102,241,0.16), transparent 28%)," +
            "radial-gradient(circle at 90% 10%, rgba(168,85,247,0.13), transparent 26%)," +
            "radial-gradient(circle at 50% 100%, rgba(14,165,233,0.08), transparent 30%)," +
            "linear-gradient(135deg, #060914 0%, #0a1020 48%, #100a18 100%)",
        color: "#f8fafc",
        fontFamily:
            "'Inter', 'Segoe UI', Arial, sans-serif"
    },


    backgroundGlowOne: {
        position: "fixed",
        width: "420px",
        height: "420px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(99,102,241,0.10), transparent 68%)",
        top: "-180px",
        left: "-160px",
        pointerEvents: "none",
        zIndex: 0
    },


    backgroundGlowTwo: {
        position: "fixed",
        width: "460px",
        height: "460px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(168,85,247,0.08), transparent 68%)",
        bottom: "-220px",
        right: "-180px",
        pointerEvents: "none",
        zIndex: 0
    },


    /* =========================================================
       HEADER
    ========================================================= */

    header: {
        position: "relative",
        zIndex: 5,
        borderBottom: "1px solid rgba(148,163,184,0.12)",
        background:
            "linear-gradient(180deg, rgba(11,16,31,0.94), rgba(8,12,24,0.86))",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: "0 10px 35px rgba(0,0,0,0.20)"
    },


    headerInner: {
        maxWidth: "1250px",
        margin: "0 auto",
        padding: "18px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px"
    },


    brandSection: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },


    brandIcon: {
        width: "42px",
        height: "42px",
        borderRadius: "13px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#ffffff",
        boxShadow:
            "0 8px 25px rgba(99,102,241,0.30)"
    },


    logo: {
        margin: 0,
        fontSize: "25px",
        fontWeight: 800,
        letterSpacing: "-0.6px",
        color: "#f8fafc"
    },


    logoAccent: {
        color: "#8b5cf6"
    },


    subtitle: {
        margin: "3px 0 0",
        color: "#94a3b8",
        fontSize: "12px",
        letterSpacing: "0.2px"
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
        border: "1px solid rgba(129,140,248,0.24)",
        borderRadius: "10px",
        background:
            "rgba(99,102,241,0.10)",
        color: "#c7d2fe",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "13px"
    },


    logoutButton: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "10px 15px",
        border: "1px solid rgba(248,113,113,0.20)",
        borderRadius: "10px",
        background:
            "rgba(239,68,68,0.08)",
        color: "#fda4af",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "13px"
    },


    /* =========================================================
       MAIN
    ========================================================= */

    container: {
        position: "relative",
        zIndex: 2,
        maxWidth: "900px",
        margin: "0 auto",
        padding: "34px 25px 60px"
    },


    backButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "9px 14px",
        marginBottom: "28px",
        border: "1px solid rgba(148,163,184,0.14)",
        borderRadius: "10px",
        background: "rgba(15,23,42,0.65)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "13px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.14)"
    },


    /* =========================================================
       PAGE TITLE
    ========================================================= */

    titleSection: {
        display: "flex",
        alignItems: "flex-start",
        gap: "15px",
        marginBottom: "28px"
    },


    titleIcon: {
        flexShrink: 0,
        width: "50px",
        height: "50px",
        borderRadius: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#c4b5fd",
        background:
            "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(168,85,247,0.18))",
        border: "1px solid rgba(139,92,246,0.24)",
        boxShadow:
            "0 10px 30px rgba(99,102,241,0.13)"
    },


    pageEyebrow: {
        color: "#8b5cf6",
        fontSize: "11px",
        fontWeight: 800,
        letterSpacing: "1.5px",
        marginBottom: "5px"
    },


    heading: {
        margin: 0,
        fontSize: "32px",
        lineHeight: 1.2,
        fontWeight: 800,
        letterSpacing: "-0.8px",
        color: "#f8fafc"
    },


    description: {
        color: "#94a3b8",
        margin: "8px 0 0",
        lineHeight: 1.6,
        fontSize: "14px"
    },


    /* =========================================================
       ALERTS
    ========================================================= */

    success: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        marginBottom: "22px",
        padding: "15px 17px",
        borderRadius: "13px",
        background:
            "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))",
        border: "1px solid rgba(52,211,153,0.20)",
        color: "#d1fae5"
    },


    alertIconSuccess: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "34px",
        height: "34px",
        borderRadius: "9px",
        background: "rgba(16,185,129,0.13)",
        color: "#34d399",
        flexShrink: 0
    },


    successTitle: {
        display: "block",
        fontSize: "14px",
        color: "#a7f3d0",
        marginBottom: "3px"
    },


    successText: {
        margin: 0,
        fontSize: "12px",
        color: "#86efac"
    },


    error: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        marginBottom: "22px",
        padding: "15px 17px",
        borderRadius: "13px",
        background:
            "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(127,29,29,0.08))",
        border: "1px solid rgba(248,113,113,0.20)",
        color: "#fee2e2"
    },


    alertIconError: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "34px",
        height: "34px",
        borderRadius: "9px",
        background: "rgba(239,68,68,0.13)",
        color: "#fb7185",
        flexShrink: 0
    },


    errorTitle: {
        display: "block",
        fontSize: "14px",
        color: "#fecaca",
        marginBottom: "3px"
    },


    errorText: {
        margin: 0,
        fontSize: "12px",
        color: "#fda4af"
    },


    /* =========================================================
       FORM
    ========================================================= */

    form: {
        background:
            "linear-gradient(145deg, rgba(17,25,45,0.92), rgba(10,15,29,0.96))",
        border: "1px solid rgba(148,163,184,0.13)",
        borderRadius: "20px",
        padding: "30px",
        boxShadow:
            "0 25px 70px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.03)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)"
    },


    formHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px"
    },


    formTitle: {
        margin: 0,
        fontSize: "20px",
        fontWeight: 750,
        color: "#f8fafc"
    },


    formSubtitle: {
        margin: "5px 0 0",
        color: "#64748b",
        fontSize: "12px",
        lineHeight: 1.5
    },


    requiredBadge: {
        padding: "5px 9px",
        borderRadius: "7px",
        background: "rgba(139,92,246,0.09)",
        border: "1px solid rgba(139,92,246,0.16)",
        color: "#a78bfa",
        fontSize: "10px",
        fontWeight: 700,
        whiteSpace: "nowrap"
    },


    divider: {
        height: "1px",
        background:
            "linear-gradient(90deg, rgba(148,163,184,0.14), transparent)",
        margin: "24px 0"
    },


    /* =========================================================
       SECTIONS
    ========================================================= */

    sectionTitle: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "18px"
    },


    sectionIcon: {
        width: "32px",
        height: "32px",
        borderRadius: "9px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#a78bfa",
        background: "rgba(139,92,246,0.10)",
        border: "1px solid rgba(139,92,246,0.14)"
    },


    sectionHeading: {
        margin: 0,
        fontSize: "14px",
        fontWeight: 700,
        color: "#e2e8f0"
    },


    sectionDescription: {
        margin: "3px 0 0",
        color: "#64748b",
        fontSize: "11px"
    },


    twoColumnGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        marginBottom: "28px"
    },


    formGroup: {
        display: "flex",
        flexDirection: "column",
        minWidth: 0
    },


    label: {
        marginBottom: "8px",
        fontSize: "12px",
        fontWeight: 700,
        color: "#cbd5e1"
    },


    required: {
        color: "#a78bfa",
        marginLeft: "3px"
    },


    /* =========================================================
       INPUTS
    ========================================================= */

    inputWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center"
    },


    inputIcon: {
        position: "absolute",
        left: "13px",
        color: "#64748b",
        pointerEvents: "none",
        zIndex: 1
    },


    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 14px 12px 40px",
        border: "1px solid rgba(100,116,139,0.25)",
        borderRadius: "11px",
        background:
            "rgba(5,10,22,0.62)",
        color: "#f8fafc",
        fontSize: "13px",
        outline: "none",
        transition: "all 0.2s ease"
    },


    select: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 14px 12px 40px",
        border: "1px solid rgba(100,116,139,0.25)",
        borderRadius: "11px",
        background:
            "#0b1220",
        color: "#f8fafc",
        fontSize: "13px",
        outline: "none",
        cursor: "pointer"
    },


    textarea: {
        width: "100%",
        boxSizing: "border-box",
        padding: "14px",
        border: "1px solid rgba(100,116,139,0.25)",
        borderRadius: "11px",
        background:
            "rgba(5,10,22,0.62)",
        color: "#f8fafc",
        fontSize: "13px",
        lineHeight: 1.65,
        resize: "vertical",
        outline: "none",
        fontFamily:
            "'Inter', 'Segoe UI', Arial, sans-serif",
        transition: "all 0.2s ease"
    },


    helpText: {
        marginTop: "6px",
        color: "#64748b",
        fontSize: "11px",
        lineHeight: 1.5
    },


    textareaFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px",
        marginTop: "5px"
    },


    characterCount: {
        color: "#475569",
        fontSize: "10px",
        whiteSpace: "nowrap"
    },


    /* =========================================================
       ACTIONS
    ========================================================= */

    actions: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "11px",
        marginTop: "28px",
        paddingTop: "22px",
        borderTop: "1px solid rgba(148,163,184,0.10)"
    },


    cancelButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "11px 20px",
        border: "1px solid rgba(148,163,184,0.16)",
        borderRadius: "10px",
        background: "rgba(30,41,59,0.55)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "13px"
    },


    cancelButtonDisabled: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "11px 20px",
        border: "1px solid rgba(148,163,184,0.08)",
        borderRadius: "10px",
        background: "rgba(30,41,59,0.30)",
        color: "#475569",
        cursor: "not-allowed",
        fontWeight: 600,
        fontSize: "13px"
    },


    submitButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "11px 22px",
        border: "1px solid rgba(129,140,248,0.30)",
        borderRadius: "10px",
        background:
            "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "13px",
        boxShadow:
            "0 10px 28px rgba(99,102,241,0.25)"
    },


    disabledButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "11px 22px",
        border: "1px solid rgba(148,163,184,0.10)",
        borderRadius: "10px",
        background: "rgba(71,85,105,0.35)",
        color: "#94a3b8",
        cursor: "not-allowed",
        fontWeight: 700,
        fontSize: "13px"
    },


    spinner: {
        width: "14px",
        height: "14px",
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.30)",
        borderTopColor: "#ffffff",
        display: "inline-block"
    },


    /* =========================================================
       BOTTOM HINT
    ========================================================= */

    bottomHint: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        marginTop: "20px",
        color: "#64748b",
        fontSize: "11px",
        textAlign: "center",
        lineHeight: 1.5
    },


    bottomHintIcon: {
        color: "#8b5cf6",
        flexShrink: 0
    }

};


export default CreateJob;