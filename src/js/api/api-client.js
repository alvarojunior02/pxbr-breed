// GET DEFAULT API BASE URL
function getDefaultPxbrApiBaseUrl() {
    const isLocalhost =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (isLocalhost) {
        return "http://127.0.0.1:3001/api";
    }

    return "https://pxbr-breed-api.onrender.com/api";
}

const PXBR_AUTH_STORAGE_KEYS = {
    accessToken: "pxbrAccessToken",
    authUser: "pxbrAuthUser"
};

let pxbrRefreshTokenPromise = null;

// GET API BASE URL
function getPxbrApiBaseUrl() {
    return (
        window.PXBR_API_BASE_URL ||
        localStorage.getItem("pxbrApiBaseUrl") ||
        getDefaultPxbrApiBaseUrl()
    );
}

// SET API BASE URL
function setPxbrApiBaseUrl(baseUrl) {
    if (!baseUrl) {
        localStorage.removeItem("pxbrApiBaseUrl");
        return;
    }

    localStorage.setItem("pxbrApiBaseUrl", baseUrl);
}

// IS AUTH API PATH
function isPxbrAuthApiPath(path) {
    return path.startsWith("/auth/login") || path.startsWith("/auth/refresh");
}

// SAVE API AUTH SESSION
function savePxbrApiAuthSession(result) {
    const payload = result?.data || result;

    if (payload?.accessToken) {
        localStorage.setItem(PXBR_AUTH_STORAGE_KEYS.accessToken, payload.accessToken);
    }

    if (payload?.user) {
        localStorage.setItem(PXBR_AUTH_STORAGE_KEYS.authUser, JSON.stringify(payload.user));
    }
}

// CLEAR API AUTH SESSION
function clearPxbrApiAuthSession() {
    localStorage.removeItem(PXBR_AUTH_STORAGE_KEYS.accessToken);
    localStorage.removeItem(PXBR_AUTH_STORAGE_KEYS.authUser);
}

// REFRESH API ACCESS TOKEN
async function refreshPxbrApiAccessToken() {
    if (!pxbrRefreshTokenPromise) {
        pxbrRefreshTokenPromise = fetch(`${getPxbrApiBaseUrl()}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({})
        })
            .then(async (response) => {
                const responseData = await parsePxbrApiResponse(response);

                if (!response.ok) {
                    throw createPxbrApiError(response, responseData);
                }

                savePxbrApiAuthSession(responseData);

                return responseData;
            })
            .finally(() => {
                pxbrRefreshTokenPromise = null;
            });
    }

    return pxbrRefreshTokenPromise;
}

// HANDLE API AUTH EXPIRED
function handlePxbrApiAuthExpired() {
    clearPxbrApiAuthSession();

    window.dispatchEvent(
        new CustomEvent("pxbr:auth-expired", {
            detail: {
                message: "Sua sessão expirou. Faça login novamente."
            }
        })
    );
}

// API CLIENT
async function pxbrApiRequest(path, options = {}) {
    const { skipAuthRefresh = false, ...fetchOptions } = options;

    const url = `${getPxbrApiBaseUrl()}${path}`;
    const accessToken = localStorage.getItem(PXBR_AUTH_STORAGE_KEYS.accessToken);

    const headers = {
        ...(fetchOptions.headers || {})
    };

    if (!(fetchOptions.body instanceof FormData)) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
    }

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: "include"
    });

    const responseData = await parsePxbrApiResponse(response);

    if (response.status === 401 && !skipAuthRefresh && !isPxbrAuthApiPath(path)) {
        try {
            await refreshPxbrApiAccessToken();

            return pxbrApiRequest(path, {
                ...options,
                skipAuthRefresh: true
            });
        } catch (error) {
            handlePxbrApiAuthExpired();

            throw error;
        }
    }

    if (!response.ok) {
        throw createPxbrApiError(response, responseData);
    }

    return responseData;
}

// PARSE API RESPONSE
async function parsePxbrApiResponse(response) {
    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
        return null;
    }

    return response.json();
}

// CREATE API ERROR
function createPxbrApiError(response, responseData) {
    const message = Array.isArray(responseData?.message)
        ? responseData.message.join(", ")
        : responseData?.message || responseData?.error || "Erro ao comunicar com a API.";

    const error = new Error(message);

    error.status = response.status;
    error.data = responseData;

    return error;
}

// API GET
function pxbrApiGet(path, options = {}) {
    return pxbrApiRequest(path, {
        ...options,
        method: "GET"
    });
}

// API POST
function pxbrApiPost(path, body, options = {}) {
    return pxbrApiRequest(path, {
        ...options,
        method: "POST",
        body: JSON.stringify(body || {})
    });
}

// API PATCH
function pxbrApiPatch(path, body, options = {}) {
    return pxbrApiRequest(path, {
        ...options,
        method: "PATCH",
        body: JSON.stringify(body || {})
    });
}

// API DELETE
function pxbrApiDelete(path, options = {}) {
    return pxbrApiRequest(path, {
        ...options,
        method: "DELETE"
    });
}

window.PXBRApiClient = {
    request: pxbrApiRequest,
    get: pxbrApiGet,
    post: pxbrApiPost,
    patch: pxbrApiPatch,
    delete: pxbrApiDelete,
    setBaseUrl: setPxbrApiBaseUrl,
    getBaseUrl: getPxbrApiBaseUrl,
    storageKeys: PXBR_AUTH_STORAGE_KEYS
};
