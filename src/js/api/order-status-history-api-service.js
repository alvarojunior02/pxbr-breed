// GET API ORDER STATUS HISTORY
async function getApiOrderStatusHistory(orderId) {
    const result = await window.PXBRApiClient.get(`/orders/${orderId}/status-history`);

    return unwrapPxbrOrderStatusHistoryApiData(result);
}

// CREATE API ORDER STATUS HISTORY
async function createApiOrderStatusHistory(orderId, payload) {
    const result = await window.PXBRApiClient.post(`/orders/${orderId}/status-history`, payload);

    return unwrapPxbrOrderStatusHistoryApiData(result);
}

// DELETE API ORDER STATUS HISTORY
async function deleteApiOrderStatusHistory(historyId) {
    const result = await window.PXBRApiClient.delete(`/order-status-history/${historyId}`);

    return unwrapPxbrOrderStatusHistoryApiData(result);
}

// UNWRAP ORDER STATUS HISTORY API DATA
function unwrapPxbrOrderStatusHistoryApiData(result) {
    return result?.data ?? result;
}

window.PXBROrderStatusHistoryApiService = {
    getByOrder: getApiOrderStatusHistory,
    create: createApiOrderStatusHistory,
    delete: deleteApiOrderStatusHistory
};
