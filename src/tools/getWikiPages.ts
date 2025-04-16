import { z } from "zod";
import { Backlog } from 'backlog-js';
import { Output, ToolDefinition } from "../toolDefinition.js";

const schema = {
  projectIdOrKey: z.union([z.string(), z.number()]).describe("Project ID or project key"),
  keyword: z.string().optional().describe("Keyword to search for in Wiki pages"),
};

export const getWikiPagesTool = (backlog: Backlog): ToolDefinition<typeof schema, Output> => ({
  name: "get_wiki_pages",
  description: "Returns list of Wiki pages",
  schema: z.object(schema),
  handler: async ({ projectIdOrKey, keyword }) => {
    const wikiPages = await backlog.getWikis({
      projectIdOrKey,
      keyword
    });
    
    return {
      content: [{ type: "text", text: JSON.stringify(wikiPages, null, 2) }]
    };
  }
});
