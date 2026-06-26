import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, Gauge, ScrollText, ShieldCheck, Sparkles, Car, ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AutoDoctor AI — Diagnose car problems instantly" },
      { name: "description", content: "Your intelligent roadside companion. Diagnose vehicle symptoms, get repair estimates, and follow DIY fix guides to save on mechanic costs." },
      { property: "og:title", content: "AutoDoctor AI" },
      { property: "og:description", content: "AI car diagnosis, repair estimates, and DIY fix guides." },
    ],
  }),
  component: Home,
});

function Home() {
  const t = useT();
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main>
        <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {t("home.badge")}
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
                {t("home.h1.a")} <span className="text-primary">{t("home.h1.b")}</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                {t("home.hero.desc")}
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg" className="h-12 px-6 text-base font-semibold" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
                  <Link to="/register">
                    {t("home.cta.primary")} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
                  <Link to="/pricing">{t("home.cta.secondary")}</Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{t("home.freeNote")}</p>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 -z-0 opacity-30" style={{ background: "radial-gradient(60% 50% at 50% 0%, oklch(0.62 0.22 30 / 0.25), transparent)" }} />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Gauge, title: t("home.feat1.title"), desc: t("home.feat1.desc") },
              { icon: Wrench, title: t("home.feat2.title"), desc: t("home.feat2.desc") },
              { icon: ScrollText, title: t("home.feat3.title"), desc: t("home.feat3.desc") },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border/60 bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border/60 bg-card/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { quote: t("home.t1"), name: t("home.t1.who") },
                { quote: t("home.t2"), name: t("home.t2.who") },
                { quote: t("home.t3"), name: t("home.t3.who") },
              ].map((tt) => (
                <figure key={tt.name} className="rounded-2xl border border-border/60 bg-background/50 p-6">
                  <blockquote className="text-sm text-foreground">"{tt.quote}"</blockquote>
                  <figcaption className="mt-4 text-xs text-muted-foreground">— {tt.name}</figcaption>
                </figure>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> {t("home.trust.private")}</span>
              <span className="inline-flex items-center gap-2"><Car className="h-4 w-4 text-primary" /> {t("home.trust.any")}</span>
              <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> {t("home.trust.ai")}</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("home.final.h2")}</h2>
          <p className="mt-4 text-muted-foreground">{t("home.final.desc")}</p>
          <Button asChild size="lg" className="mt-8 h-12 px-6 text-base font-semibold" style={{ background: "var(--gradient-primary)" }}>
            <Link to="/register">{t("home.final.cta")} <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
