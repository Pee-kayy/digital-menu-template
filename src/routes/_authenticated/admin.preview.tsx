import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BrandHeader } from "@/components/BrandHeader";
import { MenuItemCard } from "@/components/MenuItemCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useCategories, useItems } from "@/lib/menu-queries";
import { openAdminMenu } from "./admin";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/preview")({
  component: PreviewPage,
});

function PreviewPage() {
  const cats = useCategories();
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (!activeId && cats.data && cats.data.length > 0) setActiveId(cats.data[0].id);
  }, [activeId, cats.data]);
  const items = useItems(activeId);
  const categories = useMemo(() => cats.data ?? [], [cats.data]);

  if (cats.isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <BrandHeader
        mode="admin"
        categories={categories}
        activeId={activeId}
        onSelect={setActiveId}
        onMenu={openAdminMenu}
      />
      <div className="mx-auto mt-3 w-full max-w-5xl px-4 md:px-8">
        <div className="flex items-center justify-between rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-2 text-xs text-primary">
          <span>Preview mode — this is what customers see</span>
          <Link to="/menu" target="_blank">
            <Button size="sm" variant="ghost" className="h-7 text-xs text-primary">
              Open public page ↗
            </Button>
          </Link>
        </div>
      </div>
      <main className="mx-auto w-full max-w-5xl px-4 pt-4 md:px-8">
        {categories.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No categories yet — add some from the Menu Editor.
          </p>
        ) : items.isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Loading items…</div>
        ) : (items.data ?? []).length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No items in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(items.data ?? []).map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
