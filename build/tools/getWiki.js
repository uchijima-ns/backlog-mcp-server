import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getWikiSchema = buildToolSchema(t => ({
    wikiId: z.union([z.string(), z.number()]).describe(t("TOOL_GET_WIKI_ID", "Wiki ID")),
}));
export const getWikiTool = (backlog, { t }) => {
    return {
        name: "get_wiki",
        description: t("TOOL_GET_WIKI_DESCRIPTION", "Returns information about a specific wiki page"),
        schema: z.object(getWikiSchema(t)),
        handler: async ({ wikiId }) => {
            const wikiIdNumber = typeof wikiId === 'string' ? parseInt(wikiId, 10) : wikiId;
            const wiki = await backlog.getWiki(wikiIdNumber);
            return {
                content: [{ type: "text", text: JSON.stringify(wiki, null, 2) }]
            };
        }
    };
};
