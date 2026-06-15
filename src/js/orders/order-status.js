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
async function openStatusConfirmModal(orderId, pokemonId) {
    const order = await getOrderByIdFromSource(orderId);

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

            <span class="${currentStatus.cssClass}">
                ${currentStatus.name}
            </span>
        </p>

        <p>
            <strong>
                Próximo Status:
            </strong>

            <span class="${nextStatus.cssClass}">
                ${nextStatus.name}
            </span>
        </p>

        <p>
            Deseja realmente avançar o status?
        </p>
    `;

    openModal(window.statusConfirmModal);
}

btnConfirmStatusChange.addEventListener("click", async () => {
    const order = await getOrderByIdFromSource(selectedOrderId);

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

    try {
        if (shouldUseApiOrders()) {
            const updatedPokemons = order.pokemons.map((item) => {
                if (item.id !== pokemon.id) {
                    return mapOrderPokemonToApiPayload(item);
                }

                return mapOrderPokemonToApiPayload({
                    ...item,
                    status: nextStatus.value
                });
            });

            await window.PXBROrdersApiService.update(order.id, {
                pokemons: updatedPokemons
            });

            await window.PXBROrderStatusHistoryApiService.create(order.id, {
                orderPokemonId: pokemon.id,
                pokemonDexId: pokemon.pokemonId,
                pokemonName: getOrderPokemonDisplayName(pokemon),
                oldStatus: previousStatus,
                newStatus: nextStatus.value,
                notes: null
            });
        } else {
            const orders = loadOrders();

            const localOrder = orders.find((item) => item.id === selectedOrderId);

            if (!localOrder) {
                return;
            }

            const localPokemon = localOrder.pokemons.find((item) => item.id === selectedPokemonId);

            if (!localPokemon) {
                return;
            }

            localPokemon.status = nextStatus.value;

            addOrderStatusHistory({
                id: generateUUID(),
                orderId: localOrder.id,
                pokemonId: localPokemon.id,
                pokemonDexId: localPokemon.pokemonId,
                pokemonName: getOrderPokemonDisplayName(localPokemon),
                regionalForm: localPokemon.regionalForm || "",
                regionalFormLabel: localPokemon.regionalFormLabel || "",
                previousStatus,
                newStatus: nextStatus.value,
                createdAt: new Date().toISOString()
            });

            saveOrders(orders);
        }

        showSuccessToast("Status atualizado com sucesso!");

        closeModal(window.statusConfirmModal);

        renderDashboard();
        renderOrdersList();
        renderFinanceModule();
        renderPlayersModule();

        openOrderDetails(selectedOrderId);
    } catch (error) {
        showToast(error?.data?.message || error?.message || "Erro ao atualizar status.", "error");
    }
});

window.openStatusConfirmModal = openStatusConfirmModal;
window.getOrderStatusHistoryFromSource = getOrderStatusHistoryFromSource;
