import { addProjectTool } from "./addProject.js";
import { jest, describe, it, expect } from '@jest/globals';
describe("addProjectTool", () => {
    const mockBacklog = {
        postProject: jest.fn().mockResolvedValue({
            id: 1,
            projectKey: "TEST",
            name: "Test Project",
            chartEnabled: true,
            subtaskingEnabled: true,
            projectLeaderCanEditProjectLeader: false,
            textFormattingRule: "backlog",
            archived: false,
            displayOrder: 0
        })
    };
    const tool = addProjectTool(mockBacklog);
    it("returns created project as formatted JSON text", async () => {
        const result = await tool.handler({
            name: "Test Project",
            key: "TEST",
            chartEnabled: true,
            subtaskingEnabled: true
        });
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe("text");
        expect(result.content[0].text).toContain("Test Project");
        expect(result.content[0].text).toContain("TEST");
    });
    it("calls backlog.postProject with correct params", async () => {
        await tool.handler({
            name: "Test Project",
            key: "TEST",
            chartEnabled: true,
            subtaskingEnabled: true
        });
        expect(mockBacklog.postProject).toHaveBeenCalledWith({
            name: "Test Project",
            key: "TEST",
            chartEnabled: true,
            subtaskingEnabled: true,
            projectLeaderCanEditProjectLeader: false,
            textFormattingRule: "backlog"
        });
    });
    it("uses default values for optional parameters", async () => {
        await tool.handler({
            name: "Test Project",
            key: "TEST"
        });
        expect(mockBacklog.postProject).toHaveBeenCalledWith({
            name: "Test Project",
            key: "TEST",
            chartEnabled: false,
            subtaskingEnabled: false,
            projectLeaderCanEditProjectLeader: false,
            textFormattingRule: "backlog"
        });
    });
});
