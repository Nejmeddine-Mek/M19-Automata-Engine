import type { ThemeType } from "../App";

interface HeaderProps {
  theme: ThemeType;
}

export default function Header({ theme }: HeaderProps) {
  return (
    <div className={`w-full h-[80px] ${theme.bgSidebar} ${theme.border} border-b px-6 flex items-center justify-between shadow-sm`}>
      <div className="flex items-center space-x-3">
        {/* Logo Icon */}
        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center font-bold text-white shadow-inner">
          M
        </div>
        <h1 className={`text-xl font-bold tracking-wide ${theme.textInput}`}>
          M19 Automata Simulator
        </h1>
      </div>
    </div>
  );
}