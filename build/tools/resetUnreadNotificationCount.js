import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const resetUnreadNotificationCountSchema = buildToolSchema(_t => ({}));
export const resetUnreadNotificationCountTool = (backlog, { t }) => {
    return {
        name: "reset_unread_notification_count",
        description: t("TOOL_RESET_UNREAD_NOTIFICATION_COUNT_DESCRIPTION", "Reset unread notification count"),
        schema: z.object(resetUnreadNotificationCountSchema(t)),
        handler: async () => {
            const result = await backlog.resetNotificationsMarkAsRead();
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
            };
        }
    };
};
