import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
    </>
  );
}
