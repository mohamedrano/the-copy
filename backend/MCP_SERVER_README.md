# MCP Server - Demo Calculator

This is a Model Context Protocol (MCP) server implementation that exposes calculator tools and dynamic resources.

## Features

### Tools
- **Addition Tool** (`add`): Adds two numbers together
  - Input: `{ a: number, b: number }`
  - Output: `{ result: number }`

### Resources
- **Greeting Resource** (`greeting://{name}`): Dynamic greeting generator
  - Example: `greeting://John` returns "Hello, John!"

## Running the Server

### Development Mode (with auto-reload)
```bash
cd backend
npm run dev:mcp
```

### Production Mode
```bash
cd backend
npm run mcp
```

The server will start on `http://localhost:3000/mcp` by default.

You can customize the port by setting the `MCP_PORT` environment variable:
```bash
MCP_PORT=3001 npm run mcp
```

## Connecting to the Server

You can connect to this MCP server using any MCP client that supports Streamable HTTP:

### 1. MCP Inspector
```bash
npx @modelcontextprotocol/inspector
```
Then connect to: `http://localhost:3000/mcp`

### 2. Claude Code
```bash
claude mcp add --transport http my-server http://localhost:3000/mcp
```

### 3. VS Code
```bash
code --add-mcp '{"name":"my-server","type":"http","url":"http://localhost:3000/mcp"}'
```

### 4. Cursor
Use the deeplink provided in the MCP documentation.

## Testing the Tools

Once connected, you can:
1. Ask the AI agent to add two numbers using the `add` tool
2. Request greeting resources for different names
3. The server logs all operations for debugging

## Architecture

- **Framework**: Express.js with TypeScript
- **MCP SDK**: `@modelcontextprotocol/sdk`
- **Transport**: Streamable HTTP (stateless mode)
- **Validation**: Zod schemas for input/output

## File Structure

```
backend/src/
├── mcp-server.ts       # MCP server implementation
├── server.ts           # Main API server
└── ...
```

## Environment Variables

- `MCP_PORT`: Port for the MCP server (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## Logs

All MCP operations are logged using Winston logger with timestamps and context information.

## Next Steps

To extend this server:
1. Add more tools in `mcp-server.ts` using `server.registerTool()`
2. Add more resources using `server.registerResource()`
3. Add prompts using `server.registerPrompt()`
4. Implement sampling for LLM completions using `server.server.createMessage()`

Refer to the MCP SDK documentation for advanced features like:
- Session management
- Elicitation (user input requests)
- Context-aware completions
- OAuth integration