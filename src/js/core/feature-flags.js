const PXBR_FEATURE_FLAGS = {
    useApiPlayers: localStorage.getItem("pxbrUseApiPlayers") === "true",
    useApiOrders: localStorage.getItem("pxbrUseApiOrders") === "true"
};

// SET FEATURE FLAG
function setPxbrFeatureFlag(flagName, value) {
    PXBR_FEATURE_FLAGS[flagName] = Boolean(value);
    localStorage.setItem(`pxbr${capitalizePxbrFeatureFlag(flagName)}`, String(Boolean(value)));
}

// GET FEATURE FLAG
function getPxbrFeatureFlag(flagName) {
    return Boolean(PXBR_FEATURE_FLAGS[flagName]);
}

// CAPITALIZE FEATURE FLAG
function capitalizePxbrFeatureFlag(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

window.PXBR_FEATURE_FLAGS = PXBR_FEATURE_FLAGS;
window.setPxbrFeatureFlag = setPxbrFeatureFlag;
window.getPxbrFeatureFlag = getPxbrFeatureFlag;
