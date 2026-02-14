import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CreditCard, Zap, Users } from "lucide-react";

interface StatsCardsProps {
  aiGenerations: number;
  planName: string;
  planPrice: number;
  status: string;
}

export function StatsCards({ aiGenerations, planName, planPrice, status }: StatsCardsProps) {
  const stats = [
    {
      title: "AI Generations",
      value: aiGenerations.toLocaleString(),
      description: "This month",
      icon: MessageSquare,
    },
    {
      title: "Current Plan",
      value: planName,
      description: planPrice > 0 ? `$${planPrice}/month` : "Free tier",
      icon: CreditCard,
    },
    {
      title: "Status",
      value: status === "active" ? "Active" : "Free",
      description: status === "active" ? "Subscription active" : "No active subscription",
      icon: Zap,
    },
    {
      title: "API Calls",
      value: "—",
      description: "Coming soon",
      icon: Users,
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
