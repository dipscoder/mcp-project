import { FiBold, FiCode, FiItalic, FiLink, FiList } from "react-icons/fi";

const tools = [
  { icon: FiBold, label: "Bold", prefix: "**", suffix: "**", placeholder: "bold text" },
  { icon: FiItalic, label: "Italic", prefix: "*", suffix: "*", placeholder: "italic text" },
  { icon: FiCode, label: "Code", prefix: "`", suffix: "`", placeholder: "code" },
  { icon: FiList, label: "List", prefix: "- ", suffix: "", placeholder: "list item" },
  { icon: FiLink, label: "Link", prefix: "[", suffix: "](url)", placeholder: "link text" },
];

export default function MarkdownToolbar({ textareaRef, value, onChange }) {
  const insertFormat = (tool) => {
    const textarea = textareaRef?.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || tool.placeholder;

    const newText =
      value.substring(0, start) +
      tool.prefix +
      textToInsert +
      tool.suffix +
      value.substring(end);

    onChange(newText);

    // Set cursor position after the operation
    setTimeout(() => {
      const newCursorPos = start + tool.prefix.length + textToInsert.length;
      textarea.focus();
      textarea.setSelectionRange(
        selectedText ? start + tool.prefix.length : newCursorPos,
        selectedText ? start + tool.prefix.length + selectedText.length : newCursorPos
      );
    }, 0);
  };

  return (
    <div className="flex items-center gap-1 p-2 bg-zinc-50 border-b border-zinc-200 rounded-t-lg">
      {tools.map((tool) => (
        <button
          key={tool.label}
          type="button"
          onClick={() => insertFormat(tool)}
          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded transition-colors cursor-pointer"
          title={tool.label}
        >
          <tool.icon size={16} />
        </button>
      ))}
      <span className="ml-auto text-xs text-zinc-400">Markdown supported</span>
    </div>
  );
}
