import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeButtons } from "./upgrade-buttons";
import { ManageSubscriptionButton } from "./manage-subscription-button";
import { checkProposalLimit, checkClientLimit } from "@/lib/usage";
import { FileText, Users } from "lucide-react";

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

  const [proposalUsage, clientUsage] = await Promise.all([
    checkProposalLimit(),
    checkClientLimit(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold capitalize">
              {isActive ? (profile?.subscription_plan || "Pro") : "Free"}
            </span>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "active" : profile?.subscription_status || "free"}
            </Badge>
          </div>

          {/* Usage Stats */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Proposals This Month
                </p>
                <p className="text-2xl font-bold">
                  {proposalUsage.used}
                  <span className="text-base font-normal text-muted-foreground">
                    /{proposalUsage.limit === Infinity ? "Unlimited" : proposalUsage.limit}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Clients
                </p>
                <p className="text-2xl font-bold">
                  {clientUsage.used}
                  <span className="text-base font-normal text-muted-foreground">
                    /{clientUsage.limit === Infinity ? "Unlimited" : clientUsage.limit}
                  </span>
                </p>
              </div>
            </div>
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
