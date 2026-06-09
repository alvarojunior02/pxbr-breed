const orderPlayer = document.getElementById("orderPlayer");
const orderPlayerSearch = document.getElementById("orderPlayerSearch");
const orderPlayerResults = document.getElementById("orderPlayerResults");
const selectedPlayerInfo = document.getElementById("selectedPlayerInfo");

const pokemonOrderList = document.getElementById("pokemonOrderList");
const btnAddPokemon = document.getElementById("btnAddPokemon");
const btnCreateOrder =document.getElementById("btnCreateOrder");
const orderModal = document.getElementById("orderModal");
const orderSummary = document.getElementById("orderSummary");
const btnCancelOrder = document.getElementById("btnCancelOrder");
const btnConfirmOrder = document.getElementById("btnConfirmOrder");
const hasDiscount = document.getElementById("hasDiscount");
const orderPaid = document.getElementById("orderPaid");
const orderPaidAmount = document.getElementById("orderPaidAmount");
applyMoneyMask(orderPaidAmount);

const createOrderModal = document.getElementById("createOrderModal");
const btnOpenCreateOrderModal = document.getElementById("btnOpenCreateOrderModal");
const btnCancelCreateOrder = document.getElementById("btnCancelCreateOrder");
const btnClearCreateOrder = document.getElementById("btnClearCreateOrder");

const orderDetailsModal = document.getElementById("orderDetailsModal");
const orderDetailsContent = document.getElementById("orderDetailsContent");
const btnCloseOrderDetails =document.getElementById("btnCloseOrderDetails");

const discountValue = document.getElementById("discountValue");
applyMoneyMask(discountValue);

const orderTotal = document.getElementById("orderTotal");

const statusConfirmModal = document.getElementById("statusConfirmModal");
const statusConfirmContent = document.getElementById("statusConfirmContent");
const btnCancelStatusChange = document.getElementById("btnCancelStatusChange");
const btnConfirmStatusChange = document.getElementById("btnConfirmStatusChange");

const orderSearchPlayer = document.getElementById("orderSearchPlayer");
const orderStatusFilter = document.getElementById("orderStatusFilter");
const orderArchiveFilter = document.getElementById("orderArchiveFilter");

const paymentModal = document.getElementById("paymentModal");
const paymentSummary = document.getElementById("paymentSummary");
const paymentAmount = document.getElementById("paymentAmount");
applyMoneyMask(paymentAmount);
const btnCancelPayment = document.getElementById("btnCancelPayment");
const btnConfirmPayment = document.getElementById("btnConfirmPayment");

const paymentConfirmModal = document.getElementById("paymentConfirmModal");
const paymentConfirmSummary = document.getElementById("paymentConfirmSummary");
const btnCancelPaymentConfirm = document.getElementById("btnCancelPaymentConfirm");
const btnConfirmPaymentRegister = document.getElementById("btnConfirmPaymentRegister");

const archiveConfirmModal = document.getElementById("archiveConfirmModal");
const btnCancelArchive = document.getElementById("btnCancelArchive");
const btnConfirmArchive = document.getElementById("btnConfirmArchive");

let selectedOrderId = null;
let selectedPokemonId = null;
let selectedPaymentOrderId = null;
let pendingPaymentAmount = 0;
let selectedArchiveOrderId = null;

function calculateOrderTotal() {
    const rows =
        document.querySelectorAll(".pokemon-order-row");

    let subtotal = 0;

    rows.forEach(row => {
        const valueInput =
            row.querySelector(".pokemon-value");

        subtotal +=
            unformatMoney(
                valueInput.value
            );
    });

    let discount = 0;

    if (hasDiscount.checked) {
        discount =
            unformatMoney(
                discountValue.value
            );
    }

    const total =
        subtotal - discount;

    orderTotal.textContent =
        formatMoney(total);
}

function updateOrderFormAvailability() {
    const hasSelectedPlayer =
        Boolean(orderPlayer.value);

    btnAddPokemon.disabled =
        !hasSelectedPlayer;

    document
        .querySelectorAll(".pokemon-search")
        .forEach(input => {
            input.disabled =
                !hasSelectedPlayer;
        });

    document
        .querySelectorAll(".btn-remove-pokemon")
        .forEach(button => {
            button.disabled =
                !hasSelectedPlayer;
        });
}

