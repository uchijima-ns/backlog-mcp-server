import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const updateProjectSchema = buildToolSchema(t => ({
    projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_UPDATE_PROJECT_PROJECT_ID_OR_KEY", "Project ID or project key")),
    name: z.string().optional().describe(t("TOOL_UPDATE_PROJECT_NAME", "Project name")),
    key: z.string().optional().describe(t("TOOL_UPDATE_PROJECT_KEY", "Project key")),
    chartEnabled: z.boolean().optional().describe(t("TOOL_UPDATE_PROJECT_CHART_ENABLED", "Whether to enable chart")),
    subtaskingEnabled: z.boolean().optional().describe(t("TOOL_UPDATE_PROJECT_SUBTASKING_ENABLED", "Whether to enable subtasking")),
    projectLeaderCanEditProjectLeader: z.boolean().optional().describe(t("TOOL_UPDATE_PROJECT_LEADER_CAN_EDIT", "Whether project leaders can edit other project leaders")),
    textFormattingRule: z.enum(["backlog", "markdown"]).optional().describe(t("TOOL_UPDATE_PROJECT_TEXT_FORMATTING", "Text formatting rule")),
    archived: z.boolean().optional().describe(t("TOOL_UPDATE_PROJECT_ARCHIVED", "Whether to archive the project")),
}));
export const updateProjectTool = (backlog, { t }) => {
    return {
        name: "update_project",
        description: t("TOOL_UPDATE_PROJECT_DESCRIPTION", "Updates an existing project"),
        schema: z.object(updateProjectSchema(t)),
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
    };
};
