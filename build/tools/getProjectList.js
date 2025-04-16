import { z } from "zod";
const schema = {
    archived: z.boolean().optional().describe("For unspecified parameters, this form returns all projects. For ‘false’ parameters, it returns unarchived projects. For ‘true’ parameters, it returns archived projects."),
    all: z.boolean().optional().describe("Only applies to administrators. If ‘true,’ it returns all projects. If ‘false,’ it returns only projects they have joined.")
};
export const getProjectListTool = (backlog) => ({
    name: "get_project_list",
    description: "Returns list of projects",
    schema: z.object(schema),
    handler: async ({ archived, all }) => {
        const projects = await backlog.getProjects({
            archived,
            all
        });
        return {
            content: [{ type: "text", text: JSON.stringify(projects, null, 2) }]
        };
    }
});
