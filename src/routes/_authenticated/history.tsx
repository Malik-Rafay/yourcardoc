import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/SeverityBadge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — AutoDoctor AI" }] }),
  component: HistoryPage,
});

type DResult = {
  diagnosis?: string;
  estimatedCostRange?: string;
  diyDifficulty?: string;
  diySteps?: string[];
  partsNeeded?: { part: string; estimatedCost: string }[];
  mechanicAdvice?: string;
  additionalNotes?: string;
};

function HistoryPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["diagnoses", user.id, "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diagnoses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function remove(id: string) {
    const { error } = await supabase.from("diagnoses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["diagnoses"] });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">History</h1>
      <p className="mt-1 text-sm text-muted-foreground">All your past diagnoses, newest first.</p>

      <div className="mt-8 space-y-3">
        {q.isLoading && <p className="text-muted-foreground">Loading…</p>}
        {q.data && q.data.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-10 text-center text-muted-foreground">
            No diagnoses yet.
          </div>
        )}
        {q.data?.map((d) => {
          const r = (d.result ?? {}) as DResult;
          const isOpen = open === d.id;
          return (
            <article key={d.id} className="rounded-2xl border border-border/60 bg-card">
              <div className="flex items-start justify-between gap-3 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={d.severity ?? undefined} />
                    <span className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</span>
                  </div>
                  <h2 className="mt-2 font-display text-lg font-semibold">{r.diagnosis ?? "Diagnosis"}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {d.year} {d.make} {d.model} · {d.mileage}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{d.symptoms}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setOpen(isOpen ? null : d.id)} aria-label="Toggle details">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(d.id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {isOpen && (
                <div className="space-y-4 border-t border-border/60 p-5 text-sm">
                  {r.estimatedCostRange && <p><span className="font-semibold">Estimated cost:</span> {r.estimatedCostRange}</p>}
                  {r.diyDifficulty && <p><span className="font-semibold">DIY difficulty:</span> {r.diyDifficulty}</p>}
                  {r.diySteps && r.diySteps.length > 0 && (
                    <div>
                      <div className="font-semibold">Steps</div>
                      <ol className="mt-2 list-inside list-decimal space-y-1 text-muted-foreground">
                        {r.diySteps.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>
                    </div>
                  )}
                  {r.partsNeeded && r.partsNeeded.length > 0 && (
                    <div>
                      <div className="font-semibold">Parts</div>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        {r.partsNeeded.map((p, i) => <li key={i}>{p.part} — {p.estimatedCost}</li>)}
                      </ul>
                    </div>
                  )}
                  {r.mechanicAdvice && <p className="text-muted-foreground"><span className="font-semibold text-foreground">Mechanic advice:</span> {r.mechanicAdvice}</p>}
                  {r.additionalNotes && <p className="text-muted-foreground">{r.additionalNotes}</p>}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}