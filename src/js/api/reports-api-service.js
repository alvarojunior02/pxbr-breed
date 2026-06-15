// GET API DASHBOARD SUMMARY
async function getApiDashboardSummary() {
    const result = await window.PXBRApiClient.get("/reports/dashboard-summary");

    return unwrapPxbrReportsApiData(result);
}

// GET API PAYMENTS BY PLAYER
async function getApiPaymentsByPlayer(filters = {}) {
    const params = new URLSearchParams();

    if (filters.limit) {
        params.set("limit", String(filters.limit));
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const result = await window.PXBRApiClient.get(`/reports/payments-by-player${query}`);

    return unwrapPxbrReportsApiData(result);
}

// GET API ORDERS BY STATUS
async function getApiOrdersByStatus() {
    const result = await window.PXBRApiClient.get("/reports/orders-by-status");

    return unwrapPxbrReportsApiData(result);
}

// UNWRAP REPORTS API DATA
function unwrapPxbrReportsApiData(result) {
    return result?.data ?? result;
}

window.PXBRReportsApiService = {
    getDashboardSummary: getApiDashboardSummary,
    getPaymentsByPlayer: getApiPaymentsByPlayer,
    getOrdersByStatus: getApiOrdersByStatus
};
