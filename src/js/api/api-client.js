const PXBR_API_BASE_URL =
    window.PXBR_API_BASE_URL ||
    localStorage.getItem("pxbrApiBaseUrl") ||
    "http://localhost:3001/api";

const PXBR_AUTH_STORAGE_KEYS = {
    accessToken: "pxbrAccessToken",
    authUser: "pxbrAuthUser"
};

// API CLIENT
async function pxbrApiRequest(path, options = {}) {
    const url = `${PXBR_API_BASE_URL}${path}`;
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
    const error = new Error(
        responseData?.message || responseData?.error || "Erro ao comunicar com a API."
    );

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

// SET API BASE URL
function setPxbrApiBaseUrl(baseUrl) {
    localStorage.setItem("pxbrApiBaseUrl", baseUrl);
}

// GET API BASE URL
function getPxbrApiBaseUrl() {
    return localStorage.getItem("pxbrApiBaseUrl") || PXBR_API_BASE_URL;
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
