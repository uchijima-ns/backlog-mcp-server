import { z } from "zod";
import { buildToolSchema } from "../toolDefinition.js";
const getPrioritiesSchema = buildToolSchema(_t => ({}));
export const getPrioritiesTool = (backlog, { t }) => {
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
