import { Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { useT } from "@/lib/i18n";

export function AppFooter() {
  const t = useT();
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wrench className="h-4 w-4 text-primary" />
          <span>{t("footer.tagline")}</span>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/pricing" className="hover:text-foreground">{t("nav.pricing")}</Link>
          <Link to="/faq" className="hover:text-foreground">{t("nav.faq")}</Link>
        </div>
      </div>
    </footer>
  );
}