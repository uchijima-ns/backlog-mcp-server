import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getMyselfSchema = buildToolSchema(t => ({}));
export const getMyselfTool = (backlog, { t }) => {
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
