import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { suggestPricing } from "@/lib/ai/pricing-suggest";
import { getUserPlan } from "@/lib/stripe/plans";

export const maxDuration = 30;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const plan = getUserPlan(profile?.subscription_plan ?? null);
  if (!plan.limits.pricing_calculator) {
    return NextResponse.json(
      { error: "Pricing calculator requires Pro plan or higher" },
      { status: 403 },
    );
  }

  const { data: proposal } = await supabase
    .from("proposals")
    .select("brief, sections")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const brief = proposal.brief as {
    project_description: string;
    industry?: string;
  } | null;
  const sections = proposal.sections as {
    title: string;
    content: string;
  }[];
  const scopeSection = sections.find(
    (s) =>
      s.title.toLowerCase().includes("scope") ||
      s.title.toLowerCase().includes("deliverable"),
  );

  const suggestion = await suggestPricing(
    brief?.project_description || "",
    brief?.industry,
    scopeSection?.content,
  );

  return NextResponse.json({ suggestion });
}
