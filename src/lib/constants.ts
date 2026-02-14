export const POLL_INTERVAL = 2000;

export const OUTPUT_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "pt", name: "Português" },
  { code: "it", name: "Italiano" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh", name: "中文" },
  { code: "ar", name: "العربية" },
] as const;

export type LanguageCode = (typeof OUTPUT_LANGUAGES)[number]["code"];

export function getLanguageName(code: string): string {
  return (
    OUTPUT_LANGUAGES.find((l) => l.code === code)?.name ?? "English"
  );
}

export const ANALYZING_PHRASES = [
  "Searching for primary sources...",
  "Cross-referencing claims...",
  "Stripping affective language...",
  "Scoring source credibility...",
  "Separating signal from noise...",
  "Verifying against official records...",
  "Extracting truth elements...",
  "Filtering narrative framing...",
];
