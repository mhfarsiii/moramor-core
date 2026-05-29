#!/usr/bin/env node
'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require('node:child_process');
const os = require('node:os');
const path = require('node:path');

const PROTOCOL_VERSION = '2025-06-18';
const SERVER_NAME = 'moramor-terminal';
const SERVER_VERSION = '1.0.0';
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_OUTPUT_BYTES = 256_000;
const MAX_OUTPUT_BYTES = 1_000_000;
const WORKSPACE_ROOT = path.resolve(process.env.MCP_WORKSPACE_ROOT || process.cwd());
const DEFAULT_SHELL = process.env.MCP_TERMINAL_SHELL || process.env.SHELL || '/bin/zsh';

const tools = [
  {
    name: 'terminal_ping',
    title: 'Terminal Health Check',
    description: 'Validate that the MCP terminal server is connected and report runtime context.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'terminal_run',
    title: 'Run Terminal Command',
    description:
      'Run a shell command inside the project workspace and return stdout, stderr, exit code, duration, and truncation status.',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'Shell command to run, for example "npm test" or "git status --short".',
        },
        cwd: {
          type: 'string',
          description:
            'Optional working directory. Relative paths resolve from the workspace root; absolute paths must stay inside it.',
        },
        timeoutMs: {
          type: 'integer',
          minimum: 1,
          maximum: MAX_TIMEOUT_MS,
          description: `Optional timeout in milliseconds. Defaults to ${DEFAULT_TIMEOUT_MS}.`,
        },
        maxOutputBytes: {
          type: 'integer',
          minimum: 1,
          maximum: MAX_OUTPUT_BYTES,
          description: `Optional combined stdout/stderr byte cap. Defaults to ${DEFAULT_MAX_OUTPUT_BYTES}.`,
        },
      },
      required: ['command'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string' },
        cwd: { type: 'string' },
        exitCode: { type: ['integer', 'null'] },
        signal: { type: ['string', 'null'] },
        durationMs: { type: 'integer' },
        timedOut: { type: 'boolean' },
        truncated: { type: 'boolean' },
        stdout: { type: 'string' },
        stderr: { type: 'string' },
        isError: { type: 'boolean' },
      },
      required: [
        'command',
        'cwd',
        'exitCode',
        'signal',
        'durationMs',
        'timedOut',
        'truncated',
        'stdout',
        'stderr',
        'isError',
      ],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
];

let inputBuffer = '';
let pendingRequests = 0;
let stdinEnded = false;

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  inputBuffer += chunk;
  let newlineIndex = inputBuffer.indexOf('\n');

  while (newlineIndex !== -1) {
    const line = inputBuffer.slice(0, newlineIndex).trim();
    inputBuffer = inputBuffer.slice(newlineIndex + 1);

    if (line.length > 0) {
      pendingRequests += 1;
      void handleLine(line).finally(() => {
        pendingRequests -= 1;
        exitWhenDrained();
      });
    }

    newlineIndex = inputBuffer.indexOf('\n');
  }
});

process.stdin.on('end', () => {
  stdinEnded = true;
  exitWhenDrained();
});

process.on('uncaughtException', (error) => {
  logError('uncaughtException', error);
});

process.on('unhandledRejection', (reason) => {
  logError('unhandledRejection', reason);
});

async function handleLine(line) {
  let message;

  try {
    message = JSON.parse(line);
  } catch (error) {
    sendError(null, -32700, 'Parse error', error instanceof Error ? error.message : String(error));
    return;
  }

  if (!isJsonRpcMessage(message)) {
    sendError(getMessageId(message), -32600, 'Invalid Request');
    return;
  }

  if (message.id === undefined) {
    handleNotification(message);
    return;
  }

  try {
    const result = await handleRequest(message);
    sendResponse(message.id, result);
  } catch (error) {
    const code = Number.isInteger(error && error.code) ? error.code : -32603;
    const data = error && error.data !== undefined ? error.data : undefined;
    sendError(message.id, code, error instanceof Error ? error.message : String(error), data);
  }
}

function isJsonRpcMessage(message) {
  return message && message.jsonrpc === '2.0' && typeof message.method === 'string';
}

function getMessageId(message) {
  return message &&
    (typeof message.id === 'string' || typeof message.id === 'number' || message.id === null)
    ? message.id
    : null;
}

function handleNotification(message) {
  if (message.method !== 'notifications/initialized') {
    log(`ignored notification: ${message.method}`);
  }
}

async function handleRequest(message) {
  switch (message.method) {
    case 'initialize':
      return initialize(message.params);
    case 'ping':
      return {};
    case 'tools/list':
      return { tools };
    case 'tools/call':
      return callTool(message.params);
    default:
      throw rpcError(-32601, `Method not found: ${message.method}`);
  }
}

function initialize(params) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {
      tools: {
        listChanged: false,
      },
    },
    serverInfo: {
      name: SERVER_NAME,
      title: 'Moramor Terminal MCP Server',
      version: SERVER_VERSION,
    },
    instructions:
      'Use terminal_ping to confirm connectivity. Use terminal_run for project terminal commands; commands run inside the configured workspace root and are timeout/output capped.',
  };
}

