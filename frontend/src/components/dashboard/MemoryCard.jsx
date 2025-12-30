import { useState } from "react";
import { FiCopy, FiCheck, FiEdit2, FiTrash2 } from "react-icons/fi";
import { Spinner } from "../ui";

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

export default function MemoryCard({
  memory,
  onEdit,
  onDelete,
  isEditing,
  editContent,
  setEditContent,
  onSave,
  onCancel,
  saving,
}) {
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

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 p-4">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          disabled={saving}
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!editContent.trim() || saving}
            className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Spinner size="sm" className="border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    );
  }

  const wasEdited =
    memory.updated_at &&
    memory.created_at &&
    new Date(memory.updated_at) > new Date(memory.created_at);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 group">
      {/* Short ID badge */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={copyId}
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-md text-xs font-mono text-zinc-600 transition-colors cursor-pointer"
          title="Click to copy ID"
        >
          {copied ? (
            <>
              <FiCheck size={12} className="text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <FiCopy size={12} />
              <span>{memory.short_id}</span>
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <p className="text-sm text-zinc-700 whitespace-pre-wrap">
        {memory.content}
      </p>

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
