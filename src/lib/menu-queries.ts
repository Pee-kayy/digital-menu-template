import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Category[];
  },
});

export function itemsQuery(categoryId: string | null) {
  return queryOptions({
    queryKey: ["items", categoryId],
    enabled: !!categoryId,
    queryFn: async (): Promise<MenuItem[]> => {
      if (!categoryId) return [];
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("category_id", categoryId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MenuItem[];
    },
  });
}

export function useCategories() {
  return useQuery(categoriesQuery);
}

export function useItems(categoryId: string | null) {
  return useQuery(itemsQuery(categoryId));
}

/**
 * Private bucket — asynchronously get a signed URL valid for 24 hours.
 * Stored value is either a storage path (e.g. "abc.jpg") or a full URL.
 */
export async function getImageSignedUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const { data, error } = await supabase.storage
    .from("menu-images")
    .createSignedUrl(path, 60 * 60 * 24);
  if (error) return null;
  return data?.signedUrl ?? null;
}

