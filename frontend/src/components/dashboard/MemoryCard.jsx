import { useState } from "react";
import { Check, Copy, Edit2, Trash2 } from "lucide-react";
import Markdown from "react-markdown";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  // Less than 1 minute
  if (diff < 60000) return "Just now";

  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins} min${mins > 1 ? "s" : ""} ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  // Format as date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function MemoryCard({ memory, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(memory.short_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wasEdited =
    memory.updated_at &&
    memory.created_at &&
    new Date(memory.updated_at) > new Date(memory.created_at);

  return (
    <Card className="group hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
        <CardTitle className="text-sm font-medium leading-snug break-all pr-4">
          {memory.title}
        </CardTitle>
        <Button
          variant="secondary"
          size="sm"
          onClick={copyId}
          className="h-6 px-2 text-xs font-mono text-muted-foreground shrink-0"
          title="Click to copy ID"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              <span>{memory.short_id}</span>
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
          <Markdown
            components={{
              p: ({ children }) => (
                <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
            }}
          >
            {memory.content}
          </Markdown>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between p-4 pt-0 border-t bg-muted/20 mt-4 rounded-b-xl border-t-zinc-100 dark:border-t-zinc-800">
        <div className="text-xs text-muted-foreground mt-3">
          {wasEdited ? (
            <span>Edited {formatDate(memory.updated_at)}</span>
          ) : (
            <span>{formatDate(memory.created_at)}</span>
          )}
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(memory)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(memory)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
