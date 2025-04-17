import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const deleteIssueSchema = buildToolSchema(t => ({
    issueIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_DELETE_ISSUE_ISSUE_ID_OR_KEY", "Issue ID or issue key")),
}));
export const deleteIssueTool = (backlog, { t }) => {
    return {
        name: "delete_issue",
        description: t("TOOL_DELETE_ISSUE_DESCRIPTION", "Deletes an issue"),
        schema: z.object(deleteIssueSchema(t)),
        handler: async ({ issueIdOrKey }) => {
            const issue = await backlog.deleteIssue(issueIdOrKey);
            return {
                content: [{ type: "text", text: JSON.stringify(issue, null, 2) }]
            };
        }
    };
};
