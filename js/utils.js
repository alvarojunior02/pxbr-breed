function generateUUID() {
    return crypto.randomUUID();
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("pt-BR");
}

function formatCurrency(value) {
    return value.toLocaleString("pt-BR");
}