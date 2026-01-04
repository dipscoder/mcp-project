import { useRef } from "react";
import { FiPlus, FiSave } from "react-icons/fi";
import { MAX_CONTENT_LENGTH, MAX_TITLE_LENGTH } from "../../config/constants";
import { MarkdownToolbar, Spinner } from "../ui";

export default function MemoryForm({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSubmit,
  saving,
  onCancel,
  isEdit = false,
}) {
  const textareaRef = useRef(null);

  const isValid = title?.trim() && content?.trim();
  const titleLength = title?.length || 0;
  const contentLength = content?.length || 0;

  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
      {/* Title input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="E.g., My coding preferences"
          maxLength={MAX_TITLE_LENGTH}
          className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent placeholder:text-zinc-400"
          disabled={saving}
          autoFocus
        />
        <div className="flex justify-end mt-1">
          <span
            className={`text-xs ${titleLength > MAX_TITLE_LENGTH * 0.9 ? "text-amber-600" : "text-zinc-400"}`}
          >
            {titleLength}/{MAX_TITLE_LENGTH}
          </span>
        </div>
      </div>

      {/* Content textarea with markdown toolbar */}
      <div className="flex-1 flex flex-col mb-4">
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Content
        </label>
        <div className="flex-1 flex flex-col border border-zinc-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900 focus-within:border-transparent">
          <MarkdownToolbar
            textareaRef={textareaRef}
            value={content}
            onChange={onContentChange}
          />
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Write your memory here...

Examples:
- I prefer TypeScript over JavaScript
- My current project uses React Native with Expo
- **Bold** and *italic* markdown is supported

Use the toolbar above to format your text."
            maxLength={MAX_CONTENT_LENGTH}
            className="flex-1 min-h-[200px] w-full px-3 py-2.5 text-sm resize-none focus:outline-none placeholder:text-zinc-400 font-mono"
            disabled={saving}
          />
        </div>
        <div className="flex justify-end mt-1">
          <span
            className={`text-xs ${contentLength > MAX_CONTENT_LENGTH * 0.9 ? "text-amber-600" : "text-zinc-400"}`}
          >
            {contentLength.toLocaleString()}/{MAX_CONTENT_LENGTH.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg cursor-pointer disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid || saving}
          className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {saving ? (
            <>
              <Spinner size="sm" className="border-white/30 border-t-white" />
              Saving...
            </>
          ) : isEdit ? (
            <>
              <FiSave size={16} />
              Save Changes
            </>
          ) : (
            <>
              <FiPlus size={16} />
              Add Memory
            </>
          )}
        </button>
      </div>
    </form>
  );
}
