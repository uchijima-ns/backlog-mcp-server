import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getUsersSchema = buildToolSchema(_t => ({}));
export const getUsersTool = (backlog, { t }) => {
    return {
        name: "get_users",
        description: t("TOOL_GET_USERS_DESCRIPTION", "Returns list of users in the Backlog space"),
        schema: z.object(getUsersSchema(t)),
        handler: async () => {
            const users = await backlog.getUsers();
            return {
                content: [{ type: "text", text: JSON.stringify(users, null, 2) }]
            };
        }
    };
};
