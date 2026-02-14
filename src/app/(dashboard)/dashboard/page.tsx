import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { pricingPlans } from "@/lib/stripe/plans";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile for plan info
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan, subscription_status")
    .eq("id", user!.id)
    .single();

  // Fetch AI usage count this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: aiCount } = await supabase
    .from("ai_usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .gte("created_at", startOfMonth.toISOString());

  const plan = pricingPlans.find((p) => p.id === profile?.subscription_plan) || pricingPlans[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, {user?.user_metadata?.full_name || user?.email || "there"}
        </p>
      </div>
      <StatsCards
        aiGenerations={aiCount ?? 0}
        planName={plan.name}
        planPrice={plan.price.monthly}
        status={profile?.subscription_status ?? "free"}
      />
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Your app content goes here. Replace this with your product features.
      </div>
    </div>
  );
}
