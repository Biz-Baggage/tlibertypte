import { queryOptions } from "@tanstack/react-query";
import { getSiteContent, getMyRoleInfo } from "./site-content.functions";
import type { Tables } from "@/integrations/supabase/types";

export type Settings = Tables<"site_settings">;
export type FocusArea = Tables<"focus_areas">;
export type Service = Tables<"services">;
export type Stat = Tables<"stats">;
export type WhyUs = Tables<"why_us">;
export type Testimonial = Tables<"testimonials">;

export type SiteContent = {
  settings: Settings | null;
  focusAreas: FocusArea[];
  services: Service[];
  stats: Stat[];
  whyUs: WhyUs[];
  testimonials: Testimonial[];
};

export const siteContentQuery = queryOptions({
  queryKey: ["site-content"] as const,
  queryFn: () => getSiteContent() as unknown as Promise<SiteContent>,
  staleTime: 30_000,
});

export const myRoleQuery = queryOptions({
  queryKey: ["my-role"] as const,
  queryFn: () => getMyRoleInfo(),
  staleTime: 60_000,
});