function applyMoneyMask(input) {
    input.addEventListener("input", () => {
        const value =
            unformatMoney(
                input.value
            );

        input.value =
            formatMoney(value);

        calculateOrderTotal();
    });
}

// UPDATE POKEMON ROW LABELS
function updatePokemonRowLabels() {
    const rows =
        document.querySelectorAll(".pokemon-order-row");

    rows.forEach((row, index) => {
        const label =
            row.querySelector(".pokemon-label");

        const removeButton =
            row.querySelector(".btn-remove-pokemon");

        if (label) {
            label.textContent =
                `Pokémon ${index + 1}`;
        }

        if (removeButton) {
            removeButton.textContent =
                "- Remover";
        }
    });
}

function populateAbilitySelect(select, abilities) {
    if (!select) {
        console.error("Ability select não encontrado.");
        return;
    }

    select.innerHTML = "";

    abilities.forEach(ability => {
        const option =
            document.createElement("option");

        option.value =
            ability.name;

        option.textContent =
            ability.isHA
                ? `${ability.name} (HA)`
                : ability.name;

        option.dataset.isHa =
            ability.isHA;

        select.appendChild(option);
    });

    select.disabled =
        false;
}

// GET POKEMON DATA ROW DATA
function getPokemonRowData(row) {
    const valueInput = row.querySelector(".pokemon-value");
    const natureSelect = row.querySelector(".pokemon-nature");
    const abilitySelect = row.querySelector(".pokemon-ability");
    const breedableToggle = row.querySelector(".pokemon-breedable");

    const pokemon = getPokemonById(row.dataset.pokemonId);

    return {
        pokemonId: Number(row.dataset.pokemonId),

        pokemonName: row.dataset.pokemonName,

        sprite: pokemon.sprite,

        breedPokemonId: Number(row.dataset.breedPokemonId),

        breedPokemonName: row.dataset.breedPokemonName,

        nature: natureSelect.value,

        ability: {
            name: abilitySelect.value,
            isHA: abilitySelect
                .selectedOptions[0]
                ?.dataset
                .isHa === "true"
        },

        value:unformatMoney(valueInput.value),

        breedable:breedableToggle.checked
    };
}

// GET ORDER POKEMONS
function getOrderPokemons() {
    const rows =
        document.querySelectorAll(
            ".pokemon-order-row"
        );

    return Array.from(rows)
        .map(getPokemonRowData);
}

// BUILD ORDER
function buildOrder() {
    const pokemons = getOrderPokemons();

    const discount =
        hasDiscount.checked
            ? unformatMoney(
                discountValue.value
            )
            : 0;

    const subtotal =
        pokemons.reduce(
            (sum, pokemon) =>
                sum + pokemon.value,
            0
        );

    const observationsInput = document.getElementById("orderObservations");

    const paidAmount =
        orderPaid.checked
            ? unformatMoney(orderPaidAmount.value)
            : 0;

    return {
        id: generateUUID(),
        playerId: orderPlayer.value,
        pokemons,
        subtotal,
        discount,
        total: subtotal - discount,
        observations: observationsInput
            ? observationsInput.value.trim()
            : "",
        paidAmount,
        paid: paidAmount >= subtotal - discount,
        archived: false,
        createdAt: new Date().toISOString()
    };
}

// ARCHIVE ORDER
function archiveOrder(orderId) {
    const order =
        loadOrders().find(
            order =>
                order.id === orderId
        );

    if (!order) {
        return;
    }

    if (!canArchiveOrder(order)) {
        alert(
            "Esta encomenda ainda não pode ser arquivada."
        );

        return;
    }

    selectedArchiveOrderId =
        orderId;

    archiveConfirmModal.classList.remove(
        "hidden"
    );
}

