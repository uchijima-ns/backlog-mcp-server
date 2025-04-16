import { z } from "zod";
const schema = {
    projectIdOrKey: z.union([z.string(), z.number()]).describe("Project ID or project key"),
};
export const deleteProjectTool = (backlog) => ({
    name: "delete_project",
    description: "Deletes a project",
    schema: z.object(schema),
    handler: async ({ projectIdOrKey }) => {
        const project = await backlog.deleteProject(projectIdOrKey);
        return {
            content: [{ type: "text", text: JSON.stringify(project, null, 2) }]
        };
    }
});
