import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Resume() {
    const navigate = useNavigate();

    const [resumes, setResumes] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =========================================================
    // GET AUTHORIZATION HEADER
    // =========================================================

    const getAuthConfig = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            return null;
        }

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    // =========================================================
    // LOAD MY RESUMES
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const fetchResumes = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await api.get("/resumes/my", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!cancelled) {
                    setResumes(
                        Array.isArray(response.data)
                            ? response.data
                            : []
                    );

                    setError("");
                }
            } catch (err) {
                console.error("Failed to load resumes:", err);

                if (cancelled) {
                    return;
                }

                if (
                    err.response?.status === 401 ||
                    err.response?.status === 403
                ) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    navigate("/login");
                    return;
                }

                setError(
                    err.response?.data?.message ||
                        "Failed to load resumes."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchResumes();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    // =========================================================
    // FILE SELECT
    // =========================================================

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        setMessage("");
        setError("");

        if (!file) {
            setSelectedFile(null);
            return;
        }

        // Only PDF
        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            setError("Only PDF files are allowed.");
            setSelectedFile(null);
            e.target.value = "";
            return;
        }

        // Maximum 5 MB
        if (file.size > 5 * 1024 * 1024) {
            setError("Resume size must be less than 5 MB.");
            setSelectedFile(null);
            e.target.value = "";
            return;
        }

        setSelectedFile(file);
    };

    // =========================================================
    // UPLOAD RESUME
    // =========================================================

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a PDF resume first.");
            return;
        }

        try {
            setUploading(true);
            setMessage("");
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const formData = new FormData();

            formData.append("file", selectedFile);

            console.log("Uploading file:", selectedFile);
            console.log("File name:", selectedFile.name);
            console.log("File type:", selectedFile.type);
            console.log("File size:", selectedFile.size);

            // Do NOT manually set Content-Type.
            // Browser/Axios will create the multipart boundary.
            const response = await api.post(
                "/resumes",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "Resume uploaded:",
                response.data
            );

            setMessage(
                "Resume uploaded successfully. 🎉"
            );

            setSelectedFile(null);

            const fileInput =
                document.getElementById("resumeFile");

            if (fileInput) {
                fileInput.value = "";
            }

            // Reload resumes
            const resumesResponse = await api.get(
                "/resumes/my",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setResumes(
                Array.isArray(resumesResponse.data)
                    ? resumesResponse.data
                    : []
            );
        } catch (err) {
            console.error(
                "Resume upload failed:",
                err
            );

            console.error(
                "Status:",
                err.response?.status
            );

            console.error(
                "Response:",
                err.response?.data
            );

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                navigate("/login");
                return;
            }

            if (err.response?.status === 403) {
                setError(
                    "You are not authorized to upload a resume. Please make sure you are logged in as a candidate."
                );
                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to upload resume."
            );
        } finally {
            setUploading(false);
        }
    };

    // =========================================================
    // DELETE RESUME
    // =========================================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this resume?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);
            setMessage("");
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            await api.delete(`/resumes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage(
                "Resume deleted successfully."
            );

            setResumes((previousResumes) =>
                previousResumes.filter(
                    (resume) => resume.id !== id
                )
            );
        } catch (err) {
            console.error(
                "Resume deletion failed:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                navigate("/login");
                return;
            }

            if (err.response?.status === 403) {
                setError(
                    "You are not authorized to delete this resume."
                );
                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to delete resume."
            );
        } finally {
            setDeleting(false);
        }
    };

    // =========================================================
    // VIEW RESUME PDF
    // =========================================================

    const handleViewResume = async (id) => {
        try {
            setMessage("");
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await api.get(
                `/resumes/${id}/view`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: "blob",
                }
            );

            const pdfBlob = new Blob(
                [response.data],
                {
                    type: "application/pdf",
                }
            );

            const pdfUrl =
                URL.createObjectURL(pdfBlob);

            const newWindow = window.open(
                pdfUrl,
                "_blank",
                "noopener,noreferrer"
            );

            if (!newWindow) {
                setError(
                    "Please allow pop-ups to view your resume."
                );
            }

            setTimeout(() => {
                URL.revokeObjectURL(pdfUrl);
            }, 60000);
        } catch (err) {
            console.error(
                "Failed to view resume:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                navigate("/login");
                return;
            }

            if (err.response?.status === 403) {
                setError(
                    "You are not authorized to view this resume."
                );
                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to open resume."
            );
        }
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        try {
            return new Date(date).toLocaleString(
                "en-IN"
            );
        } catch {
            return "N/A";
        }
    };

    // =========================================================
    // FORMAT FILE SIZE
    // =========================================================

    const formatFileSize = (size) => {
        if (!size) {
            return null;
        }

        return `${(
            size /
            1024 /
            1024
        ).toFixed(2)} MB`;
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
                    <div style={styles.brandContainer}>
                        <div style={styles.logoIcon}>
                            🚀
                        </div>

                        <div>
                            <h1 style={styles.logo}>
                                Hire
                                <span style={styles.logoAccent}>
                                    AI
                                </span>
                            </h1>

                            <p style={styles.subtitle}>
                                Resume Management
                            </p>
                        </div>
                    </div>
                </header>

                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}>
                        ⟳
                    </div>

                    <h2 style={styles.loadingTitle}>
                        Loading your resumes
                    </h2>

                    <p style={styles.loadingText}>
                        Please wait while we fetch your
                        resume library...
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
            <div style={styles.backgroundGlowOne} />
            <div style={styles.backgroundGlowTwo} />
            <div style={styles.backgroundGlowThree} />

            {/* =================================================
                HEADER
            ================================================= */}

            <header style={styles.header}>
                <div style={styles.brandContainer}>
                    <div
                        style={styles.logoIcon}
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        🚀
                    </div>

                    <div>
                        <h1
                            style={styles.logo}
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            Hire
                            <span style={styles.logoAccent}>
                                AI
                            </span>
                        </h1>

                        <p style={styles.subtitle}>
                            Smart Hiring Platform
                        </p>
                    </div>

                    <div style={styles.roleBadge}>
                        CANDIDATE
                    </div>
                </div>

                <div style={styles.headerButtons}>
                    <button
                        type="button"
                        style={styles.profileButton}
                        onClick={() =>
                            navigate("/profile")
                        }
                    >
                        <span>👤</span>
                        <span>My Profile</span>
                    </button>
                </div>
            </header>

            {/* =================================================
                MAIN
            ================================================= */}

            <main style={styles.container}>
                {/* Back button */}

                <button
                    type="button"
                    style={styles.backButton}
                    onClick={() =>
                        navigate("/dashboard")
                    }
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                            "rgba(99,102,241,.14)";
                        e.currentTarget.style.borderColor =
                            "rgba(129,140,248,.30)";
                        e.currentTarget.style.color =
                            "#c7d2fe";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                            "rgba(15,23,42,.65)";
                        e.currentTarget.style.borderColor =
                            "rgba(148,163,184,.14)";
                        e.currentTarget.style.color =
                            "#94a3b8";
                    }}
                >
                    <span>←</span>
                    Dashboard
                </button>

                {/* =================================================
                    PAGE HEADING
                ================================================= */}

                <section style={styles.headingSection}>
                    <div>
                        <div style={styles.eyebrow}>
                            CANDIDATE PROFILE
                        </div>

                        <h2 style={styles.heading}>
                            My{" "}
                            <span style={styles.headingAccent}>
                                Resume
                            </span>
                        </h2>

                        <p style={styles.headingDescription}>
                            Upload and manage your latest
                            resume for job applications.
                        </p>
                    </div>

                    <div style={styles.resumeSummary}>
                        <div style={styles.summaryIcon}>
                            📄
                        </div>

                        <div>
                            <span style={styles.summaryLabel}>
                                RESUME LIBRARY
                            </span>

                            <strong style={styles.summaryValue}>
                                {resumes.length}
                            </strong>
                        </div>
                    </div>
                </section>

                {/* =================================================
                    MESSAGE
                ================================================= */}

                {message && (
                    <div style={styles.success}>
                        <div style={styles.alertIconSuccess}>
                            ✓
                        </div>

                        <div>
                            <strong>
                                Success
                            </strong>

                            <span>
                                {message}
                            </span>
                        </div>
                    </div>
                )}

                {error && (
                    <div style={styles.error}>
                        <div style={styles.alertIconError}>
                            !
                        </div>

                        <div>
                            <strong>
                                Something went wrong
                            </strong>

                            <span>
                                {error}
                            </span>
                        </div>
                    </div>
                )}

                {/* =================================================
                    UPLOAD CARD
                ================================================= */}

                <section style={styles.uploadCard}>
                    <div style={styles.cardGlow} />

                    <div style={styles.uploadHeader}>
                        <div style={styles.uploadIcon}>
                            <span>📄</span>
                        </div>

                        <div style={styles.uploadHeaderText}>
                            <div style={styles.cardEyebrow}>
                                RESUME UPLOAD
                            </div>

                            <h3 style={styles.uploadTitle}>
                                Upload your latest resume
                            </h3>

                            <p style={styles.description}>
                                Keep your professional profile
                                up to date with your latest
                                resume.
                            </p>
                        </div>
                    </div>

                    {/* File area */}

                    <label
                        htmlFor="resumeFile"
                        style={styles.fileDropArea}
                    >
                        <div style={styles.fileDropIcon}>
                            ⬆
                        </div>

                        <div>
                            <strong
                                style={
                                    styles.fileDropTitle
                                }
                            >
                                Choose a PDF resume
                            </strong>

                            <p
                                style={
                                    styles.fileDropText
                                }
                            >
                                Click here to browse
                                files
                            </p>

                            <span
                                style={
                                    styles.fileRequirement
                                }
                            >
                                PDF only • Maximum 5 MB
                            </span>
                        </div>
                    </label>

                    <input
                        id="resumeFile"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        style={styles.hiddenFileInput}
                    />

                    {/* Selected file */}

                    {selectedFile && (
                        <div style={styles.selectedFile}>
                            <div style={styles.selectedFileIcon}>
                                📄
                            </div>

                            <div
                                style={
                                    styles.selectedFileDetails
                                }
                            >
                                <strong>
                                    {selectedFile.name}
                                </strong>

                                <span>
                                    {formatFileSize(
                                        selectedFile.size
                                    )}
                                </span>
                            </div>

                            <div
                                style={
                                    styles.selectedFileStatus
                                }
                            >
                                Ready
                            </div>
                        </div>
                    )}

                    {/* Upload button */}

                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={
                            uploading ||
                            !selectedFile
                        }
                        style={{
                            ...styles.uploadButton,
                            ...(uploading ||
                            !selectedFile
                                ? styles.disabledButton
                                : {}),
                        }}
                        onMouseEnter={(e) => {
                            if (
                                !uploading &&
                                selectedFile
                            ) {
                                e.currentTarget.style.transform =
                                    "translateY(-2px)";
                                e.currentTarget.style.boxShadow =
                                    "0 14px 35px rgba(99,102,241,.28)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform =
                                "translateY(0)";
                            e.currentTarget.style.boxShadow =
                                "0 10px 28px rgba(99,102,241,.18)";
                        }}
                    >
                        <span>
                            {uploading
                                ? "⟳"
                                : "⬆"}
                        </span>

                        <span>
                            {uploading
                                ? "Uploading..."
                                : "Upload Resume"}
                        </span>
                    </button>

                    <div style={styles.uploadFooter}>
                        <span>
                            🔒 Secure upload
                        </span>

                        <span>
                            •
                        </span>

                        <span>
                            PDF format
                        </span>

                        <span>
                            •
                        </span>

                        <span>
                            Max 5 MB
                        </span>
                    </div>
                </section>

                {/* =================================================
                    RESUME LIST HEADER
                ================================================= */}

                <div style={styles.listHeader}>
                    <div>
                        <div style={styles.cardEyebrow}>
                            YOUR DOCUMENTS
                        </div>

                        <h3 style={styles.sectionTitle}>
                            Uploaded Resumes
                        </h3>
                    </div>

                    <span style={styles.resumeCount}>
                        <span style={styles.countDot} />
                        {resumes.length}{" "}
                        {resumes.length === 1
                            ? "Resume"
                            : "Resumes"}
                    </span>
                </div>

                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {resumes.length === 0 ? (
                    <div style={styles.empty}>
                        <div style={styles.emptyGlow} />

                        <div style={styles.emptyIcon}>
                            📄
                        </div>

                        <h3 style={styles.emptyTitle}>
                            No resume uploaded yet
                        </h3>

                        <p style={styles.emptyText}>
                            Upload your latest resume above
                            to make it available when
                            applying for jobs on HireAI.
                        </p>

                        <div style={styles.emptyHint}>
                            <span>💡</span>
                            <span>
                                Tip: Keep your resume
                                updated with your latest
                                skills and projects.
                            </span>
                        </div>
                    </div>
                ) : (
                    /* =================================================
                       RESUME LIST
                    ================================================= */

                    <div style={styles.list}>
                        {resumes.map((resume) => (
                            <div
                                key={resume.id}
                                style={styles.card}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                        "translateY(-3px)";
                                    e.currentTarget.style.borderColor =
                                        "rgba(129,140,248,.28)";
                                    e.currentTarget.style.boxShadow =
                                        "0 18px 50px rgba(0,0,0,.22)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                        "translateY(0)";
                                    e.currentTarget.style.borderColor =
                                        "rgba(148,163,184,.12)";
                                    e.currentTarget.style.boxShadow =
                                        "0 12px 35px rgba(0,0,0,.16)";
                                }}
                            >
                                {/* Resume information */}

                                <div style={styles.resumeLeft}>
                                    <div style={styles.pdfIcon}>
                                        <span>📄</span>
                                    </div>

                                    <div
                                        style={
                                            styles.resumeDetails
                                        }
                                    >
                                        <h3
                                            style={
                                                styles.fileName
                                            }
                                        >
                                            {resume.fileName ||
                                                resume.name ||
                                                "Resume.pdf"}
                                        </h3>

                                        <p
                                            style={
                                                styles.resumeInfo
                                            }
                                        >
                                            Uploaded{" "}
                                            <span>
                                                {formatDate(
                                                    resume.createdAt ||
                                                        resume.uploadedAt
                                                )}
                                            </span>
                                        </p>

                                        <div
                                            style={
                                                styles.badges
                                            }
                                        >
                                            <span
                                                style={
                                                    styles.pdfBadge
                                                }
                                            >
                                                PDF
                                            </span>

                                            {resume.fileSize && (
                                                <span
                                                    style={
                                                        styles.sizeBadge
                                                    }
                                                >
                                                    {formatFileSize(
                                                        resume.fileSize
                                                    )}
                                                </span>
                                            )}

                                            <span
                                                style={
                                                    styles.readyBadge
                                                }
                                            >
                                                ✓ Available
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}

                                <div
                                    style={
                                        styles.actions
                                    }
                                >
                                    <button
                                        type="button"
                                        style={
                                            styles.viewButton
                                        }
                                        onClick={() =>
                                            handleViewResume(
                                                resume.id
                                            )
                                        }
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background =
                                                "rgba(99,102,241,.18)";
                                            e.currentTarget.style.borderColor =
                                                "rgba(129,140,248,.35)";
                                            e.currentTarget.style.color =
                                                "#c7d2fe";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background =
                                                "rgba(99,102,241,.09)";
                                            e.currentTarget.style.borderColor =
                                                "rgba(99,102,241,.20)";
                                            e.currentTarget.style.color =
                                                "#a5b4fc";
                                        }}
                                    >
                                        <span>👁</span>
                                        <span>View</span>
                                    </button>

                                    <button
                                        type="button"
                                        style={{
                                            ...styles.deleteButton,
                                            ...(deleting
                                                ? styles.disabledDelete
                                                : {}),
                                        }}
                                        disabled={deleting}
                                        onClick={() =>
                                            handleDelete(
                                                resume.id
                                            )
                                        }
                                        onMouseEnter={(e) => {
                                            if (!deleting) {
                                                e.currentTarget.style.background =
                                                    "rgba(244,63,94,.18)";
                                                e.currentTarget.style.borderColor =
                                                    "rgba(244,63,94,.35)";
                                                e.currentTarget.style.color =
                                                    "#fda4af";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background =
                                                "rgba(244,63,94,.08)";
                                            e.currentTarget.style.borderColor =
                                                "rgba(244,63,94,.18)";
                                            e.currentTarget.style.color =
                                                "#fb7185";
                                        }}
                                    >
                                        <span>
                                            {deleting
                                                ? "⟳"
                                                : "🗑"}
                                        </span>

                                        <span>
                                            {deleting
                                                ? "Deleting..."
                                                : "Delete"}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* =================================================
                    BOTTOM INFORMATION
                ================================================= */}

                <div style={styles.securityNote}>
                    <div style={styles.securityIcon}>
                        🔐
                    </div>

                    <div>
                        <strong>
                            Your resume stays secure
                        </strong>

                        <p>
                            Your uploaded documents are
                            associated with your HireAI
                            candidate account and can be
                            managed from this page.
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
    page: {
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
            "radial-gradient(circle at 10% 10%, rgba(99,102,241,.10), transparent 28%), radial-gradient(circle at 90% 15%, rgba(34,211,238,.07), transparent 25%), linear-gradient(135deg, #050816 0%, #080d1c 48%, #0b1220 100%)",
        color: "#f8fafc",
        fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    backgroundGlowOne: {
        position: "fixed",
        width: "420px",
        height: "420px",
        left: "-220px",
        top: "100px",
        borderRadius: "50%",
        background:
            "rgba(99,102,241,.09)",
        filter: "blur(100px)",
        pointerEvents: "none",
        zIndex: 0,
    },

    backgroundGlowTwo: {
        position: "fixed",
        width: "400px",
        height: "400px",
        right: "-200px",
        top: "320px",
        borderRadius: "50%",
        background:
            "rgba(34,211,238,.06)",
        filter: "blur(100px)",
        pointerEvents: "none",
        zIndex: 0,
    },

    backgroundGlowThree: {
        position: "fixed",
        width: "300px",
        height: "300px",
        left: "42%",
        bottom: "-180px",
        borderRadius: "50%",
        background:
            "rgba(139,92,246,.07)",
        filter: "blur(100px)",
        pointerEvents: "none",
        zIndex: 0,
    },

    // =========================================================
    // HEADER
    // =========================================================

    header: {
        position: "relative",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        padding:
            "15px clamp(18px, 4vw, 52px)",
        minHeight: "72px",
        background:
            "linear-gradient(135deg, rgba(7,13,28,.92), rgba(10,18,35,.88))",
        borderBottom:
            "1px solid rgba(148,163,184,.12)",
        boxShadow:
            "0 14px 45px rgba(0,0,0,.22)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        flexWrap: "wrap",
    },

    brandContainer: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        minWidth: "230px",
    },

    logoIcon: {
        width: "44px",
        height: "44px",
        minWidth: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "13px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,.22), rgba(34,211,238,.10))",
        border:
            "1px solid rgba(129,140,248,.24)",
        boxShadow:
            "0 8px 28px rgba(99,102,241,.15)",
        fontSize: "20px",
        cursor: "pointer",
    },

    logo: {
        margin: 0,
        fontSize: "23px",
        lineHeight: 1,
        fontWeight: 850,
        letterSpacing: "-.8px",
        color: "#f8fafc",
        cursor: "pointer",
    },

    logoAccent: {
        background:
            "linear-gradient(90deg, #818cf8, #22d3ee)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },

    subtitle: {
        margin: "4px 0 0",
        color: "#64748b",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1.1px",
        textTransform: "uppercase",
    },

    roleBadge: {
        marginLeft: "6px",
        padding: "6px 10px",
        borderRadius: "999px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,.15), rgba(79,70,229,.07))",
        border:
            "1px solid rgba(129,140,248,.22)",
        color: "#a5b4fc",
        fontSize: "9px",
        fontWeight: 800,
        letterSpacing: ".7px",
    },

    headerButtons: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },

    profileButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 15px",
        border:
            "1px solid rgba(99,102,241,.25)",
        borderRadius: "11px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,.15), rgba(79,70,229,.07))",
        color: "#c7d2fe",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 750,
        boxShadow:
            "0 8px 24px rgba(99,102,241,.08)",
    },

    // =========================================================
    // CONTAINER
    // =========================================================

    container: {
        position: "relative",
        zIndex: 2,
        maxWidth: "1050px",
        margin: "0 auto",
        padding:
            "34px clamp(18px, 4vw, 32px) 70px",
    },

    // =========================================================
    // BACK BUTTON
    // =========================================================

    backButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "9px 13px",
        marginBottom: "28px",
        border:
            "1px solid rgba(148,163,184,.14)",
        borderRadius: "10px",
        background:
            "rgba(15,23,42,.65)",
        color: "#94a3b8",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 700,
        transition:
            "all .2s ease",
    },

    // =========================================================
    // HEADING
    // =========================================================

    headingSection: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "25px",
        marginBottom: "28px",
    },

    eyebrow: {
        marginBottom: "9px",
        color: "#818cf8",
        fontSize: "10px",
        fontWeight: 800,
        letterSpacing: "1.8px",
    },

    heading: {
        margin: 0,
        fontSize:
            "clamp(30px, 5vw, 44px)",
        lineHeight: 1.08,
        fontWeight: 850,
        letterSpacing: "-1.6px",
        color: "#f8fafc",
    },

    headingAccent: {
        background:
            "linear-gradient(90deg, #818cf8, #22d3ee)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },

    headingDescription: {
        margin: "10px 0 0",
        maxWidth: "620px",
        color: "#94a3b8",
        fontSize: "14px",
        lineHeight: 1.7,
    },

    resumeSummary: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        minWidth: "155px",
        padding: "13px 15px",
        border:
            "1px solid rgba(148,163,184,.13)",
        borderRadius: "14px",
        background:
            "rgba(15,23,42,.55)",
        boxShadow:
            "0 12px 30px rgba(0,0,0,.12)",
    },

    summaryIcon: {
        width: "38px",
        height: "38px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "10px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,.17), rgba(34,211,238,.08))",
        border:
            "1px solid rgba(129,140,248,.18)",
        fontSize: "17px",
    },

    summaryLabel: {
        display: "block",
        color: "#64748b",
        fontSize: "8px",
        fontWeight: 800,
        letterSpacing: "1px",
    },

    summaryValue: {
        display: "block",
        marginTop: "2px",
        color: "#f8fafc",
        fontSize: "18px",
        fontWeight: 800,
    },

    // =========================================================
    // ALERTS
    // =========================================================

    success: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
        padding: "13px 16px",
        border:
            "1px solid rgba(34,197,94,.18)",
        borderRadius: "12px",
        background:
            "linear-gradient(135deg, rgba(22,101,52,.20), rgba(20,83,45,.10))",
        color: "#bbf7d0",
        boxShadow:
            "0 10px 30px rgba(0,0,0,.10)",
    },

    alertIconSuccess: {
        width: "30px",
        height: "30px",
        minWidth: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9px",
        background:
            "rgba(34,197,94,.16)",
        color: "#86efac",
        fontWeight: 900,
    },

    error: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
        padding: "13px 16px",
        border:
            "1px solid rgba(244,63,94,.20)",
        borderRadius: "12px",
        background:
            "linear-gradient(135deg, rgba(127,29,29,.20), rgba(136,19,55,.09))",
        color: "#fecdd3",
        boxShadow:
            "0 10px 30px rgba(0,0,0,.10)",
    },

    alertIconError: {
        width: "30px",
        height: "30px",
        minWidth: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9px",
        background:
            "rgba(244,63,94,.14)",
        color: "#fda4af",
        fontWeight: 900,
    },

    // =========================================================
    // UPLOAD CARD
    // =========================================================

    uploadCard: {
        position: "relative",
        overflow: "hidden",
        padding: "26px",
        marginBottom: "42px",
        border:
            "1px solid rgba(148,163,184,.13)",
        borderRadius: "20px",
        background:
            "linear-gradient(145deg, rgba(17,24,39,.82), rgba(10,17,31,.74))",
        boxShadow:
            "0 20px 55px rgba(0,0,0,.20)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
    },

    cardGlow: {
        position: "absolute",
        width: "260px",
        height: "260px",
        right: "-120px",
        top: "-150px",
        borderRadius: "50%",
        background:
            "rgba(99,102,241,.09)",
        filter: "blur(60px)",
        pointerEvents: "none",
    },

    uploadHeader: {
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        gap: "15px",
        marginBottom: "24px",
    },

    uploadIcon: {
        width: "54px",
        height: "54px",
        minWidth: "54px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "15px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,.20), rgba(34,211,238,.09))",
        border:
            "1px solid rgba(129,140,248,.22)",
        boxShadow:
            "0 10px 30px rgba(99,102,241,.10)",
        fontSize: "24px",
    },

    uploadHeaderText: {
        minWidth: 0,
    },

    cardEyebrow: {
        marginBottom: "5px",
        color: "#64748b",
        fontSize: "9px",
        fontWeight: 800,
        letterSpacing: "1.4px",
    },

    uploadTitle: {
        margin: 0,
        color: "#f8fafc",
        fontSize: "20px",
        fontWeight: 800,
        letterSpacing: "-.4px",
    },

    description: {
        margin: "6px 0 0",
        color: "#94a3b8",
        fontSize: "13px",
        lineHeight: 1.6,
    },

    fileDropArea: {
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        gap: "14px",
        minHeight: "90px",
        padding: "17px 18px",
        border:
            "1px dashed rgba(129,140,248,.30)",
        borderRadius: "14px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,.06), rgba(34,211,238,.025))",
        cursor: "pointer",
        transition: "all .2s ease",
    },

    fileDropIcon: {
        width: "42px",
        height: "42px",
        minWidth: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "11px",
        background:
            "rgba(99,102,241,.12)",
        border:
            "1px solid rgba(129,140,248,.18)",
        color: "#a5b4fc",
        fontSize: "19px",
    },

    fileDropTitle: {
        display: "block",
        color: "#e2e8f0",
        fontSize: "13px",
        fontWeight: 750,
    },

    fileDropText: {
        margin: "4px 0",
        color: "#94a3b8",
        fontSize: "12px",
    },

    fileRequirement: {
        color: "#64748b",
        fontSize: "10px",
    },

    hiddenFileInput: {
        display: "none",
    },

    selectedFile: {
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        gap: "11px",
        marginTop: "13px",
        padding: "11px 13px",
        border:
            "1px solid rgba(34,211,238,.16)",
        borderRadius: "12px",
        background:
            "rgba(8,47,73,.20)",
    },

    selectedFileIcon: {
        width: "34px",
        height: "34px",
        minWidth: "34px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9px",
        background:
            "rgba(34,211,238,.09)",
        fontSize: "16px",
    },

    selectedFileDetails: {
        display: "flex",
        flexDirection: "column",
        gap: "3px",
        minWidth: 0,
        flex: 1,
    },

    selectedFileDetailsStrong: {
        color: "#e2e8f0",
    },

    selectedFileStatus: {
        padding: "5px 8px",
        borderRadius: "7px",
        background:
            "rgba(34,197,94,.10)",
        border:
            "1px solid rgba(34,197,94,.15)",
        color: "#86efac",
        fontSize: "9px",
        fontWeight: 800,
    },

    uploadButton: {
        position: "relative",
        zIndex: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
        marginTop: "16px",
        padding: "11px 18px",
        border: "1px solid rgba(129,140,248,.28)",
        borderRadius: "11px",
        background:
            "linear-gradient(135deg, #6366f1, #4f46e5)",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 800,
        boxShadow:
            "0 10px 28px rgba(99,102,241,.18)",
        transition:
            "all .2s ease",
    },

    disabledButton: {
        opacity: 0.45,
        cursor: "not-allowed",
        boxShadow: "none",
    },

    uploadFooter: {
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "13px",
        color: "#64748b",
        fontSize: "10px",
    },

    // =========================================================
    // LIST HEADER
    // =========================================================

    listHeader: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "20px",
        marginBottom: "15px",
    },

    sectionTitle: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "22px",
        fontWeight: 800,
        letterSpacing: "-.5px",
    },

    resumeCount: {
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "6px 10px",
        border:
            "1px solid rgba(148,163,184,.13)",
        borderRadius: "999px",
        background:
            "rgba(15,23,42,.60)",
        color: "#cbd5e1",
        fontSize: "10px",
        fontWeight: 750,
    },

    countDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#22d3ee",
        boxShadow:
            "0 0 9px rgba(34,211,238,.7)",
    },

    // =========================================================
    // RESUME LIST
    // =========================================================

    list: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },

    card: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        padding: "17px 18px",
        border:
            "1px solid rgba(148,163,184,.12)",
        borderRadius: "16px",
        background:
            "linear-gradient(145deg, rgba(17,24,39,.76), rgba(10,17,31,.68))",
        boxShadow:
            "0 12px 35px rgba(0,0,0,.16)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        transition:
            "all .2s ease",
    },

    resumeLeft: {
        display: "flex",
        alignItems: "center",
        gap: "13px",
        minWidth: 0,
        flex: 1,
    },

    pdfIcon: {
        width: "48px",
        height: "48px",
        minWidth: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "13px",
        background:
            "linear-gradient(135deg, rgba(244,63,94,.13), rgba(239,68,68,.06))",
        border:
            "1px solid rgba(244,63,94,.18)",
        boxShadow:
            "0 8px 22px rgba(244,63,94,.07)",
        fontSize: "21px",
    },

    resumeDetails: {
        minWidth: 0,
    },

    fileName: {
        margin: 0,
        color: "#f1f5f9",
        fontSize: "14px",
        fontWeight: 750,
        wordBreak: "break-word",
    },

    resumeInfo: {
        margin: "5px 0 8px",
        color: "#64748b",
        fontSize: "11px",
    },

    resumeInfoSpan: {
        color: "#94a3b8",
    },

    badges: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexWrap: "wrap",
    },

    pdfBadge: {
        padding: "3px 7px",
        borderRadius: "6px",
        background:
            "rgba(244,63,94,.10)",
        border:
            "1px solid rgba(244,63,94,.15)",
        color: "#fda4af",
        fontSize: "9px",
        fontWeight: 800,
    },

    sizeBadge: {
        padding: "3px 7px",
        borderRadius: "6px",
        background:
            "rgba(71,85,105,.18)",
        border:
            "1px solid rgba(148,163,184,.10)",
        color: "#94a3b8",
        fontSize: "9px",
    },

    readyBadge: {
        padding: "3px 7px",
        borderRadius: "6px",
        background:
            "rgba(34,197,94,.08)",
        border:
            "1px solid rgba(34,197,94,.13)",
        color: "#86efac",
        fontSize: "9px",
        fontWeight: 700,
    },

    // =========================================================
    // ACTIONS
    // =========================================================

    actions: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        flexShrink: 0,
    },

    viewButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "8px 12px",
        border:
            "1px solid rgba(99,102,241,.20)",
        borderRadius: "9px",
        background:
            "rgba(99,102,241,.09)",
        color: "#a5b4fc",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: 750,
        transition:
            "all .2s ease",
    },

    deleteButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "8px 12px",
        border:
            "1px solid rgba(244,63,94,.18)",
        borderRadius: "9px",
        background:
            "rgba(244,63,94,.08)",
        color: "#fb7185",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: 750,
        transition:
            "all .2s ease",
    },

    disabledDelete: {
        opacity: 0.45,
        cursor: "not-allowed",
    },

    // =========================================================
    // EMPTY STATE
    // =========================================================

    empty: {
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        padding: "55px 25px",
        border:
            "1px solid rgba(148,163,184,.12)",
        borderRadius: "18px",
        background:
            "linear-gradient(145deg, rgba(17,24,39,.70), rgba(10,17,31,.62))",
        boxShadow:
            "0 15px 45px rgba(0,0,0,.16)",
    },

    emptyGlow: {
        position: "absolute",
        width: "230px",
        height: "230px",
        left: "50%",
        top: "-140px",
        transform: "translateX(-50%)",
        borderRadius: "50%",
        background:
            "rgba(99,102,241,.07)",
        filter: "blur(60px)",
    },

    emptyIcon: {
        position: "relative",
        zIndex: 1,
        width: "62px",
        height: "62px",
        margin: "0 auto 15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "17px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,.13), rgba(34,211,238,.06))",
        border:
            "1px solid rgba(129,140,248,.16)",
        fontSize: "27px",
    },

    emptyTitle: {
        position: "relative",
        zIndex: 1,
        margin: 0,
        color: "#e2e8f0",
        fontSize: "18px",
        fontWeight: 800,
    },

    emptyText: {
        position: "relative",
        zIndex: 1,
        maxWidth: "500px",
        margin: "8px auto 0",
        color: "#64748b",
        fontSize: "12px",
        lineHeight: 1.7,
    },

    emptyHint: {
        position: "relative",
        zIndex: 1,
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "18px",
        padding: "8px 12px",
        border:
            "1px solid rgba(99,102,241,.13)",
        borderRadius: "9px",
        background:
            "rgba(99,102,241,.05)",
        color: "#818cf8",
        fontSize: "10px",
    },

    // =========================================================
    // SECURITY NOTE
    // =========================================================

    securityNote: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        marginTop: "28px",
        padding: "15px 17px",
        border:
            "1px solid rgba(148,163,184,.10)",
        borderRadius: "13px",
        background:
            "rgba(15,23,42,.45)",
    },

    securityIcon: {
        width: "34px",
        height: "34px",
        minWidth: "34px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9px",
        background:
            "rgba(34,211,238,.07)",
        border:
            "1px solid rgba(34,211,238,.12)",
        fontSize: "15px",
    },

    // =========================================================
    // LOADING
    // =========================================================

    loadingContainer: {
        position: "relative",
        zIndex: 2,
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "30px",
    },

    loadingSpinner: {
        width: "55px",
        height: "55px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "17px",
        background:
            "linear-gradient(135deg, rgba(99,102,241,.15), rgba(34,211,238,.07))",
        border:
            "1px solid rgba(129,140,248,.20)",
        color: "#818cf8",
        fontSize: "28px",
    },

    loadingTitle: {
        margin: "18px 0 0",
        color: "#e2e8f0",
        fontSize: "19px",
        fontWeight: 800,
    },

    loadingText: {
        margin: "7px 0 0",
        color: "#64748b",
        fontSize: "12px",
    },
};

export default Resume;