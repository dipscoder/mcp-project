import { FiAlertTriangle } from "react-icons/fi";
import Modal from "./Modal";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title = "Delete Note",
  message = "Are you sure you want to delete this note? This action cannot be undone.",
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <FiAlertTriangle className="text-red-600" size={20} />
        </div>
        <p className="text-sm text-zinc-600 mt-2">{message}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
