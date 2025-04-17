import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getIssueTypesSchema = buildToolSchema(t => ({
    projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_ISSUE_TYPES_PROJECT_ID_OR_KEY", "Project ID or project key")),
}));
export const getIssueTypesTool = (backlog, { t }) => {
    return {
        name: "get_issue_types",
        description: t("TOOL_GET_ISSUE_TYPES_DESCRIPTION", "Returns list of issue types for a project"),
        schema: z.object(getIssueTypesSchema(t)),
        handler: async ({ projectIdOrKey }) => {
            const issueTypes = await backlog.getIssueTypes(projectIdOrKey);
            return {
                content: [{ type: "text", text: JSON.stringify(issueTypes, null, 2) }]
            };
        }
    };
};
