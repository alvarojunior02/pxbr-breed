// GET API ORDERS
async function getApiOrders(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search) {
        params.set("search", filters.search);
    }

    if (filters.status) {
        params.set("status", filters.status);
    }

    if (filters.paymentStatus) {
        params.set("paymentStatus", filters.paymentStatus);
    }

    if (filters.archived !== undefined) {
        params.set("archived", String(filters.archived));
    }

    if (filters.playerId) {
        params.set("playerId", filters.playerId);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const result = await window.PXBRApiClient.get(`/orders${query}`);

    return unwrapPxbrOrdersApiData(result);
}

// GET API ORDER BY ID
async function getApiOrderById(orderId) {
    const result = await window.PXBRApiClient.get(`/orders/${orderId}`);

    return unwrapPxbrOrdersApiData(result);
}

// CREATE API ORDER
async function createApiOrder(order) {
    const result = await window.PXBRApiClient.post("/orders", order);

    return unwrapPxbrOrdersApiData(result);
}

// UPDATE API ORDER
async function updateApiOrder(orderId, data) {
    const result = await window.PXBRApiClient.patch(`/orders/${orderId}`, data);

    return unwrapPxbrOrdersApiData(result);
}

// DELETE API ORDER
async function deleteApiOrder(orderId) {
    const result = await window.PXBRApiClient.delete(`/orders/${orderId}`);

    return unwrapPxbrOrdersApiData(result);
}

// UNWRAP API DATA
function unwrapPxbrOrdersApiData(result) {
    return result?.data ?? result;
}

window.PXBROrdersApiService = {
    getOrders: getApiOrders,
    getById: getApiOrderById,
    create: createApiOrder,
    update: updateApiOrder,
    delete: deleteApiOrder
};
