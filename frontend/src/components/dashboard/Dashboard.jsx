import { useStytch, useStytchUser } from "@stytch/react";
import { useEffect, useState } from "react";
import { FiCpu, FiX } from "react-icons/fi";
import { BACKEND_URL } from "../../config/constants";
import { Header } from "../layout";
import { DeleteConfirmModal, Spinner } from "../ui";
import MemoryCard from "./MemoryCard";
import MemoryForm from "./MemoryForm";

export default function Dashboard() {
  const { user } = useStytchUser();
  const stytch = useStytch();

  // Memories state
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [newMemory, setNewMemory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, memory: null });
  const [deleting, setDeleting] = useState(false);

  const getSessionToken = () => {
    const tokens = stytch.session.getTokens();
    return tokens?.session_token;
  };

  // Fetch memories
  const fetchMemories = async () => {
    const token = getSessionToken();
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/memories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setMemories(data.memories || []);
        setError("");
      } else {
        setError(data.error || "Failed to fetch memories");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  // Create memory
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newMemory.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/memories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getSessionToken()}`,
        },
        body: JSON.stringify({ content: newMemory.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setMemories([data.memory, ...memories]);
        setNewMemory("");
        setError("");
      } else {
        setError(data.error || "Failed to create memory");
      }
    } catch {
      setError("Failed to create memory");
    } finally {
      setSaving(false);
    }
  };

  // Update memory
  const handleUpdate = async () => {
    if (!editContent.trim() || !editingId) return;

    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/memories/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getSessionToken()}`,
        },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setMemories(memories.map((m) => (m.id === editingId ? data.memory : m)));
        setEditingId(null);
        setEditContent("");
        setError("");
      } else {
        setError(data.error || "Failed to update memory");
      }
    } catch {
      setError("Failed to update memory");
    } finally {
      setSaving(false);
    }
  };

  // Delete memory
  const handleDelete = async () => {
    if (!deleteModal.memory) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/memories/${deleteModal.memory.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getSessionToken()}` },
        }
      );
      if (response.ok) {
        setMemories(memories.filter((m) => m.id !== deleteModal.memory.id));
        setDeleteModal({ open: false, memory: null });
        setError("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete memory");
      }
    } catch {
      setError("Failed to delete memory");
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
        {/* Welcome & Purpose */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-900">
            Welcome, {getDisplayName()}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Your shared memory layer for AI assistants
          </p>
        </div>

        {/* Purpose explanation */}
        <div className="mb-6 p-4 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl text-white">
          <div className="flex items-start gap-3">
            <FiCpu size={20} className="mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-medium text-sm">How it works</h2>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                Store your preferences, project context, and personal notes here.
                Any MCP-compatible AI assistant (Claude, ChatGPT, etc.) can access these memories
                to provide personalized help. Use the unique ID to reference specific memories in conversations.
              </p>
            </div>
          </div>
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

        {/* Create memory form */}
        <MemoryForm
          value={newMemory}
          onChange={setNewMemory}
          onSubmit={handleCreate}
          saving={saving && !editingId}
        />

        {/* Memories list */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Spinner size="lg" className="mb-3" />
              <p className="text-sm">Loading memories...</p>
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
              <FiCpu size={40} className="mx-auto text-zinc-300 mb-4" />
              <p className="text-zinc-500 text-sm font-medium">No memories yet</p>
              <p className="text-zinc-400 text-xs mt-1">
                Add your first memory for AI assistants to reference
              </p>
            </div>
          ) : (
            memories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                isEditing={editingId === memory.id}
                editContent={editContent}
                setEditContent={setEditContent}
                saving={saving && editingId === memory.id}
                onEdit={(m) => {
                  setEditingId(m.id);
                  setEditContent(m.content);
                }}
                onDelete={(m) => setDeleteModal({ open: true, memory: m })}
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
        onClose={() => setDeleteModal({ open: false, memory: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Memory"
        message="Are you sure you want to delete this memory? AI assistants will no longer be able to access it."
      />
    </div>
  );
}
