import { useState } from "react";
import { FiCheck, FiCopy, FiEdit2, FiTrash2 } from "react-icons/fi";
import Markdown from "react-markdown";

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
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = memory.short_id;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wasEdited =
    memory.updated_at &&
    memory.created_at &&
    new Date(memory.updated_at) > new Date(memory.created_at);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 group hover:border-zinc-300 transition-colors">
      {/* Header: Title + ID */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-medium text-zinc-900 text-sm leading-snug">
          {memory.title}
        </h3>
        <button
          onClick={copyId}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-md text-xs font-mono text-zinc-500 transition-colors cursor-pointer"
          title="Click to copy ID"
        >
          {copied ? (
            <>
              <FiCheck size={11} className="text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <FiCopy size={11} />
              <span>{memory.short_id}</span>
            </>
          )}
        </button>
      </div>

      {/* Content - Rendered as Markdown */}
      <div className="prose prose-sm prose-zinc max-w-none text-zinc-600">
        <Markdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => (
              <strong className="font-semibold text-zinc-900">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            code: ({ children }) => (
              <code className="px-1.5 py-0.5 bg-zinc-100 rounded text-xs font-mono text-zinc-800">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="p-3 bg-zinc-100 rounded-lg overflow-x-auto text-xs font-mono my-2">
                {children}
              </pre>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
            ),
            li: ({ children }) => <li className="text-sm">{children}</li>,
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-blue-600 hover:underline cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            h1: ({ children }) => (
              <h1 className="text-lg font-bold text-zinc-900 mt-3 mb-2">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-base font-bold text-zinc-900 mt-3 mb-2">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-bold text-zinc-900 mt-2 mb-1">{children}</h3>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-zinc-300 pl-3 italic text-zinc-600 my-2">
                {children}
              </blockquote>
            ),
          }}
        >
          {memory.content}
        </Markdown>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
        <div className="text-xs text-zinc-400">
          {wasEdited ? (
            <span>Edited {formatDate(memory.updated_at)}</span>
          ) : (
            <span>{formatDate(memory.created_at)}</span>
          )}
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(memory)}
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer"
            title="Edit"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(memory)}
            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
