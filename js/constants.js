const ORDER_STATUS = [
    {
        id: 1,
        value: "NEEDS_FEMALE",
        name: "Precisa Capturar Fêmea"
    },
    {
        id: 2,
        value: "READY_TO_START",
        name: "A Começar"
    },
    {
        id: 3,
        value: "IN_PROGRESS",
        name: "Em Andamento"
    },
    {
        id: 4,
        value: "READY",
        name: "Pronto"
    },
    {
        id: 5,
        value: "DELIVERED",
        name: "Entregue"
    }

];

const DEFAULT_POKEMON_PRICE =
    800000;

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

function getStatusByValue(value) {
    return ORDER_STATUS.find(
        status =>
            status.value === value
    );
}

function getNextStatus(currentValue) {

    const currentIndex =
        ORDER_STATUS.findIndex(
            status =>
                status.value === currentValue
        );

    return ORDER_STATUS[
        currentIndex + 1
    ] || null;
}