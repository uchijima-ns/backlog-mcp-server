import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, Output, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getIssueSchema = buildToolSchema(t => ({
  issueIdOrKey: z
    .union([z.string(), z.number()])
    .describe(t("TOOL_GET_ISSUE_ISSUE_ID_OR_KEY", "Issue ID or issue key")),
}));

export const getIssueTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getIssueSchema>, Output> => {
  return {
    name: "get_issue",
    description: t("TOOL_GET_ISSUE_DESCRIPTION", "Returns information about a specific issue"),
    schema: z.object(getIssueSchema(t)),
    handler: async ({ issueIdOrKey }) => {
      const issue = await backlog.getIssue(issueIdOrKey);
      
      return {
        content: [{ type: "text", text: JSON.stringify(issue, null, 2) }]
      };
    }
  };
};
