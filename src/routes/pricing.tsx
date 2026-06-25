import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — AutoDoctor AI" },
      { name: "description", content: "Simple pricing for AutoDoctor AI. Free tier available." },
      { property: "og:title", content: "AutoDoctor AI Pricing" },
      { property: "og:description", content: "Free, Pro, and Premium plans." },
    ],
  }),
  component: PricingPage,
});

const TIERS = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    desc: "Try AutoDoctor AI with no commitment.",
    cta: "Get started",
    features: ["3 diagnoses / month", "Basic DIY guide", "Diagnosis history"],
  },
  {
    name: "Pro",
    price: "€9.99",
    period: "per month",
    desc: "For owners who like to fix things themselves.",
    cta: "Go Pro",
    highlight: true,
    features: ["Unlimited diagnoses", "Full DIY guides with parts list", "Priority support", "Export reports"],
  },
  {
    name: "Premium",
    price: "€19.99",
    period: "per month",
    desc: "For families and small fleets.",
    cta: "Go Premium",
    features: ["Everything in Pro", "Maintenance scheduler", "Multiple vehicles", "PDF report exports"],
  },
];

function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Simple, honest pricing</h1>
            <p className="mt-4 text-lg text-muted-foreground">Start free. Upgrade when you need unlimited diagnoses.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`rounded-2xl border bg-card p-8 ${t.highlight ? "border-primary" : "border-border/60"}`}
              >
                {t.highlight && (
                  <span className="mb-3 inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">Most popular</span>
                )}
                <h2 className="font-display text-2xl font-bold">{t.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">{t.price}</span>
                  <span className="text-sm text-muted-foreground">/ {t.period}</span>
                </div>
                <Button asChild className={`mt-6 w-full ${t.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`} variant={t.highlight ? "default" : "outline"}>
                  <Link to="/register">{t.cta}</Link>
                </Button>
                <ul className="mt-6 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}