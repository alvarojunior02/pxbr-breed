// GET API SETTINGS
async function getApiSettings() {
    const result = await window.PXBRApiClient.get("/settings");

    return unwrapPxbrSettingsApiData(result);
}

// UPDATE API SETTINGS
async function updateApiSettings(settings) {
    const result = await window.PXBRApiClient.patch("/settings", settings);

    return unwrapPxbrSettingsApiData(result);
}

// UNWRAP SETTINGS API DATA
function unwrapPxbrSettingsApiData(result) {
    return result?.data ?? result;
}

window.PXBRSettingsApiService = {
    getSettings: getApiSettings,
    update: updateApiSettings
};
