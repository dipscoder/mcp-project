import { Bold, Code, Italic, Link, List } from "lucide-react";

const tools = [
  {
    icon: Bold,
    label: "Bold",
    prefix: "**",
    suffix: "**",
    placeholder: "bold text",
  },
  {
    icon: Italic,
    label: "Italic",
    prefix: "*",
    suffix: "*",
    placeholder: "italic text",
  },
  { icon: Code, label: "Code", prefix: "`", suffix: "`", placeholder: "code" },
  {
    icon: List,
    label: "List",
    prefix: "- ",
    suffix: "",
    placeholder: "list item",
  },
  {
    icon: Link,
    label: "Link",
    prefix: "[",
    suffix: "](url)",
    placeholder: "link text",
  },
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
        selectedText
          ? start + tool.prefix.length + selectedText.length
          : newCursorPos
      );
    }, 0);
  };

  return (
    <div className="flex items-center gap-1 p-2 bg-muted/50 border-b border-input rounded-t-md">
      {tools.map((tool) => (
        <button
          key={tool.label}
          type="button"
          onClick={() => insertFormat(tool)}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
          title={tool.label}
        >
          <tool.icon className="h-4 w-4" />
        </button>
      ))}
      <span className="ml-auto text-xs text-muted-foreground mr-2">
        Markdown supported
      </span>
    </div>
  );
}
