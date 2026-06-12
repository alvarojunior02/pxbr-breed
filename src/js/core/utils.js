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

window.formatMoney = formatMoney;
window.formatDateTime = formatDateTime;
