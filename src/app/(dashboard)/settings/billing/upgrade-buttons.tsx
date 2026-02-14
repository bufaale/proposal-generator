"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/stripe/plans";

export function UpgradeButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(priceId: string) {
    setLoading(priceId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout session");
        setLoading(null);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(null);
    }
  }

  const paidPlans = pricingPlans.filter((p) => p.price.monthly > 0);

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <div className="flex flex-wrap gap-3">
        {paidPlans.map((plan) => (
          <Button
            key={plan.id}
            onClick={() => handleCheckout(plan.stripePriceId.monthly)}
            disabled={loading !== null}
            variant={plan.highlighted ? "default" : "outline"}
          >
            {loading === plan.stripePriceId.monthly ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {loading === plan.stripePriceId.monthly
              ? "Loading..."
              : `Upgrade to ${plan.name}`}
          </Button>
        ))}
      </div>
    </div>
  );
}
