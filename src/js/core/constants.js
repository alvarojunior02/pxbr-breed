const ORDER_STATUS = [
    {
        id: 1,
        value: "NEEDS_FEMALE",
        name: "Precisa Capturar Fêmea",
        cssClass: "status-needs-female"
    },
    {
        id: 2,
        value: "READY_TO_START",
        name: "A Começar",
        cssClass: "status-ready"
    },
    {
        id: 3,
        value: "IN_PROGRESS",
        name: "Em Andamento",
        cssClass: "status-progress"
    },
    {
        id: 4,
        value: "READY",
        name: "Pronto",
        cssClass: "status-done"
    },
    {
        id: 5,
        value: "DELIVERED",
        name: "Entregue",
        cssClass: "status-delivered"
    }
];

const DEFAULT_POKEMON_PRICE = 800000;

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

    { name: "Hardy", positive: null, negative: null, neutral: true },
    { name: "Docile", positive: null, negative: null, neutral: true },
    { name: "Serious", positive: null, negative: null, neutral: true },
    { name: "Bashful", positive: null, negative: null, neutral: true },
    { name: "Quirky", positive: null, negative: null, neutral: true }
];

// GET STATUS BY VALUE
function getStatusByValue(value) {
    return ORDER_STATUS.find((status) => status.value === value);
}

// GET NATURE BY NAME
function getNatureByName(name) {
    return POKEMON_NATURES.find((nature) => nature.name === name);
}

// GET NEXT STATUS
function getNextStatus(currentValue) {
    const currentIndex = ORDER_STATUS.findIndex((status) => status.value === currentValue);

    return ORDER_STATUS[currentIndex + 1] || null;
}

// IS LAST STATUS
function isLastStatus(value) {
    const lastStatus = ORDER_STATUS[ORDER_STATUS.length - 1];

    return value === lastStatus.value;
}

// GET FIRST STATUS
function getFirstStatus() {
    return ORDER_STATUS[0];
}

// IS FIRST STATUS
function isFirstStatus(value) {
    const firstStatus = ORDER_STATUS[0];

    return value === firstStatus.value;
}

// GET ORDER STATUS CLASS
function getOrderStatusClass(statusValue) {
    return getStatusByValue(statusValue)?.cssClass ?? "";
}

