applyMoneyMask(orderPaidAmount);
applyMoneyMask(discountValue);
applyMoneyMask(paymentAmount);

const BREEDABLE_UNDISCOVERED_EXCEPTIONS = [
    489, // Phione
    490 // Manaphy
];

const POKEMON_REGIONAL_FORMS = [
    { value: "", label: "Forma padrão" },
    { value: "ALOLA", label: "Alola" },
    { value: "GALAR", label: "Galar" },
    { value: "HISUI", label: "Hisui" },
    { value: "PALDEA", label: "Paldea" }
];

// IS POKEMON BREEDABLE
function isPokemonBreedable(pokemon) {
    const eggGroups = pokemon.eggGroups || [];

    return !eggGroups.some((eggGroup) => {
        return normalizeEggGroup(eggGroup) === "Undiscovered";
    });
}

// CALCULATE ORDER TOTAL
function calculateOrderTotal() {
    const rows = document.querySelectorAll(".pokemon-order-row");

    let subtotal = 0;

    rows.forEach((row) => {
        const valueInput = row.querySelector(".pokemon-value");

        subtotal += unformatMoney(valueInput.value);
    });

    let discount = 0;

    if (hasDiscount.checked) {
        discount = unformatMoney(discountValue.value);
    }

    const total = subtotal - discount;

    orderTotal.textContent = formatMoney(total);
}

// UPDATE ORDER FORM AVAILABILITY
function updateOrderFormAvailability() {
    const hasSelectedPlayer = Boolean(orderPlayer.value);

    btnAddPokemon.disabled = !hasSelectedPlayer;

    document.querySelectorAll(".pokemon-search").forEach((input) => {
        input.disabled = !hasSelectedPlayer;
    });

    document.querySelectorAll(".btn-remove-pokemon").forEach((button) => {
        button.disabled = !hasSelectedPlayer;
    });
}

// APPLY MONEY MASK
function applyMoneyMask(input) {
    if (!input) {
        return;
    }

    input.addEventListener("input", () => {
        const value = unformatMoney(input.value);

        input.value = formatMoney(value);

        calculateOrderTotal();
    });
}

// UPDATE POKEMON ROW LABELS
function updatePokemonRowLabels() {
    const rows = document.querySelectorAll(".pokemon-order-row");

    rows.forEach((row, index) => {
        const label = row.querySelector(".pokemon-label");

        const removeButton = row.querySelector(".btn-remove-pokemon");

        if (label) {
            label.textContent = `Pokémon ${index + 1}`;
        }

        if (removeButton) {
            removeButton.textContent = "Remover";
        }
    });
}

// POPULATE ABILITY SELECT
function populateAbilitySelect(select, abilities, pokemonId = null) {
    if (!select) {
        console.error("Ability select não encontrado.");
        return;
    }

    select.innerHTML = "";

    const ownedHA = pokemonId ? getOwnedHAByPokemonId(pokemonId) : null;

    const filteredAbilities = abilities.filter((ability) => {
        if (!ability.isHA) {
            return true;
        }

        return Boolean(ownedHA);
    });

    filteredAbilities.forEach((ability) => {
        const option = document.createElement("option");

        option.value = ability.name;

        option.textContent = ability.isHA ? `${ability.name} (HA)` : ability.name;

        option.dataset.isHa = ability.isHA;

        select.appendChild(option);
    });

    select.disabled = false;
}

// GET POKEMON DATA ROW DATA
function getPokemonRowData(row) {
    const valueInput = row.querySelector(".pokemon-value");
    const natureSelect = row.querySelector(".pokemon-nature");
    const abilitySelect = row.querySelector(".pokemon-ability");
    const breedableToggle = row.querySelector(".pokemon-breedable");
    const regionalFormSelect = row.querySelector(".pokemon-regional-form");

    const pokemon = getPokemonById(row.dataset.pokemonId);

    return {
        pokemonId: Number(row.dataset.pokemonId),
        pokemonName: row.dataset.pokemonName,
        sprite: getPokemonThumbnail(pokemon.id, pokemon.sprite),
        breedPokemonId: Number(row.dataset.breedPokemonId),
        breedPokemonName: row.dataset.breedPokemonName,
        nature: natureSelect.value,
        regionalForm: regionalFormSelect?.value || "",
        regionalFormLabel: regionalFormSelect?.selectedOptions?.[0]?.textContent || "Forma padrão",
        ability: {
            name: abilitySelect.value,
            isHA: abilitySelect.selectedOptions[0]?.dataset.isHa === "true"
        },
        value: unformatMoney(valueInput.value),
        breedable: breedableToggle.checked
    };
}

