import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BrandHeader } from "@/components/BrandHeader";
import { MenuItemCard } from "@/components/MenuItemCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { categoriesQuery, itemsQuery, useCategories, useItems } from "@/lib/menu-queries";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Papi's Lounge — Menu" },
      { name: "description", content: "Fresh coffee & lounge menu. Browse our drinks and bites." },
      { property: "og:title", content: "Papi's Lounge — Menu" },
      { property: "og:description", content: "Fresh coffee & lounge menu." },
    ],
  }),
  loader: async ({ context }) => {
    const categories = await context.queryClient.ensureQueryData(categoriesQuery);
    const initialCategoryId = categories[0]?.id ?? null;
    if (initialCategoryId) {
      await context.queryClient.ensureQueryData(itemsQuery(initialCategoryId));
    }
    return { initialCategoryId };
  },
  errorComponent: ({ error }) => (
    <div role="alert" className="p-8 text-center text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center text-sm text-muted-foreground">Menu not found.</div>
  ),
  component: MenuPage,
});

function MenuPage() {
  const { initialCategoryId } = Route.useLoaderData();
  const cats = useCategories();
  const [activeId, setActiveId] = useState<string | null>(initialCategoryId);

  const items = useItems(activeId);
  const categories = useMemo(() => cats.data ?? [], [cats.data]);

  if (cats.isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <BrandHeader
        mode="customer"
        categories={categories}
        activeId={activeId}
        onSelect={setActiveId}
      />
      <main className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-8">
        {categories.length === 0 ? (
          <EmptyState
            title="Menu coming soon"
            subtitle="Our team is preparing something special."
          />
        ) : items.isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Loading items…</div>
        ) : (items.data ?? []).length === 0 ? (
          <EmptyState title="No items in this category yet" subtitle="Please check back soon." />
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

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-brand-gradient opacity-80" />
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
