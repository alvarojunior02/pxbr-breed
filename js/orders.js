function createOrder(playerId) {
    return {
        id: generateUUID(),
        playerId,
        total: 0,
        discount: 0,
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
const pokemonOrderList = document.getElementById("pokemonOrderList");
const btnAddPokemon = document.getElementById("btnAddPokemon");
const btnCreateOrder =document.getElementById("btnCreateOrder");
const orderModal = document.getElementById("orderModal");
const orderSummary = document.getElementById("orderSummary");
const btnCancelOrder = document.getElementById("btnCancelOrder");
const btnConfirmOrder = document.getElementById("btnConfirmOrder");
const hasDiscount = document.getElementById("hasDiscount");

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

let selectedOrderId = null;
let selectedPokemonId = null;

const orderSearchPlayer = document.getElementById("orderSearchPlayer");
const orderStatusFilter = document.getElementById("orderStatusFilter");

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

function getOrderPokemons() {
    const rows =
        document.querySelectorAll(
            ".pokemon-order-row"
        );

    return Array.from(rows)
        .map(getPokemonRowData);
}

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
        paid: false,
        archived: false,
        createdAt: new Date().toISOString()
    };
}

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

function createPersistedOrder(orderData) {
    const order = createOrder(orderData.playerId);

    order.total = orderData.total;

    order.discount = orderData.discount;

    order.paid = false;

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

function saveOrder(order) {
    const orders =
        loadOrders();

    orders.push(order);

    saveOrders(orders);
}

function resetOrderForm() {
    orderPlayer.value = "";

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

    createPokemonOrderRow();

    calculateOrderTotal();
}

function getFilteredOrders() {
    const orders =
        loadOrders();

    const players =
        loadPlayers();

    const searchTerm =
        orderSearchPlayer.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        orderStatusFilter.value;

    return orders.filter(order => {
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
            <strong>Pedido:</strong>
            ${order.id}
        </p>

        <p>
            <strong>Player:</strong>
            ${player?.nick ?? "-"}
        </p>

        <p>
            <strong>Criado em:</strong>
            ${formatDate(
                order.createdAt
            )}
        </p>

        <p>
            <strong>Total:</strong>
            ${formatMoney(
                order.total
            )}
        </p>

        <p>
            <strong>Desconto:</strong>
            ${formatMoney(
                order.discount
            )}
        </p>

        <p>
            <strong>Pago:</strong>
            ${
                order.paid
                    ? "Sim"
                    : "Não"
            }
        </p>

        <p>
            <strong>Precisa capturar fêmea:</strong>
            ${
                order.needsFemale
                    ? "Sim"
                    : "Não"
            }
        </p>

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
        <h3>
            Pedido #${order.id.slice(0, 8)}
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
            Criado em:
            ${formatDate(
                order.createdAt
            )}
        </p>

        <strong>Status</strong>

        <ul>
            ${statusHtml}
        </ul>

        <button
            type="button"
            onclick="openOrderDetails('${order.id}')">

            Ver Detalhes

        </button>
    `;
}

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

    return true;
}

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

        <p>
            <strong>
                Total:
            </strong>

            ${formatMoney(
                order.total
            )}
        </p>
    `;

    orderSummary.innerHTML =
        html;
}

function loadPlayersSelect() {

    const players =
        loadPlayers();

    orderPlayer.innerHTML = `
        <option value="">
            Selecione um player
        </option>
    `;

    players.forEach(player => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            player.id;

        option.textContent =
            player.nick;

        orderPlayer.appendChild(
            option
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

        <br>

        <div
            class="pokemon-selected-info">
        </div>

        <br>

        <label>
            Nature
        </label>

        <br>

        <select class="pokemon-nature">

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
        >

        <br><br>

        <label>

            <input
                type="checkbox"
                class="pokemon-breedable"
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
    const natureSelect = row.querySelector(".pokemon-nature");
    const natureInfo = row.querySelector(".nature-info" );
    const pokemonSearchInput = row.querySelector(".pokemon-search");
    const pokemonAutocomplete = row.querySelector(".pokemon-autocomplete");
    const pokemonSelectedInfo = row.querySelector(".pokemon-selected-info");
    const abilitySelect = row.querySelector(".pokemon-ability");

    let selectedPokemon = null;

    POKEMON_NATURES.forEach(
        nature => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                nature.name;

            option.textContent =
                nature.neutral
                    ? `${nature.name} (Neutral)`
                    : `${nature.name} (+${nature.positive}, -${nature.negative})`;

            natureSelect.appendChild(
                option
            );
        }
    );

    function updateNatureInfo() {
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

        resetOrderForm();

        orderModal.classList.add(
            "hidden"
        );
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

loadPlayersSelect();
loadOrderStatusFilter();
createPokemonOrderRow();
renderOrdersList();

window.openOrderDetails = openOrderDetails;
window.openStatusConfirmModal = openStatusConfirmModal;