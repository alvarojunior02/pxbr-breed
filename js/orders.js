function createOrder(playerId) {
    return {
        id: generateUUID(),
        playerId,
        total: 0,
        discount: 0,
        paid: false,
        needsFemale: false,
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

const discountValue = document.getElementById("discountValue");
applyMoneyMask(discountValue);

const orderTotal = document.getElementById("orderTotal");

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

function getPokemonRowData(row) {
    const valueInput = row.querySelector(".pokemon-value");
    const natureSelect = row.querySelector(".pokemon-nature");
    const breedableToggle = row.querySelector(".pokemon-breedable");

    const pokemon = getPokemonById(row.dataset.pokemonId);

    return {
        pokemonId: Number(row.dataset.pokemonId),

        pokemonName: row.dataset.pokemonName,

        sprite: pokemon.sprite,

        breedPokemonId: Number(row.dataset.breedPokemonId),

        breedPokemonName: row.dataset.breedPokemonName,

        nature: natureSelect.value,

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
    const pokemons =
        getOrderPokemons();

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

    return {
        id: generateUUID(),
        playerId: orderPlayer.value,
        pokemons,
        subtotal,
        discount,
        total: subtotal - discount,
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

    const needsFemale = 
        initialStatus === ORDER_STATUS[0].value;  
        
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

    return order;
}

function saveOrder(order) {
    const orders =
        loadOrders();

    orders.push(order);

    saveOrders(orders);
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

        <br><br>

        <label>
            Nature
        </label>

        <br>

        <select class="pokemon-nature">

        </select>

        <br><br>

        <div class="nature-info">

        </div>

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

    let selectedPokemon = null;

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
            ${basePokemon.name}

            <br>

            Egg Groups:
            ${pokemon.eggGroups.join(" | ")}
        `;
    }

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

        console.log(
            "Encomenda salva:",
            order
        );

        orderModal.classList.add(
            "hidden"
        );
    }
);

loadPlayersSelect();
createPokemonOrderRow();