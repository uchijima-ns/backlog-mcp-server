import { getProjectListTool } from "./getProjectList.js";
import { addIssueTool } from "./addIssue.js";
import { addProjectTool } from "./addProject.js";
import { getProjectTool } from "./getProject.js";
import { updateProjectTool } from "./updateProject.js";
import { deleteProjectTool } from "./deleteProject.js";
import { getWikiPagesTool } from "./getWikiPages.js";
import { Backlog } from 'backlog-js';

export const allTools = (backlog: Backlog) => [
  getProjectListTool(backlog),
  addIssueTool(backlog),
  addProjectTool(backlog),
  getProjectTool(backlog),
  updateProjectTool(backlog),
  deleteProjectTool(backlog),
  getWikiPagesTool(backlog),
];
