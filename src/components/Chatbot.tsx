import { useState, useEffect, useRef } from "react";
import type { ThemeType } from "../App";
import type { FSAConfig, LBAConfig, PDAConfig, TMConfig } from "../models/interfaces/configs";
import { buildChatbotContext } from "../utils/chatbotContextBuilder";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
}

interface ChatbotProps {
  theme: ThemeType;
  language?: "en" | "fr";
  apiKey?: string;
  machineConfig?: FSAConfig | PDAConfig | LBAConfig | TMConfig | null;
  code?: string;
}

export default function Chatbot({
  theme,
  language = "en",
  apiKey = "",
  machineConfig = null,
  code = "",
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const isFr = language === "fr";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 10-second Cooldown Timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setCooldown(0);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || cooldown > 0 || isLoading) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setCooldown(10); // Start 10s cooldown immediately

    const fullPrompt = buildChatbotContext(machineConfig, code, userText, language);

    if (!apiKey.trim()) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: isFr
              ? "⚠️ Veuillez configurer votre clé API dans les Paramètres ⚙️ pour activer l'IA en direct. (Le contexte du projet et les notes de cours ESI ont été générés avec succès)."
              : "⚠️ Please configure your API Key in Settings ⚙️ to enable live AI responses. (Workspace context & ESI lecture notes were generated successfully).",
          },
        ]);
        setIsLoading(false);
      }, 600);
      return;
    }

    try {
      const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey.trim()}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { 
                      text: fullPrompt 
                    }
                  ]
                }
              ]
            }),
          }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "API request failed");
      }

      const botReply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        (isFr ? "Désolé, je n'ai pas pu générer de réponse." : "Sorry, I could not generate a response.");

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: botReply,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `❌ ${isFr ? "Erreur API Chatbot" : "Chatbot API Error"}: ${err?.message || "Failed to reach AI service."}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Chat Pop-up Window ───────────────────────────────────────── */}
      {isOpen && (
        <div
          className={`fixed bottom-20 left-5 z-50 w-80 sm:w-96 h-[460px] ${theme.bgSidebar} border ${theme.border} rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${theme.borderSubtle} ${theme.bgPanelInner}`}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.fontMono} ${theme.textInput}`}>
                  {isFr ? "Assistant IA ESI" : "ESI AI Assistant"}
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {machineConfig?.machineType || "FSA"} Context Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                title={isFr ? "Nouveau Chat" : "New Chat"}
                className="px-2 py-1 text-[10px] font-mono font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg transition-all cursor-pointer flex items-center gap-1"
              >
                🧹 {isFr ? "Nouveau" : "New"}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-lg ${theme.textMuted} hover:${theme.textInput} transition-colors cursor-pointer`}
                title={isFr ? "Fermer" : "Close"}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Machine Change Remark Notice Banner */}
          <div className={`px-3 py-2 border-b ${theme.borderSubtle} bg-amber-950/40 text-amber-300 text-[11px] font-mono leading-relaxed flex items-start gap-2 select-none`}>
            <span className="text-xs shrink-0">💡</span>
            <span>
              {isFr
                ? "Cliquez sur 'Nouveau Chat' lorsque vous changez de machine pour charger le nouveau contexte."
                : "Click 'New Chat' when changing machine types to reload context & lecture notes."}
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 font-mono text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 p-4">
                <span className="text-3xl mb-2">🤖</span>
                <p className="text-xs leading-relaxed">
                  {isFr
                    ? "Bonjour ! Posez une question sur votre automate, votre code DSL ou la théorie des langages."
                    : "Hello! Ask any question about your automaton, DSL code, or formal language theory."}
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-xs whitespace-pre-wrap leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-sky-600 text-white rounded-br-none shadow-sm"
                        : `${theme.bgPanelInner} ${theme.textInput} border ${theme.borderSubtle} rounded-bl-none shadow-xs`
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`px-3 py-2 rounded-xl text-xs ${theme.bgPanelInner} ${theme.textMuted} border ${theme.borderSubtle} animate-pulse`}>
                  🤖 {isFr ? "Réflexion en cours..." : "Thinking..."}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar with 10s Cooldown */}
          <form
            onSubmit={handleSend}
            className={`p-2.5 border-t ${theme.borderSubtle} ${theme.bgPanelInner} flex items-center gap-2`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={cooldown > 0 || isLoading}
              placeholder={
                cooldown > 0
                  ? isFr
                    ? `Attendez ${cooldown}s...`
                    : `Wait ${cooldown}s...`
                  : isFr
                  ? "Posez une question..."
                  : "Ask a question..."
              }
              className={`flex-1 px-3 py-1.5 text-xs ${theme.fontMono} ${theme.bgInput} ${theme.textInput} border ${theme.border} rounded-xl outline-none ${theme.focusRing} disabled:opacity-50`}
            />
            <button
              type="submit"
              disabled={!input.trim() || cooldown > 0 || isLoading}
              className="px-3 py-1.5 text-xs font-bold font-mono text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-40 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap min-w-[50px] flex items-center justify-center"
            >
              {cooldown > 0 ? `${cooldown}s` : "🚀"}
            </button>
          </form>
        </div>
      )}

      {/* ── Circle Toggle Button (Bottom-Left) ───────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 left-5 z-50 w-12 h-12 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-cyan-400/40"
        title={isFr ? "Ouvrir le Chatbot" : "Open Chatbot"}
      >
        <span className="text-xl">💬</span>
      </button>
    </>
  );
}
