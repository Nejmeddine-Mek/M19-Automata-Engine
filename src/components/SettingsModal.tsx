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
      themeMode: "dark",
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
            <span className="text-xl">⚙️</span>
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
              🌐 {isFr ? "Langue" : "Language"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange("language", "en")}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  settings.language === "en"
                    ? "border-sky-500 bg-sky-500/15 text-sky-400 font-bold shadow-sm"
                    : `${theme.borderSubtle} ${theme.bgPanelInner} ${theme.textTitle} hover:border-gray-600`
                }`}
              >
                <span>🇬🇧</span> English
              </button>
              <button
                type="button"
                onClick={() => handleChange("language", "fr")}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  settings.language === "fr"
                    ? "border-sky-500 bg-sky-500/15 text-sky-400 font-bold shadow-sm"
                    : `${theme.borderSubtle} ${theme.bgPanelInner} ${theme.textTitle} hover:border-gray-600`
                }`}
              >
                <span>🇫🇷</span> Français
              </button>
            </div>
          </div>

          {/* 2. Theme Section */}
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider ${theme.textTitle} flex items-center gap-2`}>
              🎨 {isFr ? "Thème Visuel" : "Visual Theme"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange("themeMode", "dark")}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  settings.themeMode === "dark"
                    ? "border-sky-500 bg-sky-500/15 text-sky-400 font-bold shadow-sm"
                    : `${theme.borderSubtle} ${theme.bgPanelInner} ${theme.textTitle} hover:border-gray-600`
                }`}
              >
                <span>🌙</span> {isFr ? "Sombre (Dark)" : "Dark Mode"}
              </button>
              <button
                type="button"
                onClick={() => handleChange("themeMode", "light")}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  settings.themeMode === "light"
                    ? "border-sky-500 bg-sky-500/15 text-sky-400 font-bold shadow-sm"
                    : `${theme.borderSubtle} ${theme.bgPanelInner} ${theme.textTitle} hover:border-gray-600`
                }`}
              >
                <span>☀️</span> {isFr ? "Clair (Light)" : "Light Mode"}
              </button>
            </div>
          </div>

          {/* 3. API Key Parameter */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/40">
            <label className={`text-xs font-bold uppercase tracking-wider ${theme.textTitle} flex items-center gap-2`}>
              🔑 {isFr ? "Clé API Chatbot" : "Chatbot API Key"}
            </label>
            <input
              type="password"
              value={settings.apiKey || ""}
              onChange={(e) => handleChange("apiKey", e.target.value)}
              placeholder={isFr ? "Entrez votre clé API..." : "Enter your API Key..."}
              className={`w-full px-3 py-2 text-xs font-mono rounded-xl border ${theme.bgInput} ${theme.borderSubtle} ${theme.textInput} outline-none ${theme.focusRing}`}
            />
          </div>

          {/* 4. Typography & Font Settings */}
          <div className="space-y-4 pt-2 border-t border-zinc-800/40">
            <label className={`text-xs font-bold uppercase tracking-wider ${theme.textTitle} flex items-center gap-2`}>
              🔤 {isFr ? "Police & Typographie" : "Font & Typography"}
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
                        ? "border-sky-500 bg-sky-500/15 text-sky-400 font-bold"
                        : `${theme.borderSubtle} ${theme.bgPanelInner} ${theme.textTitle} hover:border-gray-600`
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
                        ? "border-sky-500 bg-sky-500/15 text-sky-400 font-bold"
                        : `${theme.borderSubtle} ${theme.bgPanelInner} ${theme.textTitle} hover:border-gray-600`
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
                        ? "border-sky-500 bg-sky-500/15 text-sky-400 font-bold"
                        : `${theme.borderSubtle} ${theme.bgPanelInner} ${theme.textTitle} hover:border-gray-600`
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
