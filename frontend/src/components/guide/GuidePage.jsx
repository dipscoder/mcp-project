import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Clipboard,
  Cpu,
  Terminal,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ModeToggle } from "@/components/mode-toggle";

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <pre className="bg-zinc-950 text-zinc-50 rounded-lg p-4 text-sm font-mono overflow-x-auto border border-zinc-800">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="absolute top-2 right-2 text-zinc-400 hover:text-white hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Clipboard className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
        {number}
      </div>
      <div className="flex-1 pb-8 border-l border-border ml-4 pl-8 last:border-0 last:pb-0">
        <h3 className="font-medium text-foreground mb-3">{title}</h3>
        <div className="text-sm text-muted-foreground space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="font-semibold text-lg">Setup Guide</span>
            </div>
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Connect My Memory Notes
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your centralized memory store via MCP for different LLMs.
          </p>
        </div>

        {/* Integration Steps */}
        <div className="space-y-6">
          <Tabs defaultValue="cli" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="cli" className="gap-2">
                <Terminal className="h-4 w-4" />
                Claude Code CLI
              </TabsTrigger>
              <TabsTrigger value="desktop" className="gap-2">
                <Settings className="h-4 w-4" />
                Claude Desktop
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cli" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Claude Code CLI Setup</CardTitle>
                  <CardDescription>
                    Connect via the terminal for command-line memory access.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-6">
                    <Step number="1" title="Add the MCP server">
                      <p>Run this command in your terminal:</p>
                      <CodeBlock code="claude mcp add --transport http ai-memory-hub http://localhost:8000/mcp" />
                      <p className="text-xs text-muted-foreground">
                        Replace{" "}
                        <code className="bg-muted px-1 rounded">
                          localhost:8000
                        </code>{" "}
                        with your server URL if deployed remotely.
                      </p>
                    </Step>

                    <Step number="2" title="Authenticate">
                      <p>
                        When you first use a memory tool, Claude Code will open
                        a browser window for you to log in with your AI Memory
                        Hub account. This is a one-time authentication per
                        session.
                      </p>
                    </Step>

                    <Step number="3" title="Start using memories">
                      <p>Try these example commands with Claude:</p>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-4 text-sm">
                        <div>
                          <p className="font-medium text-foreground">
                            "What do you know about me?"
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Fetches all your stored memories
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            "Remember that I prefer TypeScript"
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Saves a new memory
                          </p>
                        </div>
                      </div>
                    </Step>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="desktop" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Claude Desktop Setup</CardTitle>
                  <CardDescription>
                    Configure the desktop app to access your persistent
                    memories.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-6">
                    <Step number="1" title="Open configuration">
                      <p>Open this file in your editor:</p>
                      <CodeBlock code="~/Library/Application Support/Claude/claude_desktop_config.json" />
                      <p className="text-xs text-muted-foreground">
                        Windows:{" "}
                        <code className="bg-muted px-1 rounded">
                          %APPDATA%\Claude\claude_desktop_config.json
                        </code>
                      </p>
                    </Step>

                    <Step number="2" title="Add MCP server config">
                      <p>Insert this JSON configuration:</p>
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
                        Close and reopen Claude Desktop. You should see "AI
                        Memory Hub" (looks like a plug icon) in your available
                        tools list.
                      </p>
                    </Step>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
