import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getPullRequestSchema = buildToolSchema(t => ({
    projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_PULL_REQUEST_PROJECT_ID_OR_KEY", "Project ID or project key")),
    repoIdOrName: z.string().describe(t("TOOL_GET_PULL_REQUEST_REPO_ID_OR_NAME", "Repository ID or name")),
    number: z.number().describe(t("TOOL_GET_PULL_REQUEST_NUMBER", "Pull request number")),
}));
export const getPullRequestTool = (backlog, { t }) => {
    return {
        name: "get_pull_request",
        description: t("TOOL_GET_PULL_REQUEST_DESCRIPTION", "Returns information about a specific pull request"),
        schema: z.object(getPullRequestSchema(t)),
        handler: async ({ projectIdOrKey, repoIdOrName, number }) => {
            const pullRequest = await backlog.getPullRequest(projectIdOrKey, repoIdOrName, number);
            return {
                content: [{ type: "text", text: JSON.stringify(pullRequest, null, 2) }]
            };
        }
    };
};
