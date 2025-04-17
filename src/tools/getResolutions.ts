import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, Output, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getResolutionsSchema = buildToolSchema(t => ({}));

export const getResolutionsTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getResolutionsSchema>, Output> => {
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
