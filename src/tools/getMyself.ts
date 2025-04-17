import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, Output, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getMyselfSchema = buildToolSchema(t => ({}));

export const getMyselfTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getMyselfSchema>, Output> => {
  return {
    name: "get_myself",
    description: t("TOOL_GET_MYSELF_DESCRIPTION", "Returns information about the authenticated user"),
    schema: z.object(getMyselfSchema(t)),
    handler: async () => {
      const user = await backlog.getMyself();
      
      return {
        content: [{ type: "text", text: JSON.stringify(user, null, 2) }]
      };
    }
  };
};
