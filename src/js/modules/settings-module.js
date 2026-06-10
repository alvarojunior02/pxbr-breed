const DEFAULT_SETTINGS = {
    showMissingHAWarningOnOrder: true,
    autoFillOwnedHAPriceOnOrder: true
};

const settingShowMissingHAWarning = document.getElementById("settingShowMissingHAWarning");
const settingAutoFillOwnedHAPrice = document.getElementById("settingAutoFillOwnedHAPrice");

const btnSaveSettings = document.getElementById("btnSaveSettings");

const settingsConfirmModal = document.getElementById("settingsConfirmModal");
const settingsChangesPreview = document.getElementById("settingsChangesPreview");
const btnCloseSettingsConfirmModal = document.getElementById("btnCloseSettingsConfirmModal");
const btnCancelSettingsConfirm = document.getElementById("btnCancelSettingsConfirm");
const btnConfirmSettingsSave = document.getElementById("btnConfirmSettingsSave");

const btnExportBackup = document.getElementById("btnExportBackup");
const backupImportInput = document.getElementById("backupImportInput");

const backupExportConfirmModal = document.getElementById("backupExportConfirmModal");
const backupExportSummary = document.getElementById("backupExportSummary");
const btnCloseBackupExportModal = document.getElementById("btnCloseBackupExportModal");
const btnCancelBackupExport = document.getElementById("btnCancelBackupExport");
const btnConfirmBackupExport = document.getElementById("btnConfirmBackupExport");

let currentSettings = loadSystemSettings();
let draftSettings = { ...currentSettings };

function loadSystemSettings() {
    return JSON.parse(localStorage.getItem("systemSettings")) || DEFAULT_SETTINGS;
}

function saveSystemSettings(settings) {
    localStorage.setItem("systemSettings", JSON.stringify(settings));
}

function renderSettingsModule() {
    currentSettings = loadSystemSettings();
    draftSettings = { ...currentSettings };

    settingShowMissingHAWarning.checked = currentSettings.showMissingHAWarningOnOrder;
    settingAutoFillOwnedHAPrice.checked = currentSettings.autoFillOwnedHAPriceOnOrder;

    updateSettingsSaveButton();
}

function hasSettingsChanges() {
    return (
        currentSettings.showMissingHAWarningOnOrder !== draftSettings.showMissingHAWarningOnOrder ||
        currentSettings.autoFillOwnedHAPriceOnOrder !== draftSettings.autoFillOwnedHAPriceOnOrder
    );
}

function formatBooleanSettingValue(value) {
    return value ? "Ativado" : "Desativado";
}

function getSettingsChanges() {
    const changes = [];

    if (currentSettings.showMissingHAWarningOnOrder !== draftSettings.showMissingHAWarningOnOrder) {
        changes.push({
            label: "Exibir aviso de HA não cadastrada ao criar Nova Encomenda",
            before: formatBooleanSettingValue(currentSettings.showMissingHAWarningOnOrder),
            after: formatBooleanSettingValue(draftSettings.showMissingHAWarningOnOrder)
        });
    }

    if (currentSettings.autoFillOwnedHAPriceOnOrder !== draftSettings.autoFillOwnedHAPriceOnOrder) {
        changes.push({
            label: "Preencher automaticamente valores de HA na Nova Encomenda",
            before: formatBooleanSettingValue(currentSettings.autoFillOwnedHAPriceOnOrder),
            after: formatBooleanSettingValue(draftSettings.autoFillOwnedHAPriceOnOrder)
        });
    }

    return changes;
}

function renderSettingsChangesPreview() {
    const changes = getSettingsChanges();

    if (changes.length === 0) {
        settingsChangesPreview.innerHTML = `
            <p class="empty-state">
                Nenhuma configuração foi alterada.
            </p>
        `;

        return;
    }

    settingsChangesPreview.innerHTML = changes
        .map((change) => {
            return `
                <div class="settings-change-item">
                    <strong>${change.label}</strong>

                    <div class="settings-change-values">
                        <span class="settings-change-before">
                            Antes: ${change.before}
                        </span>

                        <span class="settings-change-arrow">→</span>

                        <span class="settings-change-after">
                            Depois: ${change.after}
                        </span>
                    </div>
                </div>
            `;
        })
        .join("");
}

