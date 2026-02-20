import { Sparkles, DollarSign, Gift, Clock } from "lucide-react";

const reasons = [
  {
    icon: Sparkles,
    title: "AI Generates the Entire Proposal",
    description:
      "Describe your project, get a complete proposal with scope, pricing, timeline, and terms. Proposify, PandaDoc, and Qwilr are template editors — you still write everything manually.",
  },
  {
    icon: DollarSign,
    title: "Flat Pricing, Not Per-User",
    description:
      "Proposify charges $19-65 per user/month. 5 team members = $95-325/mo. ProposalForge is one flat price per tier regardless of team size.",
  },
  {
    icon: Gift,
    title: "Free Tier With Real Value",
    description:
      "Get 2 proposals/month free — forever. Proposify offers only a 14-day trial. PandaDoc's free plan is e-signatures only, no proposals.",
  },
  {
    icon: Clock,
    title: "5 Minutes, Not 5 Hours",
    description:
      "Stop copying and pasting from old proposals. Describe the project, review the AI output, customize sections, and send. Complete proposals in minutes.",
  },
];

export function WhyUs() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Why ProposalForge over alternatives?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            The only tool that generates complete proposals from a project brief.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {reasons.map((reason) => (
            <div key={reason.title} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <reason.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{reason.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
