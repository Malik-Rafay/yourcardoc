import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Wrench, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LocaleBar } from "@/components/LocaleBar";
import { useT } from "@/lib/i18n";

export function AppHeader() {
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (s: { location: { pathname: string } }) => s.location.pathname,
  });
  const t = useT();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const publicLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/pricing", label: t("nav.pricing") },
    { to: "/faq", label: t("nav.faq") },
  ];
  const authedLinks = [
    { to: "/dashboard", label: t("nav.dashboard") },
    { to: "/diagnose", label: t("nav.diagnose") },
    { to: "/history", label: t("nav.history") },
    { to: "/library", label: t("nav.library") },
    { to: "/settings", label: t("nav.settings") },
  ];
  const links = userId ? authedLinks : publicLinks;

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur print:hidden">
      <LocaleBar />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            AutoDoctor<span className="text-primary">AI</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {userId ? (
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> {t("nav.signout")}
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">{t("nav.login")}</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/register">{t("nav.register")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
