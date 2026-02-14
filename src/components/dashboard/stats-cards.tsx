import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Send, TrendingUp, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  totalProposals: number;
  sentPending: number;
  winRate: number;
  accepted: number;
}

export function StatsCards({
  totalProposals,
  sentPending,
  winRate,
  accepted,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Proposals",
      value: totalProposals.toLocaleString(),
      description: "All time",
      icon: FileText,
    },
    {
      title: "Sent / Pending",
      value: sentPending.toLocaleString(),
      description: "Awaiting response",
      icon: Send,
    },
    {
      title: "Win Rate",
      value: `${winRate}%`,
      description: "Accepted vs. total decided",
      icon: TrendingUp,
    },
    {
      title: "Accepted",
      value: accepted.toLocaleString(),
      description: "Won proposals",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
