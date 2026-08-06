import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const BUCKET = "documents";
// Ten years — effectively permanent for published resources.
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365 * 10;

function pathFromUrl(url: string): string | null {
  const marker = `/object/sign/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i < 0) return null;
  const rest = url.slice(i + marker.length);
  return decodeURIComponent(rest.split("?")[0] ?? "");
}

async function requireAdmin(context: { supabase: ReturnType<typeof publicClient>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

// ==================== PUBLIC READ ====================

export const getPublishedDocuments = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("documents")
    .select("id, title, description, file_url, file_name, file_size, display_order, created_at")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  return data ?? [];
});

// ==================== ADMIN ====================

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("documents")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const uploadSchema = z.object({
  filename: z.string().min(1).max(160),
  base64: z.string().min(1).max(15_000_000),
  size: z.number().int().positive().max(10 * 1024 * 1024),
});

export const uploadDocumentFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => uploadSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    if (!safeName.toLowerCase().endsWith(".pdf")) throw new Error("Only PDF files are allowed");
    const objectPath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const bytes = Buffer.from(data.base64, "base64");

    const { error: upErr } = await context.supabase.storage
      .from(BUCKET)
      .upload(objectPath, bytes, { contentType: "application/pdf", upsert: false });
    if (upErr) throw new Error(upErr.message);

    const { data: signed, error: signErr } = await context.supabase.storage
      .from(BUCKET)
      .createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS);
    if (signErr) throw new Error(signErr.message);

    return { url: signed.signedUrl, fileName: data.filename, fileSize: data.size };
  });

const docSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  file_url: z.string().min(1).max(2000),
  file_name: z.string().max(200).nullable().optional(),
  file_size: z.number().int().nonnegative().nullable().optional(),
  display_order: z.number().int().min(0).max(9999),
  is_published: z.boolean(),
});

export const upsertDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => docSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const row = {
      title: data.title,
      description: data.description ?? null,
      file_url: data.file_url,
      file_name: data.file_name ?? null,
      file_size: data.file_size ?? null,
      display_order: data.display_order,
      is_published: data.is_published,
    };
    const { error } = data.id
      ? await context.supabase.from("documents").update(row).eq("id", data.id)
      : await context.supabase.from("documents").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { data: existing } = await context.supabase
      .from("documents")
      .select("file_url")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await context.supabase.from("documents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    const path = existing?.file_url ? pathFromUrl(existing.file_url) : null;
    if (path) await context.supabase.storage.from(BUCKET).remove([path]);
    return { ok: true };
  });
