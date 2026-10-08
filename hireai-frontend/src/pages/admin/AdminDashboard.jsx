import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    const currentYear = new Date().getFullYear();

    return (
        <div
            className="min-vh-100 text-white"
            style={{
                background:
                    "radial-gradient(circle at 10% 0%, rgba(37,99,235,0.28), transparent 28%), radial-gradient(circle at 90% 10%, rgba(124,58,237,0.25), transparent 30%), linear-gradient(135deg, #06142f 0%, #0b1d46 48%, #17124a 100%)",
                minHeight: "100vh",
            }}
        >

            {/* =====================================================
                TOP NAVIGATION
            ===================================================== */}

            <nav
                className="navbar navbar-expand-lg sticky-top"
                style={{
                    background: "rgba(4, 15, 38, 0.88)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    borderBottom:
                        "1px solid rgba(255,255,255,0.10)",
                }}
            >
                <div className="container py-2">

                    {/* BRAND */}

                    <button
                        type="button"
                        className="btn btn-link text-decoration-none p-0 border-0"
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        <div className="text-start">

                            <div
                                className="fw-bold lh-1"
                                style={{
                                    fontSize: "1.7rem",
                                    color: "#ffffff",
                                    letterSpacing: "-0.04em",
                                }}
                            >
                                HireAI{" "}
                                <span
                                    style={{
                                        filter:
                                            "drop-shadow(0 0 8px rgba(56,189,248,0.6))",
                                    }}
                                >
                                    🚀
                                </span>
                            </div>

                            <div
                                className="fw-semibold text-uppercase mt-1"
                                style={{
                                    fontSize: "0.57rem",
                                    letterSpacing: "0.18em",
                                    color: "#67e8f9",
                                }}
                            >
                                AI-Powered Recruitment
                            </div>

                        </div>
                    </button>


                    {/* NAVIGATION ACTIONS */}

                    <div className="d-flex align-items-center gap-2 ms-auto">

                        <button
                            type="button"
                            className="btn d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold"
                            style={{
                                background:
                                    "linear-gradient(135deg, #2563eb, #7c3aed)",
                                color: "#fff",
                                border:
                                    "1px solid rgba(255,255,255,0.18)",
                                boxShadow:
                                    "0 8px 25px rgba(37,99,235,0.28)",
                            }}
                            onClick={() =>
                                navigate("/profile")
                            }
                        >
                            <span>👤</span>

                            <span className="d-none d-sm-inline">
                                My Profile
                            </span>
                        </button>


                        <button
                            type="button"
                            className="btn d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold"
                            style={{
                                background:
                                    "rgba(255,255,255,0.05)",
                                color: "#f8fafc",
                                border:
                                    "1px solid rgba(255,255,255,0.18)",
                            }}
                            onClick={handleLogout}
                        >
                            <span>↪</span>

                            <span className="d-none d-sm-inline">
                                Logout
                            </span>
                        </button>

                    </div>

                </div>
            </nav>


            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}

            <main className="container py-4 py-lg-5">

                {/* =================================================
                    BREADCRUMB
                ================================================= */}

                <nav
                    aria-label="breadcrumb"
                    className="mb-4"
                >
                    <ol
                        className="breadcrumb mb-0"
                        style={{
                            "--bs-breadcrumb-divider-color":
                                "rgba(255,255,255,.35)",
                        }}
                    >

                        <li className="breadcrumb-item">

                            <button
                                type="button"
                                className="btn btn-link p-0 text-decoration-none fw-semibold"
                                style={{
                                    color: "#67e8f9",
                                }}
                                onClick={() =>
                                    navigate("/admin/dashboard")
                                }
                            >
                                Home
                            </button>

                        </li>

                        <li
                            className="breadcrumb-item active"
                            aria-current="page"
                            style={{
                                color: "rgba(255,255,255,0.58)",
                            }}
                        >
                            Admin Dashboard
                        </li>

                    </ol>
                </nav>


                {/* =================================================
                    PREMIUM HERO
                ================================================= */}

                <section
                    className="position-relative overflow-hidden rounded-4 mb-5"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(29,78,216,0.95), rgba(79,70,229,0.95) 55%, rgba(124,58,237,0.92))",
                        border:
                            "1px solid rgba(255,255,255,0.22)",
                        boxShadow:
                            "0 25px 70px rgba(0,0,0,0.32)",
                    }}
                >

                    {/* Decorative circles */}

                    <div
                        className="position-absolute rounded-circle"
                        style={{
                            width: "420px",
                            height: "420px",
                            right: "-170px",
                            top: "-230px",
                            background:
                                "rgba(255,255,255,0.07)",
                        }}
                    />

                    <div
                        className="position-absolute rounded-circle"
                        style={{
                            width: "280px",
                            height: "280px",
                            left: "-170px",
                            bottom: "-190px",
                            background:
                                "rgba(34,211,238,0.08)",
                        }}
                    />

                    <div
                        className="position-relative"
                        style={{ zIndex: 2 }}
                    >

                        <div className="row align-items-center g-0">

                            {/* HERO CONTENT */}

                            <div className="col-lg-8">

                                <div className="p-4 p-md-5">

                                    {/* Badge */}

                                    <div
                                        className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4"
                                        style={{
                                            background:
                                                "rgba(255,255,255,0.10)",
                                            border:
                                                "1px solid rgba(255,255,255,0.25)",
                                            backdropFilter:
                                                "blur(10px)",
                                        }}
                                    >

                                        <span>🛡️</span>

                                        <span
                                            className="fw-bold text-uppercase"
                                            style={{
                                                fontSize:
                                                    "0.67rem",
                                                letterSpacing:
                                                    "0.13em",
                                                color:
                                                    "#cffafe",
                                            }}
                                        >
                                            Admin Control Center
                                        </span>

                                    </div>


                                    {/* Heading */}

                                    <h1
                                        className="fw-bold mb-3"
                                        style={{
                                            fontSize:
                                                "clamp(2rem, 4vw, 3.45rem)",
                                            lineHeight: 1.08,
                                            letterSpacing:
                                                "-0.045em",
                                        }}
                                    >
                                        Manage your{" "}
                                        <span
                                            style={{
                                                background:
                                                    "linear-gradient(90deg, #67e8f9, #ffffff)",
                                                WebkitBackgroundClip:
                                                    "text",
                                                WebkitTextFillColor:
                                                    "transparent",
                                            }}
                                        >
                                            recruitment
                                        </span>
                                        <br />
                                        ecosystem.
                                    </h1>


                                    {/* Description */}

                                    <p
                                        className="mb-4"
                                        style={{
                                            color:
                                                "rgba(255,255,255,0.76)",
                                            fontSize:
                                                "1rem",
                                            lineHeight: 1.75,
                                            maxWidth:
                                                "720px",
                                        }}
                                    >
                                        Manage candidates, HR teams,
                                        jobs, applications and
                                        AI-powered interviews from one
                                        intelligent HireAI workspace.
                                    </p>


                                    {/* Buttons */}

                                    <div className="d-flex flex-wrap gap-2">

                                        <button
                                            type="button"
                                            className="btn px-4 py-2 rounded-3 fw-bold"
                                            style={{
                                                background:
                                                    "#ffffff",
                                                color:
                                                    "#1d4ed8",
                                                boxShadow:
                                                    "0 10px 30px rgba(0,0,0,0.20)",
                                            }}
                                            onClick={() =>
                                                navigate(
                                                    "/admin/users"
                                                )
                                            }
                                        >
                                            Manage Platform
                                            <span className="ms-2">
                                                →
                                            </span>
                                        </button>


                                        <button
                                            type="button"
                                            className="btn px-4 py-2 rounded-3 fw-semibold"
                                            style={{
                                                color: "#ffffff",
                                                background:
                                                    "rgba(255,255,255,0.08)",
                                                border:
                                                    "1px solid rgba(255,255,255,0.35)",
                                            }}
                                            onClick={() =>
                                                navigate(
                                                    "/admin/analytics"
                                                )
                                            }
                                        >
                                            View Analytics
                                        </button>

                                    </div>

                                </div>

                            </div>


                            {/* HERO VISUAL */}

                            <div className="col-lg-4 d-none d-lg-block">

                                <div className="p-4 p-xl-5 text-center">

                                    {/* Main icon */}

                                    <div
                                        className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-4"
                                        style={{
                                            width: "150px",
                                            height: "150px",
                                            background:
                                                "rgba(255,255,255,0.08)",
                                            border:
                                                "1px solid rgba(255,255,255,0.45)",
                                            boxShadow:
                                                "0 20px 60px rgba(0,0,0,0.22)",
                                        }}
                                    >

                                        <span
                                            style={{
                                                fontSize:
                                                    "5rem",
                                                filter:
                                                    "drop-shadow(0 10px 18px rgba(0,0,0,0.25))",
                                            }}
                                        >
                                            🚀
                                        </span>

                                    </div>


                                    {/* Hero mini cards */}

                                    <div className="row g-2">

                                        <HeroMiniCard
                                            icon="👥"
                                            text="Users"
                                        />

                                        <HeroMiniCard
                                            icon="💼"
                                            text="Jobs"
                                        />

                                        <HeroMiniCard
                                            icon="📊"
                                            text="Analytics"
                                        />

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    QUICK STATS
                ================================================= */}

                <section className="row g-3 mb-5">

                    <QuickStat
                        icon="👥"
                        label="Candidate Network"
                        value="Candidates"
                        accent="#22d3ee"
                    />

                    <QuickStat
                        icon="💼"
                        label="Recruitment"
                        value="Active Jobs"
                        accent="#60a5fa"
                    />

                    <QuickStat
                        icon="🤖"
                        label="Intelligence"
                        value="AI Interviews"
                        accent="#a78bfa"
                    />

                    <QuickStat
                        icon="📈"
                        label="Insights"
                        value="Analytics"
                        accent="#34d399"
                    />

                </section>


                {/* =================================================
                    SECTION HEADER
                ================================================= */}

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">

                    <div>

                        <div className="d-flex align-items-center gap-2 mb-2">

                            <span
                                className="rounded-circle"
                                style={{
                                    width: "9px",
                                    height: "9px",
                                    background:
                                        "#22d3ee",
                                    boxShadow:
                                        "0 0 14px rgba(34,211,238,0.8)",
                                }}
                            />

                            <span
                                className="fw-bold text-uppercase"
                                style={{
                                    color: "#67e8f9",
                                    fontSize:
                                        "0.72rem",
                                    letterSpacing:
                                        "0.13em",
                                }}
                            >
                                Workspace
                            </span>

                        </div>


                        <h2
                            className="fw-bold mb-1"
                            style={{
                                fontSize:
                                    "clamp(1.7rem, 3vw, 2.35rem)",
                                letterSpacing:
                                    "-0.035em",
                            }}
                        >
                            Recruitment Management
                        </h2>


                        <p
                            className="mb-0"
                            style={{
                                color:
                                    "rgba(255,255,255,0.58)",
                            }}
                        >
                            Everything you need to manage
                            the HireAI platform.
                        </p>

                    </div>


                    <div
                        className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 align-self-md-end"
                        style={{
                            background:
                                "rgba(255,255,255,0.06)",
                            border:
                                "1px solid rgba(255,255,255,0.15)",
                            color:
                                "rgba(255,255,255,0.78)",
                        }}
                    >
                        <span>🔐</span>
                        <span
                            className="small fw-semibold"
                        >
                            Administrator Access
                        </span>
                    </div>

                </div>


                {/* =================================================
                    MANAGEMENT CARDS
                ================================================= */}

                <section className="row g-4">

                    <AdminCard
                        icon="👥"
                        title="Users"
                        description="Manage registered candidates, HR professionals and administrators."
                        linkText="Manage Users"
                        badge="USER MANAGEMENT"
                        accent="#3b82f6"
                        onClick={() =>
                            navigate("/admin/users")
                        }
                    />


                    <AdminCard
                        icon="💼"
                        title="Jobs"
                        description="Create, review and manage job opportunities across the HireAI platform."
                        linkText="Manage Jobs"
                        badge="JOB MANAGEMENT"
                        accent="#22c55e"
                        onClick={() =>
                            navigate("/admin/jobs")
                        }
                    />


                    <AdminCard
                        icon="📄"
                        title="Applications"
                        description="Review candidate applications and monitor recruitment progress."
                        linkText="View Applications"
                        badge="APPLICATIONS"
                        accent="#f59e0b"
                        onClick={() =>
                            navigate("/admin/applications")
                        }
                    />


                    <AdminCard
                        icon="🤖"
                        title="AI Interviews"
                        description="Monitor candidate interviews and AI-powered evaluation results."
                        linkText="View Interviews"
                        badge="AI INTERVIEWS"
                        accent="#a855f7"
                        onClick={() =>
                            navigate("/admin/interviews")
                        }
                    />


                    <AdminCard
                        icon="📊"
                        title="Analytics"
                        description="Explore recruitment statistics, platform activity and business insights."
                        linkText="View Analytics"
                        badge="INSIGHTS"
                        accent="#06b6d4"
                        onClick={() =>
                            navigate("/admin/analytics")
                        }
                    />


                    {/* PLATFORM CONTROL CARD */}

                    <div className="col-12 col-md-6 col-lg-4">

                        <article
                            className="h-100 rounded-4 overflow-hidden position-relative"
                            style={{
                                background:
                                    "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.92))",
                                border:
                                    "1px solid rgba(255,255,255,0.13)",
                                boxShadow:
                                    "0 18px 45px rgba(0,0,0,0.20)",
                            }}
                        >

                            <div
                                style={{
                                    height: "4px",
                                    background:
                                        "linear-gradient(90deg, #22d3ee, #8b5cf6)",
                                }}
                            />

                            <div className="p-4 d-flex flex-column h-100">

                                <div className="d-flex justify-content-between align-items-start mb-4">

                                    <div
                                        className="rounded-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: "56px",
                                            height: "56px",
                                            fontSize:
                                                "1.45rem",
                                            background:
                                                "linear-gradient(135deg, rgba(34,211,238,0.18), rgba(139,92,246,0.22))",
                                            border:
                                                "1px solid rgba(103,232,249,0.25)",
                                        }}
                                    >
                                        ⚡
                                    </div>


                                    <span
                                        className="badge rounded-pill px-3 py-2"
                                        style={{
                                            background:
                                                "rgba(34,211,238,0.10)",
                                            color:
                                                "#67e8f9",
                                            border:
                                                "1px solid rgba(34,211,238,0.22)",
                                        }}
                                    >
                                        SYSTEM
                                    </span>

                                </div>


                                <h3
                                    className="h5 fw-bold mb-2"
                                >
                                    Platform Control
                                </h3>


                                <p
                                    className="small lh-lg mb-4"
                                    style={{
                                        color:
                                            "rgba(255,255,255,0.56)",
                                    }}
                                >
                                    Keep your HireAI recruitment
                                    environment secure, organized
                                    and ready for growth.
                                </p>


                                <div className="mt-auto">

                                    <div
                                        className="d-flex align-items-center gap-2 small fw-semibold"
                                        style={{
                                            color:
                                                "#4ade80",
                                        }}
                                    >
                                        <span
                                            className="rounded-circle"
                                            style={{
                                                width: "8px",
                                                height: "8px",
                                                background:
                                                    "#4ade80",
                                                boxShadow:
                                                    "0 0 10px rgba(74,222,128,0.8)",
                                            }}
                                        />

                                        Platform Ready
                                    </div>

                                </div>

                            </div>

                        </article>

                    </div>

                </section>


                {/* =================================================
                    PREMIUM ACTION BANNER
                ================================================= */}

                <section className="mt-5">

                    <div
                        className="rounded-4 overflow-hidden position-relative"
                        style={{
                            background:
                                "linear-gradient(110deg, rgba(14,116,144,0.35), rgba(79,70,229,0.42), rgba(124,58,237,0.32))",
                            border:
                                "1px solid rgba(103,232,249,0.18)",
                            boxShadow:
                                "0 20px 55px rgba(0,0,0,0.20)",
                        }}
                    >

                        <div
                            className="p-4 p-md-5 position-relative"
                            style={{ zIndex: 2 }}
                        >

                            <div className="row align-items-center g-4">

                                <div className="col-lg-8">

                                    <div className="d-flex gap-3 align-items-start">

                                        <div
                                            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                                            style={{
                                                width: "54px",
                                                height: "54px",
                                                fontSize:
                                                    "1.35rem",
                                                background:
                                                    "linear-gradient(135deg, #06b6d4, #6366f1)",
                                                boxShadow:
                                                    "0 10px 30px rgba(6,182,212,0.25)",
                                            }}
                                        >
                                            💡
                                        </div>


                                        <div>

                                            <div
                                                className="small fw-bold text-uppercase mb-2"
                                                style={{
                                                    color:
                                                        "#67e8f9",
                                                    letterSpacing:
                                                        "0.12em",
                                                }}
                                            >
                                                Admin Workspace
                                            </div>


                                            <h3
                                                className="h4 fw-bold mb-2"
                                            >
                                                Everything under control.
                                            </h3>


                                            <p
                                                className="mb-0"
                                                style={{
                                                    color:
                                                        "rgba(255,255,255,0.60)",
                                                    lineHeight:
                                                        1.7,
                                                }}
                                            >
                                                Monitor your recruitment
                                                ecosystem, identify
                                                opportunities and keep
                                                your hiring operations
                                                moving forward.
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <div className="col-lg-4">

                                    <div className="d-grid">

                                        <button
                                            type="button"
                                            className="btn btn-lg rounded-3 fw-bold py-3"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #06b6d4, #6366f1)",
                                                color:
                                                    "#ffffff",
                                                border:
                                                    "1px solid rgba(255,255,255,0.18)",
                                                boxShadow:
                                                    "0 12px 35px rgba(79,70,229,0.28)",
                                            }}
                                            onClick={() =>
                                                navigate(
                                                    "/admin/analytics"
                                                )
                                            }
                                        >
                                            Open Recruitment Analytics
                                            <span className="ms-2">
                                                →
                                            </span>
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

            </main>


            {/* =====================================================
                FOOTER
            ===================================================== */}

            <footer
                className="mt-5"
                style={{
                    background:
                        "rgba(3,10,28,0.75)",
                    borderTop:
                        "1px solid rgba(255,255,255,0.09)",
                }}
            >

                <div className="container py-4">

                    <div className="row align-items-center g-3">

                        <div className="col-md-6">

                            <div
                                className="fw-bold"
                                style={{
                                    color:
                                        "#ffffff",
                                }}
                            >
                                HireAI 🚀
                            </div>

                            <div
                                className="small"
                                style={{
                                    color:
                                        "rgba(255,255,255,0.45)",
                                }}
                            >
                                AI-Powered Recruitment Platform
                            </div>

                        </div>


                        <div className="col-md-6 text-md-end">

                            <div
                                className="small"
                                style={{
                                    color:
                                        "rgba(255,255,255,0.40)",
                                }}
                            >
                                © {currentYear} HireAI.
                                All rights reserved.
                            </div>

                        </div>

                    </div>

                </div>

            </footer>

        </div>
    );
}


