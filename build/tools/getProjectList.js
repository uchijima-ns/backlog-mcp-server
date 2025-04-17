import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getProjectListSchema = buildToolSchema(t => ({
    archived: z
        .boolean()
        .optional()
        .describe(t("TOOL_GET_PROJECT_LIST_ARCHIVED", "For unspecified parameters, this form returns all projects. For ‘false’ parameters, it returns unarchived projects. For ‘true’ parameters, it returns archived projects.")),
    all: z
        .boolean()
        .optional()
        .describe(t("TOOL_GET_PROJECT_LIST_ALL", "Only applies to administrators. If ‘true,’ it returns all projects. If ‘false,’ it returns only projects they have joined.")),
}));
export const getProjectListTool = (backlog, { t }) => {
    return {
        name: "get_project_list",
        description: t("TOOL_GET_PROJECT_LIST_DESCRIPTION", "Returns list of projects"),
        schema: z.object(getProjectListSchema(t)),
        handler: async ({ archived, all }) => {
            const projects = await backlog.getProjects({
                archived,
                all
            });
            return {
                content: [{ type: "text", text: JSON.stringify(projects, null, 2) }]
            };
        }
    };
};
