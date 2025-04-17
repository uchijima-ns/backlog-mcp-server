import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getProjectSchema = buildToolSchema(t => ({
    projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_PROJECT_PROJECT_ID_OR_KEY", "Project ID or project key")),
}));
export const getProjectTool = (backlog, { t }) => {
    return {
        name: "get_project",
        description: t("TOOL_GET_PROJECT_DESCRIPTION", "Returns information about a specific project"),
        schema: z.object(getProjectSchema(t)),
        handler: async ({ projectIdOrKey }) => {
            const project = await backlog.getProject(projectIdOrKey);
            return {
                content: [{ type: "text", text: JSON.stringify(project, null, 2) }]
            };
        }
    };
};
