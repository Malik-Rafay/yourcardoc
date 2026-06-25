# AutoDoctor AI — Diagnosis & Localization Upgrade

This is a large set of changes. Here's how I'll structure the work so each piece is reviewable.

## 1. Global locale bar (region / language / currency)

- New `LocaleContext` (React context + `localStorage`) with:
  - **Region**: EU, UK, US, CA, AU, IN, Other (affects price predictions and vehicle market context sent to the AI).
  - **Currency**: EUR, USD, GBP, CAD, AUD, INR (used for AI prompt + display formatting).
  - **Language**: English, Finnish, German, Spanish, French (Finnish is the priority — full UI translation).
- New `LocaleBar` component pinned to the top of `AppHeader` (always visible, mobile + desktop) with three compact dropdowns.
- New `src/lib/i18n.ts` with full translation dictionaries for every static string in the app (nav, landing, auth, dashboard, diagnose form, results, history, library, settings, pricing, FAQ, footer). A `useT()` hook returns the translator.
- Refactor existing pages to replace hardcoded strings with `t("key")` calls. Finnish gets a complete translation pass; the other languages get a complete pass too so the toggle isn't half-broken.

## 2. Diagnosis: richer AI output

Extend `runDiagnosis` server function so Gemini returns, in addition to today's fields:
- `diySteps`: array of `{ title, instruction, tip, imagePrompt, searchQuery }` (was strings).
- `toolsNeeded`: array of `{ name, searchQuery }`.
- `partsNeeded`: kept, plus `searchQuery` per part and a `priceLow/priceHigh` numeric pair in the user's currency.
- `youtubeQueries`: 3–5 search strings for tutorial videos.
- `vehicleImagePrompt`: short prompt describing the user's exact car (year/make/model/typical color) for the hero image.

Pricing accuracy: the prompt is rewritten to require region-aware and currency-aware estimates with explicit low/high numbers, and to weight repair costs by typical labor rates in the selected region.

## 3. Repair guide UI

Replace the current flat ordered list with a numbered, collapsible accordion (using existing shadcn `accordion`):

- Each step shows: number, title, short summary; expands to full instruction + safety tip.
- **Step image**: generated on demand via a new `generateStepImage` server function that calls Lovable AI image generation with the step's `imagePrompt`. Images are cached in component state per diagnosis (no DB writes — keeps scope tight).
- **"Need more help?" button** on each step → opens a popover with:
  - "More detailed instructions" → calls a new `explainStep` server function for a longer walkthrough.
  - "Watch a video" → opens YouTube search for that step in a new tab.
- **Print / Save as PDF** button at the top of the result section uses `window.print()` with a print-only stylesheet that expands all steps and hides nav/buttons.

## 4. Tools & Parts — search instead of Amazon

- Tools section (new) and Parts section both render each item with a "Buy" / "Find" button.
- Clicking opens `https://www.google.com/search?q=<encoded query>&tbm=shop` in a new tab (Google Shopping — works on desktop browser and triggers the device browser on mobile). No Amazon links anywhere.
- Each item also shows the predicted price range in the selected currency.

## 5. Video tutorials section

- New "Recommended tutorials" block under the repair guide.
- Renders 3–5 cards using the AI-supplied `youtubeQueries`.
- Each card: thumbnail placeholder + title + "Watch on YouTube" button that opens `https://www.youtube.com/results?search_query=...` in a new tab. (Embedding specific videos requires a real video ID, which the AI can't reliably produce; search links are reliable and stay on-brand. If you'd rather embed, I'll need to wire up the YouTube Data API and a key.)

## 6. Vehicle hero image

- After a successful diagnosis, call `generateVehicleImage` server function (Lovable AI image gen) using the `vehicleImagePrompt`.
- Render as a hero banner above the diagnosis result. Cached for the session.

## Technical notes

- New server functions in `src/lib/diagnose.functions.ts`: `runDiagnosis` (updated schema), `explainStep`, `generateStepImage`, `generateVehicleImage`. All use the existing Lovable AI Gateway helper.
- Image generation uses `google/gemini-2.5-flash-image-preview` via the gateway; returns base64 data URLs rendered inline.
- Locale state is client-only (localStorage) and passed into each diagnosis call as `{ region, currency, language }` so the AI responds in the right language and prices in the right currency.
- Print styles added to `src/styles.css` under `@media print`.
- No DB schema changes required.

## Out of scope (flagging explicitly)

- Embedding specific YouTube videos by ID (needs YouTube Data API key — say the word and I'll add it).
- Persisting generated images to storage (currently in-memory per session to keep this change tight).
- Translating AI-generated diagnosis text retroactively for items already in history (new diagnoses honor the selected language).
