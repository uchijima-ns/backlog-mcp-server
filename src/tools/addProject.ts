import { z } from "zod";
import { Backlog } from 'backlog-js';
import { Output, ToolDefinition } from "../toolDefinition.js";

const schema = {
  name: z.string().describe("Project name"),
  key: z.string().describe("Project key"),
  chartEnabled: z.boolean().optional().describe("Whether to enable chart (default: false)"),
  subtaskingEnabled: z.boolean().optional().describe("Whether to enable subtasking (default: false)"),
  projectLeaderCanEditProjectLeader: z.boolean().optional().describe("Whether project leaders can edit other project leaders (default: false)"),
  textFormattingRule: z.enum(["backlog", "markdown"]).optional().describe("Text formatting rule (default: 'backlog')"),
};

export const addProjectTool = (backlog: Backlog): ToolDefinition<typeof schema, Output> => ({
  name: "add_project",
  description: "Creates a new project",
  schema: z.object(schema),
  handler: async ({ name, key, chartEnabled, subtaskingEnabled, projectLeaderCanEditProjectLeader, textFormattingRule }) => {
    const project = await backlog.postProject({
      name,
      key,
      chartEnabled: chartEnabled ?? false,
      subtaskingEnabled: subtaskingEnabled ?? false,
      projectLeaderCanEditProjectLeader: projectLeaderCanEditProjectLeader ?? false,
      textFormattingRule: textFormattingRule ?? "backlog"
    });

    return {
      content: [{ type: "text", text: JSON.stringify(project, null, 2) }]
    };
  }
});
