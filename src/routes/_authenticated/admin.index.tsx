import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import { MenuItemCard } from "@/components/MenuItemCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useCategories, useItems, type MenuItem } from "@/lib/menu-queries";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/image-compress";
import { openAdminMenu } from "./admin";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: EditorPage,
});

function EditorPage() {
  const qc = useQueryClient();
  const cats = useCategories();
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (!activeId && cats.data && cats.data.length > 0) setActiveId(cats.data[0].id);
  }, [activeId, cats.data]);
  const items = useItems(activeId);

  const categories = useMemo(() => cats.data ?? [], [cats.data]);
  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeId) ?? null,
    [categories, activeId],
  );

  const [addCatOpen, setAddCatOpen] = useState(false);
  const [editCatOpen, setEditCatOpen] = useState(false);
  const [delCatOpen, setDelCatOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [editCatName, setEditCatName] = useState("");
  const [catBusy, setCatBusy] = useState(false);
  const [editCatBusy, setEditCatBusy] = useState(false);
  const [delCatBusy, setDelCatBusy] = useState(false);
  const [itemModal, setItemModal] = useState<{ open: boolean; editing: MenuItem | null }>({
    open: false,
    editing: null,
  });
  const [delItem, setDelItem] = useState<MenuItem | null>(null);
  const [delItemBusy, setDelItemBusy] = useState(false);

  async function createCategory(e?: React.FormEvent) {
    e?.preventDefault();
    if (catBusy) return;
    const name = catName.trim();
    if (!name) return toast.error("Enter a category name.");
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return toast.error("A category with that name already exists.");
    }
    setCatBusy(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({ name, sort_order: categories.length })
        .select()
        .single();
      if (error) throw error;
      setCatName("");
      setAddCatOpen(false);
      qc.invalidateQueries({ queryKey: ["categories"] });
      if (data) setActiveId(data.id);
      toast.success("Category added.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add category.");
    } finally {
      setCatBusy(false);
    }
  }

  async function updateCategory(e?: React.FormEvent) {
    e?.preventDefault();
    if (editCatBusy || !activeId) return;
    const name = editCatName.trim();
    if (!name) return toast.error("Enter a category name.");
    if (
      categories.some(
        (c) => c.id !== activeId && c.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      return toast.error("A category with that name already exists.");
    }
    setEditCatBusy(true);
    try {
      const { error } = await supabase
        .from("categories")
        .update({ name })
        .eq("id", activeId);
      if (error) throw error;
      setEditCatOpen(false);
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update category.");
    } finally {
      setEditCatBusy(false);
    }
  }

  async function deleteCategory() {
    if (!activeId || delCatBusy) return;
    setDelCatBusy(true);
    try {
      const { error } = await supabase.from("categories").delete().eq("id", activeId);
      if (error) throw error;
      setDelCatOpen(false);
      setActiveId(null);
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["items"] });
      toast.success("Category deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category.");
    } finally {
      setDelCatBusy(false);
    }
  }

  async function deleteItem(item: MenuItem) {
    if (delItemBusy) return;
    setDelItemBusy(true);
    try {
      const { error } = await supabase.from("items").delete().eq("id", item.id);
      if (error) throw error;
      setDelItem(null);
      qc.invalidateQueries({ queryKey: ["items", activeId] });
      toast.success("Item deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete item.");
    } finally {
      setDelItemBusy(false);
    }
  }

  if (cats.isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background pb-28">
      <BrandHeader
        mode="admin"
        categories={categories}
        activeId={activeId}
        onSelect={setActiveId}
        onMenu={openAdminMenu}
        onAddCategory={() => setAddCatOpen(true)}
        onEditCategory={() => {
          if (!activeCategory) return;
          setEditCatName(activeCategory.name);
          setEditCatOpen(true);
        }}
        onDeleteCategory={() => setDelCatOpen(true)}
      />
      <main className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-8">
        {categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            subtitle='Tap "Add" in the header to create your first category.'
          />
        ) : !activeId ? (
          <EmptyState title="Select a category" subtitle="Pick one above to view its items." />
        ) : items.isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Loading items…</div>
        ) : (items.data ?? []).length === 0 ? (
          <EmptyState
            title="No items yet"
            subtitle="Tap the + button to add one to this category."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(items.data ?? []).map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                admin
                onEdit={() => setItemModal({ open: true, editing: item })}
                onDelete={() => setDelItem(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating add button */}
      <button
        onClick={() => {
          if (!activeId) return toast.error("Select or create a category first.");
          setItemModal({ open: true, editing: null });
        }}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-neon transition-transform hover:scale-105"
        aria-label="Add item"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add Category */}
      <Dialog open={addCatOpen} onOpenChange={setAddCatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
          </DialogHeader>
          <form onSubmit={createCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cname">Name</Label>
              <Input
                id="cname"
                autoFocus
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Cocktails"
                maxLength={60}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddCatOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={catBusy} className="bg-brand-gradient text-white">
                {catBusy ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category */}
      <Dialog open={editCatOpen} onOpenChange={setEditCatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          <form onSubmit={updateCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ecname">Name</Label>
              <Input
                id="ecname"
                autoFocus
                value={editCatName}
                onChange={(e) => setEditCatName(e.target.value)}
                maxLength={60}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditCatOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editCatBusy} className="bg-brand-gradient text-white">
                {editCatBusy ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Category */}
      <AlertDialog open={delCatOpen} onOpenChange={setDelCatOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              All items inside will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCategory}
              disabled={delCatBusy}
              className="bg-destructive text-destructive-foreground"
            >
              {delCatBusy ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Item */}
      <AlertDialog open={!!delItem} onOpenChange={(o) => !o && setDelItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{delItem?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>This item will be removed from the menu.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => delItem && deleteItem(delItem)}
              disabled={delItemBusy}
              className="bg-destructive text-destructive-foreground"
            >
              {delItemBusy ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ItemFormDialog
        open={itemModal.open}
        editing={itemModal.editing}
        categoryId={activeId}
        onClose={() => setItemModal({ open: false, editing: null })}
        onSaved={() => {
          setItemModal({ open: false, editing: null });
          qc.invalidateQueries({ queryKey: ["items", activeId] });
        }}
      />
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-brand-gradient opacity-70" />
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function ItemFormDialog({
  open,
  editing,
  categoryId,
  onClose,
  onSaved,
}: {
  open: boolean;
  editing: MenuItem | null;
  categoryId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setPrice(editing ? String(editing.price) : "");
      setDescription(editing?.description ?? "");
      setFile(null);
    }
  }, [open, editing]);

  async function save(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    if (!name.trim()) return toast.error("Name is required.");
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) return toast.error("Enter a valid price.");
    if (!categoryId && !editing) return toast.error("Select a category first.");
    setBusy(true);
    try {
      let imagePath: string | null = editing?.image_url ?? null;
      if (file) {
        const compressed = await compressImage(file, 1000, 0.75);
        const path = `${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("menu-images")
          .upload(path, compressed, { upsert: false, contentType: compressed.type });
        if (upErr) throw upErr;
        imagePath = path;
      }
      if (editing) {
        const { error } = await supabase
          .from("items")
          .update({
            name: name.trim(),
            price: priceNum,
            description: description.trim() || null,
            image_url: imagePath,
          })
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Item updated.");
      } else {
        const { error } = await supabase.from("items").insert({
          category_id: categoryId!,
          name: name.trim(),
          price: priceNum,
          description: description.trim() || null,
          image_url: imagePath,
        });
        if (error) throw error;
        toast.success("Item added.");
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit item" : "Add item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-3">
          <div>
            <Label htmlFor="iname">Name *</Label>
            <Input id="iname" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </div>
          <div>
            <Label htmlFor="iprice">Price (₦) *</Label>
            <Input
              id="iprice"
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="2500"
            />
          </div>
          <div>
            <Label htmlFor="idesc">Description (optional)</Label>
            <Textarea
              id="idesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
          <div>
            <Label htmlFor="ifile">Image (optional)</Label>
            <Input
              id="ifile"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy} className="bg-brand-gradient text-white">
              {busy ? "Saving…" : editing ? "Save" : "Add to menu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
