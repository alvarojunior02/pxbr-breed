const CSV_SEPARATOR = ";";

function escapeCsvValue(value) {
    const stringValue = String(value ?? "");

    if (
        stringValue.includes(CSV_SEPARATOR) ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
    ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
}

function getCsvTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function downloadCsv(fileName, rows) {
    const csvContent = rows.map((row) => row.map(escapeCsvValue).join(CSV_SEPARATOR)).join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}
