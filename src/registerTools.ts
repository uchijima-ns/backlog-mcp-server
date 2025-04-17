// registerTools.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { allTools } from "./tools/tools.js";
import { Backlog } from 'backlog-js';
import { TranslationHelper } from "./createTranslationHelper.js";

export function registerTools(server: McpServer, backlog: Backlog, helper: TranslationHelper) {
  const registered = new Set<string>();

  for (const tool of allTools(backlog, helper)) {
    if (registered.has(tool.name)) {
      throw new Error(`Duplicate tool name detected: "${tool.name}"`);
    }

    registered.add(tool.name);
    server.tool(tool.name, tool.description, tool.schema.shape, tool.handler);
  }
}
