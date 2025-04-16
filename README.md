# Backlog MCP Server

A Model Context Protocol (MCP) server for interacting with the Backlog API. This server provides tools for managing projects, issues, wiki pages, and more in Backlog through Claude.

## Features

- Project management (create, read, update, delete)
- Issue tracking (create, update, delete, list)
- Wiki page management
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

| Tool Name | Description |
|-----------|-------------|
| `get_project_list` | Returns list of projects |
| `add_issue` | Creates a new issue in the specified project |
| `add_project` | Creates a new project |
| `get_project` | Returns information about a specific project |
| `update_project` | Updates an existing project |
| `delete_project` | Deletes a project |
| `get_wiki_pages` | Returns list of Wiki pages |

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
