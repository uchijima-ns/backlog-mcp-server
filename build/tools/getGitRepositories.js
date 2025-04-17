import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getGitRepositoriesSchema = buildToolSchema(t => ({
    projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_GIT_REPOSITORIES_PROJECT_ID_OR_KEY", "Project ID or project key")),
}));
export const getGitRepositoriesTool = (backlog, { t }) => {
    return {
        name: "get_git_repositories",
        description: t("TOOL_GET_GIT_REPOSITORIES_DESCRIPTION", "Returns list of Git repositories for a project"),
        schema: z.object(getGitRepositoriesSchema(t)),
        handler: async ({ projectIdOrKey }) => {
            const repositories = await backlog.getGitRepositories(projectIdOrKey);
            return {
                content: [{ type: "text", text: JSON.stringify(repositories, null, 2) }]
            };
        }
    };
};
