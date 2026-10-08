import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    // =========================================================
    // GET ROLE FROM JWT TOKEN
    // =========================================================
    const getRoleFromToken = (token) => {
        try {
            if (!token) {
                return null;
            }

            const parts = token.split(".");

            if (parts.length !== 3) {
                return null;
            }

            const base64Url = parts[1];

            const base64 = base64Url
                .replace(/-/g, "+")
                .replace(/_/g, "/");

            const paddedBase64 =
                base64 + "=".repeat((4 - (base64.length % 4)) % 4);

            const jsonPayload = decodeURIComponent(
                atob(paddedBase64)
                    .split("")
                    .map(
                        (char) =>
                            "%" +
                            ("00" + char.charCodeAt(0).toString(16)).slice(-2)
                    )
                    .join("")
            );

            const payload = JSON.parse(jsonPayload);

            console.log("JWT Payload:", payload);

            if (payload.role) {
                return payload.role;
            }

            if (payload.roles) {
                if (Array.isArray(payload.roles)) {
                    return payload.roles[0];
                }

                return payload.roles;
            }

            if (payload.authorities) {
                if (Array.isArray(payload.authorities)) {
                    return payload.authorities[0];
                }

                return payload.authorities;
            }

            return null;
        } catch (error) {
            console.error("Failed to read role from token:", error);
            return null;
        }
    };

    // =========================================================
    // NORMALIZE ROLE
    // =========================================================
    const normalizeRole = (role) => {
        if (!role) {
            return null;
        }

        return String(role)
            .replace("ROLE_", "")
            .trim()
            .toUpperCase();
    };

    // =========================================================
    // LOGIN
    // =========================================================
    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            // =================================================
            // LOGIN API
            // =================================================
            const response = await api.post("/auth/login", {
                email: email.trim(),
                password: password,
            });

            console.log("Login response:", response.data);

            // =================================================
            // GET JWT TOKEN
            // =================================================
            const token = response.data?.token;

            if (!token) {
                throw new Error(
                    "Login successful but JWT token was not received."
                );
            }

            // =================================================
            // SAVE TOKEN
            // =================================================
            localStorage.setItem("token", token);

            // =================================================
            // GET ROLE
            // =================================================
            let role =
                response.data?.role ||
                response.data?.user?.role ||
                response.data?.user?.roles ||
                response.data?.authorities;

            // =================================================
            // IF ROLE IS NOT IN RESPONSE, READ JWT
            // =================================================
            if (!role) {
                role = getRoleFromToken(token);
            }

            // =================================================
            // NORMALIZE ROLE
            // =================================================
            if (Array.isArray(role)) {
                role = role[0];
            }

            role = normalizeRole(role);

            console.log("Logged in user role:", role);

            // =================================================
            // SAVE ROLE
            // =================================================
            if (role) {
                localStorage.setItem("role", role);
            }

            // =================================================
            // ROLE BASED REDIRECTION
            // =================================================

            // ADMIN
            if (role === "ADMIN") {
                navigate("/admin/dashboard", {
                    replace: true,
                });

                return;
            }

            // HR
            if (role === "HR") {
                navigate("/hr/dashboard", {
                    replace: true,
                });

                return;
            }

            // CANDIDATE
            if (role === "CANDIDATE") {
                navigate("/dashboard", {
                    replace: true,
                });

                return;
            }

            // UNKNOWN ROLE
            console.warn(
                "Unknown role. Redirecting to candidate dashboard.",
                role
            );

            navigate("/dashboard", {
                replace: true,
            });
        } catch (error) {
            console.error("Login failed:", error);

            localStorage.removeItem("token");
            localStorage.removeItem("role");

            setError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    "Login failed. Please check your email and password."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // UI
    // =========================================================
    return (
        <div
            className="min-vh-100 d-flex align-items-center"
            style={{
                background:
                    "radial-gradient(circle at 10% 20%, rgba(59,130,246,0.25), transparent 28%), radial-gradient(circle at 90% 15%, rgba(124,58,237,0.30), transparent 30%), linear-gradient(135deg, #06142f 0%, #0b2450 45%, #20145c 100%)",
                overflowX: "hidden",
                position: "relative",
            }}
        >
            {/* =================================================
                BACKGROUND DECORATION
            ================================================= */}
            <div
                style={{
                    position: "absolute",
                    width: "350px",
                    height: "350px",
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(59,130,246,0.18), transparent 70%)",
                    top: "-120px",
                    left: "-100px",
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    position: "absolute",
                    width: "450px",
                    height: "450px",
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(139,92,246,0.16), transparent 70%)",
                    bottom: "-180px",
                    right: "-120px",
                    pointerEvents: "none",
                }}
            />

            {/* =================================================
                MAIN CONTAINER
            ================================================= */}
            <div className="container py-4 py-lg-5 position-relative">
                <div className="row align-items-center justify-content-center g-4 g-xl-5">

                    {/* =================================================
                        LEFT BRANDING / HR SECTION
                    ================================================= */}
                    <div className="col-12 col-lg-7">
                        <div
                            className="text-white pe-lg-4"
                            style={{
                                maxWidth: "720px",
                            }}
                        >
                            {/* BRAND */}
                            <div className="mb-4">
                                <div
                                    className="fw-bold"
                                    style={{
                                        fontSize: "clamp(2rem, 4vw, 3rem)",
                                        letterSpacing: "-1.5px",
                                    }}
                                >
                                    HireAI{" "}
                                    <span
                                        style={{
                                            display: "inline-block",
                                            transform: "rotate(-8deg)",
                                        }}
                                    >
                                        🚀
                                    </span>
                                </div>

                                <div
                                    className="fw-semibold text-uppercase"
                                    style={{
                                        fontSize: "0.78rem",
                                        letterSpacing: "3px",
                                        color: "#72b7ff",
                                    }}
                                >
                                    AI-Powered Recruitment
                                </div>
                            </div>

                            {/* MAIN HEADING */}
                            <h1
                                className="fw-bold mb-3"
                                style={{
                                    fontSize: "clamp(2.3rem, 5vw, 4rem)",
                                    lineHeight: "1.08",
                                    letterSpacing: "-2px",
                                }}
                            >
                                Find the right{" "}
                                <span
                                    style={{
                                        background:
                                            "linear-gradient(90deg, #38bdf8, #60a5fa)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                    }}
                                >
                                    talent.
                                </span>
                                <br />
                                Build the right{" "}
                                <span
                                    style={{
                                        background:
                                            "linear-gradient(90deg, #a78bfa, #c084fc)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                    }}
                                >
                                    future.
                                </span>
                            </h1>

                            {/* DESCRIPTION */}
                            <p
                                className="mb-4 mb-lg-5"
                                style={{
                                    maxWidth: "650px",
                                    color: "rgba(226,232,240,0.82)",
                                    fontSize: "1.05rem",
                                    lineHeight: "1.8",
                                }}
                            >
                                HireAI brings candidates, HR teams and
                                recruiters together with intelligent
                                recruitment tools powered by AI.
                            </p>

                            {/* =================================================
                                FEATURE CARDS
                            ================================================= */}
                            <div className="row g-3 mb-3">

                                {/* SMART HIRING */}
                                <div className="col-12 col-md-6">
                                    <div
                                        className="h-100 rounded-4 p-4"
                                        style={{
                                            background:
                                                "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.045))",
                                            border:
                                                "1px solid rgba(255,255,255,0.16)",
                                            backdropFilter: "blur(12px)",
                                            boxShadow:
                                                "0 18px 45px rgba(0,0,0,0.16)",
                                        }}
                                    >
                                        <div
                                            className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                background:
                                                    "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.30))",
                                                fontSize: "1.35rem",
                                            }}
                                        >
                                            👥
                                        </div>

                                        <h5 className="fw-bold mb-2 text-white">
                                            Smart Hiring
                                        </h5>

                                        <p
                                            className="mb-0"
                                            style={{
                                                color: "rgba(226,232,240,0.72)",
                                                fontSize: "0.9rem",
                                                lineHeight: "1.6",
                                            }}
                                        >
                                            Connect recruiters with qualified
                                            candidates faster and smarter.
                                        </p>
                                    </div>
                                </div>

                                {/* AI POWERED */}
                                <div className="col-12 col-md-6">
                                    <div
                                        className="h-100 rounded-4 p-4"
                                        style={{
                                            background:
                                                "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.045))",
                                            border:
                                                "1px solid rgba(255,255,255,0.16)",
                                            backdropFilter: "blur(12px)",
                                            boxShadow:
                                                "0 18px 45px rgba(0,0,0,0.16)",
                                        }}
                                    >
                                        <div
                                            className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                background:
                                                    "linear-gradient(135deg, rgba(139,92,246,0.28), rgba(168,85,247,0.30))",
                                                fontSize: "1.35rem",
                                            }}
                                        >
                                            🤖
                                        </div>

                                        <h5 className="fw-bold mb-2 text-white">
                                            AI Powered
                                        </h5>

                                        <p
                                            className="mb-0"
                                            style={{
                                                color: "rgba(226,232,240,0.72)",
                                                fontSize: "0.9rem",
                                                lineHeight: "1.6",
                                            }}
                                        >
                                            Intelligent job matching and
                                            AI-powered interview evaluation.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* =================================================
                                HR & RECRUITER HIGHLIGHT
                            ================================================= */}
                            <div
                                className="rounded-4 p-4"
                                style={{
                                    background:
                                        "linear-gradient(100deg, #2563eb 0%, #4f46e5 55%, #7c3aed 100%)",
                                    boxShadow:
                                        "0 20px 50px rgba(37,99,235,0.28)",
                                    border:
                                        "1px solid rgba(255,255,255,0.18)",
                                }}
                            >
                                <div className="d-flex align-items-start gap-3">
                                    <div
                                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                        style={{
                                            width: "52px",
                                            height: "52px",
                                            background:
                                                "rgba(255,255,255,0.16)",
                                            fontSize: "1.35rem",
                                        }}
                                    >
                                        💼
                                    </div>

                                    <div>
                                        <h5 className="fw-bold text-white mb-1">
                                            Built for HR & Recruiters
                                        </h5>

                                        <p
                                            className="mb-0"
                                            style={{
                                                color: "rgba(255,255,255,0.82)",
                                                fontSize: "0.92rem",
                                                lineHeight: "1.6",
                                            }}
                                        >
                                            Manage jobs, applications,
                                            interviews and recruitment
                                            analytics from one powerful
                                            workspace.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* TRUST INDICATORS */}
                            <div className="d-flex flex-wrap gap-3 mt-4">
                                <span
                                    className="px-3 py-2 rounded-pill"
                                    style={{
                                        background:
                                            "rgba(255,255,255,0.07)",
                                        border:
                                            "1px solid rgba(255,255,255,0.10)",
                                        color: "rgba(255,255,255,0.75)",
                                        fontSize: "0.78rem",
                                    }}
                                >
                                    🔒 Secure Authentication
                                </span>

                                <span
                                    className="px-3 py-2 rounded-pill"
                                    style={{
                                        background:
                                            "rgba(255,255,255,0.07)",
                                        border:
                                            "1px solid rgba(255,255,255,0.10)",
                                        color: "rgba(255,255,255,0.75)",
                                        fontSize: "0.78rem",
                                    }}
                                >
                                    ⚡ AI-Powered
                                </span>

                                <span
                                    className="px-3 py-2 rounded-pill"
                                    style={{
                                        background:
                                            "rgba(255,255,255,0.07)",
                                        border:
                                            "1px solid rgba(255,255,255,0.10)",
                                        color: "rgba(255,255,255,0.75)",
                                        fontSize: "0.78rem",
                                    }}
                                >
                                    📊 Recruitment Analytics
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        RIGHT LOGIN PANEL
                    ================================================= */}
                    <div className="col-12 col-md-9 col-lg-5 col-xl-4">
                        <div
                            className="rounded-4 p-3 p-sm-4 p-lg-4"
                            style={{
                                background:
                                    "linear-gradient(145deg, rgba(30,41,85,0.92), rgba(37,25,91,0.92))",
                                border:
                                    "1px solid rgba(255,255,255,0.16)",
                                boxShadow:
                                    "0 30px 80px rgba(0,0,0,0.35)",
                                backdropFilter: "blur(20px)",
                            }}
                        >
                            {/* =================================================
                                LOGIN HEADER
                            ================================================= */}
                            <div className="mb-4">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                                    style={{
                                        width: "52px",
                                        height: "52px",
                                        background:
                                            "linear-gradient(135deg, #2563eb, #7c3aed)",
                                        boxShadow:
                                            "0 10px 25px rgba(79,70,229,0.30)",
                                        fontSize: "1.4rem",
                                    }}
                                >
                                    🔐
                                </div>

                                <h2
                                    className="fw-bold text-white mb-2"
                                    style={{
                                        fontSize: "clamp(1.8rem, 4vw, 2.2rem)",
                                    }}
                                >
                                    Welcome back
                                </h2>

                                <p
                                    className="mb-0"
                                    style={{
                                        color: "rgba(226,232,240,0.68)",
                                        fontSize: "0.92rem",
                                    }}
                                >
                                    Sign in to continue to your HireAI
                                    workspace.
                                </p>
                            </div>

                            {/* =================================================
                                ERROR MESSAGE
                            ================================================= */}
                            {error && (
                                <div
                                    className="rounded-3 p-3 mb-3"
                                    style={{
                                        background:
                                            "rgba(239,68,68,0.12)",
                                        border:
                                            "1px solid rgba(248,113,113,0.30)",
                                        color: "#fecaca",
                                        fontSize: "0.88rem",
                                    }}
                                >
                                    <div className="d-flex align-items-start gap-2">
                                        <span>⚠️</span>
                                        <span>{error}</span>
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                LOGIN FORM
                            ================================================= */}
                            <form onSubmit={handleLogin}>
                                {/* EMAIL */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="email"
                                        className="form-label fw-semibold text-white"
                                        style={{
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        Email address
                                    </label>

                                    <div className="input-group">
                                        <span
                                            className="input-group-text"
                                            style={{
                                                background:
                                                    "rgba(255,255,255,0.08)",
                                                border:
                                                    "1px solid rgba(255,255,255,0.16)",
                                                color: "#93c5fd",
                                            }}
                                        >
                                            ✉
                                        </span>

                                        <input
                                            id="email"
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            required
                                            disabled={loading}
                                            style={{
                                                background:
                                                    "rgba(255,255,255,0.08)",
                                                border:
                                                    "1px solid rgba(255,255,255,0.16)",
                                                color: "#ffffff",
                                                boxShadow: "none",
                                                minHeight: "48px",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* PASSWORD */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="password"
                                        className="form-label fw-semibold text-white"
                                        style={{
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        Password
                                    </label>

                                    <div className="input-group">
                                        <span
                                            className="input-group-text"
                                            style={{
                                                background:
                                                    "rgba(255,255,255,0.08)",
                                                border:
                                                    "1px solid rgba(255,255,255,0.16)",
                                                color: "#c4b5fd",
                                            }}
                                        >
                                            🔒
                                        </span>

                                        <input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            className="form-control"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            required
                                            disabled={loading}
                                            style={{
                                                background:
                                                    "rgba(255,255,255,0.08)",
                                                border:
                                                    "1px solid rgba(255,255,255,0.16)",
                                                color: "#ffffff",
                                                boxShadow: "none",
                                                minHeight: "48px",
                                            }}
                                        />

                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            disabled={loading}
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            style={{
                                                background:
                                                    "rgba(255,255,255,0.08)",
                                                border:
                                                    "1px solid rgba(255,255,255,0.16)",
                                                color: "#c4b5fd",
                                                minWidth: "52px",
                                            }}
                                        >
                                            {showPassword ? "🙈" : "👁"}
                                        </button>
                                    </div>
                                </div>

                                {/* LOGIN BUTTON */}
                                <button
                                    type="submit"
                                    className="btn w-100 fw-bold text-white border-0 rounded-3 py-3 mt-2"
                                    disabled={loading}
                                    style={{
                                        background:
                                            "linear-gradient(90deg, #2563eb 0%, #4f46e5 55%, #7c3aed 100%)",
                                        boxShadow:
                                            "0 12px 30px rgba(79,70,229,0.32)",
                                        minHeight: "52px",
                                        fontSize: "1rem",
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                            Signing in...
                                        </>
                                    ) : (
                                        <>Sign in&nbsp; →</>
                                    )}
                                </button>
                            </form>

                            {/* =================================================
                                REGISTER LINK
                            ================================================= */}
                            <div
                                className="text-center mt-3"
                                style={{
                                    color: "rgba(226,232,240,0.62)",
                                    fontSize: "0.88rem",
                                }}
                            >
                                <span>Don't have an account?</span>

                                <button
                                    type="button"
                                    onClick={() => navigate("/register")}
                                    disabled={loading}
                                    className="btn btn-link p-0 ms-1 fw-semibold"
                                    style={{
                                        color: "#60a5fa",
                                        textDecoration: "none",
                                        fontSize: "0.88rem",
                                        verticalAlign: "baseline",
                                    }}
                                >
                                    Register
                                </button>
                            </div>

                            {/* =================================================
                                SECURITY CARD
                            ================================================= */}
                            <div
                                className="rounded-3 p-3 mt-4"
                                style={{
                                    background:
                                        "rgba(255,255,255,0.055)",
                                    border:
                                        "1px solid rgba(255,255,255,0.10)",
                                }}
                            >
                                <div className="d-flex gap-3 align-items-start">
                                    <div
                                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                        style={{
                                            width: "38px",
                                            height: "38px",
                                            background:
                                                "rgba(59,130,246,0.15)",
                                        }}
                                    >
                                        🛡️
                                    </div>

                                    <div>
                                        <div className="fw-semibold text-white mb-1">
                                            Secure recruiter workspace
                                        </div>

                                        <div
                                            style={{
                                                color: "rgba(226,232,240,0.58)",
                                                fontSize: "0.78rem",
                                                lineHeight: "1.5",
                                            }}
                                        >
                                            Your account is protected with
                                            secure authentication and
                                            role-based access.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* =================================================
                                FOOTER
                            ================================================= */}
                            <div
                                className="text-center mt-4"
                                style={{
                                    color: "rgba(226,232,240,0.45)",
                                    fontSize: "0.75rem",
                                }}
                            >
                                © 2026 HireAI · AI-Powered Recruitment
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;