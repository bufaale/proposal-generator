"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Receipt, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const promos = [
  {
    icon: Receipt,
    title: "Get Paid Faster",
    description: "Sending proposals? Invoice clients and track payments with CobroExpress.",
    url: "https://app-08-cobro-express.vercel.app",
    cta: "Try CobroExpress",
  },
];

export function CrossPromoBanner() {
  const promo = promos[0];
  const Icon = promo.icon;

  return (
    <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardContent className="flex items-center gap-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{promo.title}</p>
          <p className="text-xs text-muted-foreground">{promo.description}</p>
        </div>
        <Link
          href={promo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
        >
          {promo.cta}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