// RESET ORDER FORM
function resetOrderForm() {
    orderPlayer.value = "";
    orderPlayerSearch.value = "";
    orderPlayerResults.innerHTML = "";

    hasDiscount.checked = false;
    discountValue.value = formatMoney(0);
    discountValue.style.display = "none";

    orderPaid.checked = false;
    orderPaidAmount.value = formatMoney(0);
    orderPaidAmount.style.display = "none";

    pokemonOrderList.innerHTML = "";

    document
        .querySelectorAll("input[name='needsFemale']")
        .forEach(radio => {
            radio.checked = false;
        });

    btnConfirmOrder.disabled = true;

    createPokemonOrderRow();

    updateOrderFormAvailability();

    renderSelectedPlayerInfo(null);

    calculateOrderTotal();
}

// OPEN CREATE ORDER MODAL
function openCreateOrderModal() {
    createOrderModal.classList.remove("hidden");
}

// CLOSE CREATE ORDER MODAL
function closeCreateOrderModal() {
    createOrderModal.classList.add("hidden");
}

// OPEN PAYMENT MODAL
function openPaymentModal(orderId) {
    const order =
        loadOrders().find(
            order =>
                order.id === orderId
        );

    if (!order) {
        return;
    }

    const player =
        loadPlayers().find(
            player =>
                player.id ===
                order.playerId
        );

    const paidAmount =
        order.paidAmount || 0;

    const remaining =
        order.total - paidAmount;

    selectedPaymentOrderId =
        orderId;

    paymentSummary.innerHTML = `
        <h3>
            Player:
            ${player?.nick ?? "Player"}
        </h3>

        <p>
            <strong>Total:</strong>
            ${formatMoney(order.total)}
        </p>

        <p>
            <strong>Já pago:</strong>
            ${formatMoney(paidAmount)}
        </p>

        <p>
            <strong>Restante:</strong>
            ${formatMoney(remaining)}
        </p>
    `;

    paymentAmount.value =
        formatMoney(remaining);

    paymentModal.classList.remove(
        "hidden"
    );
}

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

// VALIDATE ORDER
function validateOrder(order) {
    if (!order.playerId) {
        alert(
            "Selecione um player."
        );

        return false;
    }

    if (
        order.pokemons.length === 0
    ) {

        alert(
            "Adicione pelo menos um Pokémon."
        );

        return false;
    }

    const invalidPokemon =
        order.pokemons.find(
            pokemon =>
                !pokemon.pokemonId
        );

    if (invalidPokemon) {

        alert(
            "Selecione todos os Pokémons."
        );

        return false;
    }

    const invalidValue =
        order.pokemons.find(
            pokemon =>
                pokemon.value <= 0
        );

    if (invalidValue) {
        alert(
            "Todos os Pokémons devem possuir valor maior que zero."
        );

        return false;
    }

    const invalidAbility =
        order.pokemons.find(
            pokemon =>
                !pokemon.ability?.name
        );

    if (invalidAbility) {
        alert(
            "Selecione a habilidade de todos os Pokémons."
        );

        return false;
    }

    if (order.discount > order.subtotal) {
        alert(
            "O desconto não pode ser maior que o subtotal da encomenda."
        );

        return false;
    }

    if (order.paidAmount < 0) {
        alert(
            "O valor pago não pode ser negativo."
        );

        return false;
    }

    if (orderPaid.checked && order.paidAmount <= 0) {
        alert(
            "Informe um valor pago maior que zero."
        );

        return false;
    }

    if (order.paidAmount > order.total) {
        alert(
            "O valor pago não pode ser maior que o total da encomenda."
        );

        return false;
    }

    return true;
}

// RENDER ORDER SUMMARY
function renderOrderSummary(order) {

    orderSummary.innerHTML =
        "";

    const player =
        loadPlayers().find(
            player =>
                player.id ===
                order.playerId
        );

    let html =
        `
        <p>
            <strong>Player:</strong>
            ${player.nick}
        </p>
    `;

    order.pokemons.forEach(
        pokemon => {
            const nature = getNatureByName(
                pokemon.nature
            );

            html +=
                `
                <hr>

                <div class="modal-pokemon">

                    <img
                        src="${pokemon.sprite}"
                        alt="${pokemon.pokemonName}"
                        class="modal-pokemon-sprite">

                    <div>

                        <p>
                            <strong>
                                ${pokemon.pokemonName}
                            </strong>
                        </p>

                        <p>
                            Breed Base:
                            ${pokemon.breedPokemonName}
                        </p>

                        <p>
                            Nature:

                            <strong>
                                ${nature.name}
                            </strong>

                            ${
                                nature.neutral

                                    ? `
                                        <span
                                            class="nature-neutral">

                                            (Neutral)

                                        </span>
                                    `

                                    : `
                                        <span
                                            class="nature-positive">

                                            (+${nature.positive})

                                        </span>

                                        <span
                                            class="nature-negative">

                                            (-${nature.negative})

                                        </span>
                                    `
                            }

                        </p>

                        <p>
                            Ability:
                            ${renderAbilityText(pokemon.ability)}
                        </p>

                        <p>
                            ${
                                pokemon.breedable
                                    ? "Breedável"
                                    : "Castrado"
                            }
                        </p>

                        <p>
                            Valor:
                            ${formatMoney(
                                pokemon.value
                            )}
                        </p>

                    </div>

                </div>
                `;
        }
    );

   html +=
        `
        <hr>

        ${
            order.discount > 0
                ? `
                    <p>
                        <strong>Subtotal:</strong>
                        ${formatMoney(order.subtotal)}
                    </p>

                    <p>
                        <strong>Desconto:</strong>
                        ${formatMoney(order.discount)}
                    </p>

                    <p>
                        <strong>Total:</strong>
                        ${formatMoney(order.total)}
                    </p>
                `
                : `
                    <p>
                        <strong>Total:</strong>
                        ${formatMoney(order.total)}
                    </p>
                `
        }
    `;

    orderSummary.innerHTML =
        html;
}

// RENDER PLAYER SEARCH RESULTS
function renderPlayerSearchResults(searchTerm = "") {
    const players =
        loadPlayers();

    orderPlayerResults.innerHTML =
        "";

    if (!searchTerm.trim()) {
        return;
    }

    const filteredPlayers =
        players.filter(player =>
            player.nick
                .toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                )
        );

    filteredPlayers
        .slice(0, 10)
        .forEach(player => {
            const item =
                document.createElement("div");

            item.textContent =
                player.nick;

            item.classList.add(
                "autocomplete-item"
            );

            item.addEventListener(
                "click",
                () => {
                    orderPlayer.value =
                        player.id;

                    orderPlayerSearch.value =
                        player.nick;

                    orderPlayerResults.innerHTML =
                        "";

                    updateOrderFormAvailability();
                    renderSelectedPlayerInfo(player);
                }
            );

            orderPlayerResults.appendChild(
                item
            );
        });
}

// LOAD ORDER STATUS FILTER
function loadOrderStatusFilter() {
    ORDER_STATUS.forEach(status => {
        const option =
            document.createElement("option");

        option.value =
            status.value;

        option.textContent =
            status.name;

        orderStatusFilter.appendChild(option);
    });
}

