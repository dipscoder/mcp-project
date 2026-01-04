import { useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiClipboard,
  FiCpu,
  FiTerminal,
  FiSettings,
  FiZap,
} from "react-icons/fi";
import { Link } from "react-router-dom";

function CodeBlock({ code, language = "bash" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-sm font-mono overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
        title="Copy to clipboard"
      >
        {copied ? <FiCheck size={14} /> : <FiClipboard size={14} />}
      </button>
    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
        {number}
      </div>
      <div className="flex-1 pb-8">
        <h3 className="font-medium text-zinc-900 mb-3">{title}</h3>
        <div className="text-sm text-zinc-600 space-y-3">{children}</div>
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
              <FiCpu size={20} />
            </div>
            <span className="font-semibold text-zinc-900">Setup Guide</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-zinc-900 mb-3">
            Connect AI Memory Hub to Your AI Assistant
          </h1>
          <p className="text-zinc-600 max-w-xl mx-auto">
            Follow this guide to connect your memories to Claude, ChatGPT, or
            any MCP-compatible AI assistant.
          </p>
        </div>

        {/* What is MCP */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-100 rounded-lg">
              <FiZap size={24} className="text-zinc-700" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 mb-2">
                What is MCP?
              </h2>
              <p className="text-sm text-zinc-600 leading-relaxed">
                The <strong>Model Context Protocol (MCP)</strong> is an open
                standard that allows AI assistants to securely connect to
                external data sources. AI Memory Hub uses MCP to let your AI
                assistants read and store memories about you, providing
                personalized assistance across all your AI interactions.
              </p>
            </div>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8">
          <h2 className="font-semibold text-zinc-900 mb-6 flex items-center gap-2">
            <FiTerminal size={20} />
            Claude Code CLI
          </h2>

          <div className="space-y-2">
            <Step number="1" title="Add the MCP server">
              <p>Run this command in your terminal:</p>
              <CodeBlock code="claude mcp add --transport http ai-memory-hub http://localhost:8000/mcp" />
              <p className="text-zinc-500 text-xs mt-2">
                Replace <code className="bg-zinc-100 px-1 rounded">localhost:8000</code> with your server URL if deployed remotely.
              </p>
            </Step>

            <Step number="2" title="Authenticate">
              <p>
                When you first use a memory tool, Claude Code will open a
                browser window for you to log in with your AI Memory Hub
                account. This is a one-time authentication.
              </p>
            </Step>

            <Step number="3" title="Start using memories">
              <p>Try these example commands with Claude:</p>
              <div className="bg-zinc-50 rounded-lg p-4 space-y-3 text-zinc-700">
                <p>
                  <strong>"What do you know about me?"</strong>
                  <br />
                  <span className="text-zinc-500 text-xs">
                    Claude will fetch all your stored memories
                  </span>
                </p>
                <p>
                  <strong>"Remember that I prefer TypeScript"</strong>
                  <br />
                  <span className="text-zinc-500 text-xs">
                    Claude will save this as a new memory
                  </span>
                </p>
                <p>
                  <strong>"Refer to memory abc123"</strong>
                  <br />
                  <span className="text-zinc-500 text-xs">
                    Claude will fetch the specific memory by ID
                  </span>
                </p>
              </div>
            </Step>
          </div>
        </div>

        {/* Claude Desktop */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8">
          <h2 className="font-semibold text-zinc-900 mb-6 flex items-center gap-2">
            <FiSettings size={20} />
            Claude Desktop
          </h2>

          <div className="space-y-2">
            <Step number="1" title="Open the config file">
              <p>Navigate to your Claude Desktop configuration:</p>
              <CodeBlock code="~/Library/Application Support/Claude/claude_desktop_config.json" />
              <p className="text-zinc-500 text-xs mt-2">
                On Windows: <code className="bg-zinc-100 px-1 rounded">%APPDATA%\Claude\claude_desktop_config.json</code>
              </p>
            </Step>

            <Step number="2" title="Add the MCP server configuration">
              <p>Add this to your config file:</p>
              <CodeBlock
                language="json"
                code={`{
  "mcpServers": {
    "ai-memory-hub": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8000/mcp"]
    }
  }
}`}
              />
            </Step>

            <Step number="3" title="Restart Claude Desktop">
              <p>
                Close and reopen Claude Desktop for the changes to take effect.
                You'll see "AI Memory Hub" in your available tools.
              </p>
            </Step>
          </div>
        </div>

        {/* Available Tools */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8">
          <h2 className="font-semibold text-zinc-900 mb-4">Available Tools</h2>
          <p className="text-sm text-zinc-600 mb-4">
            Once connected, your AI assistant will have access to these tools:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg">
              <code className="text-xs bg-zinc-200 px-2 py-1 rounded font-mono">
                get_my_memories
              </code>
              <p className="text-sm text-zinc-600">
                Retrieves all your stored memories with titles and content
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg">
              <code className="text-xs bg-zinc-200 px-2 py-1 rounded font-mono">
                get_memory_by_id
              </code>
              <p className="text-sm text-zinc-600">
                Fetches a specific memory by its unique 6-character ID
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg">
              <code className="text-xs bg-zinc-200 px-2 py-1 rounded font-mono">
                add_memory
              </code>
              <p className="text-sm text-zinc-600">
                Saves a new memory with a title and content for future reference
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-6 text-white">
          <h2 className="font-semibold mb-4">Tips for Better Memories</h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex items-start gap-2">
              <FiCheck size={16} className="mt-0.5 text-green-400 shrink-0" />
              <span>
                Use descriptive titles so AI assistants can quickly understand
                the context
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FiCheck size={16} className="mt-0.5 text-green-400 shrink-0" />
              <span>
                Include specific details like versions, preferences, and project
                names
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FiCheck size={16} className="mt-0.5 text-green-400 shrink-0" />
              <span>
                Use markdown formatting for better readability (bold, lists,
                code blocks)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FiCheck size={16} className="mt-0.5 text-green-400 shrink-0" />
              <span>
                Reference memory IDs when you want AI to use specific context
              </span>
            </li>
          </ul>
        </div>

        {/* Back button */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <FiArrowLeft size={16} />
            Back to Memories
          </Link>
        </div>
      </main>
    </div>
  );
}
