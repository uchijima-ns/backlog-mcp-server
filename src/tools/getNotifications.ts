import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, Output, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getNotificationsSchema = buildToolSchema(t => ({
  minId: z.number().optional().describe(t("TOOL_GET_NOTIFICATIONS_MIN_ID", "Minimum notification ID")),
  maxId: z.number().optional().describe(t("TOOL_GET_NOTIFICATIONS_MAX_ID", "Maximum notification ID")),
  count: z.number().optional().describe(t("TOOL_GET_NOTIFICATIONS_COUNT", "Number of notifications to retrieve")),
  order: z.enum(["asc", "desc"]).optional().describe(t("TOOL_GET_NOTIFICATIONS_ORDER", "Sort order")),
  alreadyRead: z.boolean().optional().describe(t("TOOL_GET_NOTIFICATIONS_ALREADY_READ", "Whether to include already read notifications")),
  resourceAlreadyRead: z.boolean().optional().describe(t("TOOL_GET_NOTIFICATIONS_RESOURCE_ALREADY_READ", "Whether to include notifications for already read resources")),
}));

export const getNotificationsTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getNotificationsSchema>, Output> => {
  return {
    name: "get_notifications",
    description: t("TOOL_GET_NOTIFICATIONS_DESCRIPTION", "Returns list of notifications"),
    schema: z.object(getNotificationsSchema(t)),
    handler: async (params) => {
      const notifications = await backlog.getNotifications(params);
      
      return {
        content: [{ type: "text", text: JSON.stringify(notifications, null, 2) }]
      };
    }
  };
};
