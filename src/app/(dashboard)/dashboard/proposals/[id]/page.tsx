import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/stripe/plans";
import { StatusBadge } from "@/components/proposals/status-badge";
import { ProposalActions } from "@/components/proposals/proposal-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, MessageSquare, Clock } from "lucide-react";
import type {
  Proposal,
  ProposalSection,
  PricingData,
  ProposalEvent,
  ProposalComment,
} from "@/types/database";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch proposal
  const { data: proposalData } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!proposalData) {
    notFound();
  }

  const proposal = proposalData as unknown as Proposal;
  const sections = proposal.sections as ProposalSection[];
  const pricing = proposal.pricing_data as PricingData;

  // Fetch profile for plan check
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const plan = getUserPlan(profile?.subscription_plan ?? null);
  const hasTracking = plan.limits.tracking;

  // Fetch events (if tracking available)
  let events: ProposalEvent[] = [];
  if (hasTracking) {
    const { data: eventsData } = await supabase
      .from("proposal_events")
      .select("*")
      .eq("proposal_id", id)
      .order("created_at", { ascending: false });
    events = (eventsData ?? []) as unknown as ProposalEvent[];
  }

  // Fetch comments
  const { data: commentsData } = await supabase
    .from("proposal_comments")
    .select("*")
    .eq("proposal_id", id)
    .order("created_at", { ascending: false });

  const comments = (commentsData ?? []) as unknown as ProposalComment[];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/proposals">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{proposal.title}</h1>
          <div className="flex items-center gap-3">
            <StatusBadge status={proposal.status} />
            <span className="text-sm text-muted-foreground">
              Created {new Date(proposal.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <ProposalActions proposalId={proposal.id} shareToken={proposal.share_token} />

      {/* Sections */}
      {sections.map((section, index) => (
        <Card key={`section-${index}`}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {section.content}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pricing Display */}
      {proposal.pricing_type && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            {proposal.pricing_type === "fixed" && (
              <div className="text-2xl font-bold">
                {pricing.currency ?? "USD"}{" "}
                {(pricing.amount ?? 0).toLocaleString()}
              </div>
            )}
            {proposal.pricing_type === "hourly" && (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  ${pricing.hourly_rate ?? 0}/hr
                </div>
                {pricing.estimated_hours && (
                  <p className="text-muted-foreground">
                    Estimated {pricing.estimated_hours} hours = $
                    {(
                      (pricing.hourly_rate ?? 0) * pricing.estimated_hours
                    ).toLocaleString()}
                  </p>
                )}
              </div>
            )}
            {proposal.pricing_type === "milestone" &&
              pricing.milestones &&
              pricing.milestones.length > 0 && (
                <div className="space-y-3">
                  {pricing.milestones.map((m, mIdx) => (
                    <div
                      key={`pricing-milestone-${mIdx}`}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{m.name}</p>
                        {m.due && (
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(m.due).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-lg font-semibold">
                        ${m.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end border-t pt-3">
                    <div className="text-xl font-bold">
                      Total: $
                      {pricing.milestones
                        .reduce((sum, m) => sum + m.amount, 0)
                        .toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Tracking Section */}
      {hasTracking && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5" />
              Activity Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No activity recorded yet. Share the proposal to start tracking
                views.
              </p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {event.event_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Client Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No comments yet. Clients can leave comments via the shared link.
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{comment.author_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                  {comment.author_email && (
                    <p className="text-xs text-muted-foreground">
                      {comment.author_email}
                    </p>
                  )}
                  <p className="mt-2 text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
