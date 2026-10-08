function Button({
    children,
    onClick,
    type = "button",
    variant = "primary",
    disabled = false,
    loading = false,
    fullWidth = false
}) {

    const variants = {
        primary: {
            backgroundColor: "#2563eb",
            color: "#ffffff"
        },

        secondary: {
            backgroundColor: "#374151",
            color: "#ffffff"
        },

        danger: {
            backgroundColor: "#dc2626",
            color: "#ffffff"
        },

        success: {
            backgroundColor: "#16a34a",
            color: "#ffffff"
        }
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            style={{
                ...styles.button,
                ...variants[variant],
                width: fullWidth ? "100%" : "auto",
                opacity: disabled || loading ? 0.6 : 1,
                cursor:
                    disabled || loading
                        ? "not-allowed"
                        : "pointer"
            }}
        >
            {loading ? "Loading..." : children}
        </button>
    );
}

const styles = {
    button: {
        padding: "10px 16px",
        border: "none",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "600",
        transition: "0.2s",
        boxSizing: "border-box"
    }
};

export default Button;