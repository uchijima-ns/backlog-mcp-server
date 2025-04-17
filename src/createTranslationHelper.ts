import { cosmiconfigSync } from "cosmiconfig";

export interface TranslationHelper {
  t: (key: string, fallback: string) => string;
}

export function createTranslationHelper(options?: {
  configName?: string;
}): TranslationHelper {
  const usedKeys: Record<string, string> = {};

  const configName = options?.configName ?? 'backlog-mcp-server';

  // Load config file
  const explorer = cosmiconfigSync(configName);
  const configResult = explorer.search();
  const config = configResult?.config || {};

  function toEnvKey(key: string): string {
    return `BACKLOG_MCP_${key}`;
  }

  function t(key: string, fallback: string): string {
    const upperKey = key.toUpperCase();

    if (usedKeys[upperKey]) {
      return usedKeys[upperKey];
    }

    // Priority：ENV → config → fallback
    const value =
      process.env[toEnvKey(upperKey)] ||
      config[upperKey] ||
      fallback;

    usedKeys[upperKey] = value;
    return value;
  }

  return { t };
}