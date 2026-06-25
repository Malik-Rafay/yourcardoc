import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — AutoDoctor AI" },
      { name: "description", content: "Answers to common questions about AutoDoctor AI." },
      { property: "og:title", content: "AutoDoctor AI FAQ" },
      { property: "og:description", content: "How accurate is AI diagnosis? Which cars are supported? Is my data private?" },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  { q: "How accurate is the AI diagnosis?", a: "It's a strong starting point — typically 80–90% on common issues — but it's not a substitute for hands-on inspection. Always confirm with a mechanic before paying for major repairs." },
  { q: "Can I use this without creating an account?", a: "An account is required so we can save your diagnosis history and your default vehicle. You can sign up free in under 30 seconds." },
  { q: "What car models are supported?", a: "Any make and model — the AI works from your symptoms plus year/make/model/mileage. Older vehicles (pre-1995) without OBD-II may be harder to diagnose for electronic faults." },
  { q: "Is my data private?", a: "Yes. Your diagnosis history is only visible to you. We never sell your data, and you can delete your account and history at any time from Settings." },
  { q: "Can I trust the cost estimates?", a: "Estimates are based on typical European labor rates and parts pricing. Actual costs vary by region, vehicle complexity, and shop. Treat them as a sanity-check, not a quote." },
  { q: "Should I always trust the DIY guides?", a: "The guides cover common cases, but every car is different. If a repair involves brakes, steering, suspension, airbags, or high-voltage systems and you're not confident, see a professional." },
];

function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h1 className="font-display text-4xl font-bold tracking-tight">Frequently asked questions</h1>
          <p className="mt-4 text-muted-foreground">Everything you might want to know before you start.</p>
          <Accordion type="single" collapsible className="mt-8">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`q-${i}`}>
                <AccordionTrigger className="text-left font-display text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}