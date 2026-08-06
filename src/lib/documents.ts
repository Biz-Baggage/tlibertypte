import { queryOptions } from "@tanstack/react-query";
import { getPublishedDocuments, listDocuments } from "./documents.functions";
import type { Tables } from "@/integrations/supabase/types";

export type DocumentRow = Tables<"documents">;

export const publishedDocumentsQuery = queryOptions({
  queryKey: ["documents", "published"] as const,
  queryFn: () => getPublishedDocuments(),
  staleTime: 30_000,
});

export const adminDocumentsQuery = queryOptions({
  queryKey: ["documents", "admin"] as const,
  queryFn: () => listDocuments(),
  staleTime: 10_000,
});

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
