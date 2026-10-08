import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    ArrowUpRight,
    Briefcase,
    Check,
    CheckCircle2,
    Code2,
    ExternalLink,
    FileText,
    Globe,
    Link as LinkIcon,
    Loader2,
    Mail,
    MapPin,
    Save,
    ShieldCheck,
    Sparkles,
    User,
    X,
    Phone,
    AlertCircle,
} from "lucide-react";

import api from "../../services/api";

import "bootstrap/dist/css/bootstrap.min.css";

function Profile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ============================================================
    // ROLE BASED DASHBOARD NAVIGATION
    // ============================================================

    const goToDashboard = (userProfile = profile) => {
        const userRole = userProfile?.role
            ?.toString()
            ?.replace("ROLE_", "")
            ?.toUpperCase();

        if (userRole === "ADMIN") {
            navigate("/admin/dashboard");
            return;
        }

        if (userRole === "HR") {
            navigate("/hr/dashboard");
            return;
        }

        navigate("/dashboard");
    };

    // ============================================================
    // LOGOUT / AUTH FAILURE
    // ============================================================

    const redirectToLogin = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        navigate("/login", {
            replace: true,
        });
    };

    // ============================================================
    // LOAD PROFILE
    // ============================================================

    useEffect(() => {
        let ignore = false;

        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/users/profile");

                if (!ignore) {
                    setProfile(response.data);
                }
            } catch (err) {
                console.error("Profile loading failed:", err);

                if (ignore) {
                    return;
                }

                if (
                    err.response?.status === 401 ||
                    err.response?.status === 403
                ) {
                    redirectToLogin();
                    return;
                }

                setError(
                    err.response?.data?.message ||
                        "Unable to load your profile."
                );
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            ignore = true;
        };
    }, []);

    // ============================================================
    // HANDLE INPUT
    // ============================================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile((previousProfile) => ({
            ...previousProfile,
            [name]: value,
        }));

        setMessage("");
        setError("");
    };

    // ============================================================
    // PROFILE DATA
    // ============================================================

    const fullName = useMemo(() => {
        if (!profile) {
            return "HireAI User";
        }

        const name = `${profile.firstName || ""} ${
            profile.lastName || ""
        }`.trim();

        return name || "HireAI User";
    }, [profile]);

    const role = useMemo(() => {
        return (
            profile?.role
                ?.toString()
                ?.replace("ROLE_", "")
                ?.toUpperCase() || "USER"
        );
    }, [profile]);

    const initials = useMemo(() => {
        if (!profile) {
            return "H";
        }

        const first = profile.firstName?.charAt(0) || "";
        const last = profile.lastName?.charAt(0) || "";

        return `${first}${last}`.toUpperCase() || "H";
    }, [profile]);

    // ============================================================
    // PROFILE COMPLETION
    // ============================================================
    // Resume is required ONLY for CANDIDATE.
    // ADMIN and HR do not need a resume.
    // ============================================================

    const profileCompletion = useMemo(() => {
        if (!profile) {
            return 0;
        }

        const fields = [
            profile.firstName,
            profile.lastName,
            profile.email,
            profile.phone,
            profile.location,
            profile.headline,
            profile.bio,
            profile.skills,
            profile.linkedinUrl,
            profile.githubUrl,
        ];

        // Resume is only part of profile completion for candidates.
        if (role === "CANDIDATE") {
            fields.push(profile.resumeUrl);
        }

        const completed = fields.filter(
            (field) =>
                field !== null &&
                field !== undefined &&
                String(field).trim() !== ""
        ).length;

        return Math.round((completed / fields.length) * 100);
    }, [profile, role]);

    // ============================================================
    // UPDATE PROFILE
    // ============================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!profile) {
            return;
        }

        setSaving(true);
        setMessage("");
        setError("");

        try {
            const experienceValue =
                profile.experience === "" ||
                profile.experience === null ||
                profile.experience === undefined
                    ? 0
                    : Number(profile.experience);

            const updateData = {
                phone: profile.phone?.trim() || "",

                location: profile.location?.trim() || "",

                headline: profile.headline?.trim() || "",

                bio: profile.bio?.trim() || "",

                experience:
                    Number.isFinite(experienceValue) &&
                    experienceValue >= 0
                        ? experienceValue
                        : 0,

                skills: profile.skills?.trim() || "",

                linkedinUrl: profile.linkedinUrl?.trim() || "",

                githubUrl: profile.githubUrl?.trim() || "",

                portfolioUrl:
                    profile.portfolioUrl?.trim() || "",

                profileImage:
                    profile.profileImage?.trim() || "",
            };

            const response = await api.put(
                "/users/profile",
                updateData
            );

            setProfile(response.data);

            setMessage(
                "Your profile has been updated successfully."
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (err) {
            console.error("Profile update failed:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                redirectToLogin();
                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // VIEW CANDIDATE RESUME
    // ============================================================
    // IMPORTANT:
    // Do NOT open profile.resumeUrl directly.
    //
    // profile.resumeUrl contains:
    // /uploads/resumes/xxxx_resume.pdf
    //
    // That URL does not contain the JWT Authorization header.
    //
    // Instead:
    // 1. Get the candidate's resumes.
    // 2. Find the current resume.
    // 3. Call /resumes/{id}/view with JWT.
    // 4. Receive the PDF as Blob.
    // 5. Open the Blob URL in a new tab.
    //
    // This is ONLY used for CANDIDATE resume viewing.
    // ADMIN and HR logic is untouched.
    // ============================================================

    const handleViewResume = async () => {
        try {
            setMessage("");
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                redirectToLogin();
                return;
            }

            /*
             * Get the candidate's resumes.
             *
             * Backend endpoint:
             * GET /api/v1/resumes/my
             */
            const response = await api.get("/resumes/my", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const resumes = Array.isArray(response.data)
                ? response.data
                : [];

            if (resumes.length === 0) {
                setError(
                    "No resume was found. Please upload your resume first."
                );
                return;
            }

            /*
             * Prefer the resume whose fileUrl matches
             * profile.resumeUrl.
             *
             * If there is no exact match, use the first
             * available resume.
             */
            const currentResume =
                resumes.find(
                    (resume) =>
                        resume?.fileUrl &&
                        profile?.resumeUrl &&
                        resume.fileUrl === profile.resumeUrl
                ) || resumes[0];

            const resumeId = currentResume?.id;

            if (!resumeId) {
                console.error(
                    "Resume ID is missing:",
                    currentResume
                );

                setError(
                    "Unable to identify your resume. Please open Resume Management and try again."
                );

                return;
            }

            /*
             * Open a blank tab immediately.
             *
             * This is more reliable than calling window.open()
             * after the API request because browsers can block
             * delayed popups.
             */
            const newWindow = window.open(
                "",
                "_blank"
            );

            if (!newWindow) {
                setError(
                    "Please allow pop-ups to view your resume."
                );
                return;
            }

            /*
             * Show a temporary loading message inside
             * the new browser tab.
             */
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Loading Resume...</title>
                        <style>
                            body {
                                margin: 0;
                                min-height: 100vh;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                background: #071a3d;
                                color: white;
                                font-family:
                                    Arial,
                                    Helvetica,
                                    sans-serif;
                            }

                            .loading {
                                text-align: center;
                            }

                            .spinner {
                                width: 42px;
                                height: 42px;
                                margin: 0 auto 18px;
                                border: 4px solid rgba(255,255,255,0.2);
                                border-top-color: #60a5fa;
                                border-radius: 50%;
                                animation: spin 0.8s linear infinite;
                            }

                            h3 {
                                margin: 0;
                                font-size: 18px;
                            }

                            p {
                                color: #94a3b8;
                                font-size: 14px;
                            }

                            @keyframes spin {
                                from {
                                    transform: rotate(0deg);
                                }

                                to {
                                    transform: rotate(360deg);
                                }
                            }
                        </style>
                    </head>

                    <body>
                        <div class="loading">
                            <div class="spinner"></div>
                            <h3>Opening your resume...</h3>
                            <p>Please wait.</p>
                        </div>
                    </body>
                </html>
            `);

            newWindow.document.close();

            try {
                /*
                 * Backend endpoint:
                 *
                 * GET /api/v1/resumes/{id}/view
                 *
                 * responseType blob is important because
                 * the backend returns the actual PDF file.
                 */
                const pdfResponse = await api.get(
                    `/resumes/${resumeId}/view`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        responseType: "blob",
                    }
                );

                /*
                 * Make sure we received a valid response.
                 */
                if (
                    !pdfResponse.data ||
                    pdfResponse.data.size === 0
                ) {
                    throw new Error(
                        "The resume file is empty."
                    );
                }

                const pdfBlob = new Blob(
                    [pdfResponse.data],
                    {
                        type: "application/pdf",
                    }
                );

                const pdfUrl =
                    URL.createObjectURL(pdfBlob);

                /*
                 * Navigate the already-open tab to the
                 * generated PDF Blob URL.
                 */
                newWindow.location.href = pdfUrl;

                /*
                 * Keep the Blob alive for a while so the
                 * browser PDF viewer can load it.
                 */
                setTimeout(() => {
                    URL.revokeObjectURL(pdfUrl);
                }, 60000);
            } catch (err) {
                console.error(
                    "Failed to load resume:",
                    err
                );

                /*
                 * Close the blank/loading tab if the
                 * authenticated PDF request failed.
                 */
                try {
                    newWindow.close();
                } catch (closeError) {
                    console.warn(
                        "Unable to close resume window:",
                        closeError
                    );
                }

                if (err.response?.status === 401) {
                    redirectToLogin();
                    return;
                }

                if (err.response?.status === 403) {
                    setError(
                        "You are not authorized to view this resume."
                    );
                    return;
                }

                if (err.response?.status === 404) {
                    setError(
                        "Resume not found. Please upload your resume again."
                    );
                    return;
                }

                /*
                 * Axios may return the error body as a Blob.
                 * Do not try to render that as a PDF.
                 */
                setError(
                    "Failed to open your resume. Please try again."
                );
            }
        } catch (err) {
            console.error(
                "Resume viewing failed:",
                err
            );

            if (err.response?.status === 401) {
                redirectToLogin();
                return;
            }

            if (err.response?.status === 403) {
                setError(
                    "You are not authorized to access your resume."
                );
                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to open resume."
            );
        }
    };

    // ============================================================
    // LOADING SCREEN
    // ============================================================

    if (loading) {
        return (
            <>
                <style>{profileStyles}</style>

                <div className="hireai-page loading-page">
                    <div className="loading-card">
                        <div className="loading-icon">
                            <Loader2
                                size={32}
                                className="spin"
                            />
                        </div>

                        <h4>Loading your profile</h4>

                        <p>
                            Preparing your HireAI professional
                            workspace...
                        </p>
                    </div>
                </div>
            </>
        );
    }

    // ============================================================
    // ERROR SCREEN
    // ============================================================

    if (!profile) {
        return (
            <>
                <style>{profileStyles}</style>

                <div className="hireai-page error-page">
                    <div className="profile-error-card">
                        <div className="error-icon">
                            <AlertCircle size={34} />
                        </div>

                        <h3>Unable to load profile</h3>

                        <p>
                            {error ||
                                "Something went wrong while loading your profile."}
                        </p>

                        <button
                            type="button"
                            className="hireai-primary-btn"
                            onClick={() =>
                                goToDashboard()
                            }
                        >
                            <ArrowLeft size={17} />
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{profileStyles}</style>

            <div className="hireai-page">

                {/* ==================================================
                    NAVBAR
                ================================================== */}

                <nav className="hireai-navbar">
                    <div className="hireai-navbar-inner">

                        <button
                            type="button"
                            className="hireai-brand"
                            onClick={() =>
                                goToDashboard(profile)
                            }
                        >
                            <div className="hireai-logo">
                                HireAI
                                <span>🚀</span>
                            </div>

                            <div className="hireai-tagline">
                                AI-POWERED RECRUITMENT
                            </div>
                        </button>

                        <div className="navbar-actions">

                            <button
                                type="button"
                                className="navbar-dashboard-btn"
                                onClick={() =>
                                    goToDashboard(profile)
                                }
                            >
                                <ArrowLeft size={16} />

                                <span className="desktop-only">
                                    Back to Dashboard
                                </span>

                                <span className="mobile-only">
                                    Dashboard
                                </span>
                            </button>

                        </div>
                    </div>
                </nav>

                {/* ==================================================
                    MAIN
                ================================================== */}

                <main className="hireai-container">

                    {/* Breadcrumb */}

                    <div className="hireai-breadcrumb">

                        <button
                            type="button"
                            onClick={() =>
                                goToDashboard(profile)
                            }
                        >
                            Home
                        </button>

                        <span>/</span>

                        <span>My Profile</span>

                    </div>

                    {/* ==================================================
                        PROFILE HERO
                    ================================================== */}

                    <section className="profile-hero">

                        <div className="hero-glow hero-glow-one" />

                        <div className="hero-glow hero-glow-two" />

                        <div className="hero-grid-pattern" />

                        <div className="profile-hero-content">

                            {/* Avatar */}

                            <div className="profile-avatar-wrapper">

                                <div className="profile-avatar-ring">

                                    {profile.profileImage ? (
                                        <img
                                            src={
                                                profile.profileImage
                                            }
                                            alt={fullName}
                                            className="profile-avatar-image"
                                            onError={(event) => {
                                                event.currentTarget.style.display =
                                                    "none";

                                                const fallback =
                                                    event
                                                        .currentTarget
                                                        .nextElementSibling;

                                                if (fallback) {
                                                    fallback.style.display =
                                                        "flex";
                                                }
                                            }}
                                        />
                                    ) : null}

                                    <div
                                        className="profile-avatar-fallback"
                                        style={{
                                            display:
                                                profile.profileImage
                                                    ? "none"
                                                    : "flex",
                                        }}
                                    >
                                        {initials}
                                    </div>

                                </div>

                                <div className="online-badge">
                                    <Check size={11} />
                                    Active
                                </div>

                            </div>

                            {/* Main identity */}

                            <div className="profile-identity">

                                <div className="profile-role-badge">
                                    <ShieldCheck size={14} />
                                    {role}
                                </div>

                                <h1>{fullName}</h1>

                                <p className="profile-headline">
                                    {profile.headline ||
                                        "Build your professional identity and connect with opportunities on HireAI."}
                                </p>

                                <div className="profile-meta">

                                    {profile.email && (
                                        <span>
                                            <Mail size={15} />
                                            {profile.email}
                                        </span>
                                    )}

                                    {profile.location && (
                                        <span>
                                            <MapPin size={15} />
                                            {profile.location}
                                        </span>
                                    )}

                                    {profile.phone && (
                                        <span>
                                            <Phone size={15} />
                                            {profile.phone}
                                        </span>
                                    )}

                                </div>

                            </div>

                            {/* Completion */}

                            <div className="profile-completion">

                                <div className="completion-top">

                                    <div>

                                        <small>
                                            PROFILE COMPLETION
                                        </small>

                                        <strong>
                                            {profileCompletion}%
                                        </strong>

                                    </div>

                                    <Sparkles size={21} />

                                </div>

                                <div className="completion-bar">

                                    <div
                                        style={{
                                            width: `${profileCompletion}%`,
                                        }}
                                    />

                                </div>

                                <p>
                                    {profileCompletion >= 90
                                        ? "Your profile is complete and up to date."
                                        : "Complete your profile to improve your profile information."}
                                </p>

                            </div>

                        </div>
                    </section>

                    {/* ==================================================
                        ALERTS
                    ================================================== */}

                    {message && (
                        <div className="hireai-alert success-alert">

                            <CheckCircle2 size={19} />

                            <span>{message}</span>

                            <button
                                type="button"
                                onClick={() =>
                                    setMessage("")
                                }
                            >
                                <X size={16} />
                            </button>

                        </div>
                    )}

                    {error && (
                        <div className="hireai-alert error-alert">

                            <AlertCircle size={19} />

                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={() =>
                                    setError("")
                                }
                            >
                                <X size={16} />
                            </button>

                        </div>
                    )}

                    {/* ==================================================
                        PROFILE WORKSPACE
                    ================================================== */}

                    <form onSubmit={handleSubmit}>

                        <div className="workspace-heading">

                            <div>

                                <div className="workspace-label">
                                    <span />
                                    PROFESSIONAL WORKSPACE
                                </div>

                                <h2>My Profile</h2>

                                <p>
                                    Build a professional profile
                                    that helps recruiters understand
                                    your skills, experience and career
                                    goals.
                                </p>

                            </div>

                            <div className="workspace-status">

                                <CheckCircle2 size={16} />

                                Profile active

                            </div>

                        </div>

                        {/* ==================================================
                            PERSONAL + PROFESSIONAL
                        ================================================== */}

                        <div className="profile-grid">

                            {/* PERSONAL */}

                            <section className="hireai-card">

                                <div className="card-heading">

                                    <div className="card-icon blue-icon">
                                        <User size={21} />
                                    </div>

                                    <div>

                                        <h3>
                                            Personal Information
                                        </h3>

                                        <p>
                                            Your basic account
                                            information
                                        </p>

                                    </div>

                                </div>

                                <div className="field-grid">

                                    <ProfileField
                                        label="First Name"
                                        icon={<User size={16} />}
                                    >
                                        <input
                                            type="text"
                                            value={
                                                profile.firstName ||
                                                ""
                                            }
                                            disabled
                                        />
                                    </ProfileField>

                                    <ProfileField
                                        label="Last Name"
                                        icon={<User size={16} />}
                                    >
                                        <input
                                            type="text"
                                            value={
                                                profile.lastName ||
                                                ""
                                            }
                                            disabled
                                        />
                                    </ProfileField>

                                    <div className="field-full">

                                        <ProfileField
                                            label="Email Address"
                                            icon={<Mail size={16} />}
                                        >
                                            <input
                                                type="email"
                                                value={
                                                    profile.email ||
                                                    ""
                                                }
                                                disabled
                                            />
                                        </ProfileField>

                                    </div>

                                    <ProfileField
                                        label="Phone"
                                        icon={<Phone size={16} />}
                                    >
                                        <input
                                            type="text"
                                            name="phone"
                                            value={
                                                profile.phone ||
                                                ""
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter phone number"
                                        />
                                    </ProfileField>

                                    <ProfileField
                                        label="Location"
                                        icon={<MapPin size={16} />}
                                    >
                                        <input
                                            type="text"
                                            name="location"
                                            value={
                                                profile.location ||
                                                ""
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="City, Country"
                                        />
                                    </ProfileField>

                                </div>

                            </section>

                            {/* PROFESSIONAL */}

                            <section className="hireai-card">

                                <div className="card-heading">

                                    <div className="card-icon purple-icon">
                                        <Briefcase size={21} />
                                    </div>

                                    <div>

                                        <h3>
                                            Professional Information
                                        </h3>

                                        <p>
                                            Showcase your professional
                                            identity
                                        </p>

                                    </div>

                                </div>

                                <div className="field-grid">

                                    <div className="field-full">

                                        <ProfileField
                                            label="Professional Headline"
                                            icon={
                                                <Briefcase
                                                    size={16}
                                                />
                                            }
                                        >
                                            <input
                                                type="text"
                                                name="headline"
                                                value={
                                                    profile.headline ||
                                                    ""
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. Java Backend Developer | Spring Boot | REST APIs"
                                            />
                                        </ProfileField>

                                    </div>

                                    <ProfileField
                                        label="Experience"
                                        icon={
                                            <Briefcase size={16} />
                                        }
                                    >
                                        <div className="input-with-suffix">

                                            <input
                                                type="number"
                                                name="experience"
                                                min="0"
                                                value={
                                                    profile.experience ??
                                                    ""
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="0"
                                            />

                                            <span>
                                                years
                                            </span>

                                        </div>
                                    </ProfileField>

                                    <ProfileField
                                        label="Account Role"
                                        icon={
                                            <ShieldCheck
                                                size={16}
                                            />
                                        }
                                    >
                                        <input
                                            type="text"
                                            value={role}
                                            disabled
                                        />
                                    </ProfileField>

                                    <div className="field-full">

                                        <ProfileField
                                            label="Skills"
                                            icon={
                                                <Code2 size={16} />
                                            }
                                        >
                                            <textarea
                                                name="skills"
                                                value={
                                                    profile.skills ||
                                                    ""
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Java, Spring Boot, MySQL, REST APIs, React, DSA..."
                                                rows={4}
                                            />
                                        </ProfileField>

                                    </div>

                                </div>

                            </section>

                        </div>

                        {/* ==================================================
                            ABOUT
                        ================================================== */}

                        <section className="hireai-card full-card">

                            <div className="card-heading">

                                <div className="card-icon orange-icon">
                                    <FileText size={21} />
                                </div>

                                <div>

                                    <h3>
                                        About You
                                    </h3>

                                    <p>
                                        Tell recruiters about your
                                        experience, strengths and career
                                        goals
                                    </p>

                                </div>

                            </div>

                            <ProfileField
                                label="Professional Bio"
                                icon={<FileText size={16} />}
                            >
                                <textarea
                                    name="bio"
                                    value={
                                        profile.bio || ""
                                    }
                                    onChange={handleChange}
                                    placeholder="Write a concise professional summary highlighting your technical skills, projects, experience, strengths and career goals..."
                                    rows={7}
                                />
                            </ProfileField>

                        </section>

                        {/* ==================================================
                            PROFESSIONAL LINKS
                        ================================================== */}

                        <section className="hireai-card full-card">

                            <div className="card-heading">

                                <div className="card-icon green-icon">
                                    <LinkIcon size={21} />
                                </div>

                                <div>

                                    <h3>
                                        Professional Links
                                    </h3>

                                    <p>
                                        Connect the profiles recruiters
                                        use to evaluate your work
                                    </p>

                                </div>

                            </div>

                            <div className="field-grid">

                                <div className="field-full">

                                    <ProfileField
                                        label="LinkedIn"
                                        icon={
                                            <LinkIcon size={16} />
                                        }
                                    >
                                        <input
                                            type="url"
                                            name="linkedinUrl"
                                            value={
                                                profile.linkedinUrl ||
                                                ""
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="https://linkedin.com/in/your-profile"
                                        />
                                    </ProfileField>

                                </div>

                                <ProfileField
                                    label="GitHub"
                                    icon={
                                        <Code2 size={16} />
                                    }
                                >
                                    <input
                                        type="url"
                                        name="githubUrl"
                                        value={
                                            profile.githubUrl ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="https://github.com/your-username"
                                    />
                                </ProfileField>

                                <ProfileField
                                    label="Portfolio"
                                    icon={
                                        <Globe size={16} />
                                    }
                                >
                                    <input
                                        type="url"
                                        name="portfolioUrl"
                                        value={
                                            profile.portfolioUrl ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="https://your-portfolio.com"
                                    />
                                </ProfileField>

                                <div className="field-full">

                                    <ProfileField
                                        label="Profile Image URL"
                                        icon={
                                            <User size={16} />
                                        }
                                    >
                                        <input
                                            type="url"
                                            name="profileImage"
                                            value={
                                                profile.profileImage ||
                                                ""
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="https://..."
                                        />
                                    </ProfileField>

                                </div>

                            </div>

                            {/* LINK PREVIEW */}

                            {(profile.linkedinUrl ||
                                profile.githubUrl ||
                                profile.portfolioUrl) && (

                                <div className="social-preview">

                                    <span>
                                        <Sparkles size={15} />
                                        Public professional links
                                    </span>

                                    <div className="social-links">

                                        {profile.linkedinUrl && (
                                            <a
                                                href={
                                                    profile.linkedinUrl
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                LinkedIn

                                                <ArrowUpRight
                                                    size={14}
                                                />
                                            </a>
                                        )}

                                        {profile.githubUrl && (
                                            <a
                                                href={
                                                    profile.githubUrl
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                GitHub

                                                <ArrowUpRight
                                                    size={14}
                                                />
                                            </a>
                                        )}

                                        {profile.portfolioUrl && (
                                            <a
                                                href={
                                                    profile.portfolioUrl
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Portfolio

                                                <ArrowUpRight
                                                    size={14}
                                                />
                                            </a>
                                        )}

                                    </div>

                                </div>
                            )}

                        </section>

                        {/* ==================================================
                            RESUME
                            CANDIDATE ONLY
                        ================================================== */}

                        {role === "CANDIDATE" && (
                            <section className="resume-card">

                                <div className="resume-icon">
                                    <FileText size={25} />
                                </div>

                                <div className="resume-content">

                                    <div className="resume-label">
                                        PROFESSIONAL DOCUMENT
                                    </div>

                                    <h3>
                                        Resume
                                    </h3>

                                    <p>
                                        {profile.resumeUrl
                                            ? "Your resume is connected to your HireAI profile and available to recruiters."
                                            : "Upload a resume to strengthen your profile and help recruiters discover your experience."}
                                    </p>

                                </div>

                                {profile.resumeUrl ? (
                                    <button
                                        type="button"
                                        className="resume-button"
                                        onClick={
                                            handleViewResume
                                        }
                                    >
                                        View Resume

                                        <ExternalLink
                                            size={15}
                                        />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="resume-button"
                                        onClick={() =>
                                            navigate("/resume")
                                        }
                                    >
                                        Manage Resume

                                        <ArrowUpRight
                                            size={15}
                                        />
                                    </button>
                                )}

                            </section>
                        )}

                        {/* ==================================================
                            SAVE AREA
                        ================================================== */}

                        <section className="save-panel">

                            <div className="save-panel-left">

                                <div className="save-icon">
                                    <ShieldCheck size={21} />
                                </div>

                                <div>

                                    <h3>
                                        Keep your profile
                                        up to date
                                    </h3>

                                    <p>
                                        A complete and updated profile
                                        gives recruiters a clearer view
                                        of your professional background,
                                        skills and potential.
                                    </p>

                                </div>

                            </div>

                            <button
                                type="submit"
                                className="save-profile-button"
                                disabled={saving}
                            >

                                {saving ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="spin"
                                        />

                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />

                                        Save Profile
                                    </>
                                )}

                            </button>

                        </section>

                    </form>

                    {/* ==================================================
                        FOOTER
                    ================================================== */}

                    <footer className="hireai-footer">

                        <div className="footer-brand">
                            HireAI <span>🚀</span>
                        </div>

                        <span>
                            AI-Powered Recruitment
                        </span>

                        <span className="footer-dot">
                            •
                        </span>

                        <span>
                            © 2026 HireAI
                        </span>

                    </footer>

                </main>
            </div>
        </>
    );
}

// ================================================================
// REUSABLE PROFILE FIELD
// ================================================================

function ProfileField({ label, icon, children }) {
    return (
        <div className="profile-field">

            <label>{label}</label>

            <div className="profile-input-wrapper">

                <div className="field-icon">
                    {icon}
                </div>

                {children}

            </div>

        </div>
    );
}

// ================================================================
// STYLES
// ================================================================

const profileStyles = `
    * {
        box-sizing: border-box;
    }

    .hireai-page {
        min-height: 100vh;
        background:
            radial-gradient(
                circle at 10% 0%,
                rgba(37, 99, 235, 0.12),
                transparent 28%
            ),
            radial-gradient(
                circle at 90% 10%,
                rgba(124, 58, 237, 0.13),
                transparent 30%
            ),
            #071a3d;
        color: #e5edff;
        overflow-x: hidden;
    }

    /* ============================================================
       NAVBAR
    ============================================================ */

    .hireai-navbar {
        position: sticky;
        top: 0;
        z-index: 1000;
        height: 76px;
        background: rgba(5, 20, 48, 0.94);
        border-bottom: 1px solid rgba(148, 163, 184, 0.28);
        backdrop-filter: blur(18px);
    }

    .hireai-navbar-inner {
        width: min(1240px, calc(100% - 40px));
        height: 100%;
        margin: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .hireai-brand {
        border: 0;
        background: transparent;
        padding: 0;
        text-align: left;
        cursor: pointer;
    }

    .hireai-logo {
        color: #ffffff;
        font-size: 1.55rem;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -0.8px;
    }

    .hireai-logo span {
        margin-left: 5px;
    }

    .hireai-tagline {
        margin-top: 5px;
        color: #7db4ff;
        font-size: 0.59rem;
        font-weight: 800;
        letter-spacing: 2px;
    }

    .navbar-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .navbar-dashboard-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 40px;
        padding: 0 17px;
        border-radius: 9px;
        border: 1px solid rgba(255, 255, 255, 0.65);
        color: #ffffff;
        background: rgba(255, 255, 255, 0.04);
        font-weight: 700;
        font-size: 0.86rem;
        transition: all 0.2s ease;
    }

    .navbar-dashboard-btn:hover {
        background: #ffffff;
        color: #14346e;
        transform: translateY(-1px);
    }

    /* ============================================================
       CONTAINER
    ============================================================ */

    .hireai-container {
        width: min(1240px, calc(100% - 40px));
        margin: auto;
        padding: 34px 0 60px;
    }

    .hireai-breadcrumb {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 22px;
        color: #94aee0;
        font-size: 0.84rem;
    }

    .hireai-breadcrumb button {
        border: 0;
        background: transparent;
        color: #55b8ff;
        padding: 0;
        font-weight: 700;
    }

    .hireai-breadcrumb button:hover {
        color: #8bd1ff;
        text-decoration: underline;
    }

    /* ============================================================
       HERO
    ============================================================ */

    .profile-hero {
        position: relative;
        overflow: hidden;
        border-radius: 20px;
        min-height: 275px;
        background:
            linear-gradient(
                120deg,
                #174a99 0%,
                #235bd0 48%,
                #4937c9 100%
            );
        border: 1px solid rgba(159, 190, 255, 0.85);
        box-shadow:
            0 25px 70px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.18);
    }

    .profile-hero-content {
        position: relative;
        z-index: 2;
        min-height: 275px;
        padding: 38px;
        display: grid;
        grid-template-columns: auto 1fr 245px;
        align-items: center;
        gap: 30px;
    }

    .hero-grid-pattern {
        position: absolute;
        inset: 0;
        opacity: 0.14;
        background-image:
            linear-gradient(
                rgba(255, 255, 255, 0.15) 1px,
                transparent 1px
            ),
            linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.15) 1px,
                transparent 1px
            );
        background-size: 38px 38px;
        mask-image: linear-gradient(
            to right,
            transparent,
            black,
            transparent
        );
    }

    .hero-glow {
        position: absolute;
        border-radius: 50%;
        filter: blur(1px);
        pointer-events: none;
    }

    .hero-glow-one {
        width: 340px;
        height: 340px;
        right: -130px;
        top: -160px;
        background: rgba(255, 255, 255, 0.11);
    }

    .hero-glow-two {
        width: 280px;
        height: 280px;
        right: 220px;
        bottom: -220px;
        background: rgba(56, 189, 248, 0.16);
    }

    /* ============================================================
       AVATAR
    ============================================================ */

    .profile-avatar-wrapper {
        position: relative;
        width: 135px;
        height: 150px;
    }

    .profile-avatar-ring {
        width: 125px;
        height: 125px;
        padding: 4px;
        border-radius: 50%;
        background:
            linear-gradient(
                135deg,
                #61d7ff,
                #ffffff,
                #a78bfa
            );
        box-shadow:
            0 10px 35px rgba(0, 0, 0, 0.25);
    }

    .profile-avatar-image,
    .profile-avatar-fallback {
        width: 100%;
        height: 100%;
        border-radius: 50%;
    }

    .profile-avatar-image {
        display: block;
        object-fit: cover;
        background: #dbeafe;
    }

    .profile-avatar-fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        background:
            linear-gradient(
                135deg,
                #2563eb,
                #7c3aed
            );
        color: white;
        font-size: 2.25rem;
        font-weight: 800;
    }

    .online-badge {
        position: absolute;
        left: 57px;
        bottom: 10px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 5px 9px;
        border-radius: 20px;
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.4);
        color: #a7f3d0;
        font-size: 0.65rem;
        font-weight: 800;
    }

    /* ============================================================
       PROFILE IDENTITY
    ============================================================ */

    .profile-role-badge {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 7px 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.23);
        color: #e0f2fe;
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.8px;
    }

    .profile-identity h1 {
        margin: 12px 0 5px;
        color: white;
        font-size: clamp(2rem, 4vw, 3rem);
        line-height: 1;
        letter-spacing: -1.5px;
        font-weight: 800;
    }

    .profile-headline {
        max-width: 700px;
        margin: 0 0 18px;
        color: #dbeafe;
        font-size: 0.98rem;
        line-height: 1.65;
    }

    .profile-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
    }

    .profile-meta span {
        display: flex;
        align-items: center;
        gap: 7px;
        color: #e0e7ff;
        font-size: 0.78rem;
    }

    /* ============================================================
       COMPLETION
    ============================================================ */

    .profile-completion {
        padding: 20px;
        border-radius: 16px;
        background: rgba(7, 26, 61, 0.23);
        border: 1px solid rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(12px);
    }

    .completion-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #c4d7ff;
    }

    .completion-top small {
        display: block;
        margin-bottom: 4px;
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 1.1px;
    }

    .completion-top strong {
        color: white;
        font-size: 1.7rem;
    }

    .completion-top svg {
        color: #67e8f9;
    }

    .completion-bar {
        height: 7px;
        margin: 14px 0 11px;
        overflow: hidden;
        border-radius: 99px;
        background: rgba(255, 255, 255, 0.14);
    }

    .completion-bar div {
        height: 100%;
        border-radius: inherit;
        background:
            linear-gradient(
                90deg,
                #38bdf8,
                #818cf8
            );
        box-shadow: 0 0 15px rgba(56, 189, 248, 0.45);
        transition: width 0.5s ease;
    }

    .profile-completion p {
        margin: 0;
        color: #cbd5e1;
        font-size: 0.72rem;
        line-height: 1.5;
    }

    /* ============================================================
       ALERTS
    ============================================================ */

    .hireai-alert {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 20px;
        padding: 13px 15px;
        border-radius: 12px;
        font-size: 0.84rem;
        font-weight: 600;
    }

    .hireai-alert span {
        flex: 1;
    }

    .hireai-alert button {
        display: flex;
        border: 0;
        background: transparent;
    }

    .success-alert {
        color: #a7f3d0;
        background: rgba(6, 78, 59, 0.48);
        border: 1px solid rgba(52, 211, 153, 0.25);
    }

    .success-alert svg {
        color: #34d399;
    }

    .success-alert button {
        color: #a7f3d0;
    }

    .error-alert {
        color: #fecaca;
        background: rgba(127, 29, 29, 0.45);
        border: 1px solid rgba(248, 113, 113, 0.25);
    }

    .error-alert svg {
        color: #f87171;
    }

    .error-alert button {
        color: #fecaca;
    }

    /* ============================================================
       WORKSPACE HEADER
    ============================================================ */

    .workspace-heading {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 20px;
        margin: 42px 0 20px;
    }

    .workspace-label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #42d4ff;
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 1.3px;
    }

    .workspace-label span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22d3ee;
        box-shadow: 0 0 12px #22d3ee;
    }

    .workspace-heading h2 {
        margin: 8px 0 4px;
        color: #ffffff;
        font-size: 1.8rem;
        font-weight: 800;
        letter-spacing: -0.7px;
    }

    .workspace-heading p {
        margin: 0;
        color: #94acd7;
        font-size: 0.85rem;
        max-width: 720px;
    }

    .workspace-status {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 7px 13px;
        border-radius: 999px;
        color: #a7f3d0;
        border: 1px solid rgba(167, 243, 208, 0.32);
        background: rgba(16, 185, 129, 0.08);
        font-size: 0.68rem;
        font-weight: 800;
        white-space: nowrap;
    }

    .workspace-status svg {
        color: #34d399;
    }

    /* ============================================================
       CARD GRID
    ============================================================ */

    .profile-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
    }

    .hireai-card {
        padding: 25px;
        border-radius: 17px;
        background:
            linear-gradient(
                145deg,
                rgba(20, 43, 86, 0.88),
                rgba(11, 29, 63, 0.94)
            );
        border: 1px solid rgba(157, 181, 226, 0.55);
        box-shadow:
            0 18px 45px rgba(0, 0, 0, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.035);
        transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
    }

    .hireai-card:hover {
        transform: translateY(-2px);
        border-color: rgba(116, 173, 255, 0.8);
        box-shadow:
            0 22px 55px rgba(0, 0, 0, 0.22),
            0 0 0 1px rgba(59, 130, 246, 0.08);
    }

    .full-card {
        margin-top: 20px;
    }

    .card-heading {
        display: flex;
        align-items: center;
        gap: 13px;
        margin-bottom: 24px;
    }

    .card-icon {
        width: 45px;
        height: 45px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .blue-icon {
        color: #60a5fa;
        background: rgba(37, 99, 235, 0.17);
    }

    .purple-icon {
        color: #c084fc;
        background: rgba(124, 58, 237, 0.17);
    }

    .orange-icon {
        color: #fb923c;
        background: rgba(234, 88, 12, 0.15);
    }

    .green-icon {
        color: #34d399;
        background: rgba(5, 150, 105, 0.15);
    }

    .card-heading h3 {
        margin: 0 0 3px;
        color: white;
        font-size: 1rem;
        font-weight: 800;
    }

    .card-heading p {
        margin: 0;
        color: #849bc7;
        font-size: 0.73rem;
    }

    /* ============================================================
       FORM
    ============================================================ */

    .field-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 17px;
    }

    .field-full {
        grid-column: 1 / -1;
    }

    .profile-field label {
        display: block;
        margin-bottom: 7px;
        color: #b9c9e7;
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.2px;
    }

    .profile-input-wrapper {
        position: relative;
        display: flex;
        align-items: stretch;
    }

    .field-icon {
        position: absolute;
        z-index: 2;
        left: 13px;
        top: 0;
        height: 100%;
        display: flex;
        align-items: center;
        color: #6684b8;
        pointer-events: none;
    }

    .profile-input-wrapper input,
    .profile-input-wrapper textarea {
        width: 100%;
        color: #e9f1ff;
        background: rgba(5, 18, 42, 0.65);
        border: 1px solid rgba(119, 146, 194, 0.42);
        border-radius: 10px;
        outline: none;
        padding: 11px 13px 11px 40px;
        font-size: 0.8rem;
        transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
    }

    .profile-input-wrapper textarea {
        min-height: 105px;
        resize: vertical;
        line-height: 1.55;
    }

    .profile-input-wrapper input::placeholder,
    .profile-input-wrapper textarea::placeholder {
        color: #60759b;
    }

    .profile-input-wrapper input:focus,
    .profile-input-wrapper textarea:focus {
        border-color: #4f9cff;
        background: rgba(8, 26, 57, 0.9);
        box-shadow:
            0 0 0 3px rgba(59, 130, 246, 0.12),
            0 0 20px rgba(37, 99, 235, 0.08);
    }

    .profile-input-wrapper input:disabled {
        cursor: not-allowed;
        color: #8da3c9;
        background: rgba(2, 12, 29, 0.52);
    }

    .input-with-suffix {
        position: relative;
        width: 100%;
    }

    .input-with-suffix input {
        padding-right: 55px;
    }

    .input-with-suffix span {
        position: absolute;
        right: 13px;
        top: 50%;
        transform: translateY(-50%);
        color: #7088b1;
        font-size: 0.7rem;
        font-weight: 700;
        pointer-events: none;
    }

    /* ============================================================
       SOCIAL LINKS
    ============================================================ */

    .social-preview {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        margin-top: 20px;
        padding: 12px 14px;
        border-radius: 11px;
        background: rgba(15, 23, 42, 0.52);
        border: 1px solid rgba(124, 146, 189, 0.22);
    }

    .social-preview > span {
        display: flex;
        align-items: center;
        gap: 7px;
        color: #91a8d0;
        font-size: 0.7rem;
        font-weight: 700;
    }

    .social-preview > span svg {
        color: #38bdf8;
    }

    .social-links {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
    }

    .social-links a {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 10px;
        border-radius: 7px;
        color: #cde3ff;
        background: rgba(37, 99, 235, 0.11);
        border: 1px solid rgba(96, 165, 250, 0.25);
        text-decoration: none;
        font-size: 0.67rem;
        font-weight: 700;
        transition: all 0.2s ease;
    }

    .social-links a:hover {
        color: white;
        background: rgba(37, 99, 235, 0.25);
        transform: translateY(-1px);
    }

    /* ============================================================
       RESUME
       CANDIDATE ONLY
    ============================================================ */

    .resume-card {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 17px;
        margin-top: 20px;
        padding: 23px;
        border-radius: 17px;
        background:
            linear-gradient(
                120deg,
                rgba(21, 60, 124, 0.92),
                rgba(54, 38, 131, 0.94)
            );
        border: 1px solid rgba(145, 181, 255, 0.6);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
    }

    .resume-card::after {
        content: "";
        position: absolute;
        width: 250px;
        height: 250px;
        right: -120px;
        top: -150px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.07);
    }

    .resume-icon {
        position: relative;
        z-index: 1;
        width: 56px;
        height: 56px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        color: white;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.18);
    }

    .resume-content {
        position: relative;
        z-index: 1;
        flex: 1;
    }

    .resume-label {
        color: #8fdcff;
        font-size: 0.6rem;
        font-weight: 800;
        letter-spacing: 1.2px;
    }

    .resume-content h3 {
        margin: 3px 0;
        color: white;
        font-size: 1rem;
        font-weight: 800;
    }

    .resume-content p {
        max-width: 720px;
        margin: 0;
        color: #c9dbff;
        font-size: 0.74rem;
        line-height: 1.5;
    }

    .resume-button {
        position: relative;
        z-index: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        flex-shrink: 0;
        padding: 10px 14px;
        border-radius: 9px;
        color: #173a7a;
        background: white;
        border: 0;
        text-decoration: none;
        font-size: 0.74rem;
        font-weight: 800;
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .resume-button:hover {
        color: #173a7a;
        transform: translateY(-2px);
        box-shadow: 0 7px 20px rgba(0, 0, 0, 0.2);
    }

    /* ============================================================
       SAVE PANEL
    ============================================================ */

    .save-panel {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 25px;
        margin-top: 20px;
        padding: 21px 23px;
        border-radius: 17px;
        background:
            linear-gradient(
                120deg,
                #09204b,
                #1d4ed8,
                #5b21b6
            );
        border: 1px solid rgba(125, 174, 255, 0.65);
        box-shadow: 0 20px 55px rgba(0, 0, 0, 0.23);
    }

    .save-panel-left {
        display: flex;
        align-items: flex-start;
        gap: 13px;
    }

    .save-icon {
        width: 43px;
        height: 43px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 11px;
        color: #dbeafe;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.14);
    }

    .save-panel h3 {
        margin: 0 0 4px;
        color: white;
        font-size: 0.95rem;
        font-weight: 800;
    }

    .save-panel p {
        max-width: 680px;
        margin: 0;
        color: #cbdcff;
        font-size: 0.72rem;
        line-height: 1.55;
    }

    .save-profile-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-width: 155px;
        padding: 11px 18px;
        border: 0;
        border-radius: 9px;
        color: #17419a;
        background: white;
        font-size: 0.78rem;
        font-weight: 800;
        box-shadow: 0 7px 20px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;
    }

    .save-profile-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.22);
    }

    .save-profile-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    /* ============================================================
       FOOTER
    ============================================================ */

    .hireai-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 9px;
        padding: 30px 0 10px;
        color: #6179a5;
        font-size: 0.68rem;
    }

    .footer-brand {
        color: #a9c6f7;
        font-weight: 800;
    }

    .footer-dot {
        color: #334e7e;
    }

    /* ============================================================
       LOADING / ERROR
    ============================================================ */

    .loading-page,
    .error-page {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 25px;
    }

    .loading-card,
    .profile-error-card {
        width: min(500px, 100%);
        padding: 40px;
        text-align: center;
        border-radius: 20px;
        background:
            linear-gradient(
                145deg,
                rgba(20, 43, 86, 0.9),
                rgba(9, 26, 58, 0.96)
            );
        border: 1px solid rgba(133, 166, 225, 0.45);
        box-shadow: 0 30px 70px rgba(0, 0, 0, 0.25);
    }

    .loading-icon,
    .error-icon {
        width: 70px;
        height: 70px;
        margin: 0 auto 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }

    .loading-icon {
        color: white;
        background:
            linear-gradient(
                135deg,
                #2563eb,
                #7c3aed
            );
        box-shadow: 0 0 30px rgba(59, 130, 246, 0.25);
    }

    .error-icon {
        color: #fca5a5;
        background: rgba(127, 29, 29, 0.3);
        border: 1px solid rgba(248, 113, 113, 0.25);
    }

    .loading-card h4,
    .profile-error-card h3 {
        color: white;
        font-weight: 800;
    }

    .loading-card p,
    .profile-error-card p {
        margin: 8px 0 24px;
        color: #8fa7d1;
        font-size: 0.82rem;
        line-height: 1.6;
    }

    .hireai-primary-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 11px 18px;
        border: 0;
        border-radius: 9px;
        color: white;
        background:
            linear-gradient(
                135deg,
                #2563eb,
                #4f46e5
            );
        font-weight: 700;
        font-size: 0.8rem;
    }

    /* ============================================================
       ANIMATION
    ============================================================ */

    .spin {
        animation: hireai-spin 1s linear infinite;
    }

    @keyframes hireai-spin {
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

    .mobile-only {
        display: none;
    }

    @media (max-width: 1050px) {

        .profile-hero-content {
            grid-template-columns: auto 1fr;
        }

        .profile-completion {
            grid-column: 1 / -1;
        }

        .profile-completion p {
            display: none;
        }

    }

    @media (max-width: 850px) {

        .profile-grid {
            grid-template-columns: 1fr;
        }

        .profile-hero-content {
            padding: 28px;
        }

        .workspace-heading {
            align-items: flex-start;
            flex-direction: column;
        }

    }

    @media (max-width: 650px) {

        .hireai-navbar {
            height: 68px;
        }

        .hireai-navbar-inner,
        .hireai-container {
            width: min(100% - 24px, 1240px);
        }

        .hireai-container {
            padding-top: 22px;
        }

        .hireai-tagline {
            font-size: 0.5rem;
            letter-spacing: 1.3px;
        }

        .hireai-logo {
            font-size: 1.35rem;
        }

        .desktop-only {
            display: none;
        }

        .mobile-only {
            display: inline;
        }

        .profile-hero-content {
            grid-template-columns: 1fr;
            text-align: center;
            justify-items: center;
            padding: 30px 20px;
        }

        .profile-avatar-wrapper {
            margin-bottom: -5px;
        }

        .profile-identity {
            width: 100%;
        }

        .profile-headline {
            margin-left: auto;
            margin-right: auto;
        }

        .profile-meta {
            justify-content: center;
        }

        .profile-completion {
            width: 100%;
        }

        .profile-identity h1 {
            font-size: 2rem;
        }

        .hireai-card {
            padding: 20px;
        }

        .field-grid {
            grid-template-columns: 1fr;
        }

        .field-full {
            grid-column: auto;
        }

        .social-preview {
            flex-direction: column;
            align-items: flex-start;
        }

        .resume-card,
        .save-panel {
            flex-direction: column;
            align-items: stretch;
        }

        .resume-button,
        .save-profile-button {
            width: 100%;
        }

        .save-panel-left {
            width: 100%;
        }

    }

    @media (max-width: 430px) {

        .profile-meta {
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }

        .workspace-heading h2 {
            font-size: 1.5rem;
        }

        .hireai-card {
            border-radius: 14px;
        }

        .profile-hero {
            border-radius: 15px;
        }

        .profile-avatar-wrapper {
            transform: scale(0.9);
        }

    }
`;

export default Profile;