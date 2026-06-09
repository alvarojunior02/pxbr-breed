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

function createOrderPokemon({
    pokemonId,
    pokemonName,
    nature,
    value,
    breedable
}) {
    return {
        id: generateUUID(),
        pokemonId,
        pokemonName,
        breedPokemonName:
            getBasePokemon(
                pokemonId
            ).name,
        nature,
        value,
        breedable,
        status: "NEEDS_FEMALE"
    };
}

const orderPlayer = document.getElementById("orderPlayer");
const orderPlayerSearch = document.getElementById("orderPlayerSearch");
const orderPlayerResults = document.getElementById("orderPlayerResults");

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

function updatePokemonRowLabels() {
    const rows =
        document.querySelectorAll(".pokemon-order-row");

    rows.forEach((row, index) => {
        const label =
            row.querySelector(".pokemon-label");

        if (label) {
            label.textContent =
                `Pokémon ${index + 1}`;
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

function renderAbilityText(ability) {
    if (!ability) {
        return "-";
    }

    return `
        ${ability.name}
        ${
            ability.isHA
                ? `
                    <span class="ability-ha">
                        (HA)
                    </span>
                `
                : ""
        }
    `;
}

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

// GET INITIAL POKEMON STATUS
function getInitialPokemonStatus() {
    const selectedOption =
        document.querySelector(
            "input[name='needsFemale']:checked"
        );

    if (!selectedOption) {
        return null;
    }

    return selectedOption.value === "yes"
        ? ORDER_STATUS[0].value
        : ORDER_STATUS[1].value;
}

// CREATE PERSISTED ORDER
function createPersistedOrder(orderData) {
    const order = createOrder(orderData.playerId);

    order.total = orderData.total;

    order.discount = orderData.discount;

    order.paidAmount = orderData.paidAmount;

    order.paid = orderData.paid;

    const initialStatus = getInitialPokemonStatus();
        
    order.needsFemale = isFirstStatus(initialStatus);

    order.pokemons =
        orderData.pokemons.map(
            pokemon => ({

                ...pokemon,

                id:
                    generateUUID(),

                status:
                    initialStatus
            })
        );

    order.observations = orderData.observations;

    return order;
}

// SAVE ORDER
function saveOrder(order) {
    const orders =
        loadOrders();

    orders.push(order);

    saveOrders(orders);
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

// CAN REGISTER PAYMENT
function canRegisterPayment(order) {
    return (order.paidAmount || 0) < order.total;
}

// GET PAYMENT STATUS HTML
function getPaymentStatusHtml(order) {
    const paidAmount =
        order.paidAmount || 0;

    const remaining =
        order.total - paidAmount;

    if (paidAmount >= order.total) {
        return `
            <span class="payment-paid">
                Pago
            </span>
        `;
    }

    if (paidAmount > 0) {
        return `
            <span class="payment-partial">
                Pago Parcialmente:
                ${formatMoney(paidAmount)}
            </span>

            <br>

            <span class="payment-pending">
                A Pagar:
                ${formatMoney(remaining)}
            </span>
        `;
    }

    return `
        <span class="payment-pending">
            A Pagar:
            ${formatMoney(order.total)}
        </span>
    `;
}

// CAN ARCHIVE ORDER
function canArchiveOrder(order) {
    const isPaid =
        (order.paidAmount || 0) >= order.total;

    const allPokemonsDelivered =
        order.pokemons.every(
            pokemon =>
                isLastStatus(pokemon.status)
        );

    return isPaid && allPokemonsDelivered && !order.archived;
}

// GET ARCHIVE READY HTML
function getArchiveReadyHtml(order) {
    if (!canArchiveOrder(order)) {
        return "";
    }

    return `
        <p class="archive-ready">
            Encomenda totalmente concluída — pode ser arquivada.
        </p>
    `;
}

// VALIDATE PAYMENT AMOUNT
function validatePaymentAmount(order, amount) {
    const currentPaid =
        order.paidAmount || 0;

    const remaining =
        order.total - currentPaid;

    if (amount <= 0) {
        alert(
            "Informe um valor maior que zero."
        );

        return false;
    }

    if (amount > remaining) {
        alert(
            "O valor pago não pode ser maior que o valor restante."
        );

        return false;
    }

    return true;
}

// RESET ORDER FORM
function resetOrderForm() {
    orderPlayer.value = "";

    orderPlayerSearch.value = "";

    orderPlayerResults.innerHTML = "";

    hasDiscount.checked = false;

    discountValue.value = formatMoney(0);

    discountValue.style.display = "none";

    pokemonOrderList.innerHTML = "";

    document
        .querySelectorAll(
            "input[name='needsFemale']"
        )
        .forEach(
            radio =>
                radio.checked =
                    false
        );

    btnConfirmOrder.disabled = true;

    document.getElementById("orderObservations").value = "";

    orderPaid.checked = false;
    orderPaidAmount.value = formatMoney(0);
    orderPaidAmount.style.display = "none";

    createPokemonOrderRow();

    calculateOrderTotal();
}

// GET FILTERED ORDERS
function getFilteredOrders() {
    const orders = loadOrders();

    const players = loadPlayers();

    const searchTerm =
        orderSearchPlayer.value
            .trim()
            .toLowerCase();

    const selectedStatus = orderStatusFilter.value;

    const archiveFilter = orderArchiveFilter.value;

    return orders.filter(order => {
        if (archiveFilter === "active" && order.archived) {
            return false;
        }

        if (archiveFilter === "archived" && !order.archived) {
            return false;
        }

        const player =
            players.find(
                player =>
                    player.id === order.playerId
            );

        const matchesPlayer =
            !searchTerm ||
            player?.nick
                .toLowerCase()
                .includes(searchTerm);

        const matchesStatus =
            !selectedStatus ||
            order.pokemons.some(
                pokemon =>
                    pokemon.status === selectedStatus
            );

        return matchesPlayer && matchesStatus;
    });
}

// RENDER ORDERS LIST
function renderOrdersList() {

    const orders = getFilteredOrders();

    const ordersList = document.getElementById("ordersList");
    const ordersCount = document.getElementById("ordersCount");

    ordersCount.textContent = orders.length;

    ordersList.innerHTML = "";

    orders.forEach(order => {
        const card =
            document.createElement("div");

        card.classList.add(
            "order-card"
        );

        card.innerHTML =
            createOrderCard(order);

        ordersList.appendChild(card);
    });
}

// OPEN ORDER DETAILS
function openOrderDetails(orderId) {
    const order =
        loadOrders().find(
            order =>
                order.id ===
                orderId
        );

    if (!order) {
        return;
    }

    renderOrderDetails(
        order
    );

    orderDetailsModal
        .classList
        .remove(
            "hidden"
        );
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

// RENDER ORDER DETAILS
function renderOrderDetails(order) {
    window.currentOrderId = order.id;

    const player =
        loadPlayers().find(
            player =>
                player.id ===
                order.playerId
        );

    const pokemonHtml =
        order.pokemons
            .map(
                pokemon =>
                    createPokemonDetailsCard(
                        pokemon
                    )
            )
            .join("");

    orderDetailsContent.innerHTML =
        `
        <p>
            <strong>ID do Pedido:</strong>
            ${order.id}
        </p>

        <p>
            <strong>Criado em:</strong>
            ${formatDate(
                order.createdAt
            )}
        </p>

        <p>
            <strong>Player:</strong>
            ${player?.nick ?? "-"}
        </p>

        ${
            order.discount > 0
                ? `
                    <p>
                        <strong>Subtotal:</strong>
                        ${formatMoney(order.subtotal ?? order.total + order.discount)}
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

        <p>
            ${getPaymentStatusHtml(order)}
        </p>

        ${getArchiveReadyHtml(order)}

        ${
            canArchiveOrder(order)
                ? `
                    <button
                        type="button"
                        onclick="archiveOrder('${order.id}')">

                        Arquivar Encomenda

                    </button>
                `
                : ""
        }

        ${
            canRegisterPayment(order)
                ? `
                    <button
                        type="button"
                        onclick="openPaymentModal('${order.id}')">

                        Registrar Pagamento

                    </button>
                `
                : ""
        }

        ${
            order.observations?.trim()
                ? `
                    <p>
                        <strong>
                            Observações:
                        </strong>

                        ${order.observations}
                    </p>
                `
                : ""
        }

        <hr>

        ${pokemonHtml}
    `;
}

// CREATE POKEMON DETAILS CARD
function createPokemonDetailsCard(
    pokemon
) {
    const nature = getNatureByName(pokemon.nature);

    const thumbnail = getPokemonThumbnail(pokemon.pokemonId);

    const canAdvanceStatus =
        !isLastStatus(
            pokemon.status
        );

    return `
        <div
            class="pokemon-details-card">

            <img
                src="${thumbnail}"
                alt="${pokemon.pokemonName}"
            >

            <h3>
                #${pokemon.pokemonId}
                ${pokemon.pokemonName}
            </h3>

            <p>
                Nature:
                ${nature.name}
            </p>

            <p>
                Ability:
                ${renderAbilityText(pokemon.ability)}
            </p>

            <p>
                Status:
                <span class="${getOrderStatusClass(pokemon.status)}">
                    ${getStatusByValue(pokemon.status).name}
                </span>
            </p>

            <p>
                Valor:
                ${formatMoney(
                    pokemon.value
                )}
            </p>

            <p>
                Breedável:
                ${
                    pokemon.breedable
                        ? "Sim"
                        : "Não"
                }
            </p>

        </div>

        ${
            canAdvanceStatus
                ? `
                <button
                    type="button"
                    onclick="openStatusConfirmModal(window.currentOrderId, '${pokemon.id}')">
                    Avançar Status
                </button>
                `
                : ""
        }
    `;
}

// GET ORDER STATUS SUMMARY
function getOrderStatusSummary(order) {
    const summary = {};

    order.pokemons.forEach(
        pokemon => {

            summary[
                pokemon.status
            ] =
                (summary[
                    pokemon.status
                ] || 0) + 1;

        }
    );

    return summary;
}

// CREATE ORDER CARD
function createOrderCard(order) {
    const player =
        loadPlayers().find(
            player =>
                player.id ===
                order.playerId
        );

    const statusSummary =
        getOrderStatusSummary(
            order
        );

    const statusHtml =
        Object.entries(
            statusSummary
        )
            .map(
                ([status, count]) =>
                    `
                    <li>
                        ${count}
                        <span
                            class="${getOrderStatusClass(status)}">
                            ${getStatusByValue(status).name}
                        </span>
                    </li>
                    `
            )
            .join("");

    return `
        ${
            order.archived
                ? `
                    <p class="archived-label">
                        Arquivada
                    </p>
                `
                : ""
        }
        
        <h3>
            Pedido #${order.id.slice(0, 8)}
            <span style="font-weight: normal;">
                - ${formatDate(order.createdAt)}
            </span>
        </h3>

        <p>
            Player:
            ${player?.nick ?? "-"}
        </p>

        <p>
            Pokémons:
            ${order.pokemons.length}
        </p>

        <p>
            Total:
            ${formatMoney(
                order.total
            )}
        </p>

        <p>
            ${getPaymentStatusHtml(order)}
        </p>

        <strong>Status de Breeds</strong>

        <ul>
            ${statusHtml}
        </ul>

        ${getArchiveReadyHtml(order)}

        <button
            type="button"
            onclick="openOrderDetails('${order.id}')">

            Ver Detalhes

        </button>
        
        ${
            canRegisterPayment(order)
                ? `
                    <button
                        type="button"
                        onclick="openPaymentModal('${order.id}')">

                        Registrar Pagamento

                    </button>
                `
                : ""
        }

        ${
            canArchiveOrder(order)
                ? `
                    <button
                        type="button"
                        onclick="archiveOrder('${order.id}')">

                        Arquivar Encomenda

                    </button>
                `
                : ""
        }
    `;
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
                }
            );

            orderPlayerResults.appendChild(
                item
            );
        });
}

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
        <hr>

        <label class="pokemon-label">
            Pokémon
        </label>

        <br>

        <input
            type="text"
            class="pokemon-search"
            placeholder="Nome ou ID">

        <div
            class="pokemon-autocomplete">
        </div>

        <div
            class="pokemon-selected-info">
        </div>

        <br>

        <label>
            Nature
        </label>

        <br>

        <select
            class="pokemon-nature"
            disabled>

            <option value="">
                Selecione um Pokémon primeiro
            </option>

        </select>

        <br>

        <div class="nature-info">

        </div>
    
        <br>

        <label>
            Ability
        </label>

        <br>

        <select
            class="pokemon-ability"
            disabled>

            <option value="">
                Selecione um Pokémon primeiro
            </option>

        </select>

        <br><br>

        <label>
            Valor
        </label>

        <br>

        <input
            type="text"
            class="pokemon-value"
            value="$ ${DEFAULT_POKEMON_PRICE}"}"
            disabled
        >

        <br><br>

        <label>

            <input
                type="checkbox"
                class="pokemon-breedable"
                disabled
            >

            Breedável

        </label>

        <br><br>

        <button
            type="button"
            class="btn-remove-pokemon">

            Remover

        </button>
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
    const natureInfo = row.querySelector(".nature-info" );
    const breedableToggle = row.querySelector(".pokemon-breedable");
    const pokemonSearchInput = row.querySelector(".pokemon-search");
    const pokemonAutocomplete = row.querySelector(".pokemon-autocomplete");
    const pokemonSelectedInfo = row.querySelector(".pokemon-selected-info");

    let selectedPokemon = null;

    function enablePokemonFields() {
        abilitySelect.disabled = false;
        natureSelect.disabled = false;
        valueInput.disabled = false;
        breedableToggle.disabled = false;
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

        updateNatureInfo();
    }

    function updateNatureInfo() {
        if (!natureSelect.value) {
            natureInfo.innerHTML =
                "";

            return;
        }

        const selectedNature =
            POKEMON_NATURES.find(
                nature =>
                    nature.name ===
                    natureSelect.value
            );

        if (!selectedNature) {
            return;
        }

        if (selectedNature.neutral) {

            natureInfo.innerHTML = `
                <span style="color: gray;">
                    Nature Neutra
                </span>
            `;

            return;
        }
        natureInfo.innerHTML = `
            <span style="color: green;">
                +${selectedNature.positive}
            </span>

            |

            <span style="color: red;">
                -${selectedNature.negative}
            </span>
        `;
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
            <br>

            <img
                src="${pokemon.sprite}"
                width="64">

            <br>

            <strong>
                #${pokemon.id}
                ${pokemon.name}
            </strong>

            <br>

            Breed Base:
            ${basePokemon?.name || "N/A"}

            <br>

            Egg Groups:
            ${pokemon.eggGroups.join(" | ")}
        `;
    }

    natureSelect.addEventListener(
        "change",
        updateNatureInfo
    );

    updateNatureInfo();

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
    closeCreateOrderModal
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
        orderPlayer.value =
            "";

        updateOrderFormAvailability();

        renderPlayerSearchResults(
            e.target.value
        );
    }
);

orderPaid.addEventListener("change", () => {
    if (orderPaid.checked) {
        const order =
            buildOrder();

        orderPaidAmount.value =
            formatMoney(order.total);

        orderPaidAmount.style.display =
            "block";

        return;
    }

    orderPaidAmount.value =
        formatMoney(0);

    orderPaidAmount.style.display =
        "none";
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
window.openOrderDetails = openOrderDetails;
window.openStatusConfirmModal = openStatusConfirmModal;
window.openPaymentModal = openPaymentModal;
window.archiveOrder = archiveOrder;
window.renderOrdersList = renderOrdersList;