/* =========================================================
   HERO MINI CARD
========================================================= */

function HeroMiniCard({ icon, text }) {
    return (
        <div className="col-4">

            <div
                className="rounded-3 p-2"
                style={{
                    background:
                        "rgba(255,255,255,0.08)",
                    border:
                        "1px solid rgba(255,255,255,0.20)",
                    backdropFilter:
                        "blur(10px)",
                }}
            >

                <div
                    style={{
                        fontSize: "1.15rem",
                    }}
                >
                    {icon}
                </div>

                <div
                    className="fw-semibold mt-1"
                    style={{
                        fontSize: "0.65rem",
                        color:
                            "rgba(255,255,255,0.72)",
                    }}
                >
                    {text}
                </div>

            </div>

        </div>
    );
}


/* =========================================================
   QUICK STAT
========================================================= */

function QuickStat({
    icon,
    label,
    value,
    accent,
}) {
    return (
        <div className="col-6 col-lg-3">

            <div
                className="rounded-4 h-100 p-3 p-md-4"
                style={{
                    background:
                        "rgba(255,255,255,0.045)",
                    border:
                        "1px solid rgba(255,255,255,0.10)",
                    boxShadow:
                        "0 12px 35px rgba(0,0,0,0.12)",
                    backdropFilter:
                        "blur(12px)",
                }}
            >

                <div className="d-flex align-items-center gap-3">

                    <div
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                            width: "46px",
                            height: "46px",
                            fontSize:
                                "1.2rem",
                            background:
                                `${accent}18`,
                            border:
                                `1px solid ${accent}35`,
                        }}
                    >
                        {icon}
                    </div>


                    <div className="min-w-0">

                        <div
                            className="small mb-1"
                            style={{
                                color:
                                    "rgba(255,255,255,0.45)",
                            }}
                        >
                            {label}
                        </div>

                        <div
                            className="fw-bold"
                            style={{
                                color:
                                    "#f8fafc",
                            }}
                        >
                            {value}
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


