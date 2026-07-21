import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { useT, useLocale, currencySymbol } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

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

function PricingPage() {
  const t = useT();
  const { currency } = useLocale();
  const sym = currencySymbol(currency);
  const navigate = useNavigate();

  // Track the logged-in user state via Supabase
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch initial session on page load
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
    });

    // 2. Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const TIERS = [
    {
      id: "free",
      name: t("pricing.free"),
      price: `${sym}0`,
      period: t("pricing.per.forever"),
      desc: t("pricing.free.desc"),
      cta: t("pricing.free.cta"),
      features: [t("pricing.free.f1"), t("pricing.free.f2"), t("pricing.free.f3")],
    },
    {
      id: "pro",
      name: t("pricing.pro"),
      price: `${sym}9.99`,
      period: t("pricing.per.month"),
      desc: t("pricing.pro.desc"),
      cta: t("pricing.pro.cta"),
      highlight: true,
      features: [
        t("pricing.pro.f1"),
        t("pricing.pro.f2"),
        t("pricing.pro.f3"),
        t("pricing.pro.f4"),
        t("pricing.pro.f5"),
      ],
    },
    {
      id: "premium",
      name: t("pricing.prem"),
      price: `${sym}19.99`,
      period: t("pricing.per.month"),
      desc: t("pricing.prem.desc"),
      cta: t("pricing.prem.cta"),
      features: [
        t("pricing.prem.f1"),
        t("pricing.prem.f2"),
        t("pricing.prem.f3"),
        t("pricing.prem.f4"),
        t("pricing.prem.f5"),
      ],
    },
  ];

  const handleSubscribe = async (planId: string) => {
    // 1. Free plan behavior
    if (planId === "free") {
      navigate({ to: userId ? "/diagnose" : "/register" });
      return;
    }

    // 2. Logged Out behavior -> Send to registration page
    if (!userId) {
      navigate({ to: "/register", search: { plan: planId } });
      return;
    }

    // 3. Logged In behavior -> Trigger payment checkout
    console.log(`User ${userId} requested checkout for plan: ${planId}`);
    
    // Replace this console log with your checkout call, Supabase Edge Function, or Stripe redirect:
    // e.g., navigate({ to: "/checkout", search: { plan: planId } });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {t("pricing.h1")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{t("pricing.sub")}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border bg-card p-8 ${tier.highlight ? "border-primary" : "border-border/60"}`}
              >
                {tier.highlight && (
                  <span className="mb-3 inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                    {t("pricing.popular")}
                  </span>
                )}
                <h2 className="font-display text-2xl font-bold">{tier.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{tier.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">/ {tier.period}</span>
                </div>

                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  className={`mt-6 w-full ${tier.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                  variant={tier.highlight ? "default" : "outline"}
                >
                  {tier.cta}
                </Button>

                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
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