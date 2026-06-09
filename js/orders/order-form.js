applyMoneyMask(orderPaidAmount);
applyMoneyMask(discountValue);
applyMoneyMask(paymentAmount);

// CALCULATE ORDER TOTAL
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

// UPDATE ORDER FORM AVAILABILITY
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

// APPLY MONEY MASK
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
                "Remover";
        }
    });
}

// POPULATE ABILITY SELECT
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
    orderPaidAmountLabel.style.display = "none";

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

// RENDER PLAYER SEARCH RESULTS
function renderPlayerSearchResults(searchTerm = "") {
    const players = loadPlayers();

    orderPlayerResults.innerHTML = "";

    const normalizedSearch =
        searchTerm
            .trim()
            .toLowerCase();

    const filteredPlayers =
        players.filter(player =>
            !normalizedSearch ||
            player.nick
                .toLowerCase()
                .includes(normalizedSearch)
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

                    Remover

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

    let html = `
        <div class="order-summary-header">
            <h2>
                Confirmar Encomenda
            </h2>

            <p>
                <strong>Player:</strong>
                ${player.nick}
            </p>
        </div>

        <h3 class="order-summary-section-title">
            Pokémons
        </h3>
    `;

    html += `<div class="order-summary-pokemon-grid">`;

    order.pokemons.forEach(
        pokemon => {
            const nature = getNatureByName(
                pokemon.nature
            );

            html +=
                `
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

                            <span class="pokemon-summary-id">
                                (#${String(pokemon.pokemonId).padStart(3, "0")})
                            </span>
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
                            ${renderBreedableText(pokemon.breedable)}
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

    html += `</div>`;

    html += `
        <div class="order-summary-totals">
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
        </div>
    `;

    orderSummary.innerHTML =
        html;
}

// OPEN CREATE ORDER MODAL
function openCreateOrderModal() {
    createOrderModal.classList.remove("hidden");
}

// CLOSE CREATE ORDER MODAL
function closeCreateOrderModal() {
    createOrderModal.classList.add("hidden");
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

        const order = buildOrder();

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

btnOpenCreateOrderModal.forEach(button => {
    button.addEventListener(
        "click",
        openCreateOrderModal
    );
});

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

        if (order.paidAmount > 0) {

            const transaction =
                createOrderPaymentTransaction({

                    amount:
                        order.paidAmount,

                    playerId:
                        order.playerId,

                    orderId:
                        order.id
                });

            saveTransaction(
                transaction
            );
        }

        renderOrdersList();

        renderDashboard();

        renderPlayersModule();

        resetOrderForm();

        orderModal.classList.add(
            "hidden"
        );

        closeCreateOrderModal();

        showSection("ordersSection");
    }
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

orderPlayerSearch.addEventListener(
    "focus",
    () => {
        renderPlayerSearchResults(
            orderPlayerSearch.value
        );
    }
);

orderPaid.addEventListener("change", () => {
    if (orderPaid.checked) {
        const total = unformatMoney(orderTotal.textContent);

        orderPaidAmount.value = formatMoney(total);
        orderPaidAmount.style.display = "block";
        orderPaidAmountLabel.style.display = "block";

        return;
    }

    orderPaidAmount.value = formatMoney(0);
    orderPaidAmount.style.display = "none";
    orderPaidAmountLabel.style.display = "none";
});

orderPlayer.addEventListener(
    "change",
    updateOrderFormAvailability
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

window.openCreateOrderModal = openCreateOrderModal;