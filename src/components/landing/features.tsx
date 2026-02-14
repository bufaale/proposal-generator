import {
  Bot,
  Shield,
  CreditCard,
  Mail,
  LayoutDashboard,
  Rocket,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const features = [
  {
    icon: Bot,
    title: "AI-Powered",
    description:
      "Vercel AI SDK with multi-provider streaming. Claude, GPT, and more — switch with one line.",
  },
  {
    icon: Shield,
    title: "Authentication",
    description:
      "Supabase Auth with email, Google, and GitHub. Protected routes and session management built-in.",
  },
  {
    icon: CreditCard,
    title: "Payments",
    description:
      "Stripe subscriptions, one-time payments, and usage-based billing. Webhooks synced to your database.",
  },
  {
    icon: Mail,
    title: "Email",
    description:
      "Resend for transactional emails. Welcome emails, password resets, and subscription confirmations.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "Beautiful sidebar layout with dark mode. Responsive design that works on every screen.",
  },
  {
    icon: Rocket,
    title: "Deploy in Minutes",
    description:
      "One-click deploy to Vercel. Environment variables template and setup guide included.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Everything you need to ship fast
          </h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            Pre-configured integrations and components so you can focus on what
            matters — your product.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg">
                  <feature.icon className="text-primary h-5 w-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
