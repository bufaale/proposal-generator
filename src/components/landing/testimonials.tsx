import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "Saved me hours on proposal writing. I used to spend a full day on each one — now it takes 15 minutes.",
    name: "Sarah Mitchell",
    role: "Web Developer",
    initials: "SM",
  },
  {
    quote:
      "My win rate went up 40% since using ProposalAI. The AI suggestions and professional templates really make a difference.",
    name: "Mark Stevens",
    role: "Designer",
    initials: "MS",
  },
  {
    quote:
      "The client portal is a game-changer. Clients love being able to review and accept proposals online.",
    name: "Lisa Chen",
    role: "Marketing Consultant",
    initials: "LC",
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Loved by freelancers</h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            See what freelancers and consultants are saying about ProposalAI.
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