// CREATE POKEMON ORDER ROW
function createPokemonOrderRow() {
    const row = document.createElement("div");

    row.classList.add(
        "pokemon-order-row"
    );

    row.innerHTML = `
        <div class="pokemon-row-card">

            <div class="pokemon-row-header">
                <label class="pokemon-label">
                    Pokémon
                </label>

                <button
                    type="button"
                    class="btn-remove-pokemon button-danger hidden">

                    - Remover

                </button>
            </div>

            <div class="pokemon-main-grid">
                <div>
                    <input
                        type="text"
                        class="pokemon-search"
                        placeholder="Nome ou ID">

                    <div class="pokemon-autocomplete"></div>
                </div>

                <label class="checkbox-row pokemon-breedable-wrapper hidden">
                    <input
                        type="checkbox"
                        class="pokemon-breedable"
                        disabled>

                    Breedável
                </label>
            </div>

            <div
                class="pokemon-selected-info">
            </div>

            <div class="pokemon-extra-fields hidden">

                <div>
                    <label>
                        Nature
                    </label>

                    <select
                        class="pokemon-nature"
                        disabled>

                        <option value="">
                            Selecione um Pokémon primeiro
                        </option>

                    </select>
                </div>

                <div>
                    <label>
                        Ability
                    </label>

                    <select
                        class="pokemon-ability"
                        disabled>

                        <option value="">
                            Selecione um Pokémon primeiro
                        </option>

                    </select>
                </div>

                <div>
                    <label>
                        Valor
                    </label>

                    <input
                        type="text"
                        class="pokemon-value"
                        value="${formatMoney(DEFAULT_POKEMON_PRICE)}"
                        disabled>
                </div>

            </div>

        </div>
    `;

    const valueInput = row.querySelector(".pokemon-value");
    applyMoneyMask(valueInput);

    valueInput.addEventListener(
        "input",
        calculateOrderTotal
    );

    const removeButton = row.querySelector(".btn-remove-pokemon");
    const abilitySelect = row.querySelector(".pokemon-ability");
    const natureSelect = row.querySelector(".pokemon-nature");
    const breedableToggle = row.querySelector(".pokemon-breedable");
    const pokemonSearchInput = row.querySelector(".pokemon-search");
    const pokemonAutocomplete = row.querySelector(".pokemon-autocomplete");
    const pokemonSelectedInfo = row.querySelector(".pokemon-selected-info");

    const pokemonExtraFields = row.querySelector(".pokemon-extra-fields");
    const breedableWrapper = row.querySelector(".pokemon-breedable-wrapper");

    let selectedPokemon = null;

    function enablePokemonFields() {
        abilitySelect.disabled = false;
        natureSelect.disabled = false;
        valueInput.disabled = false;
        breedableToggle.disabled = false;

        pokemonExtraFields.classList.remove("hidden");
        breedableWrapper.classList.remove("hidden");
        removeButton.classList.remove("hidden");
    }

    function populateNatureSelect() {
        natureSelect.innerHTML = "";

        POKEMON_NATURES.forEach(nature => {
            const option =
                document.createElement("option");

            option.value =
                nature.name;

            option.textContent =
                nature.neutral
                    ? `${nature.name} (Neutral)`
                    : `${nature.name} (+${nature.positive}, -${nature.negative})`;

            natureSelect.appendChild(option);
        });

        natureSelect.value =
            POKEMON_NATURES[0].name;
    }

    pokemonSearchInput.addEventListener(
        "input",
        e => {
            const searchTerm =
                e.target.value.trim();

            pokemonAutocomplete.innerHTML = "";

            if (!searchTerm) {
                return;
            }

            const results =
                searchPokemon(searchTerm)
                    .slice(0, 10);

            results.forEach(
                pokemon => {

                    const item =
                        document.createElement(
                            "div"
                        );

                    item.innerHTML = `
                    
                        <img
                            src="${pokemon.sprite}"
                            width="32">

                        #${pokemon.id}
                        ${pokemon.name}

                    `;

                    item.style.cursor =
                        "pointer";

                    item.addEventListener(
                        "click",
                        () => {
                            selectedPokemon = pokemon;

                            row.dataset.pokemonId = pokemon.id;
                            row.dataset.pokemonName = pokemon.name;

                            const basePokemon = getBasePokemon(pokemon.id);
                            row.dataset.breedPokemonId = basePokemon.id;
                            row.dataset.breedPokemonName = basePokemon.name;

                            pokemonSearchInput.value = pokemon.name;

                            pokemonAutocomplete.innerHTML = "";

                            renderPokemonInfo(pokemon);

                            populateAbilitySelect(
                                abilitySelect,
                                pokemon.abilities
                            );

                            populateNatureSelect();

                            enablePokemonFields();

                            calculateOrderTotal();
                        }
                    );

                    pokemonAutocomplete.appendChild(
                        item
                    );

                }
            );
        }
    );

    function renderPokemonInfo(pokemon) {
        const basePokemon =
            getBasePokemon(
                pokemon.id
            );

        pokemonSelectedInfo.innerHTML = `
            <div class="pokemon-info-card">
                <img
                    src="${pokemon.sprite}"
                    width="64">

                <div>
                    <strong>
                        #${pokemon.id}
                        ${pokemon.name}
                    </strong>

                    <p>
                        Breed Base:
                        ${basePokemon?.name || "N/A"}
                    </p>

                    <p>
                        Egg Groups:
                        ${pokemon.eggGroups.join(" / ")}
                    </p>
                </div>
            </div>
        `;
    }

    removeButton.addEventListener(
        "click",
        () => {
            row.remove();
            updatePokemonRowLabels();
            calculateOrderTotal();
        }
    );

    calculateOrderTotal();

    updateOrderFormAvailability();

    pokemonOrderList.appendChild(
        row
    );

    updatePokemonRowLabels();

    calculateOrderTotal();
}

