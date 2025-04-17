import { allTools } from "./tools/tools.js";
export function registerTools(server, backlog, helper) {
    const registered = new Set();
    for (const tool of allTools(backlog, helper)) {
        if (registered.has(tool.name)) {
            throw new Error(`Duplicate tool name detected: "${tool.name}"`);
        }
        registered.add(tool.name);
        server.tool(tool.name, tool.description, tool.schema.shape, tool.handler);
    }
}
