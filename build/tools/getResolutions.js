import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getResolutionsSchema = buildToolSchema(_t => ({}));
export const getResolutionsTool = (backlog, { t }) => {
    return {
        name: "get_resolutions",
        description: t("TOOL_GET_RESOLUTIONS_DESCRIPTION", "Returns list of issue resolutions"),
        schema: z.object(getResolutionsSchema(t)),
        handler: async () => {
            const resolutions = await backlog.getResolutions();
            return {
                content: [{ type: "text", text: JSON.stringify(resolutions, null, 2) }]
            };
        }
    };
};
