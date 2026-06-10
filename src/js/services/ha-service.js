function createOwnedHiddenAbility(data) {
    return {
        id: generateUUID(),
        pokemonId: Number(data.pokemonId),
        pokemonName: data.pokemonName,
        abilityName: data.abilityName,
        sprite: data.sprite || "",
        evolutionLine: data.evolutionLine || [],
        castratedPrice: Number(data.castratedPrice) || 0,
        breedablePrice: Number(data.breedablePrice) || 0,
        notes: data.notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: null
    };
}

function addOwnedHiddenAbility(data) {
    const hiddenAbilities = loadOwnedHiddenAbilities();

    const alreadyExists = hiddenAbilities.some((item) => {
        return (
            Number(item.pokemonId) === Number(data.pokemonId) &&
            item.abilityName === data.abilityName
        );
    });

    if (alreadyExists) {
        showWarningToast("Essa HA já foi cadastrada!");
        return;
    }

    const hiddenAbility = createOwnedHiddenAbility(data);

    hiddenAbilities.push(hiddenAbility);
    saveOwnedHiddenAbilities(hiddenAbilities);
}

function removeOwnedHiddenAbility(hiddenAbilityId) {
    const hiddenAbilities = loadOwnedHiddenAbilities().filter((item) => {
        return item.id !== hiddenAbilityId;
    });

    saveOwnedHiddenAbilities(hiddenAbilities);
}

function updateOwnedHiddenAbility(hiddenAbilityId, data) {
    const hiddenAbilities = loadOwnedHiddenAbilities();

    const updatedHiddenAbilities = hiddenAbilities.map((item) => {
        if (item.id !== hiddenAbilityId) {
            return item;
        }

        return {
            ...item,
            castratedPrice: Number(data.castratedPrice) || 0,
            breedablePrice: Number(data.breedablePrice) || 0,
            notes: data.notes || "",
            updatedAt: new Date().toISOString()
        };
    });

    saveOwnedHiddenAbilities(updatedHiddenAbilities);
}
