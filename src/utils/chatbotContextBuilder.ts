import { CHATBOT_HEADER } from "../constants/chatbotHeader";
import { getLectureNotesForMachine } from "../constants/notes";

export function buildChatbotContext(
  machineConfig: any,
  code: string,
  userQuery: string,
  language: "en" | "fr" = "en"
): string {
  const machineType = machineConfig?.machineType || "FSA";
  const notes = getLectureNotesForMachine(machineType);

  const configStr = machineConfig
    ? JSON.stringify(machineConfig, null, 2)
    : "No machine configuration set yet.";

  const formattedCode = code.trim().length > 0 ? code : "(No IDE code written yet)";

  return `${CHATBOT_HEADER}

--- CURRENT WORKSPACE CONTEXT ---
[Language Preference]: ${language === "fr" ? "French (Français)" : "English"}
[Active Automaton Type]: ${machineType}

[Machine Configuration]:
${configStr}

[IDE DSL Code]:
\`\`\`
${formattedCode}
\`\`\`

--- ESI LECTURE NOTES & FORMALISM RULES (${machineType}) ---
${notes}

--- USER QUESTION ---
${userQuery}`;
}
