import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "fi" | "de" | "es" | "fr";
export type Region = "EU" | "UK" | "US" | "CA" | "AU" | "IN" | "OTHER";
export type Currency = "EUR" | "USD" | "GBP" | "CAD" | "AUD" | "INR";

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fi", label: "Suomi" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
];
export const REGIONS: { code: Region; label: string }[] = [
  { code: "EU", label: "Europe" },
  { code: "UK", label: "United Kingdom" },
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "IN", label: "India" },
  { code: "OTHER", label: "Other" },
];
export const CURRENCIES: { code: Currency; symbol: string }[] = [
  { code: "EUR", symbol: "€" },
  { code: "USD", symbol: "$" },
  { code: "GBP", symbol: "£" },
  { code: "CAD", symbol: "C$" },
  { code: "AUD", symbol: "A$" },
  { code: "INR", symbol: "₹" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.home": "Home", "nav.pricing": "Pricing", "nav.faq": "FAQ",
  "nav.dashboard": "Dashboard", "nav.diagnose": "Diagnose", "nav.history": "History",
  "nav.library": "Library", "nav.settings": "Settings",
  "nav.login": "Login", "nav.register": "Get started", "nav.signout": "Sign out",
  "locale.region": "Region", "locale.language": "Language", "locale.currency": "Currency",
  "diag.title": "New Diagnosis",
  "diag.subtitle": "Tell us about your car and what's wrong. Our AI handles the rest.",
  "diag.step1": "Step 1 — Vehicle",
  "diag.step2": "Step 2 — Symptoms",
  "diag.year": "Year", "diag.make": "Make", "diag.model": "Model", "diag.mileage": "Mileage",
  "diag.symptoms.placeholder": "Describe what's happening. E.g., 'Loud grinding noise when braking, especially at low speeds. Started yesterday.'",
  "diag.submit": "Run AI diagnosis",
  "diag.analyzing": "Analyzing…",
  "diag.diagnosis": "Diagnosis",
  "diag.confidence": "Confidence", "diag.diy": "DIY", "diag.save": "Save to history",
  "diag.cost": "Estimated cost", "diag.parts": "Parts needed", "diag.tools": "Tools needed",
  "diag.steps": "Step-by-step DIY fix",
  "diag.mechanic": "See a mechanic",
  "diag.videos": "Recommended video tutorials",
  "diag.print": "Print / Save as PDF",
  "diag.buy": "Find / Buy",
  "diag.moreHelp": "Need more help?",
  "diag.moreDetail": "More detailed instructions",
  "diag.watchVideo": "Watch a video for this step",
  "diag.generateImage": "Show illustration",
  "diag.regenerating": "Generating…",
  "diag.tip": "Tip",
  "diag.whenMechanic": "When to see a mechanic",
  "tags.noise": "Strange noise", "tags.warning": "Warning light", "tags.perf": "Poor performance",
  "tags.over": "Overheating", "tags.start": "Won't start", "tags.leak": "Leak", "tags.vib": "Vibration", "tags.smoke": "Smoke",
  "dash.welcome": "Welcome back",
  "common.loading": "Loading…",
};

const fi: Dict = {
  "nav.home": "Etusivu", "nav.pricing": "Hinnoittelu", "nav.faq": "UKK",
  "nav.dashboard": "Kojelauta", "nav.diagnose": "Diagnoosi", "nav.history": "Historia",
  "nav.library": "Kirjasto", "nav.settings": "Asetukset",
  "nav.login": "Kirjaudu", "nav.register": "Aloita", "nav.signout": "Kirjaudu ulos",
  "locale.region": "Alue", "locale.language": "Kieli", "locale.currency": "Valuutta",
  "diag.title": "Uusi diagnoosi",
  "diag.subtitle": "Kerro autostasi ja vaivasta. Tekoäly hoitaa loput.",
  "diag.step1": "Vaihe 1 — Ajoneuvo",
  "diag.step2": "Vaihe 2 — Oireet",
  "diag.year": "Vuosi", "diag.make": "Merkki", "diag.model": "Malli", "diag.mileage": "Mittarilukema",
  "diag.symptoms.placeholder": "Kuvaile mitä tapahtuu. Esim. 'Kova rahiseva ääni jarrutettaessa, etenkin hitaalla. Alkoi eilen.'",
  "diag.submit": "Suorita tekoälydiagnoosi",
  "diag.analyzing": "Analysoidaan…",
  "diag.diagnosis": "Diagnoosi",
  "diag.confidence": "Varmuus", "diag.diy": "Itse tehtävä", "diag.save": "Tallenna historiaan",
  "diag.cost": "Arvioitu hinta", "diag.parts": "Tarvittavat osat", "diag.tools": "Tarvittavat työkalut",
  "diag.steps": "Vaiheittainen korjausohje",
  "diag.mechanic": "Vie mekaanikolle",
  "diag.videos": "Suositellut video-oppaat",
  "diag.print": "Tulosta / Tallenna PDF",
  "diag.buy": "Etsi / Osta",
  "diag.moreHelp": "Tarvitsetko apua?",
  "diag.moreDetail": "Tarkemmat ohjeet",
  "diag.watchVideo": "Katso video tästä vaiheesta",
  "diag.generateImage": "Näytä havainnekuva",
  "diag.regenerating": "Luodaan…",
  "diag.tip": "Vinkki",
  "diag.whenMechanic": "Milloin mekaanikolle",
  "tags.noise": "Outo ääni", "tags.warning": "Varoitusvalo", "tags.perf": "Heikko suorituskyky",
  "tags.over": "Ylikuumeneminen", "tags.start": "Ei käynnisty", "tags.leak": "Vuoto", "tags.vib": "Tärinä", "tags.smoke": "Savu",
  "dash.welcome": "Tervetuloa takaisin",
  "common.loading": "Ladataan…",
};

const de: Dict = {
  "nav.home": "Start", "nav.pricing": "Preise", "nav.faq": "FAQ",
  "nav.dashboard": "Übersicht", "nav.diagnose": "Diagnose", "nav.history": "Verlauf",
  "nav.library": "Bibliothek", "nav.settings": "Einstellungen",
  "nav.login": "Anmelden", "nav.register": "Loslegen", "nav.signout": "Abmelden",
  "locale.region": "Region", "locale.language": "Sprache", "locale.currency": "Währung",
  "diag.title": "Neue Diagnose",
  "diag.subtitle": "Erzähl uns von deinem Auto und dem Problem. Die KI übernimmt den Rest.",
  "diag.step1": "Schritt 1 — Fahrzeug",
  "diag.step2": "Schritt 2 — Symptome",
  "diag.year": "Jahr", "diag.make": "Marke", "diag.model": "Modell", "diag.mileage": "Kilometerstand",
  "diag.symptoms.placeholder": "Beschreibe, was passiert.",
  "diag.submit": "KI-Diagnose starten",
  "diag.analyzing": "Analysiere…",
  "diag.diagnosis": "Diagnose",
  "diag.confidence": "Sicherheit", "diag.diy": "DIY", "diag.save": "Im Verlauf speichern",
  "diag.cost": "Geschätzte Kosten", "diag.parts": "Benötigte Teile", "diag.tools": "Benötigte Werkzeuge",
  "diag.steps": "Schritt-für-Schritt Reparaturanleitung",
  "diag.mechanic": "Zur Werkstatt",
  "diag.videos": "Empfohlene Video-Tutorials",
  "diag.print": "Drucken / PDF speichern",
  "diag.buy": "Finden / Kaufen",
  "diag.moreHelp": "Brauchst du Hilfe?",
  "diag.moreDetail": "Ausführlichere Anleitung",
  "diag.watchVideo": "Video zu diesem Schritt",
  "diag.generateImage": "Abbildung anzeigen",
  "diag.regenerating": "Wird erzeugt…",
  "diag.tip": "Tipp",
  "diag.whenMechanic": "Wann zur Werkstatt",
  "tags.noise": "Seltsames Geräusch", "tags.warning": "Warnleuchte", "tags.perf": "Schlechte Leistung",
  "tags.over": "Überhitzung", "tags.start": "Springt nicht an", "tags.leak": "Leck", "tags.vib": "Vibration", "tags.smoke": "Rauch",
  "dash.welcome": "Willkommen zurück",
  "common.loading": "Lädt…",
};

const es: Dict = {
  "nav.home": "Inicio", "nav.pricing": "Precios", "nav.faq": "FAQ",
  "nav.dashboard": "Panel", "nav.diagnose": "Diagnosticar", "nav.history": "Historial",
  "nav.library": "Biblioteca", "nav.settings": "Ajustes",
  "nav.login": "Iniciar sesión", "nav.register": "Comenzar", "nav.signout": "Salir",
  "locale.region": "Región", "locale.language": "Idioma", "locale.currency": "Moneda",
  "diag.title": "Nuevo diagnóstico",
  "diag.subtitle": "Cuéntanos sobre tu coche y el problema. La IA hace el resto.",
  "diag.step1": "Paso 1 — Vehículo",
  "diag.step2": "Paso 2 — Síntomas",
  "diag.year": "Año", "diag.make": "Marca", "diag.model": "Modelo", "diag.mileage": "Kilometraje",
  "diag.symptoms.placeholder": "Describe qué ocurre.",
  "diag.submit": "Ejecutar diagnóstico IA",
  "diag.analyzing": "Analizando…",
  "diag.diagnosis": "Diagnóstico",
  "diag.confidence": "Confianza", "diag.diy": "DIY", "diag.save": "Guardar en historial",
  "diag.cost": "Coste estimado", "diag.parts": "Piezas necesarias", "diag.tools": "Herramientas necesarias",
  "diag.steps": "Guía paso a paso",
  "diag.mechanic": "Ver un mecánico",
  "diag.videos": "Tutoriales en vídeo recomendados",
  "diag.print": "Imprimir / Guardar PDF",
  "diag.buy": "Buscar / Comprar",
  "diag.moreHelp": "¿Necesitas más ayuda?",
  "diag.moreDetail": "Instrucciones más detalladas",
  "diag.watchVideo": "Ver un vídeo de este paso",
  "diag.generateImage": "Mostrar ilustración",
  "diag.regenerating": "Generando…",
  "diag.tip": "Consejo",
  "diag.whenMechanic": "Cuándo ir al mecánico",
  "tags.noise": "Ruido extraño", "tags.warning": "Luz de aviso", "tags.perf": "Bajo rendimiento",
  "tags.over": "Sobrecalentamiento", "tags.start": "No arranca", "tags.leak": "Fuga", "tags.vib": "Vibración", "tags.smoke": "Humo",
  "dash.welcome": "Bienvenido de nuevo",
  "common.loading": "Cargando…",
};

const fr: Dict = {
  "nav.home": "Accueil", "nav.pricing": "Tarifs", "nav.faq": "FAQ",
  "nav.dashboard": "Tableau de bord", "nav.diagnose": "Diagnostiquer", "nav.history": "Historique",
  "nav.library": "Bibliothèque", "nav.settings": "Paramètres",
  "nav.login": "Connexion", "nav.register": "Commencer", "nav.signout": "Déconnexion",
  "locale.region": "Région", "locale.language": "Langue", "locale.currency": "Devise",
  "diag.title": "Nouveau diagnostic",
  "diag.subtitle": "Décrivez votre voiture et le problème. L'IA s'occupe du reste.",
  "diag.step1": "Étape 1 — Véhicule",
  "diag.step2": "Étape 2 — Symptômes",
  "diag.year": "Année", "diag.make": "Marque", "diag.model": "Modèle", "diag.mileage": "Kilométrage",
  "diag.symptoms.placeholder": "Décrivez ce qu'il se passe.",
  "diag.submit": "Lancer le diagnostic IA",
  "diag.analyzing": "Analyse…",
  "diag.diagnosis": "Diagnostic",
  "diag.confidence": "Confiance", "diag.diy": "DIY", "diag.save": "Enregistrer",
  "diag.cost": "Coût estimé", "diag.parts": "Pièces nécessaires", "diag.tools": "Outils nécessaires",
  "diag.steps": "Guide étape par étape",
  "diag.mechanic": "Voir un mécanicien",
  "diag.videos": "Tutoriels vidéo recommandés",
  "diag.print": "Imprimer / Enregistrer en PDF",
  "diag.buy": "Trouver / Acheter",
  "diag.moreHelp": "Besoin d'aide ?",
  "diag.moreDetail": "Instructions détaillées",
  "diag.watchVideo": "Voir une vidéo pour cette étape",
  "diag.generateImage": "Afficher l'illustration",
  "diag.regenerating": "Génération…",
  "diag.tip": "Astuce",
  "diag.whenMechanic": "Quand consulter un mécanicien",
  "tags.noise": "Bruit étrange", "tags.warning": "Voyant", "tags.perf": "Mauvaises performances",
  "tags.over": "Surchauffe", "tags.start": "Ne démarre pas", "tags.leak": "Fuite", "tags.vib": "Vibration", "tags.smoke": "Fumée",
  "dash.welcome": "Bon retour",
  "common.loading": "Chargement…",
};

const DICTS: Record<Language, Dict> = { en, fi, de, es, fr };

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English", fi: "Finnish", de: "German", es: "Spanish", fr: "French",
};

