// GET ORDER STATUS HISTORY FROM SOURCE
async function getOrderStatusHistoryFromSource(orderId) {
    if (shouldUseApiOrders()) {
        return window.PXBROrderStatusHistoryApiService.getByOrder(orderId);
    }

    return loadOrderStatusHistory()
        .filter((entry) => entry.orderId === orderId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// OPEN STATUS CONFIRM MODAL
function openStatusConfirmModal(orderId, pokemonId) {
    const order = loadOrders().find((order) => order.id === orderId);

    if (!order) {
        return;
    }

    const pokemon = order.pokemons.find((pokemon) => pokemon.id === pokemonId);

    if (!pokemon) {
        return;
    }

    const currentStatus = getStatusByValue(pokemon.status);

    const nextStatus = getNextStatus(pokemon.status);

    if (!nextStatus) {
        return;
    }

    selectedOrderId = orderId;

    selectedPokemonId = pokemonId;

    statusConfirmContent.innerHTML = `
        <p>
            <strong> Pokémon:</strong>
            ${getOrderPokemonDisplayName(pokemon)}
        </p>

        ${renderOrderPokemonRegionalForm(pokemon)}

        <p>

            <strong>
                Status Atual:
            </strong>

            <span
                class="${currentStatus.cssClass}">

                ${currentStatus.name}

            </span>

        </p>

        <p>

            <strong>
                Próximo Status:
            </strong>

            <span
                class="${nextStatus.cssClass}">

                ${nextStatus.name}

            </span>

        </p>

        <p>
            Deseja realmente avançar o status?
        </p>
        `;

    openModal(window.statusConfirmModal);
}

btnConfirmStatusChange.addEventListener("click", () => {
    const orders = loadOrders();

    const order = orders.find((order) => order.id === selectedOrderId);

    if (!order) {
        return;
    }

    const pokemon = order.pokemons.find((pokemon) => pokemon.id === selectedPokemonId);

    if (!pokemon) {
        return;
    }

    const previousStatus = pokemon.status;

    const nextStatus = getNextStatus(previousStatus);

    if (!nextStatus) {
        return;
    }

    pokemon.status = nextStatus.value;

    addOrderStatusHistory({
        id: generateUUID(),
        orderId: order.id,
        pokemonId: pokemon.id,
        pokemonDexId: pokemon.pokemonId,
        pokemonName: getOrderPokemonDisplayName(pokemon),
        regionalForm: pokemon.regionalForm || "",
        regionalFormLabel: pokemon.regionalFormLabel || "",
        previousStatus,
        newStatus: nextStatus.value,
        createdAt: new Date().toISOString()
    });

    saveOrders(orders);

    showSuccessToast("Status atualizado com sucesso!");

    closeModal(window.statusConfirmModal);

    renderDashboard();
    renderOrdersList();
    renderFinanceModule();
    renderPlayersModule();

    openOrderDetails(selectedOrderId);
});

window.openStatusConfirmModal = openStatusConfirmModal;
window.getOrderStatusHistoryFromSource = getOrderStatusHistoryFromSource;
