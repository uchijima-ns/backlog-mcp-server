import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, Output, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getWatchingListCountSchema = buildToolSchema(t => ({
  userId: z.number().describe(t("TOOL_GET_WATCHING_LIST_COUNT_USER_ID", "User ID")),
}));

export const getWatchingListCountTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getWatchingListCountSchema>, Output> => {
  return {
    name: "get_watching_list_count",
    description: t("TOOL_GET_WATCHING_LIST_COUNT_DESCRIPTION", "Returns count of watching items for a user"),
    schema: z.object(getWatchingListCountSchema(t)),
    handler: async ({ userId }) => {
      const count = await backlog.getWatchingListCount(userId);
      
      return {
        content: [{ type: "text", text: JSON.stringify(count, null, 2) }]
      };
    }
  };
};