function openSettingsConfirmModal() {
    renderSettingsChangesPreview();

    settingsConfirmModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

function closeSettingsConfirmModal() {
    settingsConfirmModal.classList.add("hidden");

    const hasVisibleModal = document.querySelector(".modal:not(.hidden)");

    if (!hasVisibleModal) {
        document.body.classList.remove("modal-open");
    }
}

function confirmSettingsSave() {
    if (!hasSettingsChanges()) {
        showWarningToast("Nenhuma configuração foi alterada.");
        closeSettingsConfirmModal();
        return;
    }

    saveSystemSettings(draftSettings);

    showSuccessToast("Configurações salvas com sucesso!");

    closeSettingsConfirmModal();

    renderSettingsModule();
}

function updateSettingsSaveButton() {
    btnSaveSettings.disabled = !hasSettingsChanges();
}

function createSystemBackup() {
    return {
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        data: {
            players: loadPlayers(),
            orders: loadOrders(),
            transactions: loadTransactions(),
            ownedHiddenAbilities: loadOwnedHiddenAbilities(),
            systemSettings: loadSystemSettings()
        }
    };
}

function getBackupSummary() {
    const players = loadPlayers();
    const orders = loadOrders();
    const transactions = loadTransactions();
    const hiddenAbilities = loadOwnedHiddenAbilities();

    return {
        players: players.length,
        orders: orders.length,
        activeOrders: orders.filter((order) => !order.archived).length,
        archivedOrders: orders.filter((order) => order.archived).length,
        transactions: transactions.length,
        hiddenAbilities: hiddenAbilities.length,
        settings: 1
    };
}

function renderBackupExportSummary() {
    const summary = getBackupSummary();

    backupExportSummary.innerHTML = `
        <div class="backup-summary-grid">
            <div class="backup-summary-item">
                <strong>${summary.players}</strong>
                <span>Clientes cadastrados</span>
            </div>

            <div class="backup-summary-item">
                <strong>${summary.orders}</strong>
                <span>Encomendas totais</span>
            </div>

            <div class="backup-summary-item">
                <strong>${summary.activeOrders}</strong>
                <span>Encomendas ativas</span>
            </div>

            <div class="backup-summary-item">
                <strong>${summary.archivedOrders}</strong>
                <span>Encomendas arquivadas</span>
            </div>

            <div class="backup-summary-item">
                <strong>${summary.transactions}</strong>
                <span>Transações</span>
            </div>

            <div class="backup-summary-item">
                <strong>${summary.hiddenAbilities}</strong>
                <span>HAs cadastradas</span>
            </div>

            <div class="backup-summary-item">
                <strong>${summary.settings}</strong>
                <span>Configurações</span>
            </div>
        </div>
    `;
}

function openBackupExportConfirmModal() {
    renderBackupExportSummary();

    backupExportConfirmModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

function closeBackupExportConfirmModal() {
    backupExportConfirmModal.classList.add("hidden");

    const hasVisibleModal = document.querySelector(".modal:not(.hidden)");

    if (!hasVisibleModal) {
        document.body.classList.remove("modal-open");
    }
}

function exportSystemBackup() {
    const backup = createSystemBackup();

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    const link = document.createElement("a");

    link.href = url;
    link.download = `pxbr-breed-backup-${timestamp}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showSuccessToast("Backup exportado com sucesso!");
}

function isValidBackupFile(backup) {
    return (
        backup &&
        backup.data &&
        Array.isArray(backup.data.players) &&
        Array.isArray(backup.data.orders) &&
        Array.isArray(backup.data.transactions) &&
        Array.isArray(backup.data.ownedHiddenAbilities) &&
        typeof backup.data.systemSettings === "object"
    );
}

function restoreSystemBackup(backup) {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(backup.data.players));

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(backup.data.orders));

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(backup.data.transactions));

    localStorage.setItem(
        STORAGE_KEYS.OWNED_HIDDEN_ABILITIES,
        JSON.stringify(backup.data.ownedHiddenAbilities)
    );

    localStorage.setItem("systemSettings", JSON.stringify(backup.data.systemSettings));
}

function refreshAppAfterBackupRestore() {
    renderDashboard();
    renderOrdersList();
    renderPlayersModule();
    renderFinanceModule();
    renderPokemonCatalog();
    renderSettingsModule();
}

function importSystemBackup(file) {
    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const backup = JSON.parse(event.target.result);

            if (!isValidBackupFile(backup)) {
                showErrorToast("Arquivo de backup inválido.");
                return;
            }

            const confirmed = confirm(
                "Tem certeza que deseja restaurar este backup? Os dados atuais serão substituídos."
            );

            if (!confirmed) {
                return;
            }

            restoreSystemBackup(backup);

            refreshAppAfterBackupRestore();

            showSuccessToast("Backup restaurado com sucesso!");
        } catch (error) {
            showErrorToast("Não foi possível ler o arquivo de backup.");
        } finally {
            backupImportInput.value = "";
        }
    };

    reader.readAsText(file);
}

settingShowMissingHAWarning.addEventListener("change", () => {
    draftSettings.showMissingHAWarningOnOrder = settingShowMissingHAWarning.checked;

    updateSettingsSaveButton();
});

settingAutoFillOwnedHAPrice.addEventListener("change", () => {
    draftSettings.autoFillOwnedHAPriceOnOrder = settingAutoFillOwnedHAPrice.checked;

    updateSettingsSaveButton();
});

btnSaveSettings.addEventListener("click", () => {
    if (!hasSettingsChanges()) {
        showWarningToast("Nenhuma configuração foi alterada.");
        return;
    }

    openSettingsConfirmModal();
});

btnCloseSettingsConfirmModal.addEventListener("click", closeSettingsConfirmModal);

btnCancelSettingsConfirm.addEventListener("click", closeSettingsConfirmModal);

btnConfirmSettingsSave.addEventListener("click", confirmSettingsSave);

btnExportBackup.addEventListener("click", openBackupExportConfirmModal);

btnImportBackup.addEventListener("click", () => {
    backupImportInput.click();
});

btnCloseBackupExportModal.addEventListener("click", closeBackupExportConfirmModal);

btnCancelBackupExport.addEventListener("click", closeBackupExportConfirmModal);

btnConfirmBackupExport.addEventListener("click", () => {
    exportSystemBackup();
    closeBackupExportConfirmModal();
});

renderSettingsModule();

window.renderSettingsModule = renderSettingsModule;
window.loadSystemSettings = loadSystemSettings;
