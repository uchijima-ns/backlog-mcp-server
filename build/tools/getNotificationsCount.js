import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getNotificationsCountSchema = buildToolSchema(t => ({
    alreadyRead: z.boolean().describe(t("TOOL_GET_NOTIFICATIONS_COUNT_ALREADY_READ", "Whether to include already read notifications")),
    resourceAlreadyRead: z.boolean().describe(t("TOOL_GET_NOTIFICATIONS_COUNT_RESOURCE_ALREADY_READ", "Whether to include notifications for already read resources")),
}));
export const getNotificationsCountTool = (backlog, { t }) => {
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
