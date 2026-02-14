import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
import { PlusCircle, Eye } from "lucide-react";
import type { Proposal, Client } from "@/types/database";

export default async function ProposalsListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch proposals
  const { data: proposalsData } = await supabase
    .from("proposals")
    .select("id, title, status, created_at, client_id")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const proposals = (proposalsData ?? []) as Pick<
    Proposal,
    "id" | "title" | "status" | "created_at" | "client_id"
  >[];

  // Fetch clients for name lookup
  const clientIds = proposals
    .map((p) => p.client_id)
    .filter((id): id is string => id !== null);

  let clientMap = new Map<string, string>();
  if (clientIds.length > 0) {
    const { data: clientsData } = await supabase
      .from("clients")
      .select("id, name")
      .in("id", clientIds);

    const clients = (clientsData ?? []) as Pick<Client, "id" | "name">[];
    clientMap = new Map(clients.map((c) => [c.id, c.name]));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="mt-1 text-muted-foreground">
            Manage all your proposals in one place
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/proposals/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Proposal
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-lg">No proposals yet</p>
              <p className="mt-1 text-sm">
                Create your first AI-powered proposal to get started.
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/proposals/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Proposal
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/proposals/${proposal.id}`}
                        className="font-medium hover:underline"
                      >
                        {proposal.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {proposal.client_id
                        ? (clientMap.get(proposal.client_id) ?? "Unknown")
                        : "No client"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={proposal.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(proposal.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/proposals/${proposal.id}`}>
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Link>
                      </Button>
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
