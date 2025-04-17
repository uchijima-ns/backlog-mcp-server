import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, Output, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getGitRepositorySchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_GIT_REPOSITORY_PROJECT_ID_OR_KEY", "Project ID or project key")),
  repoIdOrName: z.string().describe(t("TOOL_GET_GIT_REPOSITORY_REPO_ID_OR_NAME", "Repository ID or name")),
}));

export const getGitRepositoryTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getGitRepositorySchema>, Output> => {
  return {
    name: "get_git_repository",
    description: t("TOOL_GET_GIT_REPOSITORY_DESCRIPTION", "Returns information about a specific Git repository"),
    schema: z.object(getGitRepositorySchema(t)),
    handler: async ({ projectIdOrKey, repoIdOrName }) => {
      const repository = await backlog.getGitRepository(projectIdOrKey, repoIdOrName);
      
      return {
        content: [{ type: "text", text: JSON.stringify(repository, null, 2) }]
      };
    }
  };
};
