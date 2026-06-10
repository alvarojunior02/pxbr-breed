function generateUUID() {
    return crypto.randomUUID();
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("pt-BR");
}

function formatCurrency(value) {
    return value.toLocaleString("pt-BR");
}

function formatMoney(value) {
    return `$ ${Number(value).toLocaleString("pt-BR")}`;
}

function unformatMoney(value) {
    return Number(value.replace(/\D/g, "")) || 0;
}

function formatDateTime(date) {
    return new Date(date).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

window.formatMoney = formatMoney;
window.formatDateTime = formatDateTime;
