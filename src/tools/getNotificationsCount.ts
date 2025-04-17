import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, Output, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getNotificationsCountSchema = buildToolSchema(t => ({
  alreadyRead: z.boolean().describe(t("TOOL_GET_NOTIFICATIONS_COUNT_ALREADY_READ", "Whether to include already read notifications")),
  resourceAlreadyRead: z.boolean().describe(t("TOOL_GET_NOTIFICATIONS_COUNT_RESOURCE_ALREADY_READ", "Whether to include notifications for already read resources")),
}));

export const getNotificationsCountTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getNotificationsCountSchema>, Output> => {
  return {
    name: "count_notifications",
    description: t("TOOL_COUNT_NOTIFICATIONS_DESCRIPTION", "Returns count of notifications"),
    schema: z.object(getNotificationsCountSchema(t)),
    handler: async (params) => {
      const count = await backlog.getNotificationsCount(params);
      
      return {
        content: [{ type: "text", text: JSON.stringify(count, null, 2) }]
      };
    }
  };
};
