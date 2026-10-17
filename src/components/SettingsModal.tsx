import type { ThemeType } from "../App";

export interface AppSettings {
  language: "en" | "fr";
  themeMode: "dark" | "light";
  fontFamily: "mono" | "sans" | "serif";
  fontSize: "small" | "medium" | "large";
  fontWeight: "normal" | "medium" | "bold";
  apiKey?: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  theme: ThemeType;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  theme,
}: SettingsModalProps) {
  if (!isOpen) return null;

  const isFr = settings.language === "fr";

  const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleReset = () => {
    onUpdateSettings({
      language: "en",
      themeMode: "light",
      fontFamily: "mono",
      fontSize: "medium",
      fontWeight: "normal",
      apiKey: "",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className={`w-full max-w-lg ${theme.bgSidebar} ${theme.border} border rounded-2xl shadow-2xl overflow-hidden flex flex-col`}
      >
        {/* ── Modal Header ────────────────────────────────────────────── */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${theme.borderSubtle} ${theme.bgPanelInner}`}>
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <h2 className={`text-base font-bold tracking-wide ${theme.textInput}`}>
                {isFr ? "Paramètres du Simulateur" : "Simulator Settings"}
              </h2>
              <p className={`text-xs ${theme.textMuted}`}>
                {isFr ? "Personnalisez l'affichage, la langue et les polices" : "Customize display, language, and typography"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textInput} hover:${theme.bgPanelInner} transition-colors`}
            title={isFr ? "Fermer" : "Close"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Modal Body (Scrollable Controls) ────────────────────────── */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* 1. Language Section */}
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider ${theme.textTitle} flex items-center gap-2`}>
              <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>{isFr ? "Langue" : "Language"}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange("language", "en")}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  settings.language === "en"
                    ? "border-sky-500 bg-sky-500/15 text-sky-500 font-bold shadow-sm"
                    : `${theme.borderSubtle} ${theme.bgPanelInner} ${theme.textTitle} hover:border-sky-400`
                }`}
              >
                <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">EN</span>
                English
              </button>
              <button
                type="button"
                onClick={() => handleChange("language", "fr")}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  settings.language === "fr"
                    ? "border-sky-500 bg-sky-500/15 text-sky-500 font-bold shadow-sm"
                    : `${theme.borderSubtle} ${theme.bgPanelInner} ${theme.textTitle} hover:border-sky-400`
                }`}
              >
                <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">FR</span>
                Français
              </button>
            </div>
          </div>

          {/* 2. Theme Section */}
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider ${theme.textTitle} flex items-center gap-2`}>
              <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4 4 4 0 014-4h1a4 4 0 014 4 4 4 0 01-4 4H7zm0 0a4 4 0 004-4 4 4 0 00-4-4m10 4a4 4 0 01-4-4 4 4 0 014-4h1a4 4 0 014 4 4 4 0 01-4 4h-1z" />
              </svg>
              <span>{isFr ? "Thème Visuel" : "Visual Theme"}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange("themeMode", "dark")}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  settings.themeMode === "dark"
                    ? "border-sky-500 bg-sky-500/15 text-sky-500 font-bold shadow-sm"
                    : `${theme.borderSubtle} ${theme.bgPanelInner} ${theme.textTitle} hover:border-sky-400`
                }`}
              >
                <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span>{isFr ? "Sombre (Dark)" : "Dark Mode"}</span>
              </button>
              <button
                type="button"
                onClick={() => handleChange("themeMode", "light")}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  settings.themeMode === "light"
                    ? "border-sky-500 bg-sky-500/15 text-sky-500 font-bold shadow-sm"
                    : `${theme.borderSubtle} ${theme.bgPanelInner} ${theme.textTitle} hover:border-sky-400`
                }`}
              >
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{isFr ? "Clair (Light)" : "Light Mode"}</span>
              </button>
            </div>
          </div>

          {/* 3. API Key Parameter */}
          <div className={`space-y-2.5 pt-2 border-t ${theme.borderSubtle}`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold uppercase tracking-wider ${theme.textTitle} flex items-center gap-2`}>
                <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>{isFr ? "Clé API Chatbot" : "Chatbot API Key"}</span>
              </label>

              {/* Get a free Gemini API key Link */}
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg transition-all"
                title="Open Google AI Studio in a new tab"
              >
                <span>{isFr ? "Obtenir une clé API Gemini gratuite" : "Get a free Gemini API key"}</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <p className={`text-[11px] leading-relaxed ${theme.textMuted}`}>
              {isFr
                ? "La clé est enregistrée en sécurité dans votre navigateur (localStorage). Elle ne sera demandée qu'une seule fois."
                : "Your key is persisted permanently in localStorage and is never shared, so you only need to enter it once."}
            </p>

            <input
              type="password"
              value={settings.apiKey || ""}
              onChange={(e) => handleChange("apiKey", e.target.value)}
              placeholder={isFr ? "Entrez votre clé API (ex: AIzaSy...)" : "Enter your API Key (e.g. AIzaSy...)"}
              className={`w-full px-3 py-2 text-xs font-mono rounded-xl border ${theme.bgInput} ${theme.border} ${theme.textInput} outline-none ${theme.focusRing}`}
            />
          </div>

          {/* 4. Typography & Font Settings */}
          <div className={`space-y-4 pt-2 border-t ${theme.borderSubtle}`}>
            <label className={`text-xs font-bold uppercase tracking-wider ${theme.textTitle} flex items-center gap-2`}>
              <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 5v14m4-7h8m-4-7v14" />
              </svg>
              <span>{isFr ? "Police & Typographie" : "Font & Typography"}</span>
            </label>

            {/* Font Family */}
            <div className="space-y-1.5">
              <span className={`text-[11px] font-medium ${theme.textMuted}`}>
                {isFr ? "Famille de police" : "Font Family"}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "mono", label: "Monospace" },
                  { id: "sans", label: "Sans-Serif" },
                  { id: "serif", label: "Serif" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleChange("fontFamily", item.id as any)}
                    className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                      settings.fontFamily === item.id
                        ? "border-sky-500 bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold"
                        : `${theme.borderSubtle} ${theme.bgPanelInner} ${theme.textTitle} hover:border-sky-400`
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-1.5">
              <span className={`text-[11px] font-medium ${theme.textMuted}`}>
                {isFr ? "Taille de police" : "Font Size"}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "small", label: isFr ? "Petite (12px)" : "Small (12px)" },
                  { id: "medium", label: isFr ? "Moyenne (14px)" : "Medium (14px)" },
                  { id: "large", label: isFr ? "Grande (16px)" : "Large (16px)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleChange("fontSize", item.id as any)}
                    className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                      settings.fontSize === item.id
                        ? "border-sky-500 bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold"
                        : `${theme.borderSubtle} ${theme.bgPanelInner} ${theme.textTitle} hover:border-sky-400`
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Weight */}
            <div className="space-y-1.5">
              <span className={`text-[11px] font-medium ${theme.textMuted}`}>
                {isFr ? "Épaisseur de police" : "Font Weight"}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "normal", label: isFr ? "Normale" : "Normal" },
                  { id: "medium", label: isFr ? "Moyenne" : "Medium" },
                  { id: "bold", label: isFr ? "Gras (Bold)" : "Bold" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleChange("fontWeight", item.id as any)}
                    className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                      settings.fontWeight === item.id
                        ? "border-sky-500 bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold"
                        : `${theme.borderSubtle} ${theme.bgPanelInner} ${theme.textTitle} hover:border-sky-400`
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Modal Footer ────────────────────────────────────────────── */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${theme.borderSubtle} ${theme.bgPanelInner}`}>
          <button
            type="button"
            onClick={handleReset}
            className={`text-xs ${theme.textMuted} hover:text-rose-400 transition-colors underline`}
          >
            {isFr ? "Réinitialiser" : "Reset Defaults"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-all shadow-md active:scale-95"
          >
            {isFr ? "Terminé" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
