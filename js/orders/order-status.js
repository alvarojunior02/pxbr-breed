// OPEN STATUS CONFIRM MODAL
function openStatusConfirmModal(
    orderId,
    pokemonId
) {
    const order =
        loadOrders().find(
            order =>
                order.id ===
                orderId
        );

    if (!order) {
        return;
    }

    const pokemon =
        order.pokemons.find(
            pokemon =>
                pokemon.id ===
                pokemonId
        );

    if (!pokemon) {
        return;
    }

    const currentStatus =
        getStatusByValue(
            pokemon.status
        );

    const nextStatus =
        getNextStatus(
            pokemon.status
        );

    if (!nextStatus) {
        return;
    }

    selectedOrderId = orderId;

    selectedPokemonId = pokemonId;

    statusConfirmContent.innerHTML =
        `
        <p>

            <strong>
                Pokémon:
            </strong>

            ${pokemon.pokemonName}

        </p>

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

    statusConfirmModal
        .classList
        .remove(
            "hidden"
        );
}

btnCancelStatusChange.addEventListener(
    "click",
    () => {
        statusConfirmModal
            .classList
            .add(
                "hidden"
            );
    }
);

btnConfirmStatusChange.addEventListener(
    "click",
    () => {
        const orders = loadOrders();

        const order =
            orders.find(
                order =>
                    order.id ===
                    selectedOrderId
            );

        if (!order) {
            return;
        }

        const pokemon =
            order.pokemons.find(
                pokemon =>
                    pokemon.id ===
                    selectedPokemonId
            );

        if (!pokemon) {
            return;
        }

        const nextStatus =
            getNextStatus(
                pokemon.status
            );

        if (!nextStatus) {
            return;
        }

        pokemon.status = nextStatus.value;

        saveOrders(orders);

        statusConfirmModal
            .classList
            .add(
                "hidden"
            );

        renderOrdersList();
        renderDashboard();

        openOrderDetails(selectedOrderId);
    }
);

window.openStatusConfirmModal = openStatusConfirmModal;