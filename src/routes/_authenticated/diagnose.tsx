import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  Car,
  ExternalLink,
  Image as ImageIcon,
  ListChecks,
  Loader2,
  Printer,
  Save,
  Sparkles,
  Wrench,
  Youtube,
  HelpCircle,
  LocateFixed,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SeverityBadge } from "@/components/SeverityBadge";
import { supabase } from "@/integrations/supabase/client";
import {
  runDiagnosis,
  explainStep,
  generateImage,
  type DiagnosisResult,
  type DiagStep,
} from "@/lib/diagnose.functions";
import { useLocale, currencySymbol } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/diagnose")({
  head: () => ({ meta: [{ title: "Diagnose — AutoDoctor AI" }] }),
  component: DiagnosePage,
});

const TAG_KEYS = [
  ["noise", "tags.noise"],
  ["warning", "tags.warning"],
  ["perf", "tags.perf"],
  ["over", "tags.over"],
  ["start", "tags.start"],
  ["leak", "tags.leak"],
  ["vib", "tags.vib"],
  ["smoke", "tags.smoke"],
] as const;

// Finland's top selling, hybrid, EV and popular pre-owned car brands and models
const CAR_DATA: Record<string, string[]> = {
  Toyota: ["Corolla", "Yaris", "Yaris Cross", "RAV4", "C-HR", "bZ4X", "Camry", "Avensis"],
  Volvo: ["XC60", "XC40", "V60", "V90", "EX30", "S60", "EX90"],
  Skoda: ["Octavia", "Enyaq", "Elroq", "Superb", "Kodiaq", "Fabia", "Karoq"],
  Volkswagen: ["Golf", "Passat", "ID.4", "ID.3", "ID.Buzz", "Tiguan", "T-Cross", "Polo"],
  Kia: ["Ceed", "EV6", "Sportage", "Niro", "Sorento", "Rio", "EV9"],
  Tesla: ["Model Y", "Model 3", "Model S", "Model X"],
  Nissan: ["Qashqai", "Leaf", "Ariya", "X-Trail", "Micra"],
  "Mercedes-Benz": ["C-Class", "E-Class", "A-Class", "GLC", "EQE", "EQS", "Sprinter"],
  BMW: ["3 Series", "5 Series", "i4", "X5", "X3", "iX3", "iX"],
  Audi: ["A4", "A6", "Q4 e-tron", "Q5", "A3", "e-tron"],
  Ford: ["Focus", "Fiesta", "Mondeo", "Kuga", "Mustang Mach-E", "Transit"],
  Hyundai: ["Ioniq 5", "Ioniq 6", "Tucson", "Kona", "i30", "i20"],
  Opel: ["Astra", "Corsa", "Insignia", "Mokka", "Grandland"],
  Peugeot: ["208", "308", "2008", "3008", "5008"],
  Renault: ["Clio", "Megane", "Captur", "Zoe"],
  Polestar: ["Polestar 2", "Polestar 3", "Polestar 4"],
};

