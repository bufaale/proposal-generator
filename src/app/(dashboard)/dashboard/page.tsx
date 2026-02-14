import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StatusBadge } from "@/components/proposals/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import type { Proposal } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all proposals for stats
  const { data: allProposals } = await supabase
    .from("proposals")
    .select("id, status, created_at")
    .eq("user_id", user!.id);

  const proposals = (allProposals ?? []) as Pick<
    Proposal,
    "id" | "status" | "created_at"
  >[];

  const totalProposals = proposals.length;
  const sentPending = proposals.filter(
    (p) => p.status === "sent" || p.status === "viewed",
  ).length;
  const accepted = proposals.filter((p) => p.status === "accepted").length;
  const declined = proposals.filter((p) => p.status === "declined").length;
  const decided = accepted + declined;
  const winRate = decided > 0 ? Math.round((accepted / decided) * 100) : 0;

  // Fetch recent proposals (last 5)
  const { data: recentProposals } = await supabase
    .from("proposals")
    .select("id, title, status, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const recent = (recentProposals ?? []) as Pick<
    Proposal,
    "id" | "title" | "status" | "created_at"
  >[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back,{" "}
            {user?.user_metadata?.full_name || user?.email || "there"}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/proposals/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Proposal
          </Link>
        </Button>
      </div>

      <StatsCards
        totalProposals={totalProposals}
        sentPending={sentPending}
        winRate={winRate}
        accepted={accepted}
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No proposals yet.</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/dashboard/proposals/new">
                  Create your first proposal
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/proposals/${proposal.id}`}
                        className="font-medium hover:underline"
                      >
                        {proposal.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={proposal.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(proposal.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
