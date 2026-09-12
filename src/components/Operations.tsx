import type { ThemeType } from "../App";
interface OperationsProps {
  theme: ThemeType; // Replace with your actual theme type
  language?: "en" | "fr";

}

export default function Operations({theme, language = 'en'}: OperationsProps){
    
    const isFr = language === "fr";
    return(
    <div className="flex flex-col gap-4 w-full">
          {/* Automaton Type Selector */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-semibold uppercase tracking-wider ${theme.textTitle}`}>
              {isFr ? "Type d'Automate" : "Automaton Type"}
            </label>
        </div>
    </div>
        )
}