const DEFAULT_SETTINGS = {
    showMissingHAWarningOnOrder: true,
    autoFillOwnedHAPriceOnOrder: true
};

const settingShowMissingHAWarning = document.getElementById("settingShowMissingHAWarning");
const settingAutoFillOwnedHAPrice = document.getElementById("settingAutoFillOwnedHAPrice");

const btnSaveSettings = document.getElementById("btnSaveSettings");

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

    saveSystemSettings(draftSettings);

    showSuccessToast("Configurações salvas com sucesso!");

    renderSettingsModule();
});

renderSettingsModule();

window.renderSettingsModule = renderSettingsModule;
window.loadSystemSettings = loadSystemSettings;
