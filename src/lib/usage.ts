import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/stripe/plans";

export async function checkProposalLimit(): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  plan: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, used: 0, limit: 0, plan: "free" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const plan = getUserPlan(profile?.subscription_plan ?? null);

  if (plan.limits.proposals_per_month === Infinity) {
    return { allowed: true, used: 0, limit: Infinity, plan: plan.id };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count } = await supabase
    .from("proposals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfMonth);

  const used = count ?? 0;

  return {
    allowed: used < plan.limits.proposals_per_month,
    used,
    limit: plan.limits.proposals_per_month,
    plan: plan.id,
  };
}

export async function checkClientLimit(): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, used: 0, limit: 0 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const plan = getUserPlan(profile?.subscription_plan ?? null);

  if (plan.limits.clients_max === Infinity) {
    return { allowed: true, used: 0, limit: Infinity };
  }

  const { count } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const used = count ?? 0;

  return {
    allowed: used < plan.limits.clients_max,
    used,
    limit: plan.limits.clients_max,
  };
}
