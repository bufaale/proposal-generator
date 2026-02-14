export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  stripePriceId: { monthly: string; yearly: string };
  features: string[];
  limits: {
    proposals_per_month: number;
    clients_max: number;
    ai_model: "haiku" | "sonnet";
    templates: "basic" | "all" | "all_custom";
    client_portal: "view_only" | "full";
    tracking: boolean;
    brand_customization: boolean;
    pricing_calculator: boolean;
  };
  highlighted?: boolean;
  cta: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Try it out with basic proposals",
    price: { monthly: 0, yearly: 0 },
    stripePriceId: { monthly: "", yearly: "" },
    features: [
      "2 proposals/month",
      "3 basic templates",
      "PDF export",
      "View-only client portal",
      "5 clients max",
    ],
    limits: {
      proposals_per_month: 2,
      clients_max: 5,
      ai_model: "haiku",
      templates: "basic",
      client_portal: "view_only",
      tracking: false,
      brand_customization: false,
      pricing_calculator: false,
    },
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For active freelancers",
    price: { monthly: 29, yearly: 290 },
    stripePriceId: {
      monthly: (process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || "").trim(),
      yearly: (process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || "").trim(),
    },
    features: [
      "20 proposals/month",
      "All templates",
      "PDF export",
      "Full client portal",
      "50 clients",
      "Proposal tracking",
      "Brand customization",
      "AI pricing calculator",
      "Sonnet 4.5 AI model",
    ],
    limits: {
      proposals_per_month: 20,
      clients_max: 50,
      ai_model: "sonnet",
      templates: "all",
      client_portal: "full",
      tracking: true,
      brand_customization: true,
      pricing_calculator: true,
    },
    highlighted: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "business",
    name: "Business",
    description: "For agencies and power users",
    price: { monthly: 99, yearly: 990 },
    stripePriceId: {
      monthly: (process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID || "").trim(),
      yearly: (process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID || "").trim(),
    },
    features: [
      "Unlimited proposals",
      "All templates + custom",
      "PDF export",
      "Full client portal",
      "Unlimited clients",
      "Proposal tracking",
      "Brand customization",
      "AI pricing calculator",
      "Sonnet 4.5 AI model",
      "Priority support",
    ],
    limits: {
      proposals_per_month: Infinity,
      clients_max: Infinity,
      ai_model: "sonnet",
      templates: "all_custom",
      client_portal: "full",
      tracking: true,
      brand_customization: true,
      pricing_calculator: true,
    },
    cta: "Go Business",
  },
];

export function getPlanByPriceId(priceId: string): PricingPlan | undefined {
  return pricingPlans.find(
    (p) =>
      p.stripePriceId.monthly === priceId ||
      p.stripePriceId.yearly === priceId,
  );
}

export function getUserPlan(subscriptionPlan: string | null): PricingPlan {
  return pricingPlans.find((p) => p.id === subscriptionPlan) || pricingPlans[0];
}
