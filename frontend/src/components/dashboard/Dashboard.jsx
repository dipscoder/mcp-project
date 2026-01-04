import { useStytch, useStytchUser } from "@stytch/react";
import { useEffect, useState } from "react";
import { FiBookOpen, FiCpu, FiPlus, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../config/constants";
import { Header } from "../layout";
import { DeleteConfirmModal, SlidePanel, Spinner } from "../ui";
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
  const [showPanel, setShowPanel] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, memory: null });
  const [deleting, setDeleting] = useState(false);

  const getSessionToken = () => {
    const tokens = stytch.session.getTokens();
    return tokens?.session_token;
  };

  // Reset form
  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
    setEditingMemory(null);
    setShowPanel(false);
  };

  // Open add panel
  const openAddPanel = () => {
    setFormTitle("");
    setFormContent("");
    setEditingMemory(null);
    setShowPanel(true);
  };

  // Open edit panel
  const openEditPanel = (memory) => {
    setFormTitle(memory.title);
    setFormContent(memory.content);
    setEditingMemory(memory);
    setShowPanel(true);
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
    if (!formTitle.trim() || !formContent.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/memories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getSessionToken()}`,
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          content: formContent.trim(),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMemories([data.memory, ...memories]);
        resetForm();
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
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim() || !editingMemory) return;

    setSaving(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/memories/${editingMemory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getSessionToken()}`,
          },
          body: JSON.stringify({
            title: formTitle.trim(),
            content: formContent.trim(),
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMemories(
          memories.map((m) => (m.id === editingMemory.id ? data.memory : m))
        );
        resetForm();
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

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {/* Welcome & Purpose */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">
              Welcome, {getDisplayName()}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Your shared memory layer for AI assistants
            </p>
          </div>
          <Link
            to="/guide"
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            <FiBookOpen size={16} />
            <span className="hidden sm:inline">Setup Guide</span>
          </Link>
        </div>

        {/* Purpose explanation */}
        <div className="mb-6 p-4 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl text-white">
          <div className="flex items-start gap-3">
            <FiCpu size={20} className="mt-0.5 shrink-0" />
            <div>
              <h2 className="font-medium text-sm">How it works</h2>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                Store your preferences, project context, and personal notes
                here. Supports <strong>markdown</strong> formatting. Any
                MCP-compatible AI assistant can access these memories. Use the
                unique ID to reference specific memories.
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
              <p className="text-zinc-500 text-sm font-medium">
                No memories yet
              </p>
              <p className="text-zinc-400 text-xs mt-1">
                Click the + button to add your first memory
              </p>
            </div>
          ) : (
            memories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onEdit={openEditPanel}
                onDelete={(m) => setDeleteModal({ open: true, memory: m })}
              />
            ))
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={openAddPanel}
        className="fixed bottom-6 right-6 w-14 h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
        title="Add new memory"
      >
        <FiPlus size={24} />
      </button>

      {/* Add/Edit Memory Slide Panel */}
      <SlidePanel
        isOpen={showPanel}
        onClose={resetForm}
        title={editingMemory ? "Edit Memory" : "Add Memory"}
      >
        <MemoryForm
          title={formTitle}
          content={formContent}
          onTitleChange={setFormTitle}
          onContentChange={setFormContent}
          onSubmit={editingMemory ? handleUpdate : handleCreate}
          saving={saving}
          onCancel={resetForm}
          isEdit={!!editingMemory}
        />
      </SlidePanel>

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
