import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getSpaceSchema = buildToolSchema(_t => ({}));
export const getSpaceTool = (backlog, { t }) => {
    return {
        name: "get_space",
        description: t("TOOL_GET_SPACE_DESCRIPTION", "Returns information about the Backlog space"),
        schema: z.object(getSpaceSchema(t)),
        handler: async () => {
            const space = await backlog.getSpace();
            return {
                content: [{ type: "text", text: JSON.stringify(space, null, 2) }]
            };
        }
    };
};
