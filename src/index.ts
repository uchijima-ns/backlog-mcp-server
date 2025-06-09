#!/usr/bin/env node
// Copyright (c) 2025 Nulab inc.
// Licensed under the MIT License.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import * as backlogjs from 'backlog-js';
import crypto from 'node:crypto';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from "dotenv";
import { default as env } from 'env-var';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createTranslationHelper } from "./createTranslationHelper.js";
import { registerDyamicTools, registerTools } from "./registerTools.js";
import { dynamicTools } from "./tools/dynamicTools/toolsets.js";
import { createToolRegistrar } from "./utils/toolRegistrar.js";
import { buildToolsetGroup } from "./utils/toolsetUtils.js";
import { wrapServerWithToolRegistry } from "./utils/wrapServerWithToolRegistry.js";
import { VERSION } from "./version.js";

dotenv.config();

const domain = env.get('BACKLOG_DOMAIN')
  .required()
  .asString();

const clientId = env.get('BACKLOG_CLIENT_ID')
  .required()
  .asString();

const clientSecret = env.get('BACKLOG_CLIENT_SECRET')
  .required()
  .asString();

const redirectUri = env.get('BACKLOG_REDIRECT_URI')
  .required()
  .asString();

const oauth = new backlogjs.OAuth2({
  clientId,
  clientSecret,
});

const state = crypto.randomUUID();
const authorizationURL = oauth.getAuthorizationURL({ host: domain, redirectUri, state });

const tokenPath = path.resolve(process.env.HOME ?? '.', '.backlog-oauth.json');
let token:any = null;

try {
  const saved = JSON.parse(await fs.readFile(tokenPath, 'utf-8'));
  if (saved.refresh_token) {
    token = await oauth.refreshAccessToken({ host: domain, refreshToken: saved.refresh_token });
    await fs.writeFile(tokenPath, JSON.stringify(token, null, 2), 'utf-8');
  }
} catch {
  console.warn('No saved OAuth token. Visit /auth to authorize.');
}

const backlog = new backlogjs.Backlog({
  host: domain,
  accessToken: token?.access_token ?? ''
});

if (token) {
  globalThis.setTimeout(scheduleRefresh, Math.max(token.expires_in - 60, 60) * 1000);
}

async function scheduleRefresh() {
  try {
    if (!token) return;
    token = await oauth.refreshAccessToken({ host: domain, refreshToken: token.refresh_token });
    await fs.writeFile(tokenPath, JSON.stringify(token, null, 2), 'utf-8');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (backlog as any).accessToken = token.access_token;
    globalThis.setTimeout(scheduleRefresh, Math.max(token.expires_in - 60, 60) * 1000);
  } catch (err) {
    console.error('Failed to refresh OAuth token', err);
  }
}

const argv = yargs(hideBin(process.argv))
  .option("max-tokens", {
    type: "number",
    describe: "Maximum number of tokens allowed in the response",
    default: env.get("MAX_TOKENS").default("50000").asIntPositive(),
  })
  .option("optimize-response", {
    type: "boolean",
    describe: "Enable GraphQL-style response optimization to include only requested fields",
    default: env.get("OPTIMIZE_RESPONSE").default("false").asBool(),
  })
  .option("prefix", {
    type: "string",
    describe: "Optional string prefix to prepend to all generated outputs",
    default: env.get("PREFIX").default("").asString(),
  })
  .option("export-translations", {
    type: "boolean",
    describe: "Export translations and exit",
    default: false,
  })
  .option("port", {
    type: "number",
    describe: "Port to listen on",
    default: env.get("PORT").default("3000").asPortNumber(),
  })
  .option("enable-toolsets", {
    type: "array",
    describe: `Specify which toolsets to enable. Defaults to 'all'.
Available toolsets:
  - space:       Tools for managing Backlog space settings and general information
  - project:     Tools for managing projects, categories, custom fields, and issue types
  - issue:       Tools for managing issues and their comments
  - wiki:        Tools for managing wiki pages
  - git:         Tools for managing Git repositories and pull requests
  - notifications: Tools for managing user notifications`,
    default: env.get("ENABLE_TOOLSETS").default("all").asArray(',')
  })
  .option("dynamic-toolsets", {
    type: "boolean",
    describe: "Enable dynamic toolsets such as enable_toolset, list_available_toolsets, etc.",
    default: env.get("ENABLE_DYNAMIC_TOOLSETS").default("false").asBool()
  })
  .parseSync();

const useFields = argv.optimizeResponse;

const server = wrapServerWithToolRegistry(new McpServer({
  name: "backlog",
  description: useFields ? `You can include only the fields you need using GraphQL-style syntax.
Start with the example above and customize freely.` : undefined,
  version: VERSION
}));

const transHelper = createTranslationHelper()

const maxTokens = argv.maxTokens;
const prefix = argv.prefix;
const port = argv.port;
let enabledToolsets = argv.enableToolsets as string[];

// If dynamic toolsets are enabled, remove "all" to allow for selective enabling via commands
if(argv.dynamicToolsets) {
  enabledToolsets = enabledToolsets.filter(a => a != "all")
}

const mcpOption = { useFields: useFields, maxTokens, prefix };
const toolsetGroup = buildToolsetGroup(backlog, transHelper, enabledToolsets)

// Register all tools
registerTools(server, toolsetGroup, mcpOption);

// Register dynamic tool management tools if enabled
if(argv.dynamicToolsets) {
  const registrar = createToolRegistrar(server, toolsetGroup, mcpOption);
  const dynamicToolsetGroup = dynamicTools(registrar, transHelper, toolsetGroup);

  registerDyamicTools(server, dynamicToolsetGroup, prefix)
}

if (argv.exportTranslations) {
  const data = transHelper.dump();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

async function main() {
  const app = express();
  app.use(express.json());

  // セキュリティヘッダー
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.removeHeader('X-Powered-By');
    next();
  });

  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);

  // OAuth Authorization Server Metadata (RFC 8414)
  // MCPクライアントがOAuth endpoints を自動発見するためのエンドポイント
  app.get('/.well-known/oauth-authorization-server', (req: express.Request, res: express.Response) => {
    const backlogBaseUrl = `https://${domain}`;
    const metadata = {
      // 必須フィールド
      issuer: backlogBaseUrl,
      authorization_endpoint: `${backlogBaseUrl}/OAuth2AccessRequest.action`,
      token_endpoint: `${backlogBaseUrl}/api/v2/oauth2/token`,
      
      // オプショナルだが推奨されるフィールド
      response_types_supported: ["code"],
      response_modes_supported: ["query"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      token_endpoint_auth_methods_supported: ["none"], // PKCEを使用するため
      code_challenge_methods_supported: ["S256"], // PKCE必須
    };

    res.json(metadata);
  });

  app.get('/auth', (_req: express.Request, res: express.Response) => {
    res.redirect(authorizationURL);
  });

  app.get('/callback', async (req: express.Request, res: express.Response) => {
    const code = req.query.code as string | undefined;
    if (!code) {
      res.status(400).send('Missing authorization code');
      return;
    }
    try {
      token = await oauth.getAccessToken({ host: domain, code, redirectUri });
    await fs.writeFile(tokenPath, JSON.stringify(token, null, 2), 'utf-8');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (backlog as any).accessToken = token.access_token;
    globalThis.setTimeout(scheduleRefresh, Math.max(token.expires_in - 60, 60) * 1000);
      res.redirect('/');
    } catch (e) {
      console.error('Access Token Error', (e as Error).message);
      res.redirect('/login');
    }
  });

  app.post('/mcp', async (req: express.Request, res: express.Response) => {
    await transport.handleRequest(req, res, req.body);
  });
  // GET リクエストは SSE エンドポイントとの互換性のために実装する必要がある
  app.get('/mcp', (req: express.Request, res: express.Response) => {
    res.writeHead(405).end(JSON.stringify({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Method not allowed.'
      },
      id: null
    }));
  });
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    transport.close();
    process.exit(0);
  });

  app.listen(port, () => {
    console.error(`Backlog MCP Server running on http://0.0.0.0:${port}`);
  });
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
