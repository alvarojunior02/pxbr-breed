// EXPORT API BACKUP
async function exportApiBackup() {
    const result = await window.PXBRApiClient.get("/backup/export");

    return unwrapPxbrBackupApiData(result);
}

// IMPORT API BACKUP
async function importApiBackup(backup) {
    const result = await window.PXBRApiClient.post("/backup/import", backup);

    return unwrapPxbrBackupApiData(result);
}

// UNWRAP BACKUP API DATA
function unwrapPxbrBackupApiData(result) {
    return result?.data ?? result;
}

window.PXBRBackupApiService = {
    exportBackup: exportApiBackup,
    importBackup: importApiBackup
};
