import { z } from "zod";
const schema = {
    projectId: z.number().describe("Project ID"),
    summary: z.string().describe("Summary of the issue"),
    issueTypeId: z.number().describe("Issue type ID"),
    priorityId: z.number().describe("Priority ID"),
    description: z.string().optional().describe("Detailed description of the issue"),
    startDate: z.string().optional().describe("Scheduled start date (yyyy-MM-dd)"),
    dueDate: z.string().optional().describe("Scheduled due date (yyyy-MM-dd)"),
    estimatedHours: z.number().optional().describe("Estimated work hours"),
    actualHours: z.number().optional().describe("Actual work hours"),
    categoryId: z.array(z.number()).optional().describe("Category IDs"),
    versionId: z.array(z.number()).optional().describe("Version IDs"),
    milestoneId: z.array(z.number()).optional().describe("Milestone IDs"),
    assigneeId: z.number().optional().describe("User ID of the assignee"),
    notifiedUserId: z.array(z.number()).optional().describe("User IDs to notify"),
    attachmentId: z.array(z.number()).optional().describe("Attachment IDs"),
    parentIssueId: z.number().optional().describe("Parent issue ID"),
    customFieldId: z.array(z.number()).optional().describe("Custom field IDs"),
    customFieldValue: z.array(z.string()).optional().describe("Values for custom fields"),
};
export const addIssueTool = (backlog) => ({
    name: "add_issue",
    description: "Creates a new issue in the specified project.",
    schema: z.object(schema),
    handler: async ({ projectId, summary, issueTypeId, priorityId, description, startDate, dueDate, estimatedHours, actualHours, categoryId, versionId, milestoneId, assigneeId, notifiedUserId, attachmentId, parentIssueId, customFieldId, customFieldValue }) => {
        const issue = await backlog.postIssue({
            projectId,
            summary,
            issueTypeId,
            priorityId,
            description,
            startDate,
            dueDate,
            estimatedHours,
            actualHours,
            categoryId,
            versionId,
            milestoneId,
            assigneeId,
            notifiedUserId,
            attachmentId,
            parentIssueId,
            customFieldId,
            customFieldValue
        });
        return {
            content: [{ type: "text", text: JSON.stringify(issue, null, 2) }]
        };
    }
});
