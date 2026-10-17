import type { FSAConfig, LBAConfig, PDAConfig, TMConfig } from "../models/interfaces/configs";

export interface PreloadedProgram {
  id: string;
  filename: string;
  name: string;
  description?: string;
  version?: string;
  machineConfig: FSAConfig | PDAConfig | LBAConfig | TMConfig;
  code: string;
}

/**
 * Automatically imports and parses all JSON program files in the `src/programs` directory.
 * Using Vite's glob import (`import.meta.glob`).
 */
const programModules = import.meta.glob<Record<string, any>>("../programs/*.json", {
  eager: true,
});

export const PRELOADED_PROGRAMS: PreloadedProgram[] = Object.entries(programModules).map(
  ([path, module]) => {
    const raw = (module as any).default ?? module;
    const filename = path.split("/").pop() || path;
    const id = filename.replace(/\.json$/i, "");
    const machineConfig = raw.machineConfig || raw.config;
    const machineType = machineConfig?.machineType || "FSA";
    const name = raw.name || `${machineType}: ${id.replace(/_/g, " ")}`;

    return {
      id,
      filename,
      name,
      description: raw.description,
      version: raw.version,
      machineConfig,
      code: raw.code || "",
    };
  }
);

