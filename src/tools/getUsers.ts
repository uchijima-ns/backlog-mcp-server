import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, Output, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";

const getUsersSchema = buildToolSchema(t => ({}));

export const getUsersTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getUsersSchema>, Output> => {
  return {
    name: "get_users",
    description: t("TOOL_GET_USERS_DESCRIPTION", "Returns list of users in the Backlog space"),
    schema: z.object(getUsersSchema(t)),
    handler: async () => {
      const users = await backlog.getUsers();
      
      return {
        content: [{ type: "text", text: JSON.stringify(users, null, 2) }]
      };
    }
  };
};
