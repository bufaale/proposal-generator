import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/stripe/plans";
import { AddClientDialog } from "@/components/clients/add-client-dialog";
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
import { Eye, Users } from "lucide-react";
import type { Client } from "@/types/database";

export default async function ClientsListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch clients
  const { data: clientsData } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const clients = (clientsData ?? []) as Client[];

  // Fetch proposal count per client
  const proposalCounts = new Map<string, number>();
  if (clients.length > 0) {
    const clientIds = clients.map((c) => c.id);
    const { data: proposalsData } = await supabase
      .from("proposals")
      .select("client_id")
      .in("client_id", clientIds);

    if (proposalsData) {
      for (const p of proposalsData) {
        if (p.client_id) {
          proposalCounts.set(
            p.client_id,
            (proposalCounts.get(p.client_id) ?? 0) + 1,
          );
        }
      }
    }
  }

  // Fetch user profile for plan limits
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user!.id)
    .single();

  const plan = getUserPlan(profile?.subscription_plan ?? null);
  const clientLimit = plan.limits.clients_max;
  const clientCount = clients.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Clients</h1>
            <Badge variant="secondary">
              {clientCount}/
              {clientLimit === Infinity ? "Unlimited" : clientLimit} clients
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            Manage your clients and track their proposals
          </p>
        </div>
        <AddClientDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-4 text-lg">No clients yet</p>
              <p className="mt-1 text-sm">
                Add your first client to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Proposals</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="font-medium hover:underline"
                      >
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.company ?? "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.email ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {proposalCounts.get(client.id) ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(client.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/clients/${client.id}`}>
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
