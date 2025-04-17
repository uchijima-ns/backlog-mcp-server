import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getCategoriesSchema = buildToolSchema(t => ({
    projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_CATEGORIES_PROJECT_ID_OR_KEY", "Project ID or project key")),
}));
export const getCategoriesTool = (backlog, { t }) => {
    return {
        name: "get_categories",
        description: t("TOOL_GET_CATEGORIES_DESCRIPTION", "Returns list of categories for a project"),
        schema: z.object(getCategoriesSchema(t)),
        handler: async ({ projectIdOrKey }) => {
            const categories = await backlog.getCategories(projectIdOrKey);
            return {
                content: [{ type: "text", text: JSON.stringify(categories, null, 2) }]
            };
        }
    };
};