const POKEMON_REGIONAL_FORMS_BY_ID = {
    19: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Rattata de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/rattata-alola.png"
        }
    ],
    20: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Raticate de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/raticate-alola.png"
        }
    ],
    26: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Raichu de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/raichu-alola.png"
        }
    ],
    27: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Sandshrew de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/sandshrew-alola.png"
        }
    ],
    28: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Sandslash de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/sandslash-alola.png"
        }
    ],
    37: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Vulpix de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/vulpix-alola.png"
        }
    ],
    38: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Ninetales de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/ninetales-alola.png"
        }
    ],
    50: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Diglett de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/diglett-alola.png"
        }
    ],
    51: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Dugtrio de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/dugtrio-alola.png"
        }
    ],
    52: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Meowth de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/meowth-alola.png"
        },
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Meowth de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/meowth-galar.png"
        }
    ],
    53: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Persian de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/persian-alola.png"
        }
    ],
    58: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Growlithe de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/growlithe-hisui.png"
        }
    ],
    59: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Arcanine de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/arcanine-hisui.png"
        }
    ],
    74: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Geodude de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/geodude-alola.png"
        }
    ],
    75: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Graveler de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/graveler-alola.png"
        }
    ],
    76: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Golem de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/golem-alola.png"
        }
    ],
    77: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Ponyta de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/ponyta-galar.png"
        }
    ],
    78: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Rapidash de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/rapidash-galar.png"
        }
    ],
    79: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Slowpoke de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/slowpoke-galar.png"
        }
    ],
    80: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Slowbro de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/slowbro-galar.png"
        }
    ],
    83: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Farfetch'd de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/farfetchd-galar.png"
        }
    ],
    88: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Grimer de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/grimer-alola.png"
        }
    ],
    89: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Muk de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/muk-alola.png"
        }
    ],
    100: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Voltorb de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/voltorb-hisui.png"
        }
    ],
    101: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Electrode de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/electrode-hisui.png"
        }
    ],
    103: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Exeggutor de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/exeggutor-alola.png"
        }
    ],
    105: [
        {
            value: "ALOLA",
            label: "Alola",
            displayName: "Marowak de Alola",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/marowak-alola.png"
        }
    ],
    110: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Weezing de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/weezing-galar.png"
        }
    ],
    122: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Mr. Mime de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/mrmime-galar.png"
        }
    ],
    128: [
        {
            value: "PALDEA_COMBAT",
            label: "Paldea - Combat Breed",
            displayName: "Tauros de Paldea - Combat Breed",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/tauros-paldea-combat.png"
        },
        {
            value: "PALDEA_BLAZE",
            label: "Paldea - Blaze Breed",
            displayName: "Tauros de Paldea - Blaze Breed",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/tauros-paldea-blaze.png"
        },
        {
            value: "PALDEA_AQUA",
            label: "Paldea - Aqua Breed",
            displayName: "Tauros de Paldea - Aqua Breed",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/tauros-paldea-aqua.png"
        }
    ],
    144: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Articuno de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/articuno-galar.png"
        }
    ],
    145: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Zapdos de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/zapdos-galar.png"
        }
    ],
    146: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Moltres de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/moltres-galar.png"
        }
    ],
    157: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Typhlosion de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/typhlosion-hisui.png"
        }
    ],
    194: [
        {
            value: "PALDEA",
            label: "Paldea",
            displayName: "Wooper de Paldea",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/wooper-paldea.png"
        }
    ],
    199: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Slowking de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/slowking-galar.png"
        }
    ],
    211: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Qwilfish de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/qwilfish-hisui.png"
        }
    ],
    215: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Sneasel de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/sneasel-hisui.png"
        }
    ],
    222: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Corsola de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/corsola-galar.png"
        }
    ],
    263: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Zigzagoon de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/zigzagoon-galar.png"
        }
    ],
    264: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Linoone de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/linoone-galar.png"
        }
    ],
    503: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Samurott de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/samurott-hisui.png"
        }
    ],
    549: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Lilligant de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/lilligant-hisui.png"
        }
    ],
    550: [
        {
            value: "HISUI_WHITE_STRIPED",
            label: "Hisui - White-Striped",
            displayName: "Basculin White-Striped",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/basculin-whitestriped.png"
        }
    ],
    554: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Darumaka de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/darumaka-galar.png"
        }
    ],
    555: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Darmanitan de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/darmanitan-galar.png"
        }
    ],
    562: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Yamask de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/yamask-galar.png"
        }
    ],
    570: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Zorua de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/zorua-hisui.png"
        }
    ],
    571: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Zoroark de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/zoroark-hisui.png"
        }
    ],
    618: [
        {
            value: "GALAR",
            label: "Galar",
            displayName: "Stunfisk de Galar",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/stunfisk-galar.png"
        }
    ],
    628: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Braviary de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/braviary-hisui.png"
        }
    ],
    705: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Sliggoo de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/sliggoo-hisui.png"
        }
    ],
    706: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Goodra de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/goodra-hisui.png"
        }
    ],
    713: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Avalugg de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/avalugg-hisui.png"
        }
    ],
    724: [
        {
            value: "HISUI",
            label: "Hisui",
            displayName: "Decidueye de Hisui",
            sprite: "https://play.pokemonshowdown.com/sprites/dex/decidueye-hisui.png"
        }
    ]
};

// GET POKEMON REGIONAL FORMS
function getPokemonRegionalForms(pokemonId) {
    return POKEMON_REGIONAL_FORMS_BY_ID[Number(pokemonId)] || [];
}

// HAS POKEMON REGIONAL FORMS
function hasPokemonRegionalForms(pokemonId) {
    return getPokemonRegionalForms(pokemonId).length > 0;
}

// GET POKEMON REGIONAL FORM
function getPokemonRegionalForm(pokemonId, regionalFormValue) {
    return getPokemonRegionalForms(pokemonId).find((form) => {
        return form.value === regionalFormValue;
    });
}

// GET POKEMON REGIONAL FORM SPRITE
function getPokemonRegionalFormSprite(pokemonId, regionalFormValue, fallbackSprite = "") {
    const regionalForm = getPokemonRegionalForm(pokemonId, regionalFormValue);

    return regionalForm?.sprite || fallbackSprite;
}

window.ORDER_STATUS = ORDER_STATUS;
window.getOrderStatusClass = getOrderStatusClass;

window.POKEMON_REGIONAL_FORMS_BY_ID = POKEMON_REGIONAL_FORMS_BY_ID;
window.getPokemonRegionalForms = getPokemonRegionalForms;
window.hasPokemonRegionalForms = hasPokemonRegionalForms;
window.getPokemonRegionalForm = getPokemonRegionalForm;
window.getPokemonRegionalFormSprite = getPokemonRegionalFormSprite;
