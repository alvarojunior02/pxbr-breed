const fs = require("fs/promises");
const path = require("path");

const POKEDEX_PATH = path.join(__dirname, "../data/pokedex.json");

const OUTPUT_PATH = path.join(__dirname, "../data/pokedex.updated.json");

const START_ID = 899;
const END_ID = 1025;

function padId(id) {
    return String(id).padStart(3, "0");
}

function formatName(name) {
    return name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function formatStatName(statName) {
    const map = {
        hp: "HP",
        attack: "Attack",
        defense: "Defense",
        "special-attack": "Sp. Attack",
        "special-defense": "Sp. Defense",
        speed: "Speed"
    };

    return map[statName];
}

function formatGender(genderRate) {
    if (genderRate === -1) {
        return "Genderless";
    }

    const femalePercent = (genderRate / 8) * 100;

    const malePercent = 100 - femalePercent;

    return `${malePercent}:${femalePercent}`;
}

function getEnglishFlavorText(species) {
    const entry = species.flavor_text_entries.find((item) => item.language.name === "en");

    return entry ? entry.flavor_text.replace(/\f/g, " ").replace(/\n/g, " ") : "";
}

function getGenus(species) {
    const genus = species.genera.find((item) => item.language.name === "en");

    return genus ? genus.genus : "";
}

function getEvolutionMethod(details) {
    if (!details) {
        return "";
    }

    if (details.min_level) {
        return `Level ${details.min_level}`;
    }

    if (details.item) {
        return `use ${formatName(details.item.name)}`;
    }

    if (details.min_happiness) {
        return "high Friendship";
    }

    if (details.trigger?.name) {
        return formatName(details.trigger.name);
    }

    return "";
}

function findEvolutionNode(chain, pokemonName) {
    if (chain.species.name === pokemonName) {
        return chain;
    }

    for (const child of chain.evolves_to) {
        const found = findEvolutionNode(child, pokemonName);

        if (found) {
            return found;
        }
    }

    return null;
}

function findPreviousEvolution(chain, pokemonName, parent = null) {
    if (chain.species.name === pokemonName) {
        return parent;
    }

    for (const child of chain.evolves_to) {
        const found = findPreviousEvolution(child, pokemonName, chain);

        if (found) {
            return found;
        }
    }

    return null;
}

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Erro ao buscar ${url}: ${response.status}`);
    }

    return response.json();
}

async function buildPokemon(id) {
    const pokemon = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${id}/`);

    const species = await fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);

    const evolutionChain = await fetchJson(species.evolution_chain.url);

    const currentNode = findEvolutionNode(evolutionChain.chain, pokemon.name);

    const previousNode = findPreviousEvolution(evolutionChain.chain, pokemon.name);

    const evolution = {};

    if (previousNode) {
        const prevId = previousNode.species.url.split("/").filter(Boolean).pop();

        const details = currentNode?.evolution_details?.[0];

        evolution.prev = [prevId, getEvolutionMethod(details)];
    }

    if (currentNode?.evolves_to?.length) {
        evolution.next = currentNode.evolves_to.map((child) => {
            const nextId = child.species.url.split("/").filter(Boolean).pop();

            return [nextId, getEvolutionMethod(child.evolution_details?.[0])];
        });
    }

    const base = {};

    pokemon.stats.forEach((stat) => {
        base[formatStatName(stat.stat.name)] = stat.base_stat;
    });

    return {
        id: pokemon.id,

        name: {
            english: formatName(pokemon.name),
            japanese: "",
            chinese: "",
            french: ""
        },

        type: pokemon.types.map((item) => formatName(item.type.name)),

        base,

        species: getGenus(species),

        description: getEnglishFlavorText(species),

        evolution,

        profile: {
            height: `${pokemon.height / 10} m`,

            weight: `${pokemon.weight / 10} kg`,

            egg: species.egg_groups.map((group) => formatName(group.name)),

            ability: pokemon.abilities.map((item) => [
                formatName(item.ability.name),
                String(item.is_hidden)
            ]),

            gender: formatGender(species.gender_rate)
        },

        image: {
            sprite: pokemon.sprites.front_default,

            thumbnail: pokemon.sprites.front_default,

            hires:
                pokemon.sprites.other?.["official-artwork"]?.front_default ||
                pokemon.sprites.front_default
        }
    };
}

async function main() {
    const raw = await fs.readFile(POKEDEX_PATH, "utf-8");

    const currentPokedex = JSON.parse(raw);

    const existingIds = new Set(currentPokedex.map((pokemon) => pokemon.id));

    const newPokemons = [];

    for (let id = START_ID; id <= END_ID; id++) {
        if (existingIds.has(id)) {
            continue;
        }

        console.log(`Buscando Pokémon #${id}...`);

        const pokemon = await buildPokemon(id);

        newPokemons.push(pokemon);
    }

    const updatedPokedex = [...currentPokedex, ...newPokemons].sort((a, b) => a.id - b.id);

    await fs.writeFile(OUTPUT_PATH, JSON.stringify(updatedPokedex, null, 2), "utf-8");

    console.log(`Pokédex atualizada em: ${OUTPUT_PATH}`);

    console.log(`Novos Pokémon adicionados: ${newPokemons.length}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