// GET ORDER POKEMONS
function getOrderPokemons() {
    const rows = document.querySelectorAll(".pokemon-order-row");

    return Array.from(rows).map(getPokemonRowData);
}

// BUILD ORDER
function buildOrder() {
    const pokemons = getOrderPokemons();

    const discount = hasDiscount.checked ? unformatMoney(discountValue.value) : 0;

    const subtotal = pokemons.reduce((sum, pokemon) => sum + pokemon.value, 0);

    const observationsInput = document.getElementById("orderObservations");

    const paidAmount = orderPaid.checked ? unformatMoney(orderPaidAmount.value) : 0;

    return {
        id: generateUUID(),
        playerId: orderPlayer.value,
        pokemons,
        subtotal,
        discount,
        total: subtotal - discount,
        observations: observationsInput ? observationsInput.value.trim() : "",
        paidAmount,
        paid: paidAmount >= subtotal - discount,
        archived: false,
        createdAt: new Date().toISOString()
    };
}

// VALIDATE ORDER
function validateOrder(order) {
    if (!order.playerId) {
        showWarningToast("Selecione um player.");

        return false;
    }

    if (order.pokemons.length === 0) {
        showWarningToast("Adicione pelo menos um Pokémon.");

        return false;
    }

    const invalidPokemon = order.pokemons.find((pokemon) => !pokemon.pokemonId);

    if (invalidPokemon) {
        showWarningToast("Selecione todos os Pokémons.");

        return false;
    }

    const invalidValue = order.pokemons.find((pokemon) => pokemon.value <= 0);

    if (invalidValue) {
        showWarningToast("Todos os Pokémons devem possuir valor maior que zero.");

        return false;
    }

    const invalidAbility = order.pokemons.find((pokemon) => !pokemon.ability?.name);

    if (invalidAbility) {
        showWarningToast("Selecione a habilidade de todos os Pokémons.");

        return false;
    }

    if (order.discount > order.subtotal) {
        showWarningToast("O desconto não pode ser maior que o subtotal da encomenda.");

        return false;
    }

    if (order.paidAmount < 0) {
        showWarningToast("O valor pago não pode ser negativo.");

        return false;
    }

    if (orderPaid.checked && order.paidAmount <= 0) {
        showWarningToast("Informe um valor pago maior que zero.");

        return false;
    }

    if (order.paidAmount > order.total) {
        showWarningToast("O valor pago não pode ser maior que o total da encomenda.");

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
    orderPaidAmountWrapper.classList.add("hidden");

    pokemonOrderList.innerHTML = "";

    document.querySelectorAll("input[name='needsFemale']").forEach((radio) => {
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

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredPlayers = players.filter(
        (player) => !normalizedSearch || player.nick.toLowerCase().includes(normalizedSearch)
    );

    filteredPlayers.slice(0, 10).forEach((player) => {
        const item = document.createElement("div");

        item.textContent = player.nick;

        item.classList.add("autocomplete-item");

        item.addEventListener("click", () => {
            orderPlayer.value = player.id;

            orderPlayerSearch.value = player.nick;

            orderPlayerResults.innerHTML = "";

            updateOrderFormAvailability();
            renderSelectedPlayerInfo(player);
        });

        orderPlayerResults.appendChild(item);
    });
}

// RENDER OWNED HA ORDER INFO
function renderOwnedHAOrderInfo(row, pokemon) {
    const container = row.querySelector(".owned-ha-order-info");

    if (!container || !pokemon) {
        return;
    }

    const ownedHA = getOwnedHAByPokemonId(pokemon.id);

    if (!ownedHA) {
        container.classList.add("hidden");
        container.innerHTML = "";
        return;
    }

    const currentEvolutionPokemon = ownedHA.evolutionLine?.find((item) => {
        return Number(item.pokemonId) === Number(pokemon.id);
    });

    container.classList.remove("hidden");

    container.innerHTML = `
        <div class="owned-ha-order-card">
            <strong>
                ✨ HA cadastrada
            </strong>

            <span>
                ${currentEvolutionPokemon?.abilityName || ownedHA.abilityName}
                <small class="pokemon-ha-label">(<span>HA</span>)</small>
            </span>

            <div class="owned-ha-order-values">
                <p>
                    <strong>Castrado:</strong>
                    ${formatMoney(ownedHA.castratedPrice)}
                </p>

                <p>
                    <strong>Breedável:</strong>
                    ${formatMoney(ownedHA.breedablePrice)}
                </p>
            </div>
        </div>
    `;
}

// CREATE OWNED HA ORDER INFO HTML
function createOwnedHAOrderInfoHtml(pokemon) {
    const ownedHA = getOwnedHAByPokemonId(pokemon.id);

    if (ownedHA) {
        const currentEvolutionPokemon = ownedHA.evolutionLine?.find((item) => {
            return Number(item.pokemonId) === Number(pokemon.id);
        });

        return `
            <div class="owned-ha-order-card compact">
                <strong>
                    ✨ HA cadastrada
                </strong>

                <span>
                    ${currentEvolutionPokemon?.abilityName || ownedHA.abilityName}
                    <small class="pokemon-ha-label">(<span>HA</span>)</small>
                </span>

                <div class="owned-ha-order-values">
                    <p>
                        <strong>Castrado:</strong>
                        ${formatMoney(ownedHA.castratedPrice)}
                    </p>

                    <p>
                        <strong>Breedável:</strong>
                        ${formatMoney(ownedHA.breedablePrice)}
                    </p>
                </div>
            </div>
        `;
    }

    const settings = loadSystemSettings();

    if (!settings.showMissingHAWarningOnOrder) {
        return "";
    }

    const pokemonHiddenAbility = pokemon.abilities?.find((ability) => {
        return ability.isHA;
    });

    if (!pokemonHiddenAbility) {
        return "";
    }

    return `
        <div class="owned-ha-order-card compact missing">
            <strong>
                ⚠ HA não cadastrada
            </strong>

            <span>
                ${pokemonHiddenAbility.name}
                <small class="pokemon-ha-label">(<span>HA</span>)</small>
            </span>

            <p>
                Pokémon possui HA, mas não está cadastrada.
            </p>

            <button
                type="button"
                class="button-ha"
                onclick="openAddOwnedHAModal(${pokemon.id}, 'order-form', this.closest('.pokemon-order-row'))">
                Adicionar HA agora
            </button>
        </div>
    `;
}

// FORMAT OWNED POKEMON BREED LEVEL
function formatOwnedPokemonBreedLevel(value) {
    const labels = {
        F6: "F6",
        F5_PFT: "F5 PFT",
        F5: "F5",
        F4: "F4",
        F3: "F3",
        F2: "F2",
        F1: "F1",
        CAPTURED: "Capturado"
    };

    return labels[value] || value;
}

// FORMAT ORDER OWNED POKEMON NATURE
function formatOrderOwnedPokemonNature(natureName) {
    const nature = getNatureByName(natureName);

    if (!nature) {
        return natureName || "-";
    }

    if (nature.neutral) {
        return `${nature.name} (Neutral)`;
    }

    return `${nature.name} (+${nature.positive}, -${nature.negative})`;
}

// GET ORDER OWNED POKEMON HINTS
function getOrderOwnedPokemonHints(pokemon) {
    const ownedPokemons = typeof loadOwnedPokemons === "function" ? loadOwnedPokemons() : [];

    const pokemonEggGroups =
        pokemon.eggGroups?.map((eggGroup) => normalizeEggGroup(eggGroup)) || [];

    const selectedBasePokemon = getBasePokemon(pokemon.id);
    const selectedBasePokemonId = Number(selectedBasePokemon?.id || pokemon.id);

    const ownedFemales = ownedPokemons.filter((item) => {
        const ownedBasePokemon = getBasePokemon(item.pokemonId);
        const ownedBasePokemonId = Number(ownedBasePokemon?.id || item.pokemonId);

        return ownedBasePokemonId === selectedBasePokemonId && item.gender === "FEMALE";
    });

    const ownedMaleF6ByEggGroup = ownedPokemons.filter((item) => {
        const hasCompatibleEggGroup = item.eggGroups?.some((eggGroup) => {
            return pokemonEggGroups.includes(normalizeEggGroup(eggGroup));
        });

        return item.gender === "MALE" && item.breedLevel === "F6" && hasCompatibleEggGroup;
    });

    return {
        ownedFemales,
        ownedMaleF6ByEggGroup
    };
}

// RENDER OWNED POKEMON ORDER HINTS
function renderOwnedPokemonOrderHints(row, pokemon) {
    const container = row.querySelector(".owned-pokemon-order-info");

    if (!container || !pokemon) {
        return;
    }

    const { ownedFemales, ownedMaleF6ByEggGroup } = getOrderOwnedPokemonHints(pokemon);

    const femaleHints = ownedFemales.map((item) => {
        return `
        <li class="owned-pokemon-order-hint">
            <img
                src="${getPokemonThumbnail(item.pokemonId, item.sprite)}"
                alt="${item.pokemonName}">

            <span>
                Você já possui um <strong>${item.pokemonName}</strong>
                fêmea <strong>${formatOwnedPokemonBreedLevel(item.breedLevel)}</strong>
                na nature <strong>${formatOrderOwnedPokemonNature(item.nature)}</strong>.
            </span>
        </li>
    `;
    });

    const maleF6Hints = ownedMaleF6ByEggGroup.map((item) => {
        const compatibleEggGroups = item.eggGroups.filter((eggGroup) => {
            return pokemon.eggGroups?.map(normalizeEggGroup).includes(normalizeEggGroup(eggGroup));
        });

        return `
        <li class="owned-pokemon-order-hint">
            <img
                src="${getPokemonThumbnail(item.pokemonId, item.sprite)}"
                alt="${item.pokemonName}">

            <span>
                Você já possui um <strong>${item.pokemonName}</strong>
                macho <strong>F6</strong>
                ${
                    compatibleEggGroups.length
                        ? `do Egg Group <strong>${compatibleEggGroups.join(", ")}</strong>`
                        : "compatível"
                }
                para breedar.
            </span>
        </li>
    `;
    });

    const hints = [...femaleHints, ...maleF6Hints];

    if (hints.length === 0) {
        container.classList.add("hidden");
        container.innerHTML = "";
        return;
    }

    container.classList.remove("hidden");

    container.innerHTML = `
        <div class="owned-pokemon-order-card">
            <strong>
                📦 Pokémons próprios encontrados
            </strong>

            <ul>
                ${hints.join("")}
            </ul>
        </div>
    `;
}

// APPLY OWNED HA PRICE TO ROW
function applyOwnedHAPriceToRow(row, pokemon) {
    const settings = loadSystemSettings();

    if (!settings.autoFillOwnedHAPriceOnOrder) {
        return;
    }

    const ownedHA = getOwnedHAByPokemonId(pokemon.id);
    const valueInput = row.querySelector(".pokemon-value");
    const breedableToggle = row.querySelector(".pokemon-breedable");
    const abilitySelect = row.querySelector(".pokemon-ability");

    if (!ownedHA || !valueInput || !breedableToggle || !abilitySelect) {
        return;
    }

    const currentEvolutionPokemon = ownedHA.evolutionLine?.find((item) => {
        return Number(item.pokemonId) === Number(pokemon.id);
    });

    const ownedHAAbilityName = currentEvolutionPokemon?.abilityName || ownedHA.abilityName;

    const selectedAbility = abilitySelect.value;

    if (selectedAbility !== ownedHAAbilityName) {
        return;
    }

    const price = breedableToggle.checked ? ownedHA.breedablePrice : ownedHA.castratedPrice;

    valueInput.value = formatMoney(price);

    calculateOrderTotal();
}

// GET DISPLAY POKEMON NAME
function getDisplayPokemonName(pokemon) {
    if (!pokemon) {
        return "N/A";
    }

    if (typeof pokemon.name === "string") {
        return pokemon.name;
    }

    return pokemon.name?.english || "N/A";
}

// CREATE POKEMON ORDER ROW
function createPokemonOrderRow() {
    const row = document.createElement("div");

    row.classList.add("pokemon-order-row");

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
                        Forma regional
                    </label>

                    <select
                        class="pokemon-regional-form"
                        disabled>

                        <option value="">
                            Forma padrão
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

            <div class="owned-ha-order-info hidden"></div>

            <div class="owned-pokemon-order-info hidden"></div>
        </div>
    `;

    const valueInput = row.querySelector(".pokemon-value");
    applyMoneyMask(valueInput);

    valueInput.addEventListener("input", calculateOrderTotal);

    const removeButton = row.querySelector(".btn-remove-pokemon");
    const abilitySelect = row.querySelector(".pokemon-ability");
    const natureSelect = row.querySelector(".pokemon-nature");
    const regionalFormSelect = row.querySelector(".pokemon-regional-form");
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
        regionalFormSelect.disabled = false;
        valueInput.disabled = false;
        breedableToggle.disabled = false;

        pokemonExtraFields.classList.remove("hidden");
        breedableWrapper.classList.remove("hidden");
        removeButton.classList.remove("hidden");
    }

    function populateNatureSelect() {
        natureSelect.innerHTML = "";

        POKEMON_NATURES.forEach((nature) => {
            const option = document.createElement("option");

            option.value = nature.name;

            option.textContent = nature.neutral
                ? `${nature.name} (Neutral)`
                : `${nature.name} (+${nature.positive}, -${nature.negative})`;

            natureSelect.appendChild(option);
        });

        natureSelect.value = POKEMON_NATURES[0].name;
    }

    function populateRegionalFormSelect() {
        regionalFormSelect.innerHTML = "";

        POKEMON_REGIONAL_FORMS.forEach((form) => {
            const option = document.createElement("option");

            option.value = form.value;
            option.textContent = form.label;

            regionalFormSelect.appendChild(option);
        });

        regionalFormSelect.value = "";
    }

    pokemonSearchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.trim();

        pokemonAutocomplete.innerHTML = "";

        if (!searchTerm) {
            return;
        }

        const results = searchPokemon(searchTerm)
            .filter((pokemon) => isPokemonBreedable(pokemon))
            .slice(0, 10);

        results.forEach((pokemon) => {
            const item = document.createElement("div");

            item.innerHTML = `

                        <img
                            src="${getPokemonThumbnail(pokemon.id, pokemon.sprite)}"
                            width="32">

                        #${pokemon.id}
                        ${pokemon.name}

                    `;

            item.style.cursor = "pointer";

            item.addEventListener("click", () => {
                selectedPokemon = pokemon;

                row.dataset.pokemonId = pokemon.id;
                row.dataset.pokemonName = pokemon.name;

                const basePokemon = getBasePokemon(pokemon.id);

                row.dataset.breedPokemonId = basePokemon?.id || pokemon.id;
                row.dataset.breedPokemonName = getDisplayPokemonName(basePokemon || pokemon);

                pokemonSearchInput.value = pokemon.name;

                pokemonAutocomplete.innerHTML = "";

                renderPokemonInfo(pokemon);

                renderOwnedPokemonOrderHints(row, pokemon);

                populateAbilitySelect(abilitySelect, pokemon.abilities, pokemon.id);

                populateNatureSelect();

                populateRegionalFormSelect();

                enablePokemonFields();

                applyOwnedHAPriceToRow(row, pokemon);

                calculateOrderTotal();
            });

            pokemonAutocomplete.appendChild(item);
        });
    });

    abilitySelect.addEventListener("change", () => {
        if (!selectedPokemon) {
            return;
        }

        applyOwnedHAPriceToRow(row, selectedPokemon);
    });

    breedableToggle.addEventListener("change", () => {
        if (!selectedPokemon) {
            return;
        }

        applyOwnedHAPriceToRow(row, selectedPokemon);
    });

    function renderPokemonInfo(pokemon) {
        const basePokemon = getBasePokemon(pokemon.id);

        pokemonSelectedInfo.innerHTML = `
            <div class="pokemon-info-card">
                <div class="pokemon-info-main">
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
                            ${getDisplayPokemonName(basePokemon)}
                        </p>

                        <p>
                            Egg Groups:
                            ${pokemon.eggGroups.map(normalizeEggGroup).join(" / ")}
                        </p>
                    </div>
                </div>

                <div class="pokemon-info-ha">
                    ${createOwnedHAOrderInfoHtml(pokemon)}
                </div>
            </div>
        `;
    }

    removeButton.addEventListener("click", () => {
        row.remove();
        updatePokemonRowLabels();
        calculateOrderTotal();
    });

    calculateOrderTotal();

    updateOrderFormAvailability();

    pokemonOrderList.appendChild(row);

    updatePokemonRowLabels();

    calculateOrderTotal();
}

// REFRESH ORDER POKEMON OWNED HA
function refreshOrderPokemonOwnedHA(row, pokemonId) {
    const pokemon = searchPokemon(String(pokemonId)).find((item) => {
        return Number(item.id) === Number(pokemonId);
    });

    if (!pokemon || !row) {
        return;
    }

    const pokemonSelectedInfo = row.querySelector(".pokemon-selected-info");
    const abilitySelect = row.querySelector(".pokemon-ability");
    const breedableToggle = row.querySelector(".pokemon-breedable");

    const basePokemon = getBasePokemon(pokemon.id);

    pokemonSelectedInfo.innerHTML = `
        <div class="pokemon-info-card">
            <div class="pokemon-info-main">
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
                        ${getDisplayPokemonName(basePokemon || pokemon)}
                    </p>

                    <p>
                        Egg Groups:
                        ${pokemon.eggGroups.join(" / ")}
                    </p>
                </div>
            </div>

            <div class="pokemon-info-ha">
                ${createOwnedHAOrderInfoHtml(pokemon)}
            </div>
        </div>
    `;

    renderOwnedPokemonOrderHints(row, pokemon);

    populateAbilitySelect(abilitySelect, pokemon.abilities, pokemon.id);

    const ownedHA = getOwnedHAByPokemonId(pokemon.id);

    if (ownedHA) {
        const currentEvolutionPokemon = ownedHA.evolutionLine?.find((item) => {
            return Number(item.pokemonId) === Number(pokemon.id);
        });

        const abilityName = currentEvolutionPokemon?.abilityName || ownedHA.abilityName;

        abilitySelect.value = abilityName;
    }

    if (breedableToggle) {
        breedableToggle.checked = false;
    }

    applyOwnedHAPriceToRow(row, pokemon);

    calculateOrderTotal();
}

// RENDER SELECTED PLAYER INFO
function renderSelectedPlayerInfo(player) {
    if (!player) {
        selectedPlayerInfo.innerHTML = "";
        return;
    }

    const summary = getPlayerFinancialSummary(player.id);

    const lastOrder = getPlayerLastOrder(player.id);

    selectedPlayerInfo.innerHTML = `
        <div class="selected-player-card">
            <h3>
                ${renderPlayerInline(player, 32)}
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
    orderSummary.innerHTML = "";

    const player = loadPlayers().find((player) => player.id === order.playerId);

    let html = `
        <div class="order-summary-header">
            <h2>
                Confirmar Encomenda
            </h2>

            <p class="order-summary-player-line">
                <strong>Cliente:</strong>

                ${renderPlayerInline(player, 28)}
            </p>
        </div>

        <h3 class="order-summary-section-title">
            Pokémons
        </h3>
    `;

    html += `<div class="order-summary-pokemon-grid">`;

    order.pokemons.forEach((pokemon) => {
        const nature = getNatureByName(pokemon.nature);

        html += `
                <div class="modal-pokemon">

                    <img
                        src="${getPokemonThumbnail(pokemon.pokemonId, pokemon.sprite)}"
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
                            ${pokemon.breedPokemonName || getDisplayPokemonName(getBasePokemon(pokemon.pokemonId))}
                        </p>

                        ${
                            pokemon.regionalForm
                                ? `
                                    <p>
                                        Forma regional:
                                        <strong>${pokemon.regionalFormLabel}</strong>
                                    </p>
                                `
                                : ""
                        }

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
                            ${formatMoney(pokemon.value)}
                        </p>

                    </div>

                </div>
                `;
    });

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

    orderSummary.innerHTML = html;
}

// OPEN CREATE ORDER MODAL
function openCreateOrderModal() {
    openModal(window.createOrderModal);
}

// CLOSE CREATE ORDER MODAL
function closeCreateOrderModal() {
    resetOrderForm();

    closeModal(window.createOrderModal);
}

// CLOSE ORDER CONFIRMATION MODAL
function closeOrderConfirmationModal() {
    closeModal(orderModal);

    document.querySelectorAll("input[name='needsFemale']").forEach((radio) => {
        radio.checked = false;
    });

    orderObservations.value = "";

    orderPaid.checked = false;
    orderPaidAmount.value = formatMoney(0);
    orderPaidAmountWrapper.classList.add("hidden");

    btnConfirmOrder.disabled = true;
}

// SELECT ORDER PLAYER
function selectOrderPlayer(player) {
    orderPlayer.value = player.id;

    orderPlayerSearch.value = player.nick;

    orderPlayerResults.innerHTML = "";

    renderSelectedPlayerInfo(player);

    updateOrderFormAvailability();
}

btnAddPokemon.addEventListener("click", () => {
    createPokemonOrderRow();
});

hasDiscount.addEventListener("change", () => {
    discountValue.style.display = hasDiscount.checked ? "block" : "none";

    calculateOrderTotal();
});

discountValue.addEventListener("input", calculateOrderTotal);

btnCreateOrder.addEventListener("click", () => {
    const order = buildOrder();

    if (!validateOrder(order)) {
        return;
    }

    renderOrderSummary(order);

    btnConfirmOrder.disabled = true;

    document
        .querySelectorAll("input[name='needsFemale']")
        .forEach((radio) => (radio.checked = false));

    openModal(window.orderModal);
});

btnOpenCreateOrderModal.forEach((button) => {
    button.addEventListener("click", openCreateOrderModal);
});

btnClearCreateOrder.addEventListener("click", resetOrderForm);

btnConfirmOrder.addEventListener("click", () => {
    const orderData = buildOrder();

    const order = createPersistedOrder(orderData);

    saveOrder(order);

    showSuccessToast("Encomenda cadastrada com sucesso!");

    if (order.paidAmount > 0) {
        const transaction = createOrderPaymentTransaction({
            amount: order.paidAmount,

            playerId: order.playerId,

            orderId: order.id
        });

        saveTransaction(transaction);
    }

    renderDashboard();
    renderOrdersList();
    renderPlayersModule();
    renderFinanceModule();

    resetOrderForm();

    orderModal.classList.add("hidden");

    closeCreateOrderModal();

    showSection("ordersSection");
});

orderPlayerSearch.addEventListener("input", (e) => {
    orderPlayer.value = "";

    renderSelectedPlayerInfo(null);

    updateOrderFormAvailability();

    renderPlayerSearchResults(e.target.value);
});

orderPlayerSearch.addEventListener("focus", () => {
    renderPlayerSearchResults(orderPlayerSearch.value);
});

orderPaid.addEventListener("change", () => {
    if (orderPaid.checked) {
        const total = unformatMoney(orderTotal.textContent);

        orderPaidAmount.value = formatMoney(total);

        orderPaidAmountWrapper.classList.remove("hidden");

        return;
    }

    orderPaidAmount.value = formatMoney(0);

    orderPaidAmountWrapper.classList.add("hidden");
});

orderPlayer.addEventListener("change", updateOrderFormAvailability);

btnQuickNewPlayer.addEventListener("click", () => {
    openNewPlayerModal(true);
});

document.querySelectorAll("input[name='needsFemale']").forEach((radio) => {
    radio.addEventListener("change", () => {
        btnConfirmOrder.disabled = false;
    });
});

window.openCreateOrderModal = openCreateOrderModal;
window.closeCreateOrderModal = closeCreateOrderModal;
window.closeOrderConfirmationModal = closeOrderConfirmationModal;
window.selectOrderPlayer = selectOrderPlayer;
window.refreshOrderPokemonOwnedHA = refreshOrderPokemonOwnedHA;
