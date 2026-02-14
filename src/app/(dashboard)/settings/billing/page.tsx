import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeButtons } from "./upgrade-buttons";
import { ManageSubscriptionButton } from "./manage-subscription-button";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isActive = profile?.subscription_status === "active";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold capitalize">
              {isActive ? (profile?.subscription_plan || "Pro") : "Free"}
            </span>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "active" : profile?.subscription_status || "free"}
            </Badge>
          </div>
          {isActive ? (
            <ManageSubscriptionButton />
          ) : (
            <div className="space-y-3">
              <UpgradeButtons />
              {profile?.stripe_customer_id && (
                <ManageSubscriptionButton label="View Billing History" />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
