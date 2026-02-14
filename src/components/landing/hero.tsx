import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Badge variant="secondary" className="mb-4">
          Launch your SaaS in days, not months
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          The AI-First SaaS Boilerplate for{" "}
          <span className="text-primary">Modern Developers</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Authentication, payments, AI chat, email, dashboard — all
          pre-configured and ready to ship. Stop reinventing the wheel and start
          building your product.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#pricing">View Pricing</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          No credit card required. Free tier available.
        </p>
      </div>
    </section>
  );
}
