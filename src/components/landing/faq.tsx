import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What tech stack does this use?",
    answer:
      "This boilerplate is built with Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Supabase (PostgreSQL + Auth), Stripe for payments, Vercel AI SDK for AI features, and Resend for transactional emails. Everything is pre-configured and ready to go.",
  },
  {
    question: "Is this a one-time purchase?",
    answer:
      "Yes, pay once and get lifetime access including all future updates. No recurring fees, no hidden costs. You own the code forever.",
  },
  {
    question: "Can I use this for multiple projects?",
    answer:
      "Yes, the license allows unlimited projects for both personal and commercial use. Build as many SaaS products as you want with a single purchase.",
  },
  {
    question: "Do I need to know AI/ML to use this?",
    answer:
      "No, the AI features are pre-configured and ready to use out of the box. Just add your API keys and start building. The Vercel AI SDK handles all the complexity for you.",
  },
  {
    question: "What kind of support is included?",
    answer:
      "You get access to GitHub issues for bug reports, a Discord community for questions and discussions, and detailed documentation covering every feature. We're here to help you ship.",
  },
  {
    question: "Can I request new features?",
    answer:
      "Absolutely! We actively develop based on community feedback. Feature requests are welcome on GitHub, and popular requests get prioritized in our roadmap.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Frequently asked questions</h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            Everything you need to know about the boilerplate.
          </p>
        </div>
        <div className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
