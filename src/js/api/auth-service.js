// AUTH LOGIN
async function pxbrAuthLogin({ email, password, rememberMe = false }) {
    const result = await window.PXBRApiClient.post("/auth/login", {
        email,
        password,
        rememberMe
    });

    savePxbrAuthSession(result);

    return result;
}

// AUTH REFRESH
async function pxbrAuthRefresh() {
    const result = await window.PXBRApiClient.post("/auth/refresh");

    savePxbrAuthSession(result);

    return result;
}

// AUTH LOGOUT
async function pxbrAuthLogout() {
    try {
        await window.PXBRApiClient.post("/auth/logout");
    } finally {
        clearPxbrAuthSession();
    }
}

// AUTH GET ME
async function pxbrAuthGetMe() {
    return window.PXBRApiClient.get("/auth/me");
}

// SAVE AUTH SESSION
function savePxbrAuthSession(result) {
    if (result?.data) {
        savePxbrAuthSession(result.data);
        return;
    }

    if (result?.accessToken) {
        localStorage.setItem(window.PXBRApiClient.storageKeys.accessToken, result.accessToken);
    }

    if (result?.user) {
        localStorage.setItem(
            window.PXBRApiClient.storageKeys.authUser,
            JSON.stringify(result.user)
        );
    }
}

// CLEAR AUTH SESSION
function clearPxbrAuthSession() {
    localStorage.removeItem(window.PXBRApiClient.storageKeys.accessToken);
    localStorage.removeItem(window.PXBRApiClient.storageKeys.authUser);
}

// GET AUTH USER
function getPxbrAuthUser() {
    const user = localStorage.getItem(window.PXBRApiClient.storageKeys.authUser);

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        clearPxbrAuthSession();
        return null;
    }
}

// GET ACCESS TOKEN
function getPxbrAccessToken() {
    return localStorage.getItem(window.PXBRApiClient.storageKeys.accessToken);
}

// IS AUTHENTICATED
function isPxbrAuthenticated() {
    return Boolean(getPxbrAccessToken() && getPxbrAuthUser());
}

window.PXBRAuthService = {
    login: pxbrAuthLogin,
    refresh: pxbrAuthRefresh,
    logout: pxbrAuthLogout,
    getMe: pxbrAuthGetMe,
    getUser: getPxbrAuthUser,
    getAccessToken: getPxbrAccessToken,
    isAuthenticated: isPxbrAuthenticated,
    clearSession: clearPxbrAuthSession
};
