const DEFAULT_SETTINGS = {
    showMissingHAWarningOnOrder: true,
    autoFillOwnedHAPriceOnOrder: true
};

const BACKUP_HISTORY_STORAGE_KEY = "pxbrBackupHistory";

const settingShowMissingHAWarning = document.getElementById("settingShowMissingHAWarning");
const settingAutoFillOwnedHAPrice = document.getElementById("settingAutoFillOwnedHAPrice");

const btnSaveSettings = document.getElementById("btnSaveSettings");

const settingsConfirmModal = document.getElementById("settingsConfirmModal");
const settingsChangesPreview = document.getElementById("settingsChangesPreview");
const btnCloseSettingsConfirmModal = document.getElementById("btnCloseSettingsConfirmModal");
const btnConfirmSettingsSave = document.getElementById("btnConfirmSettingsSave");

const btnExportBackup = document.getElementById("btnExportBackup");
const backupImportInput = document.getElementById("backupImportInput");

const backupExportConfirmModal = document.getElementById("backupExportConfirmModal");
const backupExportSummary = document.getElementById("backupExportSummary");
const btnCloseBackupExportModal = document.getElementById("btnCloseBackupExportModal");
const btnConfirmBackupExport = document.getElementById("btnConfirmBackupExport");

const btnOpenBackupHistory = document.getElementById("btnOpenBackupHistory");
const backupHistoryModal = document.getElementById("backupHistoryModal");
const backupHistoryList = document.getElementById("backupHistoryList");
const btnCloseBackupHistoryModal = document.getElementById("btnCloseBackupHistoryModal");

let currentSettings = loadSystemSettings();
let draftSettings = { ...currentSettings };

// LOAD SYSTEM SETTINGS
function loadSystemSettings() {
    return JSON.parse(localStorage.getItem("systemSettings")) || DEFAULT_SETTINGS;
}

// SAVE SYSTEM SETTINGS
function saveSystemSettings(settings) {
    localStorage.setItem("systemSettings", JSON.stringify(settings));
}

// RENDER SETTINGS MODULE
function renderSettingsModule() {
    currentSettings = loadSystemSettings();
    draftSettings = { ...currentSettings };

    settingShowMissingHAWarning.checked = currentSettings.showMissingHAWarningOnOrder;
    settingAutoFillOwnedHAPrice.checked = currentSettings.autoFillOwnedHAPriceOnOrder;

    updateSettingsSaveButton();
}

// HAS SETTINGS CHANGES
function hasSettingsChanges() {
    return (
        currentSettings.showMissingHAWarningOnOrder !== draftSettings.showMissingHAWarningOnOrder ||
        currentSettings.autoFillOwnedHAPriceOnOrder !== draftSettings.autoFillOwnedHAPriceOnOrder
    );
}

// FORMAT BOOLEAN SETTING VALUE
function formatBooleanSettingValue(value) {
    return value ? "Ativado" : "Desativado";
}

// GET SETTINGS CHANGES
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

// RENDER SETTINGS CHANGES PREVIEW
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

// OPEN SETTINGS CONFIRM MODAL
function openSettingsConfirmModal() {
    renderSettingsChangesPreview();

    openModal(settingsConfirmModal);
}

// CLOSE SETTINGS CONFIRM MODAL
function closeSettingsConfirmModal() {
    closeModal(settingsConfirmModal);
}

// CONFIRM SETTINGS SAVE
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

// UPDATE SETTINGS SAVE BUTTON
function updateSettingsSaveButton() {
    btnSaveSettings.disabled = !hasSettingsChanges();
}

// CREATE SYSTEM BACKUP
function createSystemBackup() {
    return {
        version: "1.1.0",
        exportedAt: new Date().toISOString(),
        data: {
            players: loadPlayers(),
            orders: loadOrders(),
            transactions: loadTransactions(),
            ownedHiddenAbilities: loadOwnedHiddenAbilities(),
            ownedPokemons: typeof loadOwnedPokemons === "function" ? loadOwnedPokemons() : [],
            orderStatusHistory:
                typeof loadOrderStatusHistory === "function" ? loadOrderStatusHistory() : [],
            systemSettings: loadSystemSettings()
        }
    };
}

