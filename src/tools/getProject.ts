import { z } from "zod";
import { Backlog } from 'backlog-js';
import { Output, ToolDefinition } from "../toolDefinition.js";

const schema = {
  projectIdOrKey: z.union([z.string(), z.number()]).describe("Project ID or project key"),
};

export const getProjectTool = (backlog: Backlog): ToolDefinition<typeof schema, Output> => ({
  name: "get_project",
  description: "Returns information about a specific project",
  schema: z.object(schema),
  handler: async ({ projectIdOrKey }) => {
    const project = await backlog.getProject(projectIdOrKey);
    
    return {
      content: [{ type: "text", text: JSON.stringify(project, null, 2) }]
    };
  }
});
