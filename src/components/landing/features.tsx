import {
  Sparkles,
  LayoutTemplate,
  Globe,
  FileDown,
  BarChart3,
  Users,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description:
      "Describe your project and let AI craft a professional proposal in seconds. Powered by Claude for natural, compelling copy.",
  },
  {
    icon: LayoutTemplate,
    title: "Professional Templates",
    description:
      "Choose from curated templates designed for web development, design, marketing, and more. Customize every detail.",
  },
  {
    icon: Globe,
    title: "Client Portal",
    description:
      "Share proposals via a branded portal link. Clients can view, comment, and accept proposals online.",
  },
  {
    icon: FileDown,
    title: "PDF Export",
    description:
      "Download polished PDF proposals ready to send. Branded with your logo, colors, and company details.",
  },
  {
    icon: BarChart3,
    title: "Engagement Tracking",
    description:
      "Know when clients open your proposals, which sections they read, and how long they spend reviewing.",
  },
  {
    icon: Users,
    title: "CRM Lite",
    description:
      "Manage your clients and proposals in one place. Track deals, follow up on pending proposals, and close more work.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Everything you need to win more clients
          </h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            From AI-generated content to client tracking, ProposalAI helps
            freelancers create proposals that close deals.
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
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
