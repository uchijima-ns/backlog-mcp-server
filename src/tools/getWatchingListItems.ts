import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, Output, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getWatchingListItemsSchema = buildToolSchema(t => ({
  userId: z.number().describe(t("TOOL_GET_WATCHING_LIST_ITEMS_USER_ID", "User ID")),
}));

export const getWatchingListItemsTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getWatchingListItemsSchema>, Output> => {
  return {
    name: "get_watching_list_items",
    description: t("TOOL_GET_WATCHING_LIST_ITEMS_DESCRIPTION", "Returns list of watching items for a user"),
    schema: z.object(getWatchingListItemsSchema(t)),
    handler: async ({ userId }) => {
      const watchingItems = await backlog.getWatchingListItems(userId);
      
      return {
        content: [{ type: "text", text: JSON.stringify(watchingItems, null, 2) }]
      };
    }
  };
};
