export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  stripePriceId: { monthly: string; yearly: string };
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started with the basics",
    price: { monthly: 0, yearly: 0 },
    stripePriceId: { monthly: "", yearly: "" },
    features: [
      "5 AI generations/day",
      "Basic dashboard",
      "Community support",
    ],
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For serious builders",
    price: { monthly: 29, yearly: 290 },
    stripePriceId: {
      monthly: (process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || "").trim(),
      yearly: (process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || "").trim(),
    },
    features: [
      "Unlimited AI generations",
      "Advanced dashboard",
      "Priority support",
      "API access",
      "Custom integrations",
    ],
    highlighted: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For teams and organizations",
    price: { monthly: 99, yearly: 990 },
    stripePriceId: {
      monthly: (process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "").trim(),
      yearly: (process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "").trim(),
    },
    features: [
      "Everything in Pro",
      "Dedicated support",
      "SSO / SAML",
      "Custom AI models",
      "SLA guarantee",
      "Team management",
    ],
    cta: "Contact Sales",
  },
];

export function getPlanByPriceId(priceId: string): PricingPlan | undefined {
  return pricingPlans.find(
    (p) => p.stripePriceId.monthly === priceId || p.stripePriceId.yearly === priceId,
  );
}
