import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function EditJob() {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        companyName: "",
        location: "",
        salary: "",
        jobType: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // =========================================================
    // LOAD JOB
    // =========================================================

    useEffect(() => {
        const loadJob = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await api.get(`/jobs/${jobId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const job = response.data;

                setFormData({
                    title: job?.title || "",
                    description: job?.description || "",
                    companyName: job?.companyName || "",
                    location: job?.location || "",
                    salary:
                        job?.salary !== null &&
                        job?.salary !== undefined
                            ? job.salary
                            : "",
                    jobType: job?.jobType || ""
                });
            } catch (err) {
                console.error("Failed to load job:", err);

                const status = err.response?.status;

                if (status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }

                if (status === 403) {
                    setError(
                        "You are not authorized to access this job. Please make sure you are logged in with the correct HR account."
                    );
                    return;
                }

                if (status === 404) {
                    setError(
                        "This job could not be found. It may have been deleted."
                    );
                    return;
                }

                setError(
                    err.response?.data?.message ||
                        (typeof err.response?.data === "string"
                            ? err.response.data
                            : "Failed to load job details.")
                );
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            loadJob();
        } else {
            setError("Invalid job ID.");
            setLoading(false);
        }
    }, [jobId, navigate]);

    // =========================================================
    // HANDLE INPUT
    // =========================================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        // Clear old messages while editing
        if (error) {
            setError("");
        }

        if (message) {
            setMessage("");
        }
    };

    // =========================================================
    // UPDATE JOB
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const requestData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                companyName: formData.companyName.trim(),
                location: formData.location.trim(),
                salary:
                    formData.salary === ""
                        ? null
                        : Number(formData.salary),
                jobType: formData.jobType
            };

            // Basic frontend validation
            if (!requestData.title) {
                setError("Please enter a job title.");
                return;
            }

            if (!requestData.companyName) {
                setError("Please enter the company name.");
                return;
            }

            if (!requestData.location) {
                setError("Please enter the job location.");
                return;
            }

            if (!requestData.jobType) {
                setError("Please select a job type.");
                return;
            }

            if (!requestData.description) {
                setError("Please enter the job description.");
                return;
            }

            if (
                requestData.salary !== null &&
                (Number.isNaN(requestData.salary) ||
                    requestData.salary < 0)
            ) {
                setError("Please enter a valid salary.");
                return;
            }

            await api.put(`/jobs/${jobId}`, requestData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage("Job updated successfully.");

            // Return to HR jobs after successful update
            setTimeout(() => {
                navigate("/hr/jobs");
            }, 900);
        } catch (err) {
            console.error("Failed to update job:", err);

            const status = err.response?.status;

            if (status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            if (status === 403) {
                setError(
                    "You are not authorized to edit this job. Only the HR account that manages this job can update it."
                );
                return;
            }

            if (status === 404) {
                setError(
                    "This job could not be found. It may have been deleted."
                );
                return;
            }

            setError(
                err.response?.data?.message ||
                    (typeof err.response?.data === "string"
                        ? err.response.data
                        : "Failed to update job.")
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // LOADING SCREEN
    // =========================================================

    if (loading) {
        return (
            <div style={styles.page}>
                <div style={styles.backgroundGlowOne} />
                <div style={styles.backgroundGlowTwo} />

                <header style={styles.header}>
                    <div style={styles.brandSection}>
                        <div style={styles.logoMark}>H</div>

                        <div>
                            <h1 style={styles.logo}>
                                Hire<span style={styles.logoAccent}>AI</span>
                            </h1>

                            <p style={styles.subtitle}>
                                HR Management Workspace
                            </p>
                        </div>
                    </div>
                </header>

                <main style={styles.container}>
                    <div style={styles.loadingCard}>
                        <div style={styles.spinner} />

                        <h2 style={styles.loadingTitle}>
                            Loading job details
                        </h2>

                        <p style={styles.loadingText}>
                            Please wait while we retrieve the job information.
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
            {/* Ambient background */}
            <div style={styles.backgroundGlowOne} />
            <div style={styles.backgroundGlowTwo} />
            <div style={styles.backgroundGlowThree} />

            {/* =================================================
                HEADER
            ================================================= */}

            <header style={styles.header}>
                <div style={styles.headerInner}>
                    {/* Brand */}
                    <div style={styles.brandSection}>
                        <div style={styles.logoMark}>H</div>

                        <div>
                            <h1 style={styles.logo}>
                                Hire<span style={styles.logoAccent}>AI</span>
                            </h1>

                            <p style={styles.subtitle}>
                                HR Management Workspace
                            </p>
                        </div>
                    </div>

                    {/* Header actions */}
                    <div style={styles.headerButtons}>
                        <button
                            type="button"
                            style={styles.profileButton}
                            onClick={() => navigate("/profile")}
                        >
                            <span style={styles.buttonIcon}>◉</span>
                            My Profile
                        </button>

                        <button
                            type="button"
                            style={styles.logoutButton}
                            onClick={() => {
                                localStorage.removeItem("token");
                                navigate("/login");
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* =================================================
                MAIN
            ================================================= */}

            <main style={styles.container}>
                {/* Back navigation */}
                <button
                    type="button"
                    style={styles.backButton}
                    onClick={() => navigate("/hr/jobs")}
                >
                    <span style={styles.backArrow}>←</span>
                    Back to My Jobs
                </button>

                {/* Page heading */}
                <section style={styles.pageHeading}>
                    <div>
                        <div style={styles.eyebrow}>
                            JOB MANAGEMENT
                        </div>

                        <h2 style={styles.heading}>
                            Edit Job Posting
                        </h2>

                        <p style={styles.description}>
                            Update your job posting details and keep your
                            opportunity information current.
                        </p>
                    </div>

                    <div style={styles.jobIdBadge}>
                        <span style={styles.jobIdLabel}>JOB ID</span>
                        <span style={styles.jobIdValue}>#{jobId}</span>
                    </div>
                </section>

                {/* =================================================
                    FORM CARD
                ================================================= */}

                <div style={styles.formCard}>
                    {/* Top gradient line */}
                    <div style={styles.cardAccent} />

                    {/* Card header */}
                    <div style={styles.formCardHeader}>
                        <div>
                            <h3 style={styles.formCardTitle}>
                                Job Information
                            </h3>

                            <p style={styles.formCardSubtitle}>
                                Make changes to the information below.
                            </p>
                        </div>

                        <div style={styles.statusBadge}>
                            <span style={styles.statusDot} />
                            Editing
                        </div>
                    </div>

                    {/* SUCCESS MESSAGE */}

                    {message && (
                        <div style={styles.success}>
                            <div style={styles.messageIcon}>✓</div>

                            <div>
                                <strong style={styles.successTitle}>
                                    Changes saved
                                </strong>

                                <div style={styles.successText}>
                                    Your job has been updated successfully.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ERROR MESSAGE */}

                    {error && (
                        <div style={styles.error}>
                            <div style={styles.errorIcon}>!</div>

                            <div>
                                <strong style={styles.errorTitle}>
                                    Unable to continue
                                </strong>

                                <div style={styles.errorText}>
                                    {error}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGrid}>
                            {/* TITLE */}

                            <div
                                style={{
                                    ...styles.formGroup,
                                    gridColumn: "1 / -1"
                                }}
                            >
                                <label
                                    htmlFor="title"
                                    style={styles.label}
                                >
                                    Job Title
                                    <span style={styles.required}>*</span>
                                </label>

                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>✦</span>

                                    <input
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Senior Java Backend Developer"
                                        required
                                        style={styles.inputWithIcon}
                                    />
                                </div>
                            </div>

                            {/* COMPANY */}

                            <div style={styles.formGroup}>
                                <label
                                    htmlFor="companyName"
                                    style={styles.label}
                                >
                                    Company Name
                                    <span style={styles.required}>*</span>
                                </label>

                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>◈</span>

                                    <input
                                        id="companyName"
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="Enter company name"
                                        required
                                        style={styles.inputWithIcon}
                                    />
                                </div>
                            </div>

                            {/* LOCATION */}

                            <div style={styles.formGroup}>
                                <label
                                    htmlFor="location"
                                    style={styles.label}
                                >
                                    Location
                                    <span style={styles.required}>*</span>
                                </label>

                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>⌖</span>

                                    <input
                                        id="location"
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="e.g. Bangalore, India"
                                        required
                                        style={styles.inputWithIcon}
                                    />
                                </div>
                            </div>

                            {/* JOB TYPE */}

                            <div style={styles.formGroup}>
                                <label
                                    htmlFor="jobType"
                                    style={styles.label}
                                >
                                    Job Type
                                    <span style={styles.required}>*</span>
                                </label>

                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>▣</span>

                                    <select
                                        id="jobType"
                                        name="jobType"
                                        value={formData.jobType}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            ...styles.inputWithIcon,
                                            cursor: "pointer"
                                        }}
                                    >
                                        <option value="">
                                            Select Job Type
                                        </option>

                                        <option value="FULL_TIME">
                                            Full Time
                                        </option>

                                        <option value="PART_TIME">
                                            Part Time
                                        </option>

                                        <option value="INTERNSHIP">
                                            Internship
                                        </option>

                                        <option value="CONTRACT">
                                            Contract
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* SALARY */}

                            <div style={styles.formGroup}>
                                <label
                                    htmlFor="salary"
                                    style={styles.label}
                                >
                                    Salary
                                    <span style={styles.required}>*</span>
                                </label>

                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>₹</span>

                                    <input
                                        id="salary"
                                        type="number"
                                        name="salary"
                                        value={formData.salary}
                                        onChange={handleChange}
                                        placeholder="Enter annual salary"
                                        min="0"
                                        step="1"
                                        required
                                        style={styles.inputWithIcon}
                                    />
                                </div>
                            </div>

                            {/* DESCRIPTION */}

                            <div
                                style={{
                                    ...styles.formGroup,
                                    gridColumn: "1 / -1"
                                }}
                            >
                                <label
                                    htmlFor="description"
                                    style={styles.label}
                                >
                                    Job Description
                                    <span style={styles.required}>*</span>
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the role, responsibilities, required skills, qualifications, and other important details..."
                                    rows={8}
                                    required
                                    style={styles.textarea}
                                />

                                <div style={styles.helperText}>
                                    Provide enough information for candidates
                                    to clearly understand the role.
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            FORM ACTIONS
                        ================================================= */}

                        <div style={styles.formFooter}>
                            <div style={styles.footerHint}>
                                <span style={styles.hintIcon}>✓</span>
                                Changes will be reflected on the job listing.
                            </div>

                            <div style={styles.buttons}>
                                <button
                                    type="button"
                                    style={styles.cancelButton}
                                    onClick={() => navigate("/hr/jobs")}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    style={{
                                        ...styles.saveButton,
                                        ...(saving
                                            ? styles.saveButtonDisabled
                                            : {})
                                    }}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span style={styles.buttonSpinner} />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <span style={styles.saveIcon}>
                                                ✓
                                            </span>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

/* =============================================================
   STYLES
============================================================= */

const styles = {
    page: {
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
            "radial-gradient(circle at 15% 15%, rgba(79, 70, 229, 0.18), transparent 30%), radial-gradient(circle at 85% 10%, rgba(124, 58, 237, 0.15), transparent 28%), linear-gradient(135deg, #070b18 0%, #0b1020 45%, #10162d 100%)",
        color: "#f8fafc",
        fontFamily:
            "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    },

    backgroundGlowOne: {
        position: "fixed",
        width: "420px",
        height: "420px",
        borderRadius: "50%",
        top: "-180px",
        left: "-160px",
        background:
            "radial-gradient(circle, rgba(79, 70, 229, 0.20), transparent 70%)",
        filter: "blur(10px)",
        pointerEvents: "none",
        zIndex: 0
    },

    backgroundGlowTwo: {
        position: "fixed",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        right: "-220px",
        top: "120px",
        background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.16), transparent 70%)",
        filter: "blur(15px)",
        pointerEvents: "none",
        zIndex: 0
    },

    backgroundGlowThree: {
        position: "fixed",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        bottom: "-220px",
        left: "35%",
        background:
            "radial-gradient(circle, rgba(37, 99, 235, 0.12), transparent 70%)",
        filter: "blur(20px)",
        pointerEvents: "none",
        zIndex: 0
    },

    header: {
        position: "relative",
        zIndex: 5,
        borderBottom: "1px solid rgba(148, 163, 184, 0.10)",
        background: "rgba(7, 11, 24, 0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)"
    },

    headerInner: {
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "18px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
    },

    brandSection: {
        display: "flex",
        alignItems: "center",
        gap: "13px"
    },

    logoMark: {
        width: "42px",
        height: "42px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        boxShadow:
            "0 8px 25px rgba(79, 70, 229, 0.35)",
        fontSize: "21px",
        fontWeight: "800",
        color: "#ffffff"
    },

    logo: {
        margin: 0,
        fontSize: "23px",
        lineHeight: 1.1,
        fontWeight: "800",
        letterSpacing: "-0.5px",
        color: "#ffffff"
    },

    logoAccent: {
        color: "#8b5cf6"
    },

    subtitle: {
        margin: "4px 0 0",
        color: "#94a3b8",
        fontSize: "11px",
        letterSpacing: "0.5px"
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
        border: "1px solid rgba(129, 140, 248, 0.20)",
        borderRadius: "10px",
        background: "rgba(79, 70, 229, 0.10)",
        color: "#c7d2fe",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px"
    },

    buttonIcon: {
        fontSize: "12px"
    },

    logoutButton: {
        padding: "10px 15px",
        border: "1px solid rgba(248, 113, 113, 0.18)",
        borderRadius: "10px",
        background: "rgba(239, 68, 68, 0.08)",
        color: "#fca5a5",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px"
    },

    container: {
        position: "relative",
        zIndex: 2,
        maxWidth: "1120px",
        margin: "0 auto",
        padding: "36px 28px 70px"
    },

    backButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "28px",
        padding: "9px 14px",
        border: "1px solid rgba(148, 163, 184, 0.14)",
        borderRadius: "10px",
        background: "rgba(15, 23, 42, 0.60)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
        transition: "all 0.2s ease"
    },

    backArrow: {
        fontSize: "18px",
        lineHeight: 1
    },

    pageHeading: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "30px",
        marginBottom: "28px"
    },

    eyebrow: {
        display: "inline-block",
        marginBottom: "9px",
        color: "#818cf8",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "1.8px"
    },

    heading: {
        margin: 0,
        fontSize: "38px",
        lineHeight: 1.15,
        fontWeight: "800",
        letterSpacing: "-1.2px",
        color: "#f8fafc"
    },

    description: {
        maxWidth: "650px",
        margin: "11px 0 0",
        color: "#94a3b8",
        fontSize: "14px",
        lineHeight: 1.7
    },

    jobIdBadge: {
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "4px",
        padding: "11px 15px",
        border: "1px solid rgba(129, 140, 248, 0.18)",
        borderRadius: "12px",
        background: "rgba(79, 70, 229, 0.08)"
    },

    jobIdLabel: {
        color: "#64748b",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1.5px"
    },

    jobIdValue: {
        color: "#a5b4fc",
        fontSize: "15px",
        fontWeight: "800"
    },

    formCard: {
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(148, 163, 184, 0.12)",
        borderRadius: "20px",
        background:
            "linear-gradient(145deg, rgba(18, 25, 48, 0.88), rgba(11, 17, 34, 0.88))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow:
            "0 25px 70px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255,255,255,0.03)"
    },

    cardAccent: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        background:
            "linear-gradient(90deg, transparent, #6366f1, #8b5cf6, transparent)"
    },

    formCardHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        padding: "27px 30px",
        borderBottom: "1px solid rgba(148, 163, 184, 0.09)"
    },

    formCardTitle: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "750",
        color: "#f8fafc"
    },

    formCardSubtitle: {
        margin: "5px 0 0",
        color: "#64748b",
        fontSize: "12px"
    },

    statusBadge: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "7px 11px",
        borderRadius: "999px",
        border: "1px solid rgba(99, 102, 241, 0.18)",
        background: "rgba(99, 102, 241, 0.08)",
        color: "#a5b4fc",
        fontSize: "11px",
        fontWeight: "700"
    },

    statusDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#818cf8",
        boxShadow: "0 0 10px rgba(129, 140, 248, 0.8)"
    },

    success: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        margin: "22px 30px 0",
        padding: "14px 16px",
        border: "1px solid rgba(52, 211, 153, 0.18)",
        borderRadius: "12px",
        background: "rgba(16, 185, 129, 0.07)"
    },

    messageIcon: {
        width: "25px",
        height: "25px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "rgba(16, 185, 129, 0.15)",
        color: "#6ee7b7",
        fontWeight: "800"
    },

    successTitle: {
        display: "block",
        marginBottom: "3px",
        color: "#a7f3d0",
        fontSize: "13px"
    },

    successText: {
        color: "#6ee7b7",
        fontSize: "12px"
    },

    error: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        margin: "22px 30px 0",
        padding: "14px 16px",
        border: "1px solid rgba(248, 113, 113, 0.18)",
        borderRadius: "12px",
        background: "rgba(239, 68, 68, 0.07)"
    },

    errorIcon: {
        width: "25px",
        height: "25px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "rgba(239, 68, 68, 0.15)",
        color: "#fca5a5",
        fontWeight: "800"
    },

    errorTitle: {
        display: "block",
        marginBottom: "3px",
        color: "#fecaca",
        fontSize: "13px"
    },

    errorText: {
        color: "#fca5a5",
        fontSize: "12px",
        lineHeight: 1.5
    },

    formGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "22px 20px",
        padding: "30px"
    },

    formGroup: {
        minWidth: 0
    },

    label: {
        display: "block",
        marginBottom: "8px",
        color: "#cbd5e1",
        fontSize: "12px",
        fontWeight: "700",
        letterSpacing: "0.2px"
    },

    required: {
        marginLeft: "4px",
        color: "#a78bfa"
    },

    inputWrapper: {
        position: "relative",
        width: "100%"
    },

    inputIcon: {
        position: "absolute",
        left: "14px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 1,
        color: "#818cf8",
        fontSize: "14px",
        fontWeight: "700",
        pointerEvents: "none"
    },

    inputWithIcon: {
        width: "100%",
        boxSizing: "border-box",
        padding: "13px 14px 13px 40px",
        border: "1px solid rgba(100, 116, 139, 0.22)",
        borderRadius: "11px",
        outline: "none",
        background: "rgba(7, 12, 27, 0.72)",
        color: "#f8fafc",
        fontSize: "13px",
        fontFamily: "inherit",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease"
    },

    textarea: {
        width: "100%",
        boxSizing: "border-box",
        padding: "14px",
        border: "1px solid rgba(100, 116, 139, 0.22)",
        borderRadius: "11px",
        outline: "none",
        background: "rgba(7, 12, 27, 0.72)",
        color: "#f8fafc",
        fontSize: "13px",
        lineHeight: 1.65,
        fontFamily: "inherit",
        resize: "vertical",
        minHeight: "180px",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease"
    },

    helperText: {
        marginTop: "7px",
        color: "#64748b",
        fontSize: "10px",
        lineHeight: 1.5
    },

    formFooter: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        padding: "22px 30px",
        borderTop: "1px solid rgba(148, 163, 184, 0.09)",
        background: "rgba(7, 12, 27, 0.24)"
    },

    footerHint: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#64748b",
        fontSize: "11px"
    },

    hintIcon: {
        width: "18px",
        height: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "rgba(99, 102, 241, 0.10)",
        color: "#818cf8",
        fontSize: "10px"
    },

    buttons: {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },

    cancelButton: {
        padding: "11px 19px",
        border: "1px solid rgba(148, 163, 184, 0.16)",
        borderRadius: "10px",
        background: "rgba(30, 41, 59, 0.55)",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: "650",
        fontSize: "12px"
    },

    saveButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        minWidth: "150px",
        padding: "11px 19px",
        border: "1px solid rgba(129, 140, 248, 0.35)",
        borderRadius: "10px",
        background:
            "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "12px",
        boxShadow:
            "0 10px 25px rgba(79, 70, 229, 0.25)"
    },

    saveButtonDisabled: {
        opacity: 0.65,
        cursor: "not-allowed",
        boxShadow: "none"
    },

    saveIcon: {
        fontSize: "14px"
    },

    buttonSpinner: {
        width: "13px",
        height: "13px",
        border: "2px solid rgba(255,255,255,0.35)",
        borderTop: "2px solid #ffffff",
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.8s linear infinite"
    },

    loadingCard: {
        maxWidth: "500px",
        margin: "100px auto",
        padding: "55px 35px",
        textAlign: "center",
        border: "1px solid rgba(148, 163, 184, 0.12)",
        borderRadius: "20px",
        background: "rgba(15, 23, 42, 0.68)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 25px 70px rgba(0,0,0,0.28)"
    },

    spinner: {
        width: "42px",
        height: "42px",
        margin: "0 auto 22px",
        border: "3px solid rgba(129, 140, 248, 0.18)",
        borderTop: "3px solid #818cf8",
        borderRight: "3px solid #8b5cf6",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
    },

    loadingTitle: {
        margin: 0,
        color: "#f8fafc",
        fontSize: "20px",
        fontWeight: "750"
    },

    loadingText: {
        margin: "8px 0 0",
        color: "#64748b",
        fontSize: "13px",
        lineHeight: 1.6
    }
};

export default EditJob;