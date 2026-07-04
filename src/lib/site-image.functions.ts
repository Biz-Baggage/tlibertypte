import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const uploadSchema = z.object({
  filename: z.string().min(1).max(120),
  contentType: z.string().min(1).max(80),
  base64: z.string().min(1).max(15_000_000), // ~11MB decoded
});

// Ten years — effectively permanent for site imagery.
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365 * 10;

export const uploadSiteImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => uploadSchema.parse(d))
  .handler(async ({ data, context }) => {
    // Verify caller is admin (server-side, using the user-scoped client).
    const { data: isAdmin, error: rerr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (rerr) throw new Error(rerr.message);
    if (!isAdmin) throw new Error("Forbidden: admin only");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectPath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const bytes = Buffer.from(data.base64, "base64");

    const { error: upErr } = await supabaseAdmin.storage
      .from("site-images")
      .upload(objectPath, bytes, { contentType: data.contentType, upsert: false });
    if (upErr) throw new Error(upErr.message);

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("site-images")
      .createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS);
    if (signErr) throw new Error(signErr.message);

    return { url: signed.signedUrl, path: objectPath };
  });