function shopUrl(q: string) {
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`;
}
function youtubeUrl(q: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}
function openExternal(e: React.MouseEvent<HTMLButtonElement> | undefined, url: string) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function DiagnosePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { t, language, region, currency } = useLocale();
  
  const profileQ = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
  });

  const [year, setYear] = useState("");
  
  // Custom Select vs Free-text State Management
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");

  const make = selectedMake === "other" ? customMake : selectedMake;
  const model = selectedModel === "other" ? customModel : selectedModel;

  const [mileage, setMileage] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [vehicleImg, setVehicleImg] = useState<string | null>(null);
  const [stepImgs, setStepImgs] = useState<Record<number, string>>({});
  const [stepLoading, setStepLoading] = useState<Record<number, boolean>>({});
  const [stepDetails, setStepDetails] = useState<Record<number, string>>({});
  const [stepDetailLoading, setStepDetailLoading] = useState<Record<number, boolean>>({});
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "ready" | "denied" | "unsupported">("idle");
  const [locationError, setLocationError] = useState("");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapQuery, setMapQuery] = useState("");

  useEffect(() => {
    const p = profileQ.data;
    if (!p) return;
    if (!year && p.default_year) setYear(p.default_year);
    
    if (p.default_make) {
      if (CAR_DATA[p.default_make]) {
        setSelectedMake(p.default_make);
      } else {
        setSelectedMake("other");
        setCustomMake(p.default_make);
      }
    }

    if (p.default_model) {
      const modelsForMake = p.default_make ? CAR_DATA[p.default_make] : [];
      if (modelsForMake?.includes(p.default_model)) {
        setSelectedModel(p.default_model);
      } else {
        setSelectedModel("other");
        setCustomModel(p.default_model);
      }
    }

    if (!mileage && p.default_mileage) setMileage(p.default_mileage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQ.data]);

  // SOLUTION 1 IMPLEMENTATION: Standardized English search query for Google Maps
  useEffect(() => {
    if (!result) return;
    
    const carInfo = `${year} ${make} ${model}`.trim();
    const cleanDiagnosis = result.diagnosis.replace(/[^a-zA-Z0-9\s-]/g, " ").trim();
    
    // Construct a clean, standardized English search query that Google Maps understands globally
    const query = carInfo 
      ? `auto repair shop for ${carInfo}`
      : `car repair shop ${cleanDiagnosis.slice(0, 30)}`.trim();

    setMapQuery(query);
  }, [result, year, make, model]);

  const diagnose = useServerFn(runDiagnosis);
  const explain = useServerFn(explainStep);
  const genImg = useServerFn(generateImage);

  const mutation = useMutation({
    mutationFn: async () => {
      return await diagnose({
        data: { year, make, model, mileage, symptoms, tags, language, region, currency },
      });
    },
    onSuccess: async (data) => {
      setResult(data);
      setVehicleImg(null);
      setStepImgs({});
      setStepDetails({});
      
      if (data.vehicleImagePrompt) {
        genImg({ data: { prompt: data.vehicleImagePrompt } })
          .then((r) => setVehicleImg(r.dataUrl))
          .catch(() => {});
      }

      try {
        const { error } = await supabase.from("diagnoses").insert({
          user_id: user.id,
          year,
          make,
          model,
          mileage,
          symptoms,
          tags,
          result: data as never,
          severity: data.severity,
        });

        if (error) {
          console.error("Auto-save to history failed:", error.message);
        } else {
          qc.invalidateQueries({ queryKey: ["diagnoses"] });
        }
      } catch (err) {
        console.error("Failed to execute database write:", err);
      }
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : t("diag.failed") || "Diagnosis failed.";
      toast.error(msg);
    },
  });

  async function save() {
    if (!result) return;
    const { error } = await supabase.from("diagnoses").insert({
      user_id: user.id,
      year,
      make,
      model,
      mileage,
      symptoms,
      tags,
      result: result as never,
      severity: result.severity,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("diag.savedHistory") || "Saved to history");
    qc.invalidateQueries({ queryKey: ["diagnoses"] });
  }

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));
  }

  async function loadStepImage(idx: number, prompt: string) {
    if (stepImgs[idx] || stepLoading[idx]) return;
    setStepLoading((s) => ({ ...s, [idx]: true }));
    try {
      const r = await genImg({ data: { prompt } });
      setStepImgs((s) => ({ ...s, [idx]: r.dataUrl }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Image failed");
    } finally {
      setStepLoading((s) => ({ ...s, [idx]: false }));
    }
  }

  async function loadStepDetail(idx: number, step: DiagStep) {
    if (stepDetails[idx] || stepDetailLoading[idx]) return;
    setStepDetailLoading((s) => ({ ...s, [idx]: true }));
    try {
      const r = await explain({
        data: {
          stepTitle: step.title,
          stepInstruction: step.instruction,
          vehicle: `${year} ${make} ${model}`,
          language,
        },
      });
      setStepDetails((s) => ({ ...s, [idx]: r.detail }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load detail");
    } finally {
      setStepDetailLoading((s) => ({ ...s, [idx]: false }));
    }
  }

  const canSubmit = year && make && model && symptoms.length > 3 && !mutation.isPending;
  const sym = currencySymbol(currency);

  const mapsEmbedUrl = useMemo(() => {
    const query = encodeURIComponent(mapQuery || "auto repair shop");
    if (userCoords) {
      return `https://www.google.com/maps?q=${query}&sll=${userCoords.lat},${userCoords.lng}&output=embed`;
    }
    return `https://www.google.com/maps?q=${query}&output=embed`;
  }, [mapQuery, userCoords]);

  function requestNearbyMechanics() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationStatus("unsupported");
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }

    setLocationStatus("loading");
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus("ready");
      },
      (error) => {
        setLocationStatus("denied");
        setLocationError(error.message || "Location access was blocked.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">{t("diag.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("diag.subtitle")}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) mutation.mutate();
        }}
        className="rounded-2xl border border-border/60 bg-card p-6 print:hidden"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Car className="h-4 w-4" /> {t("diag.step1")}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={t("diag.year")}>
            <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2018" />
          </Field>

          {/* Make Dropdown / Custom Input */}
          <Field label={t("diag.make")}>
            {selectedMake !== "other" ? (
              <select
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  setSelectedModel("");
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">{t("diag.selectMake") || "Select Make"}</option>
                {Object.keys(CAR_DATA).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="other">{t("diag.otherCustom") || "Other / Custom..."}</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={customMake}
                  onChange={(e) => setCustomMake(e.target.value)}
                  placeholder={t("diag.enterMake") || "Enter Manufacturer"}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedMake("");
                    setCustomMake("");
                  }}
                >
                  {t("diag.reset") || "Reset"}
                </Button>
              </div>
            )}
          </Field>

          {/* Model Dropdown / Custom Input */}
          <Field label={t("diag.model")}>
            {selectedMake !== "other" && selectedMake !== "" && selectedModel !== "other" ? (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">{t("diag.selectModel") || "Select Model"}</option>
                {(CAR_DATA[selectedMake] || []).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="other">{t("diag.otherCustom") || "Other / Custom..."}</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={selectedMake === "other" ? customModel : (selectedModel === "other" ? customModel : "")}
                  onChange={(e) => {
                    if (selectedMake === "other") {
                      setCustomModel(e.target.value);
                    } else {
                      setSelectedModel("other");
                      setCustomModel(e.target.value);
                    }
                  }}
                  disabled={!selectedMake}
                  placeholder={selectedMake ? (t("diag.enterModel") || "Enter Model") : (t("diag.selectMakeFirst") || "Select Make First")}
                />
                {selectedModel === "other" && selectedMake !== "other" && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedModel("");
                      setCustomModel("");
                    }}
                  >
                    {t("diag.reset") || "Reset"}
                  </Button>
                )}
              </div>
            )}
          </Field>

          <Field label={t("diag.mileage")}>
            <Input
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="120,000 km"
            />
          </Field>
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-primary">
          <ListChecks className="h-4 w-4" /> {t("diag.step2")}
        </div>
        <div className="mt-4">
          <Label htmlFor="symptoms" className="sr-only">
            {t("diag.step2")}
          </Label>
          <Textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder={t("diag.symptoms.placeholder")}
            rows={5}
            maxLength={2000}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {TAG_KEYS.map(([id, key]) => {
              const label = t(key);
              const active = tags.includes(label);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleTag(label)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${active ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            disabled={!canSubmit}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("diag.analyzing")}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> {t("diag.submit")}
              </>
            )}
          </Button>
        </div>
      </form>

      {result && (
        <section
          className="mt-10 rounded-2xl border border-border/60 bg-card p-6"
          id="diagnosis-result"
        >
          {vehicleImg && (
            <div className="mb-6 w-full overflow-hidden rounded-xl border border-border/60 bg-zinc-950 aspect-video relative">
              <img
                src={vehicleImg}
                alt={`${year} ${make} ${model}`}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 py-3">
                <span className="text-xs font-semibold tracking-wider text-white uppercase">
                  {year} {make} {model}
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Wrench className="h-4 w-4" /> {t("diag.diagnosis")}
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold">{result.diagnosis}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={result.severity} />
                <Badge variant="outline">
                  {t("diag.confidence")}: {result.confidence}
                </Badge>
                <Badge variant="outline">
                  {t("diag.diy")}: {result.diyDifficulty}
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <Button onClick={() => window.print()} variant="outline">
                <Printer className="mr-2 h-4 w-4" /> {t("diag.print")}
              </Button>
              <Button onClick={save} variant="outline">
                <Save className="mr-2 h-4 w-4" /> {t("diag.save")}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoBox label={t("diag.cost")} value={result.estimatedCostRange} />
            <InfoBox
              label={t("diag.parts")}
              value={result.partsNeeded.length === 0 ? "—" : `${result.partsNeeded.length}`}
            />
          </div>

          {(result.severity === "High" || result.severity === "Critical") && (
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <div className="font-semibold text-destructive">{t("diag.mechanic")}</div>
                <p className="mt-1 text-foreground/90">{result.mechanicAdvice}</p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-display text-lg font-semibold">{t("diag.steps")}</h3>
            <Accordion type="multiple" className="mt-3">
              {result.diySteps.map((s, i) => (
                <AccordionItem
                  key={i}
                  value={`step-${i}`}
                  className="rounded-lg border border-border/60 bg-background/40 px-4 mb-2"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      <span className="font-medium">{s.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent data-print-expand>
                    <div className="space-y-3 pt-1">
                      <p className="text-sm text-foreground/90">{s.instruction}</p>
                      {s.tip && (
                        <p className="rounded-md bg-primary/5 px-3 py-2 text-xs text-foreground/80">
                          <span className="font-semibold text-primary">{t("diag.tip")}:</span>{" "}
                          {s.tip}
                        </p>
                      )}
                      {stepImgs[i] ? (
                        <img
                          src={stepImgs[i]}
                          alt={s.title}
                          className="w-full rounded-lg border border-border/60"
                        />
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={stepLoading[i]}
                          onClick={() => loadStepImage(i, s.imagePrompt)}
                          className="print:hidden"
                        >
                          {stepLoading[i] ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />{" "}
                              {t("diag.regenerating")}
                            </>
                          ) : (
                            <>
                              <ImageIcon className="mr-2 h-3 w-3" /> {t("diag.generateImage")}
                            </>
                          )}
                        </Button>
                      )}
                      <div className="flex flex-wrap gap-2 print:hidden">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={stepDetailLoading[i]}
                          onClick={() => loadStepDetail(i, s)}
                        >
                          {stepDetailLoading[i] ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <HelpCircle className="mr-2 h-3 w-3" />
                          )}
                          {t("diag.moreDetail")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={(e) => openExternal(e, youtubeUrl(`${year} ${make} ${model} ${s.searchQuery}`))}
                        >
                          <Youtube className="mr-2 h-3 w-3" /> {t("diag.watchVideo")}
                        </Button>
                      </div>
                      {stepDetails[i] && (
                        <div className="whitespace-pre-wrap rounded-md border border-border/60 bg-card p-3 text-xs leading-relaxed text-foreground/90">
                          {stepDetails[i]}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {result.toolsNeeded && result.toolsNeeded.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display text-lg font-semibold">{t("diag.tools")}</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {result.toolsNeeded.map((tool, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm"
                  >
                    <span>{tool.name}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="print:hidden"
                      onClick={(e) => openExternal(e, shopUrl(tool.searchQuery))}
                    >
                      {t("diag.buy")} <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.partsNeeded.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display text-lg font-semibold">{t("diag.parts")}</h3>
              <ul className="mt-3 divide-y divide-border/60 rounded-lg border border-border/60">
                {result.partsNeeded.map((p, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <span className="flex-1">{p.part}</span>
                    <span className="text-muted-foreground">
                      {Number.isFinite(p.priceLow) && Number.isFinite(p.priceHigh)
                        ? `${sym}${p.priceLow}–${sym}${p.priceHigh}`
                        : p.estimatedCost}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="print:hidden"
                      onClick={(e) => openExternal(e, shopUrl(p.searchQuery || p.part))}
                    >
                      {t("diag.buy")} <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.youtubeQueries && result.youtubeQueries.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display text-lg font-semibold">{t("diag.videos")}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {result.youtubeQueries.slice(0, 5).map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => openExternal(e, youtubeUrl(q))}
                    className="group flex flex-col gap-2 rounded-lg border border-border/60 bg-background/40 p-3 text-left transition-colors hover:border-primary/50"
                  >
                    <div className="flex aspect-video items-center justify-center rounded-md bg-gradient-to-br from-red-500/20 to-red-900/40">
                      <Youtube className="h-10 w-10 text-red-500" />
                    </div>
                    <div className="text-sm font-medium group-hover:text-primary">{q}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ExternalLink className="h-3 w-3" /> YouTube
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-border/60 bg-background/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <MapPin className="h-4 w-4" /> {t("diag.nearbyMechanics")}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t("diag.nearbyMechanics.desc")}</p>
              </div>
              <Button type="button" variant="outline" onClick={requestNearbyMechanics}>
                <LocateFixed className="mr-2 h-4 w-4" /> {t("diag.useMyLocation")}
              </Button>
            </div>

            <div className="mt-4 rounded-lg border border-border/60 bg-card/70 p-3">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                  {mapQuery || t("diag.nearbyMechanics")}
                </span>
                {locationStatus === "loading" && <span>{t("diag.locating")}</span>}
                {locationStatus === "ready" && userCoords && (
                  <span>
                    {t("diag.locationFound")}: {userCoords.lat.toFixed(3)}, {userCoords.lng.toFixed(3)}
                  </span>
                )}
                {locationStatus === "denied" && locationError && <span>{locationError}</span>}
                {locationStatus === "unsupported" && <span>{locationError}</span>}
              </div>
              <iframe
                title={t("diag.nearbyMechanics")}
                src={mapsEmbedUrl}
                className="h-72 w-full rounded-lg border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={(e) => openExternal(e, mapsEmbedUrl)}>
                {t("diag.openMaps")}
              </Button>
              <Button type="button" variant="ghost" onClick={(e) => openExternal(e, `https://www.google.com/maps/search/${encodeURIComponent(mapQuery || "auto repair shop")}`)}>
                {t("diag.searchMaps")}
              </Button>
            </div>
          </div>

          {result.additionalNotes && (
            <p className="mt-6 rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
              {result.additionalNotes}
            </p>
          )}

          {result.severity !== "High" &&
            result.severity !== "Critical" &&
            result.mechanicAdvice && (
              <p className="mt-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{t("diag.whenMechanic")}:</span>{" "}
                {result.mechanicAdvice}
              </p>
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