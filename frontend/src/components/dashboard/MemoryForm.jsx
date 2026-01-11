import { useRef } from "react";
import { Plus, Save, Loader2 } from "lucide-react";
import { MAX_CONTENT_LENGTH, MAX_TITLE_LENGTH } from "../../config/constants";
import { MarkdownToolbar } from "../ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    <form onSubmit={onSubmit} className="flex flex-col h-full gap-6">
      {/* Title input */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="E.g., My coding preferences"
          maxLength={MAX_TITLE_LENGTH}
          disabled={saving}
          autoFocus
          className="bg-background"
        />
        <div className="flex justify-end">
          <span
            className={`text-xs ${
              titleLength > MAX_TITLE_LENGTH * 0.9
                ? "text-amber-600"
                : "text-muted-foreground"
            }`}
          >
            {titleLength}/{MAX_TITLE_LENGTH}
          </span>
        </div>
      </div>

      {/* Content textarea with markdown toolbar */}
      <div className="flex-1 flex flex-col space-y-2 min-h-0">
        <Label htmlFor="content">Content</Label>
        <div className="flex-1 flex flex-col border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
          <MarkdownToolbar
            textareaRef={textareaRef}
            value={content}
            onChange={onContentChange}
          />
          <Textarea
            ref={textareaRef}
            id="content"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Write your memory here...

Examples:
- I prefer TypeScript over JavaScript
- My current project uses React Native with Expo
- **Bold** and *italic* markdown is supported

Use the toolbar above to format your text."
            maxLength={MAX_CONTENT_LENGTH}
            className="flex-1 min-h-[200px] w-full resize-none border-0 rounded-none focus-visible:ring-0 px-4 py-3 font-mono text-sm leading-relaxed"
            disabled={saving}
          />
        </div>
        <div className="flex justify-end">
          <span
            className={`text-xs ${
              contentLength > MAX_CONTENT_LENGTH * 0.9
                ? "text-amber-600"
                : "text-muted-foreground"
            }`}
          >
            {contentLength.toLocaleString()}/
            {MAX_CONTENT_LENGTH.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t mt-auto">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!isValid || saving}
          className="min-w-[120px]"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEdit ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Memory
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
