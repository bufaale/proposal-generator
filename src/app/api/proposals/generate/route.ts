import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProposal } from "@/lib/ai/generate-proposal";
import { getUserPlan } from "@/lib/stripe/plans";
import { checkProposalLimit } from "@/lib/usage";
import type { Proposal } from "@/types/database";
import { z } from "zod";

const briefSchema = z.object({
  project_description: z.string().min(20),
  client_name: z.string().optional(),
  client_company: z.string().optional(),
  industry: z.string().optional(),
  budget_range: z.string().optional(),
  timeline: z.string().optional(),
  special_requirements: z.string().optional(),
  template_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
});

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await checkProposalLimit();
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Monthly limit reached (${limit.used}/${limit.limit}). Upgrade your plan.`,
      },
      { status: 429 },
    );
  }

  const body = await req.json();
  const parsed = briefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const brief = parsed.data;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "subscription_plan, primary_color, secondary_color, company_logo_url, company_name",
    )
    .eq("id", user.id)
    .single();

  const plan = getUserPlan(profile?.subscription_plan ?? null);

  let templateSections = [
    {
      type: "executive_summary",
      title: "Executive Summary",
      prompt_hint: "Summarize the project",
    },
    { type: "scope", title: "Project Scope", prompt_hint: "Define scope" },
    {
      type: "deliverables",
      title: "Deliverables",
      prompt_hint: "List deliverables",
    },
    { type: "timeline", title: "Timeline", prompt_hint: "Project timeline" },
    { type: "pricing", title: "Investment", prompt_hint: "Pricing details" },
    {
      type: "terms",
      title: "Terms & Conditions",
      prompt_hint: "Standard terms",
    },
  ];

  if (brief.template_id) {
    const { data: template } = await supabase
      .from("templates")
      .select("sections_schema")
      .eq("id", brief.template_id)
      .single();

    if (template?.sections_schema) {
      templateSections = template.sections_schema as typeof templateSections;
    }
  }

  const generated = await generateProposal(
    brief,
    templateSections,
    plan.limits.ai_model,
  );

  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert({
      user_id: user.id,
      client_id: brief.client_id ?? null,
      template_id: brief.template_id ?? null,
      title: generated.title,
      status: "draft",
      sections: generated.sections,
      pricing_type: generated.pricing_type,
      pricing_data: generated.pricing_data,
      brand_settings: {
        logo_url: profile?.company_logo_url ?? undefined,
        company_name: profile?.company_name ?? undefined,
        primary_color: profile?.primary_color || "#2563eb",
        secondary_color: profile?.secondary_color || "#1e40af",
      },
      brief: brief as Proposal["brief"],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ proposal });
}
