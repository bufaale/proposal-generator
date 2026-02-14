export const siteConfig = {
  name: "ProposalAI",
  description:
    "AI-powered proposal generator for freelancers. Create, customize, and send professional proposals in minutes.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/bufaale/proposal-generator",
    twitter: "https://twitter.com/yourusername",
  },
} as const;
