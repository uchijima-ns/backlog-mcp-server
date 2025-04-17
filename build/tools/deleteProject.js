import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const deleteProjectSchema = buildToolSchema(t => ({
    projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_DELETE_PROJECT_PROJECT_ID_OR_KEY", "Project ID or project key")),
}));
export const deleteProjectTool = (backlog, { t }) => {
    return {
        name: "delete_project",
        description: t("TOOL_DELETE_PROJECT_DESCRIPTION", "Deletes a project"),
        schema: z.object(deleteProjectSchema(t)),
        handler: async ({ projectIdOrKey }) => {
            const project = await backlog.deleteProject(projectIdOrKey);
            return {
                content: [{ type: "text", text: JSON.stringify(project, null, 2) }]
            };
        }
    };
};
