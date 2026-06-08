const POKEMON_NATURES = [
    { name: "Jolly", positive: "Spe", negative: "SpA", neutral: false },
    { name: "Timid", positive: "Spe", negative: "Atk", neutral: false },
    { name: "Adamant", positive: "Atk", negative: "SpA", neutral: false },
    { name: "Modest", positive: "SpA", negative: "Atk", neutral: false },
    { name: "Bold", positive: "Def", negative: "Atk", neutral: false },
    { name: "Impish", positive: "Def", negative: "SpA", neutral: false },
    { name: "Careful", positive: "SpD", negative: "SpA", neutral: false },

    { name: "Brave", positive: "Atk", negative: "Spe", neutral: false },
    { name: "Calm", positive: "SpD", negative: "Atk", neutral: false },
    { name: "Gentle", positive: "SpD", negative: "Def", neutral: false },
    { name: "Hasty", positive: "Spe", negative: "Def", neutral: false },
    { name: "Lonely", positive: "Atk", negative: "Def", neutral: false },
    { name: "Mild", positive: "SpA", negative: "Def", neutral: false },
    { name: "Naive", positive: "Spe", negative: "SpD", neutral: false },
    { name: "Naughty", positive: "Atk", negative: "SpD", neutral: false },
    { name: "Quiet", positive: "SpA", negative: "Spe", neutral: false },
    { name: "Rash", positive: "SpA", negative: "SpD", neutral: false },
    { name: "Relaxed", positive: "Def", negative: "Spe", neutral: false },
    { name: "Sassy", positive: "SpD", negative: "Spe", neutral: false },

    { name: "Hardy", neutral: true },
    { name: "Docile", neutral: true },
    { name: "Serious", neutral: true },
    { name: "Bashful", neutral: true },
    { name: "Quirky", neutral: true }
];

function createOrder(playerId) {
    return {
        id: generateUUID(),
        playerId,
        discount: 0,
        paid: false,
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
    const row =
        document.createElement("div");

    row.classList.add(
        "pokemon-order-row"
    );

    row.innerHTML = `
        <hr>

        <label>
            Pokémon
        </label>

        <br>

        <input
            type="text"
            class="pokemon-search"
            placeholder="Digite o nome do Pokémon">

        <br><br>

        <label>
            Nature
        </label>

        <br>

        <select
            class="pokemon-nature">

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
            type="number"
            class="pokemon-value"
            value="800000">

        <br><br>

        <label>

            <input
                type="checkbox"
                class="pokemon-breedable">

            Breedável

        </label>

        <br><br>

        <button
            type="button"
            class="btn-remove-pokemon">

            Remover

        </button>
    `;

    const removeButton = row.querySelector(".btn-remove-pokemon");
    const natureSelect = row.querySelector(".pokemon-nature");
    const natureInfo =row.querySelector(".nature-info" );

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

    natureSelect.addEventListener(
        "change",
        updateNatureInfo
    );

    updateNatureInfo();

    removeButton.addEventListener(
        "click",
        () => {
            row.remove();
        }
    );

    pokemonOrderList.appendChild(
        row
    );
}

btnAddPokemon.addEventListener(
    "click",
    () => {
        createPokemonOrderRow();
    }
);

loadPlayersSelect();
createPokemonOrderRow();