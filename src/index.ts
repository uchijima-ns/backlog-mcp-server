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
    const baseUrl = `https://${req.get('host')}`;
    const metadata = {
      issuer: baseUrl,
      authorization_endpoint: `${baseUrl}/authorize`,
      token_endpoint: `${baseUrl}/token`,
      registration_endpoint: `${baseUrl}/register`,
      
      // オプショナルだが推奨されるフィールド
      response_types_supported: ["code"],
      response_modes_supported: ["query"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      token_endpoint_auth_methods_supported: [
        "none",                    // PKCE用（公開クライアント）
        "client_secret_basic",     // HTTP Basic認証
        "client_secret_post"       // POSTボディ内認証
      ],
      code_challenge_methods_supported: ["S256"], // PKCE必須

    };

    res.json(metadata);
  });
  app.get('/authorize', (_req: express.Request, res: express.Response) => {
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

  // クライアント認証を処理するミドルウェア
  function authenticateClient(req: express.Request): { clientId?: string; clientSecret?: string; error?: any } {
    const authHeader = req.headers.authorization;
    const { client_id, client_secret } = req.body;

    // 1. HTTP Basic認証をチェック
    if (authHeader && authHeader.startsWith('Basic ')) {
      try {
        const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8');
        const [clientId, clientSecret] = credentials.split(':', 2);
        
        if (clientId && clientSecret) {
          return { clientId, clientSecret };
        }
      } catch (error) {
        return { 
          error: {
            error: 'invalid_client',
            error_description: 'Invalid client credentials in Authorization header'
          }
        };
      }
    }

    // 2. POSTボディ内の認証情報をチェック
    if (client_id && client_secret) {
      return { clientId: client_id, clientSecret: client_secret };
    }

    // 3. client_id のみ（PKCEクライアント）
    if (client_id && !client_secret) {
      return { clientId: client_id };
    }

    return {
      error: {
        error: 'invalid_client',
        error_description: 'Client authentication required'
      }
    };
  }
  // OAuth トークン交換
  app.post('/token', async (req: express.Request, res: express.Response) => {
    const { grant_type, code, redirect_uri, code_verifier, refresh_token } = req.body;

    console.log('Token request:', {
      grant_type,
      code: code ? (code.startsWith('mcp_') ? 'mcp_code' : 'backlog_code') : 'absent',
      redirect_uri,
      code_verifier: code_verifier ? 'present' : 'absent',
      refresh_token: refresh_token ? 'present' : 'absent'
    });

    // クライアント認証
    const authResult = authenticateClient(req);
    if (authResult.error) {
      return res.status(401).json(authResult.error);
    }

    const authenticatedClientId = authResult.clientId;
    console.log('Authenticated client:', authenticatedClientId);

    if (grant_type === 'authorization_code') {
      // 認証コード交換
      if (!code) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Missing authorization code'
        });
      }

      // MCP認証コードの処理
      if (code.startsWith('mcp_')) {
        // 既にBacklogから取得済みのトークンを返す
        if (!token) {
          return res.status(400).json({
            error: 'invalid_grant',
            error_description: 'No valid session found'
          });
        }

        console.log('Returning cached Backlog token');
        return res.json({
          access_token: token.access_token,
          token_type: 'Bearer',
          expires_in: token.expires_in,
          refresh_token: token.refresh_token,
          scope: 'read write'
        });
      }

      // 直接のBacklog認証コードの処理
      try {
        const newToken = await oauth.getAccessToken({ 
          host: domain, 
          code, 
          redirectUri: redirect_uri || redirectUri 
        });

        // トークンを保存
        token = newToken;
        await fs.writeFile(tokenPath, JSON.stringify(token, null, 2), { 
          encoding: 'utf-8',
          mode: 0o600 
        });
        
        (backlog as any).accessToken = token.access_token;
        globalThis.setTimeout(scheduleRefresh, Math.max(token.expires_in - 60, 60) * 1000);

        console.log('New Backlog token obtained');
        return res.json({
          access_token: token.access_token,
          token_type: 'Bearer',
          expires_in: token.expires_in,
          refresh_token: token.refresh_token,
          scope: 'read write'
        });

      } catch (error) {
        console.error('Token exchange error:', error);
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Invalid authorization code'
        });
      }

    } else if (grant_type === 'refresh_token') {
      // リフレッシュトークン処理
      if (!refresh_token) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Missing refresh token'
        });
      }

      if (refresh_token !== token?.refresh_token) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Invalid refresh token'
        });
      }

      try {
        console.log('Refreshing token...');
        const refreshedToken = await oauth.refreshAccessToken({
          host: domain,
          refreshToken: refresh_token
        });

        // 新しいトークンを保存
        token = refreshedToken;
        await fs.writeFile(tokenPath, JSON.stringify(token, null, 2), { 
          encoding: 'utf-8',
          mode: 0o600 
        });
        
        (backlog as any).accessToken = token.access_token;
        
        console.log('Token refresh successful');
        return res.json({
          access_token: token.access_token,
          token_type: 'Bearer',
          expires_in: token.expires_in,
          refresh_token: token.refresh_token,
          scope: 'read write'
        });

      } catch (error) {
        console.error('Token refresh error:', error);
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Failed to refresh token'
        });
      }

    } else {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'Only authorization_code and refresh_token are supported'
      });
    }
  });

  // Dynamic Client Registration endpoint (RFC 7591)
  app.post('/register', (req: express.Request, res: express.Response) => {
    try {
      const {
        client_name,
        client_uri,
        redirect_uris,
        grant_types = ['authorization_code'],
        response_types = ['code'],
        scope,
        token_endpoint_auth_method = 'client_secret_basic'
      } = req.body;

      console.log('Client registration request:', {
        client_name,
        client_uri,
        redirect_uris,
        grant_types,
        response_types,
        scope
      });

      // 基本的なバリデーション
      if (!client_name) {
        return res.status(400).json({
          error: 'invalid_client_metadata',
          error_description: 'client_name is required'
        });
      }

      if (!redirect_uris || !Array.isArray(redirect_uris) || redirect_uris.length === 0) {
        return res.status(400).json({
          error: 'invalid_client_metadata',
          error_description: 'redirect_uris is required and must be a non-empty array'
        });
      }

      // redirect URIの検証
      const validRedirectUris = redirect_uris.filter((uri: string) => {
        if (typeof uri !== 'string') return false;
        
        try {
          const url = new URL(uri);
          // HTTPS または localhost HTTP を許可
          return url.protocol === 'https:' || 
                (url.protocol === 'http:' && (
                  url.hostname === 'localhost' || 
                  url.hostname === '127.0.0.1' ||
                  url.hostname.endsWith('.local')
                ));
        } catch {
          return false;
        }
      });

      if (validRedirectUris.length === 0) {
        return res.status(400).json({
          error: 'invalid_redirect_uri',
          error_description: 'All redirect URIs must be HTTPS or localhost HTTP'
        });
      }

      // grant_typesの検証
      const supportedGrantTypes = ['authorization_code', 'refresh_token'];
      const invalidGrantTypes = grant_types.filter((type: string) => !supportedGrantTypes.includes(type));
      
      if (invalidGrantTypes.length > 0) {
        return res.status(400).json({
          error: 'invalid_client_metadata',
          error_description: `Unsupported grant types: ${invalidGrantTypes.join(', ')}`
        });
      }

      // response_typesの検証
      const supportedResponseTypes = ['code'];
      const invalidResponseTypes = response_types.filter((type: string) => !supportedResponseTypes.includes(type));
      
      if (invalidResponseTypes.length > 0) {
        return res.status(400).json({
          error: 'invalid_client_metadata',
          error_description: `Unsupported response types: ${invalidResponseTypes.join(', ')}`
        });
      }

      // token_endpoint_auth_methodの検証
      const supportedAuthMethods = ['none', 'client_secret_post'];
      if (!supportedAuthMethods.includes(token_endpoint_auth_method)) {
        return res.status(400).json({
          error: 'invalid_client_metadata',
          error_description: `Unsupported token endpoint auth method: ${token_endpoint_auth_method}`
        });
      }

      // クライアントIDとシークレットの生成
      const clientId = crypto.randomUUID();
      const clientSecret = token_endpoint_auth_method === 'none' ? undefined : crypto.randomBytes(32).toString('hex');

      // クライアント登録情報
      const clientRegistration = {
        client_id: clientId,
        client_name,
        client_uri: client_uri || undefined,
        redirect_uris: validRedirectUris,
        grant_types,
        response_types,
        token_endpoint_auth_method,
        scope: scope || 'read write',
        
        // 追加のメタデータ
        client_id_issued_at: Math.floor(Date.now() / 1000),
        ...(clientSecret && { client_secret: clientSecret }),
        ...(clientSecret && { client_secret_expires_at: 0 }) // 0 = never expires
      };

      console.log('Client registered successfully:', {
        client_id: clientId,
        client_name,
        redirect_uris: validRedirectUris
      });

      // 201 Created で登録情報を返す
      res.status(201).json(clientRegistration);

    } catch (error) {
      console.error('Client registration error:', error);
      res.status(500).json({
        error: 'server_error',
        error_description: 'Internal server error during client registration'
      });
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
