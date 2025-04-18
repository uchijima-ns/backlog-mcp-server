import { cosmiconfigSync } from "cosmiconfig";
import os from "os";
export function createTranslationHelper(options) {
    const usedKeys = {};
    const configName = options?.configName ?? 'backlog-mcp-server';
    // Load config file
    const explorer = cosmiconfigSync(configName);
    const searchPath = options?.searchDir ?? os.homedir();
    const configResult = explorer.search(searchPath);
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
        return { ...usedKeys };
    }
    return { t, dump };
}
