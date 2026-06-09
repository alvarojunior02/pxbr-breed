const TRANSACTION_TYPES = {
    ORDER_PAYMENT: "ORDER_PAYMENT"
};

// CREATE TRANSACTION
function createTransaction({
    type,
    amount,
    playerId,
    orderId
}) {
    return {
        id: generateUUID(),
        type,
        amount,
        playerId,
        orderId,
        createdAt: new Date().toISOString()
    };
}

// SAVE TRANSACTION
function saveTransaction(transaction) {
    const transactions =
        loadTransactions();

    transactions.push(transaction);

    saveTransactions(transactions);
}

// CREATE ORDER PAYMENT TRANSACTION
function createOrderPaymentTransaction({
    amount,
    playerId,
    orderId
}) {
    return createTransaction({
        type: TRANSACTION_TYPES.ORDER_PAYMENT,
        amount,
        playerId,
        orderId
    });
}

// GET ORDER TRANSACTIONS
function getOrderTransactions(orderId) {
    return loadTransactions()
        .filter(transaction =>
            transaction.orderId === orderId
        )
        .sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );
}

// GET PLAYER TRANSACTIONS
function getPlayerTransactions(playerId) {
    return loadTransactions()
        .filter(transaction =>
            transaction.playerId === playerId
        )
        .sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );
}

function getTransactionTotalByOrder(
    orderId
) {
    return getOrderTransactions(
        orderId
    ).reduce(
        (
            total,
            transaction
        ) =>
            total +
            transaction.amount,
        0
    );
}

window.TRANSACTION_TYPES = TRANSACTION_TYPES;

window.createOrderPaymentTransaction = createOrderPaymentTransaction;
window.saveTransaction = saveTransaction;
window.getOrderTransactions = getOrderTransactions;
window.getPlayerTransactions = getPlayerTransactions;
window.getTransactionTotalByOrder = getTransactionTotalByOrder;