async function callTool(params) {
  if (!params || typeof params.name !== 'string') {
    throw rpcError(-32602, 'tools/call requires params.name');
  }

  const args = params.arguments && typeof params.arguments === 'object' ? params.arguments : {};

  switch (params.name) {
    case 'terminal_ping':
      return toolResult({
        connected: true,
        server: `${SERVER_NAME}@${SERVER_VERSION}`,
        protocolVersion: PROTOCOL_VERSION,
        workspaceRoot: WORKSPACE_ROOT,
        shell: DEFAULT_SHELL,
        platform: process.platform,
        nodeVersion: process.version,
      });
    case 'terminal_run':
      return toolResult(await runCommand(args));
    default:
      throw rpcError(-32602, `Unknown tool: ${params.name}`);
  }
}

function toolResult(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);

  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
    structuredContent: typeof value === 'string' ? { text: value } : value,
    isError: Boolean(value && value.isError),
  };
}

async function runCommand(args) {
  const command = readString(args, 'command');
  const cwd = resolveWorkspacePath(readOptionalString(args, 'cwd') || WORKSPACE_ROOT);
  const timeoutMs = clampInteger(args.timeoutMs, DEFAULT_TIMEOUT_MS, 1, MAX_TIMEOUT_MS);
  const maxOutputBytes = clampInteger(
    args.maxOutputBytes,
    DEFAULT_MAX_OUTPUT_BYTES,
    1,
    MAX_OUTPUT_BYTES,
  );
  const startTime = Date.now();

  let stdout = '';
  let stderr = '';
  let outputBytes = 0;
  let truncated = false;
  let timedOut = false;

  return new Promise((resolve) => {
    let childClosed = false;
    const child = spawn(DEFAULT_SHELL, ['-lc', command], {
      cwd,
      env: {
        ...process.env,
        MCP_TERMINAL_ACTIVE: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');

      setTimeout(() => {
        if (!childClosed) {
          child.kill('SIGKILL');
        }
      }, 2_000).unref();
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      const result = appendOutput(stdout, chunk, outputBytes, maxOutputBytes);
      stdout = result.text;
      outputBytes = result.outputBytes;
      truncated = truncated || result.truncated;
    });

    child.stderr.on('data', (chunk) => {
      const result = appendOutput(stderr, chunk, outputBytes, maxOutputBytes);
      stderr = result.text;
      outputBytes = result.outputBytes;
      truncated = truncated || result.truncated;
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      const durationMs = Date.now() - startTime;
      resolve({
        command,
        cwd,
        exitCode: null,
        signal: null,
        durationMs,
        timedOut,
        truncated,
        stdout,
        stderr: `${stderr}${stderr ? '\n' : ''}${error.message}`,
        isError: true,
      });
    });

    child.on('close', (exitCode, signal) => {
      childClosed = true;
      clearTimeout(timeout);
      const durationMs = Date.now() - startTime;
      resolve({
        command,
        cwd,
        exitCode,
        signal,
        durationMs,
        timedOut,
        truncated,
        stdout,
        stderr,
        isError: timedOut || exitCode !== 0,
      });
    });
  });
}

function appendOutput(currentText, chunk, currentBytes, maxBytes) {
  if (currentBytes >= maxBytes) {
    return { text: currentText, outputBytes: currentBytes, truncated: true };
  }

  const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
  const availableBytes = maxBytes - currentBytes;
  const nextBuffer = buffer.subarray(0, availableBytes);

  return {
    text: currentText + nextBuffer.toString('utf8'),
    outputBytes: currentBytes + nextBuffer.length,
    truncated: buffer.length > availableBytes,
  };
}

function readString(source, key) {
  const value = source[key];

  if (typeof value !== 'string' || value.trim() === '') {
    throw rpcError(-32602, `Argument "${key}" must be a non-empty string`);
  }

  return value;
}

function readOptionalString(source, key) {
  const value = source[key];

  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw rpcError(-32602, `Argument "${key}" must be a string when provided`);
  }

  return value;
}

function clampInteger(value, defaultValue, min, max) {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (!Number.isInteger(value)) {
    throw rpcError(-32602, 'Numeric arguments must be integers');
  }

  return Math.min(Math.max(value, min), max);
}

function resolveWorkspacePath(requestedPath) {
  const resolvedPath = path.resolve(WORKSPACE_ROOT, requestedPath);
  const relativePath = path.relative(WORKSPACE_ROOT, resolvedPath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw rpcError(-32602, `cwd must stay inside workspace root: ${WORKSPACE_ROOT}`);
  }

  return resolvedPath;
}

function sendResponse(id, result) {
  writeMessage({
    jsonrpc: '2.0',
    id,
    result,
  });
}

function sendError(id, code, message, data) {
  const error = {
    code,
    message,
  };

  if (data !== undefined) {
    error.data = data;
  }

  writeMessage({
    jsonrpc: '2.0',
    id,
    error,
  });
}

function writeMessage(message) {
  process.stdout.write(`${JSON.stringify(message)}${os.EOL}`);
}

function exitWhenDrained() {
  if (stdinEnded && pendingRequests === 0) {
    process.exit(0);
  }
}

function rpcError(code, message, data) {
  const error = new Error(message);
  error.code = code;
  error.data = data;
  return error;
}

function log(message) {
  process.stderr.write(`[${SERVER_NAME}] ${message}${os.EOL}`);
}

function logError(label, error) {
  const message =
    error instanceof Error ? `${error.message}${os.EOL}${error.stack || ''}` : String(error);
  log(`${label}: ${message}`);
}
