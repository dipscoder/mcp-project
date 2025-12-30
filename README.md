# AI Memory Hub

A shared memory layer for AI assistants via the Model Context Protocol (MCP). Store personal context, preferences, and notes that any MCP-compatible AI assistant can access - solving the problem of lost context when switching between AI tools.

## The Problem

Every time you switch AI assistants (Claude, ChatGPT, Copilot, etc.), you lose all the context and preferences you've built up. You end up repeating yourself constantly:

- "I prefer TypeScript over JavaScript"
- "My project uses PostgreSQL"
- "I'm working on a React Native app"

## The Solution

AI Memory Hub provides a centralized memory layer that:

- **Persists your context** across all AI interactions
- **Shares memories** between different AI assistants via MCP
- **Lets you control** what AI assistants know about you
- **References specific memories** using unique IDs

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Claude Code    │     │    ChatGPT      │     │   Other AI      │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │         MCP Protocol  │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     AI Memory Hub       │
                    │                         │
                    │  - Personal preferences │
                    │  - Project context      │
                    │  - Work notes           │
                    │  - Any memory you want  │
                    └─────────────────────────┘
```

## Features

- **Secure Authentication** - Powered by Stytch for secure user authentication
- **MCP Integration** - Works with any MCP-compatible AI assistant
- **CRUD Operations** - Full control over your memories via web UI
- **Unique Memory IDs** - Reference specific memories in conversations
- **Real-time Sync** - Changes reflect immediately across all AI tools

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [Stytch](https://stytch.com/) account (free tier available)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-memory-hub.git
cd ai-memory-hub
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
uv sync

# Create .env file
cp .env.example .env
```

Edit `.env` with your Stytch credentials:

```env
STYTCH_PROJECT_ID=project-test-xxxxxxxx
STYTCH_SECRET=secret-test-xxxxxxxx
STYTCH_DOMAIN=https://test.stytch.com/v1/public/project-test-xxxxxxxx
```

Start the backend:

```bash
uv run python main.py
```

The MCP server runs at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Create .env file with your Stytch public token
echo "VITE_STYTCH_PUBLIC_TOKEN=public-token-test-xxxxxxxx" > .env

# Start development server
pnpm dev
```

The web UI is available at `http://localhost:5173`

### 4. Connect Your AI Assistant

#### Claude Code

Add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "ai-memory-hub": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8000/sse"]
    }
  }
}
```

## MCP Tools Available

| Tool               | Description                                      |
| ------------------ | ------------------------------------------------ |
| `get_my_memories`  | Retrieve all memories for the authenticated user |
| `get_memory_by_id` | Fetch a specific memory by its unique ID         |
| `add_memory`       | Store a new memory for future reference          |

## Usage Examples

### In Claude Code

```
You: What are my preferences?
AI: Let me check your memories...
    [Calls get_my_memories]
    Based on your memories, you prefer TypeScript, use VS Code, and are working on a React Native project.

You: Remember that I'm using PostgreSQL 15 for this project
AI: [Calls add_memory with "Using PostgreSQL 15 for current project"]
    I've saved that to your memory hub.

You: Refer to memory #abc123 for my coding style
AI: [Calls get_memory_by_id with "abc123"]
    Got it! I see your coding style preferences...
```

### In Web UI

1. Log in at `http://localhost:5173`
2. Add memories that you want AI assistants to know
3. Copy memory IDs to reference in conversations
4. Edit or delete memories as needed

## Project Structure

```
ai-memory-hub/
├── backend/
│   ├── main.py          # FastMCP server with MCP tools
│   ├── database.py      # SQLAlchemy models and repository
│   └── .env             # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── config/      # Configuration
│   │   └── App.jsx      # Main app router
│   └── .env             # Frontend environment
└── README.md
```

## Tech Stack

- **Backend**: Python, FastMCP, SQLAlchemy, SQLite
- **Frontend**: React, Vite, Tailwind CSS v4
- **Auth**: Stytch (passwords + OAuth)
- **Protocol**: Model Context Protocol (MCP)

## Security

- All API endpoints require authentication
- Session tokens validated via Stytch API
- MCP tools use JWT bearer authentication
- User data is isolated by user_id

## Contributing

Contributions are welcome! Please open an issue or submit a PR.
