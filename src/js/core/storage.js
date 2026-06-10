const STORAGE_KEYS = {
    PLAYERS: "players",
    ORDERS: "orders",
    TRANSACTIONS: "transactions"
};

function savePlayers(players) {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
}

function loadPlayers() {
    const data = localStorage.getItem(STORAGE_KEYS.PLAYERS);

    return data ? JSON.parse(data) : [];
}

function saveOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

function loadOrders() {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);

    return data ? JSON.parse(data) : [];
}

function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

function loadTransactions() {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

    return data ? JSON.parse(data) : [];
}

window.savePlayers = savePlayers;
window.loadPlayers = loadPlayers;

window.saveOrders = saveOrders;
window.loadOrders = loadOrders;

window.saveTransactions = saveTransactions;
window.loadTransactions = loadTransactions;
