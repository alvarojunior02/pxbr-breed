const STORAGE_KEYS = {
    PLAYERS: "players",
    ORDERS: "orders",
    TRANSACTIONS: "transactions",
    OWNED_HIDDEN_ABILITIES: "ownedHiddenAbilities"
};

// SAVE PLAYERS
function savePlayers(players) {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
}

// LOAD PLAYERS
function loadPlayers() {
    const data = localStorage.getItem(STORAGE_KEYS.PLAYERS);

    return data ? JSON.parse(data) : [];
}

// SAVE ORDERS
function saveOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

// LOAD ORDERS
function loadOrders() {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);

    return data ? JSON.parse(data) : [];
}

// SAVE TRANSACTIONS
function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

// LOAD TRANSACTIONS
function loadTransactions() {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

    return data ? JSON.parse(data) : [];
}

// SAVE OWNED HIDDEN ABILITIES
function saveOwnedHiddenAbilities(hiddenAbilities) {
    localStorage.setItem(STORAGE_KEYS.OWNED_HIDDEN_ABILITIES, JSON.stringify(hiddenAbilities));
}

// LOAD OWNED HIDDEN ABILITIES
function loadOwnedHiddenAbilities() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.OWNED_HIDDEN_ABILITIES)) || [];
}

window.savePlayers = savePlayers;
window.loadPlayers = loadPlayers;

window.saveOrders = saveOrders;
window.loadOrders = loadOrders;

window.saveTransactions = saveTransactions;
window.loadTransactions = loadTransactions;

window.saveOwnedHiddenAbilities = saveOwnedHiddenAbilities;
window.loadOwnedHiddenAbilities = loadOwnedHiddenAbilities;
