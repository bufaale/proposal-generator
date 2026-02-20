import { Target, CreditCard, Timer, Gift } from "lucide-react";

const stats = [
  {
    icon: Target,
    value: "0",
    label: "Competitors that generate full proposals with AI",
  },
  {
    icon: CreditCard,
    value: "Flat",
    label: "Per-tier pricing, no per-user fees",
  },
  {
    icon: Timer,
    value: "<5min",
    label: "From project brief to complete proposal",
  },
  {
    icon: Gift,
    value: "Free",
    label: "Tier with 2 proposals/month",
  },
];

export function Stats() {
  return (
    <section className="border-y bg-muted/30 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {stat.value}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
