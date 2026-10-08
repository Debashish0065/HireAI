import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "CANDIDATE",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !formData.firstName.trim() ||
            !formData.lastName.trim() ||
            !formData.email.trim() ||
            !formData.password ||
            !formData.confirmPassword ||
            !formData.role
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (
            formData.role !== "CANDIDATE" &&
            formData.role !== "HR"
        ) {
            setError("Please select a valid registration role.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "/api/v1/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        firstName: formData.firstName.trim(),
                        lastName: formData.lastName.trim(),
                        email: formData.email.trim(),
                        password: formData.password,
                        role: formData.role,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    "Registration failed. Please try again."
                );
            }

            setSuccess(
                "Registration successful. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            setError(
                err.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background:
                    "linear-gradient(135deg, #020617 0%, #0f172a 50%, #111827 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "30px 15px",
                color: "#ffffff",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "500px",
                    background: "rgba(15, 23, 42, 0.92)",
                    border: "1px solid rgba(148, 163, 184, 0.18)",
                    borderRadius: "20px",
                    padding: "40px",
                    boxShadow:
                        "0 25px 60px rgba(0, 0, 0, 0.45)",
                }}
            >
                {/* HEADER */}
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "30px",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "2rem",
                            fontWeight: "700",
                            marginBottom: "8px",
                        }}
                    >
                        Create Your Account
                    </h1>

                    <p
                        style={{
                            color: "#94a3b8",
                            marginBottom: 0,
                        }}
                    >
                        Join HireAI and start your career journey
                    </p>
                </div>

                {/* ERROR */}
                {error && (
                    <div
                        style={{
                            background:
                                "rgba(239, 68, 68, 0.12)",
                            border:
                                "1px solid rgba(239, 68, 68, 0.35)",
                            color: "#fca5a5",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            marginBottom: "20px",
                            fontSize: "0.9rem",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* SUCCESS */}
                {success && (
                    <div
                        style={{
                            background:
                                "rgba(34, 197, 94, 0.12)",
                            border:
                                "1px solid rgba(34, 197, 94, 0.35)",
                            color: "#86efac",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            marginBottom: "20px",
                            fontSize: "0.9rem",
                        }}
                    >
                        {success}
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit}>

                    {/* FIRST + LAST NAME */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "1fr 1fr",
                            gap: "15px",
                            marginBottom: "18px",
                        }}
                    >
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "7px",
                                    color: "#cbd5e1",
                                    fontSize: "0.9rem",
                                }}
                            >
                                First Name
                            </label>

                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="First name"
                                disabled={loading}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "7px",
                                    color: "#cbd5e1",
                                    fontSize: "0.9rem",
                                }}
                            >
                                Last Name
                            </label>

                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Last name"
                                disabled={loading}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* EMAIL */}
                    <div style={{ marginBottom: "18px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "7px",
                                color: "#cbd5e1",
                                fontSize: "0.9rem",
                            }}
                        >
                            Email Address
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            disabled={loading}
                            style={inputStyle}
                        />
                    </div>

                    {/* ROLE */}
                    <div style={{ marginBottom: "18px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "7px",
                                color: "#cbd5e1",
                                fontSize: "0.9rem",
                            }}
                        >
                            Register As
                        </label>

                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            disabled={loading}
                            style={{
                                ...inputStyle,
                                cursor: loading
                                    ? "not-allowed"
                                    : "pointer",
                            }}
                        >
                            <option
                                value="CANDIDATE"
                                style={{
                                    background: "#1e293b",
                                    color: "#ffffff",
                                }}
                            >
                                Candidate
                            </option>

                            <option
                                value="HR"
                                style={{
                                    background: "#1e293b",
                                    color: "#ffffff",
                                }}
                            >
                                HR / Recruiter
                            </option>
                        </select>

                        <div
                            style={{
                                marginTop: "7px",
                                color: "#64748b",
                                fontSize: "0.78rem",
                            }}
                        >
                            Select Candidate if you are looking for jobs,
                            or HR / Recruiter if you are hiring candidates.
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div style={{ marginBottom: "18px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "7px",
                                color: "#cbd5e1",
                                fontSize: "0.9rem",
                            }}
                        >
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            disabled={loading}
                            style={inputStyle}
                        />

                        <div
                            style={{
                                marginTop: "7px",
                                color: "#64748b",
                                fontSize: "0.78rem",
                            }}
                        >
                            Password must contain at least 8 characters.
                        </div>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div style={{ marginBottom: "25px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "7px",
                                color: "#cbd5e1",
                                fontSize: "0.9rem",
                            }}
                        >
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            disabled={loading}
                            style={inputStyle}
                        />
                    </div>

                    {/* REGISTER BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "13px",
                            border: "none",
                            borderRadius: "10px",
                            background:
                                "linear-gradient(135deg, #2563eb, #3b82f6)",
                            color: "#ffffff",
                            fontSize: "1rem",
                            fontWeight: "600",
                            cursor: loading
                                ? "not-allowed"
                                : "pointer",
                            opacity: loading ? 0.7 : 1,
                            transition: "0.2s ease",
                        }}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>
                </form>

                {/* LOGIN LINK */}
                <div
                    style={{
                        textAlign: "center",
                        marginTop: "25px",
                        color: "#94a3b8",
                        fontSize: "0.9rem",
                    }}
                >
                    Already have an account?

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        disabled={loading}
                        style={{
                            border: "none",
                            background: "transparent",
                            color: "#60a5fa",
                            fontWeight: "600",
                            marginLeft: "6px",
                            cursor: loading
                                ? "not-allowed"
                                : "pointer",
                        }}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    background: "rgba(30, 41, 59, 0.75)",
    color: "#ffffff",
    outline: "none",
    fontSize: "0.95rem",
    boxSizing: "border-box",
};

export default Register;