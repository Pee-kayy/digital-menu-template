import { useRef } from "react";
import { Menu, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/menu-queries";

interface Props {
  mode: "customer" | "admin";
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onMenu?: () => void;
  onAddCategory?: () => void;
  onEditCategory?: () => void;
  onDeleteCategory?: () => void;
}

export function BrandHeader({
  mode,
  categories,
  activeId,
  onSelect,
  onMenu,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY === 0) return;
    e.currentTarget.scrollLeft += e.deltaY;
    e.preventDefault();
  };
  return (
    <header className="sticky top-0 z-40 flex min-h-[120px] flex-col bg-brand-fade text-white md:min-h-[140px]">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 pt-4 md:px-8 md:pt-5">
        <h1 className="text-glow truncate text-2xl font-semibold tracking-wide md:text-3xl">
                    {import.meta.env.VITE_RESTAURANT_NAME ?? "Restaurant Name"}
        </h1>
        {mode === "admin" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenu}
            className="shrink-0 rounded-full text-white hover:bg-white/15 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
      </div>

      <div className="pb-3 pt-2">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 md:px-8">
          <div ref={scrollRef} onWheel={handleWheel} className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto snap-x">
            {categories.length === 0 && mode === "customer" && (
              <span className="text-sm text-primary/80">No categories yet</span>
            )}
            {categories.length === 0 && mode === "admin" && (
              <span className="text-sm text-primary/80">Add your first category →</span>
            )}
            {categories.map((c) => {
              const active = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    "shrink-0 snap-start rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                    active
                      ? "border-primary bg-white text-primary shadow-soft"
                      : "border-primary/30 bg-white/60 text-primary/90 hover:border-primary/60 hover:bg-white",
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
          {mode === "admin" && (
            <div className="flex shrink-0 items-center gap-2 pl-2">
              <button
                onClick={onAddCategory}
                className="flex items-center gap-1 rounded-full border border-dashed border-primary/50 bg-white/80 px-3 py-1.5 text-sm text-primary hover:bg-white"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
              {activeId && (
                <>
                  <button
                    onClick={onEditCategory}
                    className="rounded-full border border-primary/30 bg-white/80 p-1.5 text-primary hover:bg-white hover:border-primary/60"
                    aria-label="Edit category"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onDeleteCategory}
                    className="rounded-full border border-primary/30 bg-white/80 p-1.5 text-primary hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                    aria-label="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
