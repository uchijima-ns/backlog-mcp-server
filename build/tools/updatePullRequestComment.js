import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const updatePullRequestCommentSchema = buildToolSchema(t => ({
    projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_UPDATE_PULL_REQUEST_COMMENT_PROJECT_ID_OR_KEY", "Project ID or project key")),
    repoIdOrName: z.string().describe(t("TOOL_UPDATE_PULL_REQUEST_COMMENT_REPO_ID_OR_NAME", "Repository ID or name")),
    number: z.number().describe(t("TOOL_UPDATE_PULL_REQUEST_COMMENT_NUMBER", "Pull request number")),
    commentId: z.number().describe(t("TOOL_UPDATE_PULL_REQUEST_COMMENT_COMMENT_ID", "Comment ID")),
    content: z.string().describe(t("TOOL_UPDATE_PULL_REQUEST_COMMENT_CONTENT", "Comment content")),
}));
export const updatePullRequestCommentTool = (backlog, { t }) => {
    return {
        name: "update_pull_request_comment",
        description: t("TOOL_UPDATE_PULL_REQUEST_COMMENT_DESCRIPTION", "Updates a comment on a pull request"),
        schema: z.object(updatePullRequestCommentSchema(t)),
        handler: async ({ projectIdOrKey, repoIdOrName, number, commentId, content }) => {
            const comment = await backlog.patchPullRequestComments(projectIdOrKey, repoIdOrName, number, commentId, { content });
            return {
                content: [{ type: "text", text: JSON.stringify(comment, null, 2) }]
            };
        }
    };
};
