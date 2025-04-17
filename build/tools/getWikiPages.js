import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getWikiPagesSchema = buildToolSchema(t => ({
    projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_WIKI_PAGES_PROJECT_ID_OR_KEY", "Project ID or project key")),
    keyword: z.string().optional().describe(t("TOOL_GET_WIKI_PAGES_KEYWORD", "Keyword to search for in Wiki pages")),
}));
export const getWikiPagesTool = (backlog, { t }) => {
    return {
        name: "get_wiki_pages",
        description: t("TOOL_GET_WIKI_PAGES_DESCRIPTION", "Returns list of Wiki pages"),
        schema: z.object(getWikiPagesSchema(t)),
        handler: async ({ projectIdOrKey, keyword }) => {
            const wikiPages = await backlog.getWikis({
                projectIdOrKey,
                keyword
            });
            return {
                content: [{ type: "text", text: JSON.stringify(wikiPages, null, 2) }]
            };
        }
    };
};
