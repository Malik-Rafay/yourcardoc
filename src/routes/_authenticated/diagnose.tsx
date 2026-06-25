import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Car, ListChecks, Loader2, Save, Sparkles, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { supabase } from "@/integrations/supabase/client";
import { runDiagnosis, type DiagnosisResult } from "@/lib/diagnose.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/diagnose")({
  head: () => ({ meta: [{ title: "Diagnose — AutoDoctor AI" }] }),
  component: DiagnosePage,
});

const TAGS = ["Strange noise", "Warning light", "Poor performance", "Overheating", "Won't start", "Leak", "Vibration", "Smoke"];

function DiagnosePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const profileQ = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
  });

  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [mileage, setMileage] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    const p = profileQ.data;
    if (!p) return;
    if (!year && p.default_year) setYear(p.default_year);
    if (!make && p.default_make) setMake(p.default_make);
    if (!model && p.default_model) setModel(p.default_model);
    if (!mileage && p.default_mileage) setMileage(p.default_mileage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQ.data]);

  const diagnose = useServerFn(runDiagnosis);

  const mutation = useMutation({
    mutationFn: async () => {
      return await diagnose({ data: { year, make, model, mileage, symptoms, tags } });
    },
    onSuccess: (data) => setResult(data),
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Diagnosis failed.";
      toast.error(msg);
    },
  });

  async function save() {
    if (!result) return;
    const { error } = await supabase.from("diagnoses").insert({
      user_id: user.id,
      year, make, model, mileage,
      symptoms,
      tags,
      result: result as unknown as Record<string, unknown>,
      severity: result.severity,
    });
    if (error) return toast.error(error.message);
    toast.success("Saved to history");
    qc.invalidateQueries({ queryKey: ["diagnoses"] });
  }

  function toggleTag(t: string) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  const canSubmit = year && make && model && symptoms.length > 3 && !mutation.isPending;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">New Diagnosis</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tell us about your car and what's wrong. Our AI handles the rest.</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (canSubmit) mutation.mutate(); }}
        className="rounded-2xl border border-border/60 bg-card p-6"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Car className="h-4 w-4" /> Step 1 — Vehicle
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Year"><Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2018" /></Field>
          <Field label="Make"><Input value={make} onChange={(e) => setMake(e.target.value)} placeholder="Toyota" /></Field>
          <Field label="Model"><Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Corolla" /></Field>
          <Field label="Mileage"><Input value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="120,000 km" /></Field>
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-primary">
          <ListChecks className="h-4 w-4" /> Step 2 — Symptoms
        </div>
        <div className="mt-4">
          <Label htmlFor="symptoms" className="sr-only">Symptoms</Label>
          <Textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe what's happening. E.g., 'Loud grinding noise when braking, especially at low speeds. Started yesterday.'"
            rows={5}
            maxLength={2000}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {TAGS.map((t) => {
              const active = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${active ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={!canSubmit} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            {mutation.isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</>) : (<><Sparkles className="mr-2 h-4 w-4" /> Run AI diagnosis</>)}
          </Button>
        </div>
      </form>

      {result && (
        <section className="mt-10 rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Wrench className="h-4 w-4" /> Diagnosis
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold">{result.diagnosis}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={result.severity} />
                <Badge variant="outline">Confidence: {result.confidence}</Badge>
                <Badge variant="outline">DIY: {result.diyDifficulty}</Badge>
              </div>
            </div>
            <Button onClick={save} variant="outline"><Save className="mr-2 h-4 w-4" /> Save to history</Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoBox label="Estimated cost" value={result.estimatedCostRange} />
            <InfoBox label="Parts needed" value={result.partsNeeded.length === 0 ? "None listed" : `${result.partsNeeded.length} item(s)`} />
          </div>

          {(result.severity === "High" || result.severity === "Critical") && (
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <div className="font-semibold text-destructive">See a mechanic</div>
                <p className="mt-1 text-foreground/90">{result.mechanicAdvice}</p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-display text-lg font-semibold">Step-by-step DIY fix</h3>
            <ol className="mt-3 space-y-2">
              {result.diySteps.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-border/60 bg-background/40 p-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          {result.partsNeeded.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display text-lg font-semibold">Parts needed</h3>
              <ul className="mt-3 divide-y divide-border/60 rounded-lg border border-border/60">
                {result.partsNeeded.map((p, i) => (
                  <li key={i} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                    <span>{p.part}</span>
                    <span className="text-muted-foreground">{p.estimatedCost}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.additionalNotes && (
            <p className="mt-6 rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">{result.additionalNotes}</p>
          )}

          {result.severity !== "High" && result.severity !== "Critical" && result.mechanicAdvice && (
            <p className="mt-4 text-xs text-muted-foreground"><span className="font-semibold text-foreground">When to see a mechanic:</span> {result.mechanicAdvice}</p>
          )}
        </section>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg font-semibold">{value}</div>
    </div>
  );
}