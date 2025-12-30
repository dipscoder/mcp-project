import { FiPlus } from "react-icons/fi";
import { Spinner } from "../ui";

export default function NoteForm({ value, onChange, onSubmit, saving }) {
  return (
    <form onSubmit={onSubmit} className="mb-6">
      <div className="bg-white rounded-xl border border-zinc-200 p-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write a new note..."
          rows={3}
          className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          disabled={saving}
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={!value.trim() || saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Spinner size="sm" className="border-white/30 border-t-white" />
                Adding...
              </>
            ) : (
              <>
                <FiPlus size={16} />
                Add Note
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
