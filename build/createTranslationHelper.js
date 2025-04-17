import { cosmiconfigSync } from "cosmiconfig";
export function createTranslationHelper(options) {
    const usedKeys = {};
    const configName = options?.configName ?? 'backlog-mcp-server';
    // Load config file
    const explorer = cosmiconfigSync(configName);
    const configResult = explorer.search();
    const config = configResult?.config || {};
    function toEnvKey(key) {
        return `BACKLOG_MCP_${key}`;
    }
    function t(key, fallback) {
        const upperKey = key.toUpperCase();
        if (usedKeys[upperKey]) {
            return usedKeys[upperKey];
        }
        // Priority：ENV → config → fallback
        const value = process.env[toEnvKey(upperKey)] ||
            config[upperKey] ||
            fallback;
        usedKeys[upperKey] = value;
        return value;
    }
    function dump() {
        console.log('[translation] Used keys:\n' + JSON.stringify(usedKeys, null, 2));
    }
    return { t };
}