type LocaleState = {
  language: Language;
  region: Region;
  currency: Currency;
  setLanguage: (l: Language) => void;
  setRegion: (r: Region) => void;
  setCurrency: (c: Currency) => void;
  t: (key: string) => string;
};

const LocaleCtx = createContext<LocaleState | null>(null);

const STORAGE = "autodoctor.locale.v1";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [region, setRegion] = useState<Region>("EU");
  const [currency, setCurrency] = useState<Currency>("EUR");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const v = JSON.parse(raw);
        if (v.language) setLanguage(v.language);
        if (v.region) setRegion(v.region);
        if (v.currency) setCurrency(v.currency);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify({ language, region, currency })); } catch { /* ignore */ }
    if (typeof document !== "undefined") document.documentElement.lang = language;
  }, [language, region, currency]);

  const value = useMemo<LocaleState>(() => ({
    language, region, currency, setLanguage, setRegion, setCurrency,
    t: (key: string) => DICTS[language]?.[key] ?? DICTS.en[key] ?? key,
  }), [language, region, currency]);

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale() {
  const v = useContext(LocaleCtx);
  if (!v) throw new Error("useLocale outside provider");
  return v;
}

export function useT() {
  return useLocale().t;
}

export function currencySymbol(c: Currency) {
  return CURRENCIES.find((x) => x.code === c)?.symbol ?? c;
}