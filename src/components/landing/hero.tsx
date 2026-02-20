import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Badge variant="secondary" className="mb-4">
          AI generates complete proposals — no more template editing
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Describe Your Project.{" "}
          <span className="text-primary">Get a Complete Proposal.</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          AI generates scope, pricing, timeline, and terms from your project
          brief. Proposify and PandaDoc make you fill templates manually.
          ProposalForge creates the entire proposal for you — starting at
          $19/mo.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Start Creating Proposals</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#comparison">See How We Compare</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          No credit card required. Free tier available.
        </p>
      </div>
    </section>
  );
}