// RENDER SELECTED PLAYER INFO
function renderSelectedPlayerInfo(player) {
    if (!player) {
        selectedPlayerInfo.innerHTML = "";
        return;
    }

    const summary =
        getPlayerFinancialSummary(player.id);

    const lastOrder =
        getPlayerLastOrder(player.id);

    selectedPlayerInfo.innerHTML =
        `
        <div class="selected-player-card">
            <h3>
                ${player.nick}
            </h3>

            <p>
                Última Encomenda:
                ${
                    lastOrder
                        ? `
                            ${formatDate(lastOrder.createdAt)}
                            (${getDaysSince(lastOrder.createdAt)} dias atrás)
                        `
                        : "Nenhuma encomenda registrada"
                }
            </p>

            <p>
                Total Vendido:
                ${formatMoney(summary.total)}
            </p>

            <p>
                Recebido:
                <span class="payment-paid">
                    ${formatMoney(summary.paid)}
                </span>
            </p>

            <p>
                Pendente:
                <span class="payment-pending">
                    ${formatMoney(summary.pending)}
                </span>
            </p>
        </div>
    `;
}

btnAddPokemon.addEventListener(
    "click",
    () => {
        createPokemonOrderRow();
    }
);

hasDiscount.addEventListener(
    "change",
    () => {
        discountValue.style.display =
            hasDiscount.checked
                ? "block"
                : "none";

        calculateOrderTotal();
    }
);

discountValue.addEventListener(
    "input",
    calculateOrderTotal
);

btnCreateOrder.addEventListener(
    "click",
    () => {

        const order =
            buildOrder();

        if (
            !validateOrder(order)
        ) {
            return;
        }

        renderOrderSummary(
            order
        );

        btnConfirmOrder.disabled =
            true;

        document
            .querySelectorAll(
                "input[name='needsFemale']"
            )
            .forEach(
                radio =>
                    radio.checked =
                        false
            );

        orderModal.classList.remove(
            "hidden"
        );
    }
);

document
    .querySelectorAll(
        "input[name='needsFemale']"
    )
    .forEach(
        radio => {

            radio.addEventListener(
                "change",
                () => {

                    btnConfirmOrder.disabled =
                        false;

                }
            );

        }
    );

btnOpenCreateOrderModal.addEventListener(
    "click",
    openCreateOrderModal
);

btnCancelCreateOrder.addEventListener(
    "click",
    () => {
        resetOrderForm();
        closeCreateOrderModal();
    }
);

btnClearCreateOrder.addEventListener(
    "click",
    resetOrderForm
);

btnCancelOrder.addEventListener(
    "click",
    () => {
        orderModal.classList.add("hidden");
    }
);

btnConfirmOrder.addEventListener(
    "click",
    () => {
        const orderData =
            buildOrder();

        const order =
            createPersistedOrder(
                orderData
            );

        saveOrder(order);

        renderOrdersList();
        renderDashboard();

        resetOrderForm();

        orderModal.classList.add(
            "hidden"
        );

        closeCreateOrderModal();

        showSection("ordersSection");
    }
);

btnCloseOrderDetails.addEventListener(
    "click",
    () => {
        orderDetailsModal
            .classList
            .add(
                "hidden"
            );
    }
);

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

orderSearchPlayer.addEventListener(
    "input",
    renderOrdersList
);

orderStatusFilter.addEventListener(
    "change",
    renderOrdersList
);

orderArchiveFilter.addEventListener(
    "change",
    renderOrdersList
);

orderPlayer.addEventListener(
    "change",
    updateOrderFormAvailability
);

orderPlayerSearch.addEventListener(
    "input",
    e => {
        orderPlayer.value = "";

        renderSelectedPlayerInfo(null);

        updateOrderFormAvailability();

        renderPlayerSearchResults(
            e.target.value
        );
    }
);

