# Build MCP Service Manager CLI with Tool Execution

This updated plan includes the ability to **execute tools** from registered MCP servers, in addition to the management features.

## 1. Project Initialization & Infrastructure
- **Setup**: Initialize TypeScript project with `package.json` and `tsconfig.json`.
- **Dependencies**: 
    - `commander`: CLI framework.
    - `@modelcontextprotocol/sdk`: Official SDK for connecting and calling tools.
    - `zod`: For config and argument validation.
    - `chalk`: For terminal output styling.
- **Structure**: Separate configuration logic from MCP protocol interaction logic.

## 2. Configuration Management (Server CRUD)
- **Store**: JSON-based config file (persisted in user home directory).
- **Commands**:
    - `server add <name>`: Register a server (supports `stdio` command/args and `sse` URLs).
    - `server list`: Show all configured servers.
    - `server remove <name>`: Delete a server configuration.
    - `server update <name>`: Edit server details.

## 3. MCP Client & Tool Discovery
- **Client Wrapper**: Create a helper class to instantiate `Client` with `StdioClientTransport` or `SSEClientTransport` based on config.
- **`tools <server_name>` Command**: 
    - Connect to the specified server.
    - Fetch and display the list of available tools.
    - Show tool descriptions and required arguments (Schema) to help the user compose `call` commands.

## 4. Tool Execution (Call Command)
- **`call <server_name> <tool_name> [args...]` Command**:
    - **Argument Parsing**: Implement a parser to convert CLI arguments (e.g., `key=value` or JSON strings) into the arguments object required by the tool.
    - **Execution**: Send the tool call request to the MCP server.
    - **Output Handling**: Format and display the result (TextContent, ImageContent, or EmbeddedResource) in the terminal.

## 5. Verification
- **Test Server**: Create or use a simple "Echo" or "Math" MCP server to verify the flow.
- **End-to-End Test**: 
    1. `server add` the test server.
    2. `tools` to list capabilities.
    3. `call` to execute a function and verify output.
