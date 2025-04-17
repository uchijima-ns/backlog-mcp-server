import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, Output, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getPrioritiesSchema = buildToolSchema(t => ({}));

export const getPrioritiesTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getPrioritiesSchema>, Output> => {
  return {
    name: "get_priorities",
    description: t("TOOL_GET_PRIORITIES_DESCRIPTION", "Returns list of priorities"),
    schema: z.object(getPrioritiesSchema(t)),
    handler: async () => {
      const priorities = await backlog.getPriorities();
      
      return {
        content: [{ type: "text", text: JSON.stringify(priorities, null, 2) }]
      };
    }
  };
};