orderPaid.addEventListener("change", () => {
    if (orderPaid.checked) {
        const total = unformatMoney(orderTotal.textContent);

        orderPaidAmount.value = formatMoney(total);

        orderPaidAmount.style.display = "block";

        return;
    }

    orderPaidAmount.value = formatMoney(0);

    orderPaidAmount.style.display = "none";
});

btnCancelPayment.addEventListener(
    "click",
    () => {
        paymentModal.classList.add(
            "hidden"
        );
    }
);

btnConfirmPayment.addEventListener(
    "click",
    () => {
        const orders =
            loadOrders();

        const order =
            orders.find(
                order =>
                    order.id === selectedPaymentOrderId
            );

        if (!order) {
            return;
        }

        const player =
            loadPlayers().find(
                player =>
                    player.id ===
                    order.playerId
            );

        const amount =
            unformatMoney(
                paymentAmount.value
            );

        if (!validatePaymentAmount(order, amount)) {
            return;
        }

        const currentPaid =
            order.paidAmount || 0;

        const remaining =
            order.total - currentPaid;

        pendingPaymentAmount =
            amount;

        paymentConfirmSummary.innerHTML = `
            <h3>
                Player:
                ${player?.nick ?? "Player"}
            </h3>

            <p>
                <strong>Total:</strong>
                ${formatMoney(order.total)}
            </p>

            <p>
                <strong>Já pago:</strong>
                ${formatMoney(currentPaid)}
            </p>

            <p>
                <strong>Restante antes do pagamento:</strong>
                ${formatMoney(remaining)}
            </p>

            <p>
                <strong>Valor a registrar agora:</strong>
                ${formatMoney(amount)}
            </p>

            <p>
                <strong>Restante após pagamento:</strong>
                ${formatMoney(
                    remaining - amount
                )}
            </p>
        `;

        paymentConfirmModal.classList.remove(
            "hidden"
        );
    }
);

btnCancelPaymentConfirm.addEventListener(
    "click",
    () => {
        paymentConfirmModal.classList.add(
            "hidden"
        );
    }
);

btnConfirmPaymentRegister.addEventListener(
    "click",
    () => {
        const orders =
            loadOrders();

        const order =
            orders.find(
                order =>
                    order.id === selectedPaymentOrderId
            );

        if (!order) {
            return;
        }

        if (!validatePaymentAmount(order, pendingPaymentAmount)) {
            return;
        }

        order.paidAmount =
            (order.paidAmount || 0) + pendingPaymentAmount;

        order.paid =
            order.paidAmount >= order.total;

        saveOrders(
            orders
        );

        paymentConfirmModal.classList.add(
            "hidden"
        );

        paymentModal.classList.add(
            "hidden"
        );

        pendingPaymentAmount =
            0;

        renderOrdersList();
        renderDashboard();

        openOrderDetails(
            selectedPaymentOrderId
        );
    }
);

btnCancelArchive.addEventListener(
    "click",
    () => {
        archiveConfirmModal.classList.add(
            "hidden"
        );

        selectedArchiveOrderId =
            null;
    }
);

btnConfirmArchive.addEventListener(
    "click",
    () => {
        const orders =
            loadOrders();

        const order =
            orders.find(
                order =>
                    order.id === selectedArchiveOrderId
            );

        if (!order) {
            return;
        }

        if (!canArchiveOrder(order)) {
            alert(
                "Esta encomenda ainda não pode ser arquivada."
            );

            return;
        }

        order.archived =
            true;

        saveOrders(
            orders
        );

        archiveConfirmModal.classList.add(
            "hidden"
        );

        orderDetailsModal.classList.add(
            "hidden"
        );

        selectedArchiveOrderId =
            null;

        renderOrdersList();
        renderDashboard();
    }
);

loadOrderStatusFilter();
createPokemonOrderRow();
updateOrderFormAvailability();
renderOrdersList();

window.openCreateOrderModal =openCreateOrderModal;
window.openStatusConfirmModal = openStatusConfirmModal;
window.openPaymentModal = openPaymentModal;
window.archiveOrder = archiveOrder;