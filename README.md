# GPT-5 MCP Server

[![smithery badge](https://smithery.ai/badge/@alfie-max/gpt5-mcp)](https://smithery.ai/server/@alfie-max/gpt5-mcp)

A Model Context Protocol (MCP) server that provides integration with OpenAI's GPT-5 API through Claude Desktop.

## Features

- **gpt5_generate** - Simple text generation with a prompt
- **gpt5_messages** - Multi-turn conversation support
- Standard MCP server using stdio transport
- Direct integration with OpenAI API

## Installation

### Installing via Smithery

To install gpt5-mcp for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@alfie-max/gpt5-mcp):

```bash
npx -y @smithery/cli install @alfie-max/gpt5-mcp --client claude
```

### Manual Installation
1. Clone this repository:
```bash
git clone https://github.com/alfie-max/gpt5-mcp.git
cd gpt5-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

## Configuration

Create a `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Usage with Claude Desktop

Add this server to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gpt5": {
      "command": "node",
      "args": ["/absolute/path/to/gpt5-mcp/index.js"],
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key"
      }
    }
  }
}
```

Or if you prefer using the .env file:

```json
{
  "mcpServers": {
    "gpt5": {
      "command": "node",
      "args": ["/absolute/path/to/gpt5-mcp/index.js"]
    }
  }
}
```

## Available Tools

### gpt5_generate

Generate text with a simple prompt.

**Parameters:**
- `prompt` (required) - The text prompt
- `max_tokens` (optional) - Maximum tokens to generate (default: 1000)
- `temperature` (optional) - Sampling temperature 0-2 (default: 0.7)

**Example:**
```
Use gpt5_generate to write a haiku about programming
```

### gpt5_messages

Handle multi-turn conversations.

**Parameters:**
- `messages` (required) - Array of message objects with `role` and `content`
- `system_prompt` (optional) - System message to prepend
- `max_tokens` (optional) - Maximum tokens (default: 1000)
- `temperature` (optional) - Temperature 0-2 (default: 0.7)

**Example:**
```
Use gpt5_messages with:
- System: "You are a helpful assistant"
- User: "Explain recursion"
```

## Development

Run the server locally:
```bash
npm start
```

Run with auto-reload during development:
```bash
npm run dev
```

## Testing

Test the server with the MCP inspector:
```bash
npx @modelcontextprotocol/inspector node index.js
```

## Project Structure

```
gpt5-mcp/
├── index.js        # Main MCP server
├── package.json    # Dependencies
├── .env           # Your API key (create from .env.example)
├── .env.example   # Environment template
└── README.md      # This file
```

## Requirements

- Node.js 18 or higher
- OpenAI API key with GPT-5 access

## License

MIT
