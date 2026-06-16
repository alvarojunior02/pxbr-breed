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

// API CLIENT
async function pxbrApiRequest(path, options = {}) {
    const url = `${getPxbrApiBaseUrl()}${path}`;
    const accessToken = localStorage.getItem(PXBR_AUTH_STORAGE_KEYS.accessToken);

    const headers = {
        ...(options.headers || {})
    };

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
    }

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include"
    });

    const responseData = await parsePxbrApiResponse(response);

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
