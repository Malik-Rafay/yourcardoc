import { Globe, MapPin, Coins } from "lucide-react";
import {
  CURRENCIES,
  LANGUAGES,
  REGIONS,
  useLocale,
  type Currency,
  type Language,
  type Region,
} from "@/lib/i18n";

export function LocaleBar() {
  const { language, region, currency, setLanguage, setRegion, setCurrency, t } = useLocale();
  return (
    <div className="w-full border-b border-border/60 bg-card/50 print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-2 px-4 py-1.5 text-xs sm:px-6">
        <LocaleSelect
          icon={<MapPin className="h-3 w-3" />}
          label={t("locale.region")}
          value={region}
          onChange={(v) => setRegion(v as Region)}
          options={REGIONS.map((r) => ({ value: r.code, label: r.label }))}
        />
        <LocaleSelect
          icon={<Globe className="h-3 w-3" />}
          label={t("locale.language")}
          value={language}
          onChange={(v) => setLanguage(v as Language)}
          options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
        />
        <LocaleSelect
          icon={<Coins className="h-3 w-3" />}
          label={t("locale.currency")}
          value={currency}
          onChange={(v) => setCurrency(v as Currency)}
          options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.symbol} ${c.code}` }))}
        />
      </div>
    </div>
  );
}

function LocaleSelect({
  icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2 py-1">
      <span className="text-muted-foreground">{icon}</span>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs font-medium text-foreground focus:outline-none"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-background text-foreground">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
