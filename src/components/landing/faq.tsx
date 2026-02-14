import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "How does AI generation work?",
    answer:
      "Describe your project details — scope, timeline, pricing — and our AI (powered by Claude) generates a professional proposal with compelling copy, structured sections, and clear deliverables. You can edit every part before sending.",
  },
  {
    question: "Can I customize the proposals?",
    answer:
      "Absolutely. Every proposal is fully editable after generation. Customize the content, add or remove sections, change the order, and apply your brand colors and logo. Pro and Business plans unlock all templates and full brand customization.",
  },
  {
    question: "How does the client portal work?",
    answer:
      "Each proposal gets a unique, shareable link. Your clients can view the proposal in a branded portal — no login required. On the full portal (Pro+), clients can leave comments, ask questions, and accept the proposal directly online.",
  },
  {
    question: "What file formats can I export?",
    answer:
      "All plans include PDF export with your branding. The exported PDF includes your logo, company colors, and all proposal sections in a clean, professional layout ready to share via email or print.",
  },
  {
    question: "What happens when I reach my limit?",
    answer:
      "On the Free plan, you can create up to 2 proposals per month and manage 5 clients. Once you hit the limit, you can upgrade to Pro (20 proposals/month) or Business (unlimited) at any time. Your existing proposals are never deleted.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. All data is stored in a secure PostgreSQL database with row-level security (RLS). Client portal links are unique and unguessable. We never share your data with third parties, and all connections are encrypted with TLS.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Frequently asked questions</h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            Everything you need to know about ProposalAI.
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
