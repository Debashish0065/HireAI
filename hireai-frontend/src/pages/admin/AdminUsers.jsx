import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    Users,
    UserRound,
    BriefcaseBusiness,
    ShieldCheck,
    Search,
    SlidersHorizontal,
    Mail,
    CheckCircle2,
    UserCog,
    RefreshCw,
} from "lucide-react";

import api from "../../services/api";

import "bootstrap/dist/css/bootstrap.min.css";

function AdminUsers() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    const [hoveredUser, setHoveredUser] = useState(null);

    // =========================================================
    // LOAD USERS
    // =========================================================

    useEffect(() => {
        let ignore = false;

        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/admin/users");

                console.log("Admin users response:", response.data);

                if (!ignore) {
                    if (Array.isArray(response.data)) {
                        setUsers(response.data);
                    } else if (Array.isArray(response.data?.users)) {
                        setUsers(response.data.users);
                    } else if (Array.isArray(response.data?.content)) {
                        setUsers(response.data.content);
                    } else if (Array.isArray(response.data?.data)) {
                        setUsers(response.data.data);
                    } else {
                        setUsers([]);
                    }
                }
            } catch (err) {
                console.error("Failed to load admin users:", err);

                if (!ignore) {
                    if (err.response?.status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("role");

                        navigate("/login");
                        return;
                    }

                    if (err.response?.status === 403) {
                        setError(
                            "Access denied. Only administrators can view users."
                        );
                        return;
                    }

                    setError(
                        err.response?.data?.message ||
                            "Unable to load users."
                    );
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            ignore = true;
        };
    }, [navigate]);

    // =========================================================
    // BACK TO ADMIN DASHBOARD
    // =========================================================

    const handleBack = () => {
        navigate("/admin/dashboard");
    };

    // =========================================================
    // REFRESH USERS
    // =========================================================

    const handleRefresh = () => {
        window.location.reload();
    };

    // =========================================================
    // STATISTICS
    // =========================================================

    const totalUsers = users.length;

    const candidateCount = users.filter(
        (user) =>
            normalizeRole(user.role || user.roles) === "CANDIDATE"
    ).length;

    const hrCount = users.filter(
        (user) =>
            normalizeRole(user.role || user.roles) === "HR"
    ).length;

    const adminCount = users.filter(
        (user) =>
            normalizeRole(user.role || user.roles) === "ADMIN"
    ).length;

    const activeCount = users.filter(
        (user) => getUserStatus(user) === "Active"
    ).length;

    // =========================================================
    // FILTER USERS
    // =========================================================

    const filteredUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return users.filter((user) => {
            const name = getUserName(user).toLowerCase();

            const email = String(
                user.email || ""
            ).toLowerCase();

            const role = normalizeRole(
                user.role || user.roles
            );

            const matchesSearch =
                !query ||
                name.includes(query) ||
                email.includes(query) ||
                role.toLowerCase().includes(query);

            const matchesRole =
                roleFilter === "ALL" ||
                role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div
                className="min-vh-100 d-flex align-items-center justify-content-center"
                style={{
                    background:
                        "radial-gradient(circle at 10% 0%, #1e293b 0%, #111827 28%, #080d1c 65%, #030712 100%)",
                    color: "#ffffff",
                    padding: "30px",
                }}
            >
                <div
                    className="text-center p-5"
                    style={{
                        background:
                            "linear-gradient(145deg, rgba(20, 30, 52, 0.96), rgba(8, 15, 30, 0.96))",
                        border:
                            "1px solid rgba(99, 102, 241, 0.22)",
                        borderRadius: "24px",
                        boxShadow:
                            "0 30px 80px rgba(0, 0, 0, 0.45), 0 0 40px rgba(79, 70, 229, 0.08)",
                        backdropFilter: "blur(20px)",
                        minWidth: "320px",
                    }}
                >
                    <div
                        className="d-flex align-items-center justify-content-center mx-auto mb-4"
                        style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "18px",
                            background:
                                "linear-gradient(135deg, #4f46e5, #7c3aed)",
                            boxShadow:
                                "0 12px 35px rgba(99, 102, 241, 0.40)",
                        }}
                    >
                        <Users size={28} />
                    </div>

                    <h3
                        className="fw-bold mb-2"
                        style={{
                            letterSpacing: "-0.3px",
                        }}
                    >
                        Admin Users
                    </h3>

                    <p
                        className="mb-4"
                        style={{
                            color: "#94a3b8",
                        }}
                    >
                        Loading registered users...
                    </p>

                    <div
                        className="spinner-border"
                        role="status"
                        style={{
                            color: "#818cf8",
                            width: "28px",
                            height: "28px",
                        }}
                    />
                </div>
            </div>
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div
            className="min-vh-100"
            style={{
                background:
                    "radial-gradient(circle at 10% 0%, #1e293b 0%, #111827 28%, #080d1c 65%, #030712 100%)",
                color: "#f8fafc",
                padding: "32px 18px 60px",
            }}
        >
            {/* =====================================================
                PREMIUM TABLE OVERRIDE
            ===================================================== */}

            <style>
                {`
                    .admin-users-premium-table,
                    .admin-users-premium-table .table,
                    .admin-users-premium-table .table-responsive {
                        --bs-table-bg: transparent !important;
                        --bs-table-color: #e2e8f0 !important;
                        --bs-table-border-color: transparent !important;
                        --bs-table-striped-bg: transparent !important;
                        --bs-table-striped-color: #e2e8f0 !important;
                        --bs-table-hover-bg: transparent !important;
                        --bs-table-hover-color: #f8fafc !important;
                        background-color: transparent !important;
                    }

                    .admin-users-premium-table table {
                        background: transparent !important;
                    }

                    .admin-users-premium-table thead,
                    .admin-users-premium-table thead tr,
                    .admin-users-premium-table thead th {
                        background-color: transparent !important;
                    }

                    .admin-users-premium-table tbody,
                    .admin-users-premium-table tbody tr,
                    .admin-users-premium-table tbody td {
                        background-color: transparent !important;
                    }

                    .admin-users-premium-table .form-control,
                    .admin-users-premium-table .form-select,
                    .admin-users-premium-table .input-group-text {
                        color-scheme: dark;
                    }

                    .admin-users-premium-table .form-control::placeholder {
                        color: #64748b !important;
                    }

                    .admin-users-premium-table .form-control:focus,
                    .admin-users-premium-table .form-select:focus {
                        background-color: #080f1f !important;
                        color: #f8fafc !important;
                        border-color: rgba(129, 140, 248, 0.55) !important;
                        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.10) !important;
                    }

                    .admin-users-premium-table .form-select option {
                        background: #0b1222 !important;
                        color: #e2e8f0 !important;
                    }

                    .admin-users-premium-table tbody tr {
                        transition:
                            background 0.22s ease,
                            transform 0.22s ease,
                            box-shadow 0.22s ease;
                    }

                    .admin-users-premium-table tbody tr:hover {
                        background:
                            linear-gradient(
                                90deg,
                                rgba(99, 102, 241, 0.12),
                                rgba(124, 58, 237, 0.06),
                                rgba(15, 23, 42, 0.18)
                            ) !important;
                    }

                    .admin-users-premium-table tbody tr:last-child td {
                        border-bottom: none !important;
                    }

                    @media (max-width: 768px) {
                        .admin-users-premium-table .input-group {
                            width: 100%;
                            min-width: 0 !important;
                        }
                    }
                `}
            </style>

            <div
                className="container"
                style={{
                    maxWidth: "1200px",
                }}
            >
                {/* =================================================
                    TOP NAVIGATION
                ================================================= */}

                <div
                    className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
                >
                    <button
                        type="button"
                        onClick={handleBack}
                        className="btn d-inline-flex align-items-center gap-2"
                        style={{
                            background:
                                "linear-gradient(145deg, rgba(71, 85, 105, 0.75), rgba(51, 65, 85, 0.65))",
                            color: "#f8fafc",
                            border:
                                "1px solid rgba(148, 163, 184, 0.20)",
                            borderRadius: "10px",
                            padding: "10px 16px",
                            fontWeight: "500",
                            boxShadow:
                                "0 8px 25px rgba(0, 0, 0, 0.20)",
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        <ArrowLeft size={17} />

                        Back to Admin Dashboard
                    </button>

                    <div
                        className="d-flex align-items-center gap-2 px-3 py-2"
                        style={{
                            background:
                                "rgba(16, 185, 129, 0.08)",
                            border:
                                "1px solid rgba(52, 211, 153, 0.22)",
                            borderRadius: "999px",
                            color: "#6ee7b7",
                            fontSize: "13px",
                            fontWeight: "600",
                            boxShadow:
                                "0 0 20px rgba(16, 185, 129, 0.06)",
                        }}
                    >
                        <span
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#34d399",
                                boxShadow:
                                    "0 0 12px rgba(52, 211, 153, 0.85)",
                            }}
                        />

                        System Active
                    </div>
                </div>

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-4">
                    <div
                        className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3"
                    >
                        <div>
                            <div
                                className="d-flex align-items-center gap-3 mb-3"
                            >
                                <div
                                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{
                                        width: "56px",
                                        height: "56px",
                                        borderRadius: "16px",
                                        background:
                                            "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                        boxShadow:
                                            "0 15px 35px rgba(79, 70, 229, 0.38)",
                                    }}
                                >
                                    <UserCog size={27} />
                                </div>

                                <div>
                                    <h1
                                        className="mb-1 fw-bold"
                                        style={{
                                            fontSize:
                                                "clamp(28px, 4vw, 36px)",
                                            letterSpacing:
                                                "-0.8px",
                                        }}
                                    >
                                        Admin Users
                                    </h1>

                                    <p
                                        className="mb-0"
                                        style={{
                                            color: "#94a3b8",
                                            fontSize: "15px",
                                        }}
                                    >
                                        Manage and monitor registered
                                        users on HireAI.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="btn d-inline-flex align-items-center justify-content-center gap-2"
                            style={{
                                background:
                                    "rgba(30, 41, 59, 0.78)",
                                color: "#cbd5e1",
                                border:
                                    "1px solid rgba(148, 163, 184, 0.16)",
                                borderRadius: "10px",
                                padding: "10px 15px",
                                fontSize: "13px",
                                fontWeight: "600",
                                boxShadow:
                                    "0 8px 20px rgba(0, 0, 0, 0.15)",
                            }}
                        >
                            <RefreshCw size={15} />

                            Refresh
                        </button>
                    </div>
                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div
                        className="d-flex align-items-start gap-3 mb-4 p-3"
                        style={{
                            background:
                                "rgba(127, 29, 29, 0.32)",
                            border:
                                "1px solid rgba(239, 68, 68, 0.35)",
                            color: "#fecaca",
                            borderRadius: "14px",
                            boxShadow:
                                "0 12px 30px rgba(0, 0, 0, 0.15)",
                        }}
                    >
                        <div
                            className="d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "10px",
                                background:
                                    "rgba(239, 68, 68, 0.15)",
                                fontWeight: "700",
                            }}
                        >
                            !
                        </div>

                        <div>
                            <div
                                className="fw-semibold mb-1"
                                style={{
                                    color: "#fca5a5",
                                }}
                            >
                                Unable to load users
                            </div>

                            <div
                                style={{
                                    fontSize: "13px",
                                }}
                            >
                                {error}
                            </div>
                        </div>
                    </div>
                )}

                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="row g-3 mb-4">

                    {/* TOTAL USERS */}

                    <div className="col-12 col-sm-6 col-xl-3">
                        <div
                            className="h-100 p-4"
                            style={{
                                background:
                                    "linear-gradient(145deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.94))",
                                border:
                                    "1px solid rgba(99, 102, 241, 0.24)",
                                borderRadius: "18px",
                                boxShadow:
                                    "0 18px 40px rgba(0, 0, 0, 0.24)",
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <div
                                        style={{
                                            color: "#94a3b8",
                                            fontSize: "11px",
                                            fontWeight: "700",
                                            letterSpacing: "1px",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        TOTAL USERS
                                    </div>

                                    <div
                                        className="fw-bold"
                                        style={{
                                            fontSize: "30px",
                                        }}
                                    >
                                        {totalUsers}
                                    </div>
                                </div>

                                <div
                                    className="d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "46px",
                                        height: "46px",
                                        borderRadius: "13px",
                                        background:
                                            "rgba(99, 102, 241, 0.14)",
                                        color: "#818cf8",
                                    }}
                                >
                                    <Users size={22} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CANDIDATES */}

                    <div className="col-12 col-sm-6 col-xl-3">
                        <div
                            className="h-100 p-4"
                            style={{
                                background:
                                    "linear-gradient(145deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.94))",
                                border:
                                    "1px solid rgba(16, 185, 129, 0.20)",
                                borderRadius: "18px",
                                boxShadow:
                                    "0 18px 40px rgba(0, 0, 0, 0.24)",
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <div
                                        style={{
                                            color: "#94a3b8",
                                            fontSize: "11px",
                                            fontWeight: "700",
                                            letterSpacing: "1px",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        CANDIDATES
                                    </div>

                                    <div
                                        className="fw-bold"
                                        style={{
                                            fontSize: "30px",
                                        }}
                                    >
                                        {candidateCount}
                                    </div>
                                </div>

                                <div
                                    className="d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "46px",
                                        height: "46px",
                                        borderRadius: "13px",
                                        background:
                                            "rgba(16, 185, 129, 0.12)",
                                        color: "#34d399",
                                    }}
                                >
                                    <UserRound size={22} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HR */}

                    <div className="col-12 col-sm-6 col-xl-3">
                        <div
                            className="h-100 p-4"
                            style={{
                                background:
                                    "linear-gradient(145deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.94))",
                                border:
                                    "1px solid rgba(59, 130, 246, 0.20)",
                                borderRadius: "18px",
                                boxShadow:
                                    "0 18px 40px rgba(0, 0, 0, 0.24)",
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <div
                                        style={{
                                            color: "#94a3b8",
                                            fontSize: "11px",
                                            fontWeight: "700",
                                            letterSpacing: "1px",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        HR USERS
                                    </div>

                                    <div
                                        className="fw-bold"
                                        style={{
                                            fontSize: "30px",
                                        }}
                                    >
                                        {hrCount}
                                    </div>
                                </div>

                                <div
                                    className="d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "46px",
                                        height: "46px",
                                        borderRadius: "13px",
                                        background:
                                            "rgba(59, 130, 246, 0.12)",
                                        color: "#60a5fa",
                                    }}
                                >
                                    <BriefcaseBusiness size={22} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ADMIN */}

                    <div className="col-12 col-sm-6 col-xl-3">
                        <div
                            className="h-100 p-4"
                            style={{
                                background:
                                    "linear-gradient(145deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.94))",
                                border:
                                    "1px solid rgba(168, 85, 247, 0.20)",
                                borderRadius: "18px",
                                boxShadow:
                                    "0 18px 40px rgba(0, 0, 0, 0.24)",
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <div
                                        style={{
                                            color: "#94a3b8",
                                            fontSize: "11px",
                                            fontWeight: "700",
                                            letterSpacing: "1px",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        ADMINS
                                    </div>

                                    <div
                                        className="fw-bold"
                                        style={{
                                            fontSize: "30px",
                                        }}
                                    >
                                        {adminCount}
                                    </div>
                                </div>

                                <div
                                    className="d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "46px",
                                        height: "46px",
                                        borderRadius: "13px",
                                        background:
                                            "rgba(168, 85, 247, 0.12)",
                                        color: "#c084fc",
                                    }}
                                >
                                    <ShieldCheck size={22} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    REGISTERED USERS
                ================================================= */}

                {users.length === 0 ? (
                    <div
                        className="p-5 text-center"
                        style={{
                            background:
                                "linear-gradient(145deg, rgba(18, 28, 48, 0.97), rgba(7, 14, 29, 0.97))",
                            border:
                                "1px solid rgba(99, 102, 241, 0.18)",
                            borderRadius: "20px",
                            boxShadow:
                                "0 25px 60px rgba(0, 0, 0, 0.30)",
                        }}
                    >
                        <div
                            className="d-flex align-items-center justify-content-center mx-auto mb-3"
                            style={{
                                width: "64px",
                                height: "64px",
                                borderRadius: "18px",
                                background:
                                    "rgba(99, 102, 241, 0.10)",
                                color: "#818cf8",
                            }}
                        >
                            <Users size={28} />
                        </div>

                        <h3
                            className="fw-bold mb-2"
                            style={{
                                fontSize: "21px",
                            }}
                        >
                            No users found
                        </h3>

                        <p
                            className="mb-0"
                            style={{
                                color: "#94a3b8",
                            }}
                        >
                            There are currently no registered users.
                        </p>
                    </div>
                ) : (
                    <div
                        className="admin-users-premium-table"
                        style={{
                            background:
                                "linear-gradient(145deg, rgba(17, 25, 45, 0.98), rgba(6, 12, 26, 0.99))",
                            border:
                                "1px solid rgba(129, 140, 248, 0.22)",
                            borderRadius: "22px",
                            overflow: "hidden",
                            boxShadow:
                                "0 30px 80px rgba(0, 0, 0, 0.42), 0 0 55px rgba(79, 70, 229, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.025)",
                            backdropFilter: "blur(22px)",
                        }}
                    >
                        {/* =================================================
                            TABLE HEADER
                        ================================================= */}

                        <div
                            className="p-3 p-md-4"
                            style={{
                                background:
                                    "linear-gradient(135deg, rgba(24, 35, 60, 0.98), rgba(11, 19, 38, 0.98))",
                                borderBottom:
                                    "1px solid rgba(129, 140, 248, 0.14)",
                                boxShadow:
                                    "inset 0 -1px 0 rgba(255, 255, 255, 0.015)",
                            }}
                        >
                            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <div
                                            style={{
                                                width: "8px",
                                                height: "8px",
                                                borderRadius: "50%",
                                                background:
                                                    "#818cf8",
                                                boxShadow:
                                                    "0 0 12px rgba(129, 140, 248, 0.8)",
                                            }}
                                        />

                                        <h4
                                            className="fw-bold mb-0"
                                            style={{
                                                fontSize: "20px",
                                                color: "#f8fafc",
                                                letterSpacing:
                                                    "-0.3px",
                                            }}
                                        >
                                            Registered Users
                                        </h4>
                                    </div>

                                    <p
                                        className="mb-0"
                                        style={{
                                            color: "#64748b",
                                            fontSize: "13px",
                                        }}
                                    >
                                        Manage all registered
                                        HireAI accounts.
                                    </p>
                                </div>

                                {/* SEARCH + FILTER */}

                                <div className="d-flex flex-column flex-sm-row gap-2">
                                    {/* SEARCH */}

                                    <div
                                        className="input-group"
                                        style={{
                                            minWidth: "260px",
                                        }}
                                    >
                                        <span
                                            className="input-group-text"
                                            style={{
                                                background:
                                                    "#080f1f",
                                                border:
                                                    "1px solid rgba(129, 140, 248, 0.22)",
                                                borderRight:
                                                    "none",
                                                color:
                                                    "#818cf8",
                                            }}
                                        >
                                            <Search size={17} />
                                        </span>

                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(
                                                    e.target.value
                                                )
                                            }
                                            style={{
                                                background:
                                                    "#080f1f",
                                                border:
                                                    "1px solid rgba(129, 140, 248, 0.22)",
                                                borderLeft:
                                                    "none",
                                                color:
                                                    "#f8fafc",
                                                boxShadow:
                                                    "none",
                                            }}
                                        />
                                    </div>

                                    {/* ROLE FILTER */}

                                    <div className="input-group">
                                        <span
                                            className="input-group-text"
                                            style={{
                                                background:
                                                    "#080f1f",
                                                border:
                                                    "1px solid rgba(129, 140, 248, 0.22)",
                                                borderRight:
                                                    "none",
                                                color:
                                                    "#818cf8",
                                            }}
                                        >
                                            <SlidersHorizontal
                                                size={16}
                                            />
                                        </span>

                                        <select
                                            className="form-select"
                                            value={roleFilter}
                                            onChange={(e) =>
                                                setRoleFilter(
                                                    e.target.value
                                                )
                                            }
                                            style={{
                                                background:
                                                    "#080f1f",
                                                border:
                                                    "1px solid rgba(129, 140, 248, 0.22)",
                                                borderLeft:
                                                    "none",
                                                color:
                                                    "#e2e8f0",
                                                boxShadow:
                                                    "none",
                                                minWidth:
                                                    "130px",
                                            }}
                                        >
                                            <option value="ALL">
                                                All Roles
                                            </option>

                                            <option value="CANDIDATE">
                                                Candidate
                                            </option>

                                            <option value="HR">
                                                HR
                                            </option>

                                            <option value="ADMIN">
                                                Admin
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            TABLE
                        ================================================= */}

                        <div
                            className="table-responsive"
                            style={{
                                background:
                                    "linear-gradient(180deg, rgba(11, 19, 36, 0.99), rgba(5, 11, 23, 0.99))",
                            }}
                        >
                            <table
                                className="table table-borderless mb-0 align-middle"
                                style={{
                                    minWidth: "850px",
                                    color: "#e2e8f0",
                                    background:
                                        "transparent",
                                    "--bs-table-bg":
                                        "transparent",
                                    "--bs-table-color":
                                        "#e2e8f0",
                                    "--bs-table-border-color":
                                        "transparent",
                                }}
                            >
                                {/* TABLE HEAD */}

                                <thead>
                                    <tr
                                        style={{
                                            background:
                                                "linear-gradient(90deg, rgba(27, 39, 65, 0.95), rgba(18, 29, 52, 0.95))",
                                            borderBottom:
                                                "1px solid rgba(129, 140, 248, 0.16)",
                                        }}
                                    >
                                        <th
                                            className="px-4 py-3"
                                            style={thStyle}
                                        >
                                            USER
                                        </th>

                                        <th
                                            className="py-3"
                                            style={thStyle}
                                        >
                                            EMAIL
                                        </th>

                                        <th
                                            className="py-3"
                                            style={thStyle}
                                        >
                                            ROLE
                                        </th>

                                        <th
                                            className="py-3"
                                            style={thStyle}
                                        >
                                            STATUS
                                        </th>
                                    </tr>
                                </thead>

                                {/* TABLE BODY */}

                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center py-5"
                                                style={{
                                                    background:
                                                        "rgba(8, 15, 30, 0.96)",
                                                }}
                                            >
                                                <div
                                                    className="d-flex align-items-center justify-content-center mx-auto mb-3"
                                                    style={{
                                                        width: "52px",
                                                        height: "52px",
                                                        borderRadius:
                                                            "15px",
                                                        background:
                                                            "rgba(99, 102, 241, 0.10)",
                                                        color:
                                                            "#818cf8",
                                                        border:
                                                            "1px solid rgba(129, 140, 248, 0.14)",
                                                    }}
                                                >
                                                    <Search
                                                        size={25}
                                                    />
                                                </div>

                                                <div
                                                    className="fw-semibold"
                                                    style={{
                                                        color:
                                                            "#e2e8f0",
                                                    }}
                                                >
                                                    No matching users
                                                </div>

                                                <div
                                                    className="mt-1"
                                                    style={{
                                                        color:
                                                            "#64748b",
                                                        fontSize:
                                                            "13px",
                                                    }}
                                                >
                                                    Try another search
                                                    term or role filter.
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map(
                                            (user, index) => {
                                                const name =
                                                    getUserName(
                                                        user
                                                    );

                                                const role =
                                                    normalizeRole(
                                                        user.role ||
                                                            user.roles
                                                    );

                                                const status =
                                                    getUserStatus(
                                                        user
                                                    );

                                                const userKey =
                                                    user.id ||
                                                    user.userId ||
                                                    index;

                                                const isHovered =
                                                    hoveredUser ===
                                                    userKey;

                                                return (
                                                    <tr
                                                        key={userKey}
                                                        onMouseEnter={() =>
                                                            setHoveredUser(
                                                                userKey
                                                            )
                                                        }
                                                        onMouseLeave={() =>
                                                            setHoveredUser(
                                                                null
                                                            )
                                                        }
                                                        style={{
                                                            background:
                                                                isHovered
                                                                    ? "linear-gradient(90deg, rgba(79, 70, 229, 0.15), rgba(124, 58, 237, 0.08), rgba(12, 21, 38, 0.92))"
                                                                    : "rgba(9, 17, 32, 0.94)",
                                                            borderBottom:
                                                                index ===
                                                                filteredUsers.length -
                                                                    1
                                                                    ? "none"
                                                                    : "1px solid rgba(148, 163, 184, 0.07)",
                                                            transition:
                                                                "all 0.2s ease",
                                                        }}
                                                    >
                                                        {/* USER */}

                                                        <td
                                                            className="px-4 py-3"
                                                            style={{
                                                                background:
                                                                    "transparent",
                                                                color:
                                                                    "#e2e8f0",
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div
                                                                    className="d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                                                                    style={{
                                                                        width: "43px",
                                                                        height: "43px",
                                                                        borderRadius:
                                                                            "12px",
                                                                        background:
                                                                            "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                                                        color:
                                                                            "#ffffff",
                                                                        fontSize:
                                                                            "13px",
                                                                        boxShadow:
                                                                            "0 8px 22px rgba(79, 70, 229, 0.28)",
                                                                    }}
                                                                >
                                                                    {getInitials(
                                                                        name
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <div
                                                                        className="fw-semibold"
                                                                        style={{
                                                                            color:
                                                                                "#f1f5f9",
                                                                            fontSize:
                                                                                "14px",
                                                                        }}
                                                                    >
                                                                        {
                                                                            name
                                                                        }
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            color:
                                                                                "#64748b",
                                                                            fontSize:
                                                                                "12px",
                                                                            marginTop:
                                                                                "2px",
                                                                        }}
                                                                    >
                                                                        ID #
                                                                        {user.id ||
                                                                            user.userId ||
                                                                            "-"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* EMAIL */}

                                                        <td
                                                            style={{
                                                                ...tdStyle,
                                                                background:
                                                                    "transparent",
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-center gap-2">
                                                                <Mail
                                                                    size={
                                                                        15
                                                                    }
                                                                    style={{
                                                                        color:
                                                                            "#64748b",
                                                                    }}
                                                                />

                                                                <span
                                                                    style={{
                                                                        color:
                                                                            "#94a3b8",
                                                                        fontSize:
                                                                            "14px",
                                                                    }}
                                                                >
                                                                    {user.email ||
                                                                        "-"}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* ROLE */}

                                                        <td
                                                            style={{
                                                                ...tdStyle,
                                                                background:
                                                                    "transparent",
                                                            }}
                                                        >
                                                            <span
                                                                className="d-inline-flex align-items-center gap-1 px-3 py-2"
                                                                style={{
                                                                    ...getRoleStyle(
                                                                        role
                                                                    ),
                                                                    borderRadius:
                                                                        "999px",
                                                                    fontSize:
                                                                        "11px",
                                                                    fontWeight:
                                                                        "700",
                                                                    letterSpacing:
                                                                        "0.3px",
                                                                }}
                                                            >
                                                                {role ===
                                                                    "ADMIN" && (
                                                                    <ShieldCheck
                                                                        size={
                                                                            13
                                                                        }
                                                                    />
                                                                )}

                                                                {role ===
                                                                    "HR" && (
                                                                    <BriefcaseBusiness
                                                                        size={
                                                                            13
                                                                        }
                                                                    />
                                                                )}

                                                                {role ===
                                                                    "CANDIDATE" && (
                                                                    <UserRound
                                                                        size={
                                                                            13
                                                                        }
                                                                    />
                                                                )}

                                                                {role}
                                                            </span>
                                                        </td>

                                                        {/* STATUS */}

                                                        <td
                                                            style={{
                                                                ...tdStyle,
                                                                background:
                                                                    "transparent",
                                                            }}
                                                        >
                                                            <div
                                                                className="d-inline-flex align-items-center gap-2"
                                                                style={{
                                                                    color:
                                                                        status ===
                                                                        "Active"
                                                                            ? "#34d399"
                                                                            : "#f87171",
                                                                    fontSize:
                                                                        "13px",
                                                                    fontWeight:
                                                                        "600",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        width: "8px",
                                                                        height: "8px",
                                                                        borderRadius:
                                                                            "50%",
                                                                        background:
                                                                            status ===
                                                                            "Active"
                                                                                ? "#34d399"
                                                                                : "#f87171",
                                                                        boxShadow:
                                                                            status ===
                                                                            "Active"
                                                                                ? "0 0 10px rgba(52, 211, 153, 0.7)"
                                                                                : "0 0 10px rgba(248, 113, 113, 0.55)",
                                                                    }}
                                                                />

                                                                {
                                                                    status
                                                                }

                                                                {status ===
                                                                    "Active" && (
                                                                    <CheckCircle2
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* =================================================
                            TABLE FOOTER
                        ================================================= */}

                        {filteredUsers.length > 0 && (
                            <div
                                className="px-4 py-3 d-flex flex-wrap justify-content-between align-items-center gap-2"
                                style={{
                                    borderTop:
                                        "1px solid rgba(99, 102, 241, 0.12)",
                                    background:
                                        "linear-gradient(90deg, rgba(6, 13, 27, 0.99), rgba(13, 21, 39, 0.99))",
                                }}
                            >
                                <div
                                    style={{
                                        color: "#64748b",
                                        fontSize: "12px",
                                    }}
                                >
                                    Showing{" "}
                                    <strong
                                        style={{
                                            color: "#cbd5e1",
                                        }}
                                    >
                                        {filteredUsers.length}
                                    </strong>{" "}
                                    of{" "}
                                    <strong
                                        style={{
                                            color: "#cbd5e1",
                                        }}
                                    >
                                        {totalUsers}
                                    </strong>{" "}
                                    users
                                </div>

                                <div
                                    className="d-flex align-items-center gap-2"
                                    style={{
                                        color: "#64748b",
                                        fontSize: "12px",
                                    }}
                                >
                                    <CheckCircle2
                                        size={14}
                                        style={{
                                            color: "#34d399",
                                        }}
                                    />

                                    <span>
                                        {activeCount} active users
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    className="text-center mt-4"
                    style={{
                        color: "#475569",
                        fontSize: "12px",
                    }}
                >
                    HireAI Administration · User Management
                </div>
            </div>
        </div>
    );
}

// =============================================================
// TABLE HEADER STYLE
// =============================================================

const thStyle = {
    padding: "14px 16px",
    textAlign: "left",
    fontWeight: "700",
    color: "#94a3b8",
    fontSize: "11px",
    letterSpacing: "0.8px",
    borderBottom:
        "1px solid rgba(99, 102, 241, 0.12)",
};

// =============================================================
// TABLE DATA STYLE
// =============================================================

const tdStyle = {
    padding: "16px",
    color: "#e2e8f0",
};

// =============================================================
// GET USER INITIALS
// =============================================================

const getInitials = (name) => {
    if (!name || name === "-") {
        return "U";
    }

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
};

// =============================================================
// GET USER NAME
// =============================================================

const getUserName = (user) => {
    if (user.name) {
        return user.name;
    }

    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
        return fullName;
    }

    if (user.fullName) {
        return user.fullName;
    }

    return "-";
};

// =============================================================
// NORMALIZE ROLE
// =============================================================

const normalizeRole = (role) => {
    if (!role) {
        return "-";
    }

    if (Array.isArray(role)) {
        role = role[0];
    }

    return String(role)
        .replace("ROLE_", "")
        .trim()
        .toUpperCase();
};

// =============================================================
// ROLE STYLE
// =============================================================

const getRoleStyle = (role) => {
    switch (role) {
        case "ADMIN":
            return {
                background:
                    "rgba(168, 85, 247, 0.14)",
                color: "#c084fc",
                border:
                    "1px solid rgba(168, 85, 247, 0.32)",
            };

        case "HR":
            return {
                background:
                    "rgba(59, 130, 246, 0.14)",
                color: "#60a5fa",
                border:
                    "1px solid rgba(59, 130, 246, 0.32)",
            };

        case "CANDIDATE":
            return {
                background:
                    "rgba(16, 185, 129, 0.14)",
                color: "#34d399",
                border:
                    "1px solid rgba(16, 185, 129, 0.32)",
            };

        default:
            return {
                background:
                    "rgba(148, 163, 184, 0.12)",
                color: "#cbd5e1",
                border:
                    "1px solid rgba(148, 163, 184, 0.25)",
            };
    }
};

// =============================================================
// USER STATUS
// =============================================================

const getUserStatus = (user) => {
    if (
        user.active === true ||
        user.enabled === true
    ) {
        return "Active";
    }

    if (
        user.active === false ||
        user.enabled === false
    ) {
        return "Inactive";
    }

    if (user.status) {
        return user.status;
    }

    return "Active";
};

// =============================================================
// DEFAULT EXPORT
// =============================================================

export default AdminUsers;