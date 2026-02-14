import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditClientForm } from "@/components/clients/edit-client-form";
import { StatusBadge } from "@/components/proposals/status-badge";
import { Badge } from "@/components/ui/badge";
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
import {
  ArrowLeft,
  PlusCircle,
  FileText,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import type { Client, Proposal } from "@/types/database";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch client
  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!clientData) {
    notFound();
  }

  const client = clientData as Client;

  // Fetch proposals for this client
  const { data: proposalsData } = await supabase
    .from("proposals")
    .select("id, title, status, created_at")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const proposals = (proposalsData ?? []) as Pick<
    Proposal,
    "id" | "title" | "status" | "created_at"
  >[];

  // Calculate stats
  const totalProposals = proposals.length;
  const acceptedCount = proposals.filter(
    (p) => p.status === "accepted",
  ).length;
  const declinedCount = proposals.filter(
    (p) => p.status === "declined",
  ).length;
  const decided = acceptedCount + declinedCount;
  const winRate = decided > 0 ? Math.round((acceptedCount / decided) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/clients">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          {client.company && (
            <p className="mt-1 text-muted-foreground">{client.company}</p>
          )}
        </div>
        <Button asChild>
          <Link href={`/dashboard/proposals/new?client_id=${client.id}`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Proposal for Client
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Proposals
              </p>
              <p className="text-2xl font-bold">{totalProposals}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Accepted
              </p>
              <p className="text-2xl font-bold">{acceptedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Win Rate
              </p>
              <p className="text-2xl font-bold">{winRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Info */}
      <EditClientForm client={client} />

      {/* Proposal History */}
      <Card>
        <CardHeader>
          <CardTitle>Proposal History</CardTitle>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No proposals yet for this client.</p>
              <Button asChild variant="link" className="mt-2">
                <Link
                  href={`/dashboard/proposals/new?client_id=${client.id}`}
                >
                  Create the first proposal
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
