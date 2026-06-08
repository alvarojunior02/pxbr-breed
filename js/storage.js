const STORAGE_KEYS = {
    PLAYERS: "players",
    ORDERS: "orders"
};

function savePlayers(players) {
    localStorage.setItem(
        STORAGE_KEYS.PLAYERS,
        JSON.stringify(players)
    );
}

function loadPlayers() {
    const data = localStorage.getItem(
        STORAGE_KEYS.PLAYERS
    );

    return data ? JSON.parse(data) : [];
}

function saveOrders(orders) {
    localStorage.setItem(
        STORAGE_KEYS.ORDERS,
        JSON.stringify(orders)
    );
}

function loadOrders() {
    const data = localStorage.getItem(
        STORAGE_KEYS.ORDERS
    );

    return data ? JSON.parse(data) : [];
}