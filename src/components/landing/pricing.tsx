"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pricingPlans } from "@/lib/stripe/plans";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, []);

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            Choose the plan that fits your needs. Upgrade or downgrade at any
            time.
          </p>
        </div>

        {/* Monthly/Yearly Toggle */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <span
            className={cn(
              "text-sm font-medium",
              !isYearly ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Monthly
          </span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span
            className={cn(
              "text-sm font-medium",
              isYearly ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Yearly
            <Badge variant="secondary" className="ml-2">
              Save 17%
            </Badge>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {pricingPlans.map((plan) => {
            const price = isYearly ? plan.price.yearly : plan.price.monthly;
            const period = isYearly ? "/yr" : "/mo";

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col transition-shadow hover:shadow-md",
                  plan.highlighted && "border-primary shadow-lg"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {price === 0 ? "Free" : `$${price}`}
                    </span>
                    {price > 0 && (
                      <span className="text-muted-foreground ml-1 text-base">
                        {period}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                        <span className="text-muted-foreground text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    asChild
                  >
                    <Link
                      href={
                        isLoggedIn
                          ? plan.id === "free"
                            ? "/dashboard"
                            : "/settings/billing"
                          : "/signup"
                      }
                    >
                      {isLoggedIn && plan.id === "free"
                        ? "Go to Dashboard"
                        : plan.cta}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
