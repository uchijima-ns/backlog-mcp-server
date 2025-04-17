import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, Output, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getIssueTypesSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_ISSUE_TYPES_PROJECT_ID_OR_KEY", "Project ID or project key")),
}));

export const getIssueTypesTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getIssueTypesSchema>, Output> => {
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
