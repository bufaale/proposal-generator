import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { regenerateSection } from "@/lib/ai/regenerate-section";
import { getUserPlan } from "@/lib/stripe/plans";
import { z } from "zod";

const schema = z.object({
  proposal_id: z.string().uuid(),
  section_index: z.number().int().min(0),
  instructions: z.string().optional(),
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { proposal_id, section_index, instructions } = parsed.data;

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", proposal_id)
    .eq("user_id", user.id)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const sections = proposal.sections as {
    type: string;
    title: string;
    content: string;
    order: number;
  }[];
  const target = sections[section_index];
  if (!target) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const plan = getUserPlan(profile?.subscription_plan ?? null);

  const newContent = await regenerateSection(
    target.title,
    target.type,
    "",
    sections.filter((_, i) => i !== section_index),
    instructions,
    plan.limits.ai_model,
  );

  sections[section_index].content = newContent;

  const { error } = await supabase
    .from("proposals")
    .update({ sections })
    .eq("id", proposal_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ content: newContent });
}