/* =========================================================
   ADMIN MANAGEMENT CARD
========================================================= */

function AdminCard({
    icon,
    title,
    description,
    linkText,
    badge,
    accent,
    onClick,
}) {
    return (
        <div className="col-12 col-md-6 col-lg-4">

            <article
                className="h-100 rounded-4 overflow-hidden position-relative"
                style={{
                    background:
                        "linear-gradient(145deg, rgba(15,28,58,0.96), rgba(10,21,47,0.96))",
                    border:
                        "1px solid rgba(255,255,255,0.13)",
                    boxShadow:
                        "0 18px 45px rgba(0,0,0,0.18)",
                }}
            >

                {/* TOP COLOR LINE */}

                <div
                    style={{
                        height: "4px",
                        background:
                            `linear-gradient(90deg, ${accent}, transparent)`,
                    }}
                />


                <div className="p-4 d-flex flex-column h-100">

                    {/* CARD TOP */}

                    <div className="d-flex justify-content-between align-items-start mb-4">

                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center"
                            style={{
                                width: "56px",
                                height: "56px",
                                fontSize:
                                    "1.45rem",
                                background:
                                    `${accent}18`,
                                border:
                                    `1px solid ${accent}40`,
                                boxShadow:
                                    `0 8px 25px ${accent}12`,
                            }}
                        >
                            {icon}
                        </div>


                        <span
                            className="badge rounded-pill px-3 py-2"
                            style={{
                                color: accent,
                                background:
                                    `${accent}12`,
                                border:
                                    `1px solid ${accent}30`,
                                fontSize:
                                    "0.58rem",
                                letterSpacing:
                                    "0.07em",
                            }}
                        >
                            {badge}
                        </span>

                    </div>


                    {/* TITLE */}

                    <h3
                        className="h5 fw-bold mb-2"
                        style={{
                            color:
                                "#f8fafc",
                        }}
                    >
                        {title}
                    </h3>


                    {/* DESCRIPTION */}

                    <p
                        className="small lh-lg mb-4"
                        style={{
                            color:
                                "rgba(255,255,255,0.55)",
                        }}
                    >
                        {description}
                    </p>


                    {/* ACTION */}

                    <div className="mt-auto">

                        <button
                            type="button"
                            className="btn rounded-3 fw-semibold px-3 py-2"
                            style={{
                                color: "#ffffff",
                                background:
                                    `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                                border:
                                    "1px solid rgba(255,255,255,0.10)",
                                boxShadow:
                                    `0 8px 22px ${accent}20`,
                            }}
                            onClick={onClick}
                        >
                            {linkText}

                            <span className="ms-2">
                                →
                            </span>
                        </button>

                    </div>

                </div>

            </article>

        </div>
    );
}


export default AdminDashboard;