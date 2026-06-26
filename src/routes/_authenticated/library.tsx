import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LIBRARY, LIBRARY_CATEGORIES } from "@/lib/library-data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({ meta: [{ title: "Library — AutoDoctor AI" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const t = useT();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const items = useMemo(() => {
    const s = search.toLowerCase().trim();
    return LIBRARY.filter((a) => {
      if (cat && a.category !== cat) return false;
      if (!s) return true;
      return (
        a.title.toLowerCase().includes(s) ||
        a.description.toLowerCase().includes(s) ||
        a.symptoms.some((sy) => sy.toLowerCase().includes(s))
      );
    });
  }, [search, cat]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">{t("lib.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("lib.sub")}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("lib.search")} className="pl-9" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Chip active={cat === null} onClick={() => setCat(null)}>{t("lib.all")}</Chip>
        {LIBRARY_CATEGORIES.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((a) => (
          <article key={a.id} className="rounded-2xl border border-border/60 bg-card p-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">{a.category}</span>
            <h2 className="mt-1 font-display text-lg font-semibold">{a.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("lib.symptoms")}</div>
              <ul className="mt-1 list-inside list-disc text-sm text-foreground/90">
                {a.symptoms.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="mt-4 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("lib.fix")}</div>
              <p className="mt-1 text-foreground/90">{a.fix}</p>
            </div>
            <div className="mt-4 inline-flex items-center rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs">
              <span className="text-muted-foreground">{t("lib.cost")}&nbsp;</span><span className="font-semibold">{a.cost}</span>
            </div>
          </article>
        ))}
        {items.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">{t("lib.noResults")}</p>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${active ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}