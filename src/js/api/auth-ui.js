// AUTH UI INIT
function initPxbrAuthUI() {
    document.body.classList.add("auth-loading");

    bindPxbrAuthEvents();

    bootstrapPxbrAuth();
}

// BIND AUTH EVENTS
function bindPxbrAuthEvents() {
    const loginForm = document.getElementById("authLoginForm");
    const logoutButton = document.getElementById("btnAuthLogout");

    loginForm?.addEventListener("submit", handlePxbrAuthLoginSubmit);
    logoutButton?.addEventListener("click", handlePxbrAuthLogout);
}

// BOOTSTRAP AUTH
async function bootstrapPxbrAuth() {
    try {
        await window.PXBRAuthService.refresh();
        unlockPxbrApp();
    } catch {
        lockPxbrApp();
    } finally {
        document.body.classList.remove("auth-loading");
    }
}

// HANDLE LOGIN SUBMIT
async function handlePxbrAuthLoginSubmit(event) {
    event.preventDefault();

    const emailInput = document.getElementById("authEmail");
    const passwordInput = document.getElementById("authPassword");
    const rememberMeInput = document.getElementById("authRememberMe");

    setPxbrAuthLoading(true);
    setPxbrAuthError("");

    try {
        await window.PXBRAuthService.login({
            email: emailInput.value.trim(),
            password: passwordInput.value,
            rememberMe: rememberMeInput.checked
        });

        unlockPxbrApp();
    } catch (error) {
        setPxbrAuthError(error?.data?.message || error?.message || "Não foi possível entrar.");
    } finally {
        setPxbrAuthLoading(false);
    }
}

// HANDLE AUTH LOGOUT
async function handlePxbrAuthLogout() {
    setPxbrAuthLoading(true);

    try {
        await window.PXBRAuthService.logout();
    } finally {
        lockPxbrApp();
        setPxbrAuthLoading(false);
    }
}

// LOCK APP
function lockPxbrApp() {
    document.body.classList.add("auth-locked");

    const authScreen = document.getElementById("authScreen");
    const userBox = document.getElementById("authenticatedUserBox");

    authScreen?.classList.remove("hidden");
    userBox?.classList.add("hidden");
}

// UNLOCK APP
function unlockPxbrApp() {
    document.body.classList.remove("auth-locked");

    const authScreen = document.getElementById("authScreen");
    const userBox = document.getElementById("authenticatedUserBox");

    authScreen?.classList.add("hidden");
    userBox?.classList.remove("hidden");

    renderPxbrAuthenticatedUser();
}

// RENDER AUTHENTICATED USER
function renderPxbrAuthenticatedUser() {
    const user = window.PXBRAuthService.getUser();
    const userName = document.getElementById("authenticatedUserName");

    if (!userName) {
        return;
    }

    userName.textContent = user?.email ? `Logado como ${user.email}` : "Usuário autenticado";
}

// SET AUTH LOADING
function setPxbrAuthLoading(isLoading) {
    const submitButton = document.getElementById("authSubmitButton");

    if (!submitButton) {
        return;
    }

    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? "Entrando..." : "Entrar";
}

// SET AUTH ERROR
function setPxbrAuthError(message) {
    const errorBox = document.getElementById("authError");

    if (!errorBox) {
        return;
    }

    errorBox.textContent = message;
    errorBox.classList.toggle("visible", Boolean(message));
}

window.initPxbrAuthUI = initPxbrAuthUI;
