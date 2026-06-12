// SHOW TOAST
function showToast(message, type = "success") {
    const toastTypes = {
        success: {
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "#ffffff"
        },
        error: {
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "#ffffff"
        },
        warning: {
            background: "linear-gradient(135deg, #facc15, #eab308)",
            color: "#1f2937"
        },
        info: {
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#ffffff"
        }
    };

    const config = toastTypes[type] || toastTypes.info;

    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: config.background,
            color: config.color,
            borderRadius: "10px",
            fontWeight: "700",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.25)"
        }
    }).showToast();
}

// SHOW SUCCESS TOAST
function showSuccessToast(message) {
    showToast(message, "success");
}

// SHOW ERROR TOAST
function showErrorToast(message) {
    showToast(message, "error");
}

// SHOW WARNING TOAST
function showWarningToast(message) {
    showToast(message, "warning");
}

// SHOW INFO TOAST
function showInfoToast(message) {
    showToast(message, "info");
}
