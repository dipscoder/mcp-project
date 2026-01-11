import { useStytch, useStytchUser } from "@stytch/react";
import { useEffect, useState } from "react";
import { BookOpen, Cpu, Plus, X, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../config/constants";
import { Header } from "../layout";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

import MemoryCard from "./MemoryCard";
import MemoryForm from "./MemoryForm";

export default function Dashboard() {
  useStytchUser();
  const stytch = useStytch();

  // Memories state
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  // Using sheet instead of SlidePanel
  const [showPanel, setShowPanel] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, memory: null });
  const [deleting, setDeleting] = useState(false);

  // Helper to get session
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
  useEffect(() => {
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

    fetchMemories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 pb-32">
        {/* Welcome & Purpose */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              My Memory Notes
            </h1>
            <p className="text-muted-foreground mt-1">
              Your shared memory layer for AI assistants
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/guide" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Setup Guide</span>
            </Link>
          </Button>
        </div>

        {/* Purpose explanation */}
        <Card className="mb-8 border-none bg-gradient-to-r from-zinc-900 to-zinc-800 text-white dark:from-zinc-800 dark:to-zinc-900">
          <CardContent className="p-4 sm:p-6 flex items-start gap-4">
            <div className="p-2 bg-white/10 rounded-lg shrink-0">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold mb-1">How it works</h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Store your preferences, project context, and personal notes
                here. Any MCP-compatible LLM can access these memories using the
                unique ID. Markdown formatting is supported.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/20"
              onClick={() => setError("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Memories list */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-sm">Loading memories...</p>
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed hover:bg-muted/50 transition-colors">
              <Cpu className="mx-auto text-muted-foreground/50 h-10 w-10 mb-4" />
              <p className="text-muted-foreground font-medium mb-1">
                No memories yet
              </p>
              <p className="text-xs text-muted-foreground/70">
                Create your first memory to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1">
              {memories.map((memory) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  onEdit={openEditPanel}
                  onDelete={(m) => setDeleteModal({ open: true, memory: m })}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <Button
        size="icon"
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 z-40"
        onClick={openAddPanel}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add new memory</span>
      </Button>

      {/* Add/Edit Memory Sheet */}
      <Sheet open={showPanel} onOpenChange={setShowPanel}>
        <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col gap-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>
              {editingMemory ? "Edit Memory" : "Add Memory"}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden p-6">
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
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation modal */}
      <AlertDialog
        open={deleteModal.open}
        onOpenChange={(open) =>
          !open && setDeleteModal({ open: false, memory: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memory?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this memory? AI assistants will no
              longer be able to access it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
