import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

// Server publishable client for anon-safe public reads.
function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

// ==================== PUBLIC READ ====================

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [settings, focusAreas, services, stats, whyUs, testimonials] = await Promise.all([
    sb.from("site_settings").select("*").limit(1).maybeSingle(),
    sb.from("focus_areas").select("*").order("sort_order"),
    sb.from("services").select("*").order("sort_order"),
    sb.from("stats").select("*").order("sort_order"),
    sb.from("why_us").select("*").order("sort_order"),
    sb.from("testimonials").select("*").order("sort_order"),
  ]);
  return {
    settings: settings.data,
    focusAreas: focusAreas.data ?? [],
    services: services.data ?? [],
    stats: stats.data ?? [],
    whyUs: whyUs.data ?? [],
    testimonials: testimonials.data ?? [],
  };
});

// ==================== AUTH & ROLES ====================

export const getMyRoleInfo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roles = (data ?? []).map((r) => r.role);
    return { userId: context.userId, roles, isAdmin: roles.includes("admin") };
  });

export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_admin_role");
    if (error) throw new Error(error.message);
    return { granted: data === true };
  });

// ==================== ADMIN GUARD ====================

async function requireAdmin(context: { supabase: ReturnType<typeof publicClient>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

// ==================== SITE SETTINGS ====================

const settingsUpdateSchema = z.object({
  company_name: z.string().min(1).max(200),
  short_name: z.string().min(1).max(80),
  tagline: z.string().min(1).max(300),
  description: z.string().min(1).max(1000),
  email: z.string().email().max(200),
  phone: z.string().min(1).max(60),
  phone_href: z.string().min(1).max(80),
  address: z.string().min(1).max(300),
  uen: z.string().min(1).max(60),
  domain: z.string().min(1).max(200),
  hero_image_url: z.string().min(1).max(600),
  hero_eyebrow: z.string().max(200),
  hero_secondary_cta: z.string().max(80),
  focus_eyebrow: z.string().max(200),
  focus_heading: z.string().max(200),
  focus_subheading: z.string().max(500),
  track_record_eyebrow: z.string().max(200),
  track_record_heading: z.string().max(300),
  why_eyebrow: z.string().max(200),
  why_heading: z.string().max(300),
  testimonials_eyebrow: z.string().max(200),
  testimonials_heading: z.string().max(300),
  cta_heading: z.string().max(300),
  cta_body: z.string().max(500),
  about_body: z.string().max(4000),
  services_intro: z.string().max(300),
  services_body: z.string().max(500),
  logo_url: z.string().max(1000).default(""),
});

export const updateSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => settingsUpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { data: existing } = await context.supabase
      .from("site_settings")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (!existing) throw new Error("Settings row missing");
    const { error } = await context.supabase
      .from("site_settings")
      .update(data)
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ==================== FOCUS AREAS ====================

const focusAreaSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/, "lowercase letters, digits and hyphens only"),
  title: z.string().min(1).max(150),
  blurb: z.string().min(1).max(500),
  image_url: z.string().min(1).max(600),
  items: z.array(z.string().min(1).max(200)).max(20),
  sort_order: z.number().int().min(0).max(999),
});

export const upsertFocusArea = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => focusAreaSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const row = { ...data, items: data.items };
    const { error } = data.id
      ? await context.supabase.from("focus_areas").update(row).eq("id", data.id)
      : await context.supabase.from("focus_areas").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteFocusArea = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("focus_areas").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ==================== SERVICES ====================

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  sort_order: z.number().int().min(0).max(999),
});

export const upsertService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => serviceSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = data.id
      ? await context.supabase.from("services").update(data).eq("id", data.id)
      : await context.supabase.from("services").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("services").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ==================== STATS ====================

const statSchema = z.object({
  id: z.string().uuid().optional(),
  value: z.string().min(1).max(40),
  label: z.string().min(1).max(120),
  note: z.string().min(1).max(300),
  sort_order: z.number().int().min(0).max(999),
});

export const upsertStat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => statSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = data.id
      ? await context.supabase.from("stats").update(data).eq("id", data.id)
      : await context.supabase.from("stats").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteStat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("stats").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ==================== WHY US ====================

const whyUsSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(500),
  sort_order: z.number().int().min(0).max(999),
});

export const upsertWhyUs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => whyUsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = data.id
      ? await context.supabase.from("why_us").update(data).eq("id", data.id)
      : await context.supabase.from("why_us").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteWhyUs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("why_us").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ==================== TESTIMONIALS ====================

const testimonialSchema = z.object({
  id: z.string().uuid().optional(),
  quote: z.string().min(1).max(1000),
  author: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  sort_order: z.number().int().min(0).max(999),
});

export const upsertTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => testimonialSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = data.id
      ? await context.supabase.from("testimonials").update(data).eq("id", data.id)
      : await context.supabase.from("testimonials").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("testimonials").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });