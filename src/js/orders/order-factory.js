// CREATE ORDER
function createOrder(playerId) {
    return {
        id: generateUUID(),
        playerId,
        total: 0,
        discount: 0,
        paidAmount: 0,
        paid: false,
        needsFemale: false,
        observations: "",
        archived: false,
        createdAt: new Date().toISOString(),
        pokemons: []
    };
}

// GET INITIAL POKEMON STATUS
function getInitialPokemonStatus() {
    const selectedOption = document.querySelector("input[name='needsFemale']:checked");

    if (!selectedOption) {
        return null;
    }

    return selectedOption.value === "yes" ? ORDER_STATUS[0].value : ORDER_STATUS[1].value;
}

// CREATE PERSISTED ORDER
function createPersistedOrder(orderData) {
    const order = createOrder(orderData.playerId);

    order.subtotal = orderData.subtotal;

    order.total = orderData.total;

    order.discount = orderData.discount;

    order.paidAmount = orderData.paidAmount;

    order.paid = orderData.paid;

    const initialStatus = getInitialPokemonStatus();

    order.needsFemale = isFirstStatus(initialStatus);

    order.pokemons = orderData.pokemons.map((pokemon) => ({
        ...pokemon,

        id: generateUUID(),

        status: initialStatus
    }));

    order.observations = orderData.observations;

    return order;
}

// SAVE ORDER
function saveOrder(order) {
    const orders = loadOrders();

    orders.push(order);

    saveOrders(orders);
}
