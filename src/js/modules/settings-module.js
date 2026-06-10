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

renderSettingsModule();

window.renderSettingsModule = renderSettingsModule;
window.loadSystemSettings = loadSystemSettings;
