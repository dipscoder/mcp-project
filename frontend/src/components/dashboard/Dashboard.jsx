import { useStytch, useStytchUser } from "@stytch/react";
import { useEffect, useState } from "react";
import { FiFileText, FiX } from "react-icons/fi";
import { BACKEND_URL } from "../../config/constants";
import { Header } from "../layout";
import { DeleteConfirmModal, Spinner } from "../ui";
import NoteCard from "./NoteCard";
import NoteForm from "./NoteForm";

export default function Dashboard() {
  const { user } = useStytchUser();
  const stytch = useStytch();

  // Notes state
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, note: null });
  const [deleting, setDeleting] = useState(false);

  const getSessionToken = () => {
    const tokens = stytch.session.getTokens();
    return tokens?.session_token;
  };

  // Fetch notes
  const fetchNotes = async () => {
    const token = getSessionToken();
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setNotes(data.notes || []);
        setError("");
      } else {
        setError(data.error || "Failed to fetch notes");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Create note
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getSessionToken()}`,
        },
        body: JSON.stringify({ content: newNote.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setNotes([data.note, ...notes]);
        setNewNote("");
        setError("");
      } else {
        setError(data.error || "Failed to create note");
      }
    } catch {
      setError("Failed to create note");
    } finally {
      setSaving(false);
    }
  };

  // Update note
  const handleUpdate = async () => {
    if (!editContent.trim() || !editingId) return;

    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/notes/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getSessionToken()}`,
        },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setNotes(notes.map((n) => (n.id === editingId ? data.note : n)));
        setEditingId(null);
        setEditContent("");
        setError("");
      } else {
        setError(data.error || "Failed to update note");
      }
    } catch {
      setError("Failed to update note");
    } finally {
      setSaving(false);
    }
  };

  // Delete note
  const handleDelete = async () => {
    if (!deleteModal.note) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/notes/${deleteModal.note.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getSessionToken()}` },
        }
      );
      if (response.ok) {
        setNotes(notes.filter((n) => n.id !== deleteModal.note.id));
        setDeleteModal({ open: false, note: null });
        setError("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete note");
      }
    } catch {
      setError("Failed to delete note");
    } finally {
      setDeleting(false);
    }
  };

  const getDisplayName = () => {
    if (user?.name?.first_name) {
      return `${user.name.first_name}${user.name.last_name ? ` ${user.name.last_name}` : ""}`;
    }
    return user?.emails?.[0]?.email?.split("@")[0] || "User";
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-900">
            Welcome, {getDisplayName()}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your notes for AI agents
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-600 cursor-pointer"
            >
              <FiX size={16} />
            </button>
          </div>
        )}

        {/* Create note form */}
        <NoteForm
          value={newNote}
          onChange={setNewNote}
          onSubmit={handleCreate}
          saving={saving && !editingId}
        />

        {/* Notes list */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Spinner size="lg" className="mb-3" />
              <p className="text-sm">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
              <FiFileText size={40} className="mx-auto text-zinc-300 mb-4" />
              <p className="text-zinc-500 text-sm font-medium">No notes yet</p>
              <p className="text-zinc-400 text-xs mt-1">
                Create your first note above
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isEditing={editingId === note.id}
                editContent={editContent}
                setEditContent={setEditContent}
                saving={saving && editingId === note.id}
                onEdit={(n) => {
                  setEditingId(n.id);
                  setEditContent(n.content);
                }}
                onDelete={(n) => setDeleteModal({ open: true, note: n })}
                onSave={handleUpdate}
                onCancel={() => {
                  setEditingId(null);
                  setEditContent("");
                }}
              />
            ))
          )}
        </div>
      </main>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, note: null })}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
