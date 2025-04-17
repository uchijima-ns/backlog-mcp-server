# Backlog MCP Server

A Model Context Protocol (MCP) server for interacting with the Backlog API. This server provides tools for managing projects, issues, wiki pages, and more in Backlog through Claude.

## Features

- Project management (create, read, update, delete)
- Issue tracking (create, update, delete, list)
- Wiki page management
- Git repository management
- Pull request management (create, update, list, comment)
- Notification management
- Watching list management
- And more Backlog API integrations

## Requirements

- Node.js (v16 or higher)
- A Backlog account with API access
- API key from your Backlog account

## Installation

### Option 1: Install via npx

The easiest way to use this MCP server is through Claude's MCP configuration:

1. Open Claude settings
2. Navigate to the MCP configuration section
3. Add the following configuration:

```json
{
  "mcpServers": {
    "backlog": {
      "command": "npx",
      "args": [
        "-y",
        "github:trknhr/backlog-mcp-server"
      ],
      "env": {
        "BACKLOG_DOMAIN": "your-domain.backlog.com",
        "BACKLOG_API_KEY": "your-api-key"
      }
    }
  }
}
```

Replace `your-domain.backlog.com` with your Backlog domain and `your-api-key` with your Backlog API key.

### Option 2: Manual Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/trknhr/backlog-mcp-server.git
   cd backlog-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Create a `.env` file with your Backlog credentials:
   ```
   BACKLOG_DOMAIN=your-domain.backlog.com
   BACKLOG_API_KEY=your-api-key
   ```

5. Start the server:
   ```bash
   npm start
   ```

## Available Tools

The server provides the following tools for interacting with Backlog:

### Project Tools

| Tool Name | Description |
|-----------|-------------|
| `get_project_list` | Returns list of projects |
| `add_project` | Creates a new project |
| `get_project` | Returns information about a specific project |
| `update_project` | Updates an existing project |
| `delete_project` | Deletes a project |

### Issue Tools

| Tool Name | Description |
|-----------|-------------|
| `get_issue` | Returns information about a specific issue |
| `get_issues` | Returns list of issues |
| `count_issues` | Returns count of issues |
| `add_issue` | Creates a new issue in the specified project |
| `update_issue` | Updates an existing issue |
| `delete_issue` | Deletes an issue |

### Comment Tools

| Tool Name | Description |
|-----------|-------------|
| `get_issue_comments` | Returns list of comments for an issue |
| `add_issue_comment` | Adds a comment to an issue |

### Wiki Tools

| Tool Name | Description |
|-----------|-------------|
| `get_wiki_pages` | Returns list of Wiki pages |
| `get_wikis_count` | Returns count of wiki pages in a project |
| `get_wiki` | Returns information about a specific wiki page |
| `get_categories` | Returns list of categories for a project |

### Notification Tools

| Tool Name | Description |
|-----------|-------------|
| `get_notifications` | Returns list of notifications |
| `count_notifications` | Returns count of notifications |
| `reset_unread_notification_count` | Reset unread notification count |
| `mark_notification_as_read` | Mark a notification as read |

### Git Repository Tools

| Tool Name | Description |
|-----------|-------------|
| `get_git_repositories` | Returns list of Git repositories for a project |
| `get_git_repository` | Returns information about a specific Git repository |

### Pull Request Tools

| Tool Name | Description |
|-----------|-------------|
| `get_pull_requests` | Returns list of pull requests for a repository |
| `get_pull_requests_count` | Returns count of pull requests for a repository |
| `get_pull_request` | Returns information about a specific pull request |
| `add_pull_request` | Creates a new pull request |
| `update_pull_request` | Updates an existing pull request |
| `get_pull_request_comments` | Returns list of comments for a pull request |
| `add_pull_request_comment` | Adds a comment to a pull request |
| `update_pull_request_comment` | Updates a comment on a pull request |

### Watching Tools

| Tool Name | Description |
|-----------|-------------|
| `get_watching_list_items` | Returns list of watching items for a user |
| `get_watching_list_count` | Returns count of watching items for a user |

## Usage Examples

Once the MCP server is configured in Claude, you can use the tools directly in your conversations. Here are some examples:

### Listing Projects

```
Could you list all my Backlog projects?
```

### Creating a New Issue

```
Create a new bug issue in the PROJECT-KEY project with high priority titled "Fix login page error"
```

### Getting Project Details

```
Show me the details of the PROJECT-KEY project
```

### Working with Git Repositories

```
List all Git repositories in the PROJECT-KEY project
```

### Managing Pull Requests

```
Show me all open pull requests in the repository "repo-name" of PROJECT-KEY project
```

```
Create a new pull request from branch "feature/new-feature" to "main" in the repository "repo-name" of PROJECT-KEY project
```

### Watching Items

```
Show me all items I'm watching
```

## Development

### Running Tests

```bash
npm test
```

### Adding New Tools

1. Create a new file in `src/tools/` following the pattern of existing tools
2. Create a corresponding test file
3. Add the new tool to `src/tools/tools.ts`
4. Build and test your changes

## License

MIT