// GET BACKUP SUMMARY
function getBackupSummary() {
    const players = loadPlayers();
    const orders = loadOrders();
    const transactions = loadTransactions();
    const hiddenAbilities = loadOwnedHiddenAbilities();
    const ownedPokemons = typeof loadOwnedPokemons === "function" ? loadOwnedPokemons() : [];
    const orderStatusHistory =
        typeof loadOrderStatusHistory === "function" ? loadOrderStatusHistory() : [];

    return {
        players: players.length,
        orders: orders.length,
        activeOrders: orders.filter((order) => !order.archived).length,
        archivedOrders: orders.filter((order) => order.archived).length,
        transactions: transactions.length,
        hiddenAbilities: hiddenAbilities.length,
        ownedPokemons: ownedPokemons.length,
        orderStatusHistory: orderStatusHistory.length,
        settings: 1
    };
}

// RENDER BACKUP EXPORT SUMMARY
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
                <strong>${summary.ownedPokemons}</strong>
                <span>Pokémons próprios</span>
            </div>

            <div class="backup-summary-item">
                <strong>${summary.orderStatusHistory}</strong>
                <span>Histórico de status</span>
            </div>

            <div class="backup-summary-item">
                <strong>${summary.settings}</strong>
                <span>Configurações</span>
            </div>
        </div>
    `;
}

// OPEN BACKUP EXPORT CONFIRM MODAL
function openBackupExportConfirmModal() {
    renderBackupExportSummary();

    openModal(backupExportConfirmModal);
}

// CLOSE BACKUP EXPORT CONFIRM MODAL
function closeBackupExportConfirmModal() {
    closeModal(backupExportConfirmModal);
}

// LOAD BACKUP HISTORY
function loadBackupHistory() {
    return JSON.parse(localStorage.getItem(BACKUP_HISTORY_STORAGE_KEY)) || [];
}

// SAVE BACKUP HISTORY
function saveBackupHistory(history) {
    localStorage.setItem(BACKUP_HISTORY_STORAGE_KEY, JSON.stringify(history));
}

// CREATE BACKUP HISTORY ENTRY
function createBackupHistoryEntry(fileName, backup) {
    return {
        id: generateUUID(),
        fileName,
        exportedAt: backup.exportedAt,
        summary: {
            players: backup.data.players.length,
            orders: backup.data.orders.length,
            transactions: backup.data.transactions.length,
            ownedHiddenAbilities: backup.data.ownedHiddenAbilities.length,
            ownedPokemons: backup.data.ownedPokemons?.length || 0,
            orderStatusHistory: backup.data.orderStatusHistory?.length || 0,
            settings: backup.data.systemSettings ? 1 : 0
        }
    };
}

// ADD BACKUP HISTORY ENTRY
function addBackupHistoryEntry(fileName, backup) {
    const history = loadBackupHistory();

    const entry = createBackupHistoryEntry(fileName, backup);

    saveBackupHistory([entry, ...history]);
}

// RENDER BACKUP HISTORY
function renderBackupHistory() {
    const history = loadBackupHistory();

    if (history.length === 0) {
        backupHistoryList.innerHTML = `
            <div class="backup-history-empty">
                Nenhum backup exportado neste navegador.
            </div>
        `;

        return;
    }

    backupHistoryList.innerHTML = history
        .map((entry) => {
            return `
                <article class="backup-history-card">
                    <div class="backup-history-header">
                        <div>
                            <strong>
                                ${entry.fileName}
                            </strong>

                            <span>
                                ${formatDateTime(entry.exportedAt)}
                            </span>
                        </div>
                    </div>

                    <div class="backup-history-summary">
                        <span>Clientes: ${entry.summary.players}</span>
                        <span>Encomendas: ${entry.summary.orders}</span>
                        <span>Transações: ${entry.summary.transactions}</span>
                        <span>HAs: ${entry.summary.ownedHiddenAbilities}</span>
                        <span>Pokémons: ${entry.summary.ownedPokemons || 0}</span>
                        <span>Status: ${entry.summary.orderStatusHistory || 0}</span>
                        <span>Configurações: ${entry.summary.settings}</span>
                    </div>
                </article>
            `;
        })
        .join("");
}

// OPEN BACKUP HISTORY MODAL
function openBackupHistoryModal() {
    renderBackupHistory();

    openModal(backupHistoryModal);
}

// CLOSE BACKUP HISTORY MODAL
function closeBackupHistoryModal() {
    closeModal(backupHistoryModal);
}

// EXPORT SYSTEM BACKUP
function exportSystemBackup() {
    const backup = createSystemBackup();

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    const link = document.createElement("a");

    link.href = url;

    const fileName = `pxbr-breed-backup-${timestamp}.json`;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    addBackupHistoryEntry(fileName, backup);

    showSuccessToast("Backup exportado com sucesso!");
}

// IS VALID BACKUP FILE
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

// RESTORE SYSTEM BACKUP
function restoreSystemBackup(backup) {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(backup.data.players));

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(backup.data.orders));

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(backup.data.transactions));

    localStorage.setItem(
        STORAGE_KEYS.OWNED_HIDDEN_ABILITIES,
        JSON.stringify(backup.data.ownedHiddenAbilities)
    );

    localStorage.setItem(
        STORAGE_KEYS.OWNED_POKEMONS,
        JSON.stringify(backup.data.ownedPokemons || [])
    );

    localStorage.setItem(
        STORAGE_KEYS.ORDER_STATUS_HISTORY,
        JSON.stringify(backup.data.orderStatusHistory || [])
    );

    localStorage.setItem("systemSettings", JSON.stringify(backup.data.systemSettings));
}

// REFRESH APP AFTER BACKUP RESTORE
function refreshAppAfterBackupRestore() {
    renderDashboard();
    renderOrdersList();
    renderPlayersModule();
    renderFinanceModule();
    renderPokemonCatalog();
    renderSettingsModule();

    if (typeof renderOwnedPokemonsList === "function") {
        renderOwnedPokemonsList();
    }

    if (typeof renderOwnedHAList === "function") {
        renderOwnedHAList();
    }
}

// IMPORT SYSTEM BACKUP
function importSystemBackup(file) {
    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
        let backup;

        try {
            backup = JSON.parse(event.target.result);
        } catch (error) {
            console.error("Backup JSON parse error:", error);
            showErrorToast("Não foi possível ler o arquivo de backup.");
            backupImportInput.value = "";
            return;
        }

        if (!isValidBackupFile(backup)) {
            showErrorToast("Arquivo de backup inválido.");
            backupImportInput.value = "";
            return;
        }

        const confirmed = confirm(
            "Tem certeza que deseja restaurar este backup? Os dados atuais serão substituídos."
        );

        if (!confirmed) {
            backupImportInput.value = "";
            return;
        }

        try {
            restoreSystemBackup(backup);
            refreshAppAfterBackupRestore();

            showSuccessToast("Backup restaurado com sucesso!");
        } catch (error) {
            console.error("Backup restore error:", error);
            showErrorToast("O backup foi lido, mas houve erro ao restaurar os dados.");
        } finally {
            backupImportInput.value = "";
        }
    };

    reader.onerror = () => {
        showErrorToast("Não foi possível abrir o arquivo de backup.");
        backupImportInput.value = "";
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

btnConfirmSettingsSave.addEventListener("click", confirmSettingsSave);

btnExportBackup.addEventListener("click", openBackupExportConfirmModal);

btnImportBackup.addEventListener("click", () => {
    backupImportInput.click();
});

backupImportInput.addEventListener("change", (event) => {
    const [file] = event.target.files;

    importSystemBackup(file);
});

btnConfirmBackupExport.addEventListener("click", () => {
    exportSystemBackup();
    closeBackupExportConfirmModal();
});

btnOpenBackupHistory.addEventListener("click", openBackupHistoryModal);

renderSettingsModule();

window.renderSettingsModule = renderSettingsModule;
window.loadSystemSettings = loadSystemSettings;
