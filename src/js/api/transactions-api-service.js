// GET API TRANSACTIONS
async function getApiTransactions(filters = {}) {
    const params = new URLSearchParams();

    if (filters.playerId) {
        params.set("playerId", filters.playerId);
    }

    if (filters.orderId) {
        params.set("orderId", filters.orderId);
    }

    if (filters.type) {
        params.set("type", filters.type);
    }

    if (filters.search) {
        params.set("search", filters.search);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const result = await window.PXBRApiClient.get(`/transactions${query}`);

    return unwrapPxbrTransactionsApiData(result);
}

// GET API TRANSACTION BY ID
async function getApiTransactionById(transactionId) {
    const result = await window.PXBRApiClient.get(`/transactions/${transactionId}`);

    return unwrapPxbrTransactionsApiData(result);
}

// CREATE API TRANSACTION
async function createApiTransaction(transaction) {
    const result = await window.PXBRApiClient.post("/transactions", transaction);

    return unwrapPxbrTransactionsApiData(result);
}

// DELETE API TRANSACTION
async function deleteApiTransaction(transactionId) {
    const result = await window.PXBRApiClient.delete(`/transactions/${transactionId}`);

    return unwrapPxbrTransactionsApiData(result);
}

// UNWRAP TRANSACTIONS API DATA
function unwrapPxbrTransactionsApiData(result) {
    return result?.data ?? result;
}

window.PXBRTransactionsApiService = {
    getTransactions: getApiTransactions,
    getById: getApiTransactionById,
    create: createApiTransaction,
    delete: deleteApiTransaction
};
