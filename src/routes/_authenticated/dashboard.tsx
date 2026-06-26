import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Stethoscope, History, BookOpen, TrendingDown, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useT, useLocale, currencySymbol } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — AutoDoctor AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const t = useT();
  const { currency } = useLocale();

  const profileQ = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const diagQ = useQuery({
    queryKey: ["diagnoses", user.id, "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diagnoses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const total = diagQ.data?.length ?? 0;
  const savedEstimate = total * 120;
  const issueCounts: Record<string, number> = {};
  diagQ.data?.forEach((d) => {
    const dx = (d.result as { diagnosis?: string } | null)?.diagnosis ?? "Unknown";
    issueCounts[dx] = (issueCounts[dx] ?? 0) + 1;
  });
  const topIssue = Object.entries(issueCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const recent = diagQ.data?.slice(0, 5) ?? [];

  const name = profileQ.data?.full_name || user.email?.split("@")[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{t("dash.welcome")}, {name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("dash.snapshot")}</p>
        </div>
        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/diagnose"><Stethoscope className="mr-2 h-4 w-4" /> {t("dash.startNew")}</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Stethoscope} label={t("dash.stat.total")} value={String(total)} />
        <StatCard icon={TrendingDown} label={t("dash.stat.savings")} value={`${currencySymbol(currency)}${savedEstimate}`} />
        <StatCard icon={Wrench} label={t("dash.stat.common")} value={topIssue} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border/60 bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">{t("dash.recent")}</h2>
            <Link to="/history" className="text-sm text-primary hover:underline">{t("dash.viewAll")}</Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">{t("dash.empty")}</p>
          ) : (
            <ul className="mt-4 divide-y divide-border/60">
              {recent.map((d) => {
                const result = d.result as { diagnosis?: string };
                return (
                  <li key={d.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{result?.diagnosis ?? "—"}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {d.year} {d.make} {d.model} · {new Date(d.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <SeverityBadge severity={d.severity ?? undefined} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="grid gap-4">
          <Link to="/library" className="group rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/50">
            <BookOpen className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display text-lg font-semibold">{t("nav.library")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("dash.card.library.desc")}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">{t("dash.card.explore")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
          <Link to="/history" className="group rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/50">
            <History className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display text-lg font-semibold">{t("dash.card.history")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("dash.card.history.desc")}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">{t("dash.card.open")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}