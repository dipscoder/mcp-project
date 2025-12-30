import { FiPlus } from "react-icons/fi";
import { Spinner } from "../ui";

export default function MemoryForm({ value, onChange, onSubmit, saving }) {
  return (
    <form onSubmit={onSubmit} className="mb-6">
      <div className="bg-white rounded-xl border border-zinc-200 p-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add a memory for AI assistants... (e.g., 'I prefer TypeScript over JavaScript' or 'My current project uses React Native')"
          rows={3}
          className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent placeholder:text-zinc-400"
          disabled={saving}
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={!value.trim() || saving}
            className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <>
                <Spinner size="sm" className="border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <FiPlus size={16} />
                Add Memory
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
