# mcpp - MCP CLI Manager

[English](./README_EN.md) | [简体中文](./README.md)

A powerful command-line interface for managing and interacting with [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers.

## Features

- 🔌 **Server Management**: Easily add, remove, list, and update MCP servers (Stdio & SSE).
- 🛠️ **Tool Discovery**: List available tools from any configured server.
- 🚀 **Tool Execution**: Call tools directly from the CLI with automatic argument parsing.
- ⚙️ **Config Management**: Import configurations from existing JSON files (e.g., `.mcporter`).
- 🔄 **Persistence**: Automatically saves configuration to `~/.mcp/config.json`.

## Installation

```bash
npm install -g mcpp
```

## Usage

### 1. Server Management

**List all servers:**
```bash
mcpp server list
```

**Add a Stdio server:**
```bash
# Add a local Node.js server
mcpp server add my-server --command node --args ./build/index.js

# Add a server using npx/uvx
mcpp server add fetch --command uvx --args mcp-server-fetch
```

**Add an SSE server:**
```bash
mcpp server add remote-server --type sse --url http://localhost:8000/sse
```

**Remove a server:**
```bash
mcpp server remove my-server
```

### 2. Tool Interaction

**List tools available on a server:**
```bash
mcpp tools fetch
```

**Call a tool:**
Arguments are passed as `key=value` pairs. The CLI attempts to parse values as JSON (numbers, booleans, objects) automatically.

```bash
# Simple string argument
mcpp call fetch fetch url="https://example.com"

# JSON object argument
mcpp call my-server createUser user='{"name": "Alice", "age": 30}'

# Boolean/Number argument
mcpp call my-server config debug=true timeout=5000
```

### 3. Configuration Management

**Import configuration:**
Import servers from a standard MCP JSON configuration file (e.g., `mcporter.json` or VSCode config).

```bash
# Import and merge (skips duplicates)
mcpp config import ~/.mcporter/mcporter.json

# Import and overwrite existing servers
mcpp config import ~/.mcporter/mcporter.json --force
```

## Configuration File

By default, configuration is stored in:
`~/.mcp/config.json`

You can override this location by setting the `MCP_CONFIG_DIR` environment variable.

## License

ISC
