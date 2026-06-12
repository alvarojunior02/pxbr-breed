// GENERATE UUID
function generateUUID() {
    return crypto.randomUUID();
}

// FORMAT DATE
function formatDate(date) {
    return new Date(date).toLocaleDateString("pt-BR");
}

// FORMAT CURRENCY
function formatCurrency(value) {
    return value.toLocaleString("pt-BR");
}

// FORMAT MONEY
function formatMoney(value) {
    return `$ ${Number(value).toLocaleString("pt-BR")}`;
}

// UNFORMAT MONEY
function unformatMoney(value) {
    return Number(value.replace(/\D/g, "")) || 0;
}

// FORMAT DATE TIME
function formatDateTime(date) {
    return new Date(date).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

// RENDER PLAYER AVATAR
function renderPlayerAvatar(player, size = 28) {
    if (!player) {
        return "";
    }

    const avatarUrl = player.avatarUrl || getMinecraftAvatarUrl(player.nick);

    return `
        <img
            src="${avatarUrl}"
            alt="${player.nick}"
            class="inline-player-avatar"
            style="width: ${size}px; height: ${size}px;"
            onerror="this.src='${getDefaultMinecraftAvatarUrl()}'">
    `;
}

// RENDER PLAYER INLINE
function renderPlayerInline(player, size = 28) {
    if (!player) {
        return `<span>-</span>`;
    }

    return `
        <span class="inline-player">
            ${renderPlayerAvatar(player, size)}

            <span>
                ${player.nick}
            </span>
        </span>
    `;
}

// IS VALID IMAGE SRC
function isValidImageSrc(src) {
    return (
        typeof src === "string" &&
        src.trim() !== "" &&
        src !== "undefined" &&
        src !== "null" &&
        src !== "[object Object]"
    );
}

// GET POKEMON SPRITE
function getPokemonSprite(pokemonId, fallbackSprite = "") {
    const normalizedPokemonId = Number(pokemonId);

    const pokemon =
        typeof getPokemonById === "function" && !Number.isNaN(normalizedPokemonId)
            ? getPokemonById(normalizedPokemonId)
            : null;

    const spriteCandidates = [
        fallbackSprite,
        pokemon?.image?.thumbnail,
        pokemon?.image?.sprite,
        pokemon?.image?.hires,
        pokemon?.thumbnail,
        pokemon?.sprite,
        pokemon?.hires
    ];

    const validSprite = spriteCandidates.find((src) => isValidImageSrc(src));

    if (validSprite) {
        return validSprite;
    }

    if (!Number.isNaN(normalizedPokemonId) && normalizedPokemonId > 0) {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${normalizedPokemonId}.png`;
    }

    return "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
}

// GET POKEMON THUMBNAIL
function getPokemonThumbnail(pokemonId, fallbackSprite = "") {
    return getPokemonSprite(pokemonId, fallbackSprite);
}

window.formatMoney = formatMoney;
window.formatDateTime = formatDateTime;
window.getPokemonSprite = getPokemonSprite;
window.getPokemonThumbnail = getPokemonThumbnail;
