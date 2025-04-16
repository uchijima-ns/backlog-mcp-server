import { z } from "zod";
const schema = {
    projectIdOrKey: z.union([z.string(), z.number()]).describe("Project ID or project key"),
    name: z.string().optional().describe("Project name"),
    key: z.string().optional().describe("Project key"),
    chartEnabled: z.boolean().optional().describe("Whether to enable chart"),
    subtaskingEnabled: z.boolean().optional().describe("Whether to enable subtasking"),
    projectLeaderCanEditProjectLeader: z.boolean().optional().describe("Whether project leaders can edit other project leaders"),
    textFormattingRule: z.enum(["backlog", "markdown"]).optional().describe("Text formatting rule"),
    archived: z.boolean().optional().describe("Whether to archive the project"),
};
export const updateProjectTool = (backlog) => ({
    name: "update_project",
    description: "Updates an existing project",
    schema: z.object(schema),
    handler: async ({ projectIdOrKey, name, key, chartEnabled, subtaskingEnabled, projectLeaderCanEditProjectLeader, textFormattingRule, archived }) => {
        const project = await backlog.patchProject(projectIdOrKey, {
            name,
            key,
            chartEnabled,
            subtaskingEnabled,
            projectLeaderCanEditProjectLeader,
            textFormattingRule,
            archived
        });
        return {
            content: [{ type: "text", text: JSON.stringify(project, null, 2) }]
        };
    }
});
