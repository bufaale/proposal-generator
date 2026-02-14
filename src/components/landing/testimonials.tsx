import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "Saved me weeks of boilerplate work. The AI integration alone is worth the price.",
    name: "Sarah Chen",
    role: "Founder at TechFlow",
    initials: "SC",
  },
  {
    quote:
      "Finally, a boilerplate that includes proper Stripe webhooks and subscription management.",
    name: "Marcus Rodriguez",
    role: "Indie Hacker",
    initials: "MR",
  },
  {
    quote:
      "The dark mode and shadcn/ui setup is chef's kiss. Best DX I've experienced.",
    name: "Alex Kim",
    role: "Full-Stack Developer",
    initials: "AK",
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Loved by developers</h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            See what builders are saying about the boilerplate.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <blockquote className="text-muted-foreground text-sm leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
