import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import * as backlogjs from 'backlog-js';
import { registerTools } from "./registerTools.js";
dotenv.config();
const domain = process.env.BACKLOG_DOMAIN || "";
const backlog = new backlogjs.Backlog({ host: domain, apiKey: process.env.BACKLOG_API_KEY });
const server = new McpServer({
    name: "backlog",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
// Register all tools
registerTools(server, backlog);
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Backlog MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
// Original tool implementations (commented out for reference)
/*
// https://developer.nulab.com/docs/backlog/api/2/get-project-list/
server.tool(
  "get_project_list",
  "Returns list of projects",
  z.object({
    archived: z.boolean().optional().describe("For unspecified parameters, this form returns all projects. For 'false' parameters, it returns unarchived projects. For 'true' parameters, it returns archived projects. "),
    all: z.boolean().optional().describe("Only applies to administrators. If 'true,' it returns all projects. If 'false,' it returns only projects they have joined (set to 'false' by default). ")
  }).shape,
  async ({ archived, all }) => {
    const projects = await backlog.getProjects(
      {
        archived,
        all
      }
    )
    return {
      content: [{ type: "text", text: JSON.stringify(projects, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/add-issue/
server.tool(
  "add_issue",
  "Creates a new issue in the specified project.",
  z.object({
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
  }).shape,
  async ({
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
  }) => {
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
);

// https://developer.nulab.com/docs/backlog/api/2/add-project/
server.tool(
  "add_project",
  "Creates a new project",
  z.object({
    name: z.string().describe("Project name"),
    key: z.string().describe("Project key"),
    chartEnabled: z.boolean().optional().describe("Whether to enable chart (default: false)"),
    subtaskingEnabled: z.boolean().optional().describe("Whether to enable subtasking (default: false)"),
    projectLeaderCanEditProjectLeader: z.boolean().optional().describe("Whether project leaders can edit other project leaders (default: false)"),
    textFormattingRule: z.enum(["backlog", "markdown"]).optional().describe("Text formatting rule (default: 'backlog')"),
  }).shape,
  async ({ name, key, chartEnabled, subtaskingEnabled, projectLeaderCanEditProjectLeader, textFormattingRule }) => {
    const project = await backlog.postProject({
      name,
      key,
      chartEnabled: chartEnabled ?? false,
      subtaskingEnabled: subtaskingEnabled ?? false,
      projectLeaderCanEditProjectLeader: projectLeaderCanEditProjectLeader ?? false,
      textFormattingRule: textFormattingRule ?? "backlog"
    });

    return {
      content: [{ type: "text", text: JSON.stringify(project, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/get-project/
server.tool(
  "get_project",
  "Returns information about a specific project",
  z.object({
    projectIdOrKey: z.union([z.string(), z.number()]).describe("Project ID or project key"),
  }).shape,
  async ({ projectIdOrKey }) => {
    const project = await backlog.getProject(projectIdOrKey);
    
    return {
      content: [{ type: "text", text: JSON.stringify(project, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/update-project/
server.tool(
  "update_project",
  "Updates an existing project",
  z.object({
    projectIdOrKey: z.union([z.string(), z.number()]).describe("Project ID or project key"),
    name: z.string().optional().describe("Project name"),
    key: z.string().optional().describe("Project key"),
    chartEnabled: z.boolean().optional().describe("Whether to enable chart"),
    subtaskingEnabled: z.boolean().optional().describe("Whether to enable subtasking"),
    projectLeaderCanEditProjectLeader: z.boolean().optional().describe("Whether project leaders can edit other project leaders"),
    textFormattingRule: z.enum(["backlog", "markdown"]).optional().describe("Text formatting rule"),
    archived: z.boolean().optional().describe("Whether to archive the project"),
  }).shape,
  async ({ projectIdOrKey, name, key, chartEnabled, subtaskingEnabled, projectLeaderCanEditProjectLeader, textFormattingRule, archived }) => {
    const project = await backlog.patchProject(projectIdOrKey, {
      name,
      key,
      chartEnabled,
      subtaskingEnabled,
      projectLeaderCanEditProjectLeader,
      textFormattingRule,
      archived
    });

    return {
      content: [{ type: "text", text: JSON.stringify(project, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/delete-project/
server.tool(
  "delete_project",
  "Deletes a project",
  z.object({
    projectIdOrKey: z.union([z.string(), z.number()]).describe("Project ID or project key"),
  }).shape,
  async ({ projectIdOrKey }) => {
    const project = await backlog.deleteProject(projectIdOrKey);
    
    return {
      content: [{ type: "text", text: JSON.stringify(project, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/get-wiki-page-list/
server.tool(
  "get_wiki_pages",
  "Returns list of Wiki pages",
  z.object({
    projectIdOrKey: z.union([z.string(), z.number()]).describe("Project ID or project key"),
    keyword: z.string().optional().describe("Keyword to search for in Wiki pages"),
  }).shape,
  async ({ projectIdOrKey, keyword }) => {
    const wikiPages = await backlog.getWikis({
      projectIdOrKey,
      keyword
    });
    
    return {
      content: [{ type: "text", text: JSON.stringify(wikiPages, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/add-wiki-page/
server.tool(
  "add_wiki_page",
  "Creates a new Wiki page",
  z.object({
    projectId: z.number().describe("Project ID"),
    name: z.string().describe("Wiki page name"),
    content: z.string().describe("Wiki page content"),
    mailNotify: z.boolean().optional().describe("Whether to send notification email (default: false)"),
  }).shape,
  async ({ projectId, name, content, mailNotify }) => {
    const wikiPage = await backlog.postWiki({
      projectId,
      name,
      content,
      mailNotify
    });
    
    return {
      content: [{ type: "text", text: JSON.stringify(wikiPage, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/get-wiki-page/
server.tool(
  "get_wiki_page",
  "Returns information about a specific Wiki page",
  z.object({
    wikiId: z.number().describe("Wiki page ID"),
  }).shape,
  async ({ wikiId }) => {
    const wikiPage = await backlog.getWiki(wikiId);
    
    return {
      content: [{ type: "text", text: JSON.stringify(wikiPage, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/get-issue-type-list/
server.tool(
  "get_issue_types",
  "Returns list of issue types for a project",
  z.object({
    projectIdOrKey: z.union([z.string(), z.number()]).describe("Project ID or project key"),
  }).shape,
  async ({ projectIdOrKey }) => {
    const issueTypes = await backlog.getIssueTypes(projectIdOrKey);
    
    return {
      content: [{ type: "text", text: JSON.stringify(issueTypes, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/get-priority-list/
server.tool(
  "get_priorities",
  "Returns list of priorities",
  z.object({}).shape,
  async () => {
    const priorities = await backlog.getPriorities();
    
    return {
      content: [{ type: "text", text: JSON.stringify(priorities, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/get-space/
server.tool(
  "get_space",
  "Returns information about your space",
  z.object({}).shape,
  async () => {
    const space = await backlog.getSpace();
    
    return {
      content: [{ type: "text", text: JSON.stringify(space, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/get-user-list/
server.tool(
  "get_users",
  "Returns list of users in your space",
  z.object({}).shape,
  async () => {
    const users = await backlog.getUsers();
    
    return {
      content: [{ type: "text", text: JSON.stringify(users, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/get-user/
server.tool(
  "get_user",
  "Returns information about a specific user",
  z.object({
    userId: z.number().describe("User ID"),
  }).shape,
  async ({ userId }) => {
    const user = await backlog.getUser(userId);
    
    return {
      content: [{ type: "text", text: JSON.stringify(user, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/get-issue/
server.tool(
  "get_issue",
  "Returns information about a specific issue",
  z.object({
    issueIdOrKey: z.union([z.string(), z.number()]).describe("Issue ID or issue key"),
  }).shape,
  async ({ issueIdOrKey }) => {
    const issue = await backlog.getIssue(issueIdOrKey);
    
    return {
      content: [{ type: "text", text: JSON.stringify(issue, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/get-issue-list/
server.tool(
  "get_issues",
  "Returns list of issues",
  z.object({
    projectId: z.array(z.number()).optional().describe("Project IDs"),
    issueTypeId: z.array(z.number()).optional().describe("Issue type IDs"),
    categoryId: z.array(z.number()).optional().describe("Category IDs"),
    versionId: z.array(z.number()).optional().describe("Version IDs"),
    milestoneId: z.array(z.number()).optional().describe("Milestone IDs"),
    statusId: z.array(z.number()).optional().describe("Status IDs"),
    priorityId: z.array(z.number()).optional().describe("Priority IDs"),
    assigneeId: z.array(z.number()).optional().describe("Assignee user IDs"),
    createdUserId: z.array(z.number()).optional().describe("Created user IDs"),
    resolutionId: z.array(z.number()).optional().describe("Resolution IDs"),
    parentIssueId: z.array(z.number()).optional().describe("Parent issue IDs"),
    keyword: z.string().optional().describe("Keyword to search for in issues"),
    startDateSince: z.string().optional().describe("Start date since (yyyy-MM-dd)"),
    startDateUntil: z.string().optional().describe("Start date until (yyyy-MM-dd)"),
    dueDateSince: z.string().optional().describe("Due date since (yyyy-MM-dd)"),
    dueDateUntil: z.string().optional().describe("Due date until (yyyy-MM-dd)"),
    createdSince: z.string().optional().describe("Created since (yyyy-MM-dd)"),
    createdUntil: z.string().optional().describe("Created until (yyyy-MM-dd)"),
    updatedSince: z.string().optional().describe("Updated since (yyyy-MM-dd)"),
    updatedUntil: z.string().optional().describe("Updated until (yyyy-MM-dd)"),
    sort: z.enum(["issueType", "category", "version", "milestone", "summary", "status", "priority", "attachment", "sharedFile", "created", "createdUser", "updated", "updatedUser", "assignee", "startDate", "dueDate", "estimatedHours", "actualHours", "childIssue"]).optional().describe("Sort field"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    offset: z.number().optional().describe("Offset for pagination"),
    count: z.number().optional().describe("Number of issues to retrieve"),
  }).shape,
  async (params) => {
    const issues = await backlog.getIssues(params);
    
    return {
      content: [{ type: "text", text: JSON.stringify(issues, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/count-issue/
server.tool(
  "count_issues",
  "Returns count of issues",
  z.object({
    projectId: z.array(z.number()).optional().describe("Project IDs"),
    issueTypeId: z.array(z.number()).optional().describe("Issue type IDs"),
    categoryId: z.array(z.number()).optional().describe("Category IDs"),
    versionId: z.array(z.number()).optional().describe("Version IDs"),
    milestoneId: z.array(z.number()).optional().describe("Milestone IDs"),
    statusId: z.array(z.number()).optional().describe("Status IDs"),
    priorityId: z.array(z.number()).optional().describe("Priority IDs"),
    assigneeId: z.array(z.number()).optional().describe("Assignee user IDs"),
    createdUserId: z.array(z.number()).optional().describe("Created user IDs"),
    resolutionId: z.array(z.number()).optional().describe("Resolution IDs"),
    parentIssueId: z.array(z.number()).optional().describe("Parent issue IDs"),
    keyword: z.string().optional().describe("Keyword to search for in issues"),
    startDateSince: z.string().optional().describe("Start date since (yyyy-MM-dd)"),
    startDateUntil: z.string().optional().describe("Start date until (yyyy-MM-dd)"),
    dueDateSince: z.string().optional().describe("Due date since (yyyy-MM-dd)"),
    dueDateUntil: z.string().optional().describe("Due date until (yyyy-MM-dd)"),
    createdSince: z.string().optional().describe("Created since (yyyy-MM-dd)"),
    createdUntil: z.string().optional().describe("Created until (yyyy-MM-dd)"),
    updatedSince: z.string().optional().describe("Updated since (yyyy-MM-dd)"),
    updatedUntil: z.string().optional().describe("Updated until (yyyy-MM-dd)"),
  }).shape,
  async (params) => {
    const count = await backlog.getIssuesCount(params);
    
    return {
      content: [{ type: "text", text: JSON.stringify(count, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/update-issue/
server.tool(
  "update_issue",
  "Updates an existing issue",
  z.object({
    issueIdOrKey: z.union([z.string(), z.number()]).describe("Issue ID or issue key"),
    summary: z.string().optional().describe("Summary of the issue"),
    issueTypeId: z.number().optional().describe("Issue type ID"),
    priorityId: z.number().optional().describe("Priority ID"),
    description: z.string().optional().describe("Detailed description of the issue"),
    startDate: z.string().optional().describe("Scheduled start date (yyyy-MM-dd)"),
    dueDate: z.string().optional().describe("Scheduled due date (yyyy-MM-dd)"),
    estimatedHours: z.number().optional().describe("Estimated work hours"),
    actualHours: z.number().optional().describe("Actual work hours"),
    categoryId: z.array(z.number()).optional().describe("Category IDs"),
    versionId: z.array(z.number()).optional().describe("Version IDs"),
    milestoneId: z.array(z.number()).optional().describe("Milestone IDs"),
    statusId: z.number().optional().describe("Status ID"),
    resolutionId: z.number().optional().describe("Resolution ID"),
    assigneeId: z.number().optional().describe("User ID of the assignee"),
    notifiedUserId: z.array(z.number()).optional().describe("User IDs to notify"),
    attachmentId: z.array(z.number()).optional().describe("Attachment IDs"),
    comment: z.string().optional().describe("Comment to add when updating the issue"),
  }).shape,
  async ({ issueIdOrKey, ...params }) => {
    const issue = await backlog.patchIssue(issueIdOrKey, params);
    
    return {
      content: [{ type: "text", text: JSON.stringify(issue, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/delete-issue/
server.tool(
  "delete_issue",
  "Deletes an issue",
  z.object({
    issueIdOrKey: z.union([z.string(), z.number()]).describe("Issue ID or issue key"),
  }).shape,
  async ({ issueIdOrKey }) => {
    const issue = await backlog.deleteIssue(issueIdOrKey);
    
    return {
      content: [{ type: "text", text: JSON.stringify(issue, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/get-comment-list/
server.tool(
  "get_issue_comments",
  "Returns list of comments for an issue",
  z.object({
    issueIdOrKey: z.union([z.string(), z.number()]).describe("Issue ID or issue key"),
    minId: z.number().optional().describe("Minimum comment ID"),
    maxId: z.number().optional().describe("Maximum comment ID"),
    count: z.number().optional().describe("Number of comments to retrieve"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
  }).shape,
  async ({ issueIdOrKey, ...params }) => {
    const comments = await backlog.getIssueComments(issueIdOrKey, params);
    
    return {
      content: [{ type: "text", text: JSON.stringify(comments, null, 2) }]
    };
  }
);

// https://developer.nulab.com/docs/backlog/api/2/add-comment/
server.tool(
  "add_issue_comment",
  "Adds a comment to an issue",
  z.object({
    issueIdOrKey: z.union([z.string(), z.number()]).describe("Issue ID or issue key"),
    content: z.string().describe("Comment content"),
    notifiedUserId: z.array(z.number()).optional().describe("User IDs to notify"),
    attachmentId: z.array(z.number()).optional().describe("Attachment IDs"),
  }).shape,
  async ({ issueIdOrKey, content, notifiedUserId, attachmentId }) => {
    const comment = await backlog.postIssueComments(issueIdOrKey, {
      content,
      notifiedUserId,
      attachmentId
    });
    
    return {
      content: [{ type: "text", text: JSON.stringify(comment, null, 2) }]
    };
  }
);
*/
