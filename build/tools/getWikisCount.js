import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getWikisCountSchema = buildToolSchema(t => ({
    projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_WIKIS_COUNT_PROJECT_ID_OR_KEY", "Project ID or project key")),
}));
export const getWikisCountTool = (backlog, { t }) => {
    return {
        name: "get_wikis_count",
        description: t("TOOL_GET_WIKIS_COUNT_DESCRIPTION", "Returns count of wiki pages in a project"),
        schema: z.object(getWikisCountSchema(t)),
        handler: async ({ projectIdOrKey }) => {
            const count = await backlog.getWikisCount(projectIdOrKey);
            return {
                content: [{ type: "text", text: JSON.stringify(count, null, 2) }]
            };
        }
    };
};
