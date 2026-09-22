import { FSA_NOTES } from "./fsaNotes";
import { TM_NOTES } from "./tmNotes";
import { LBA_NOTES } from "./lbaNotes";
import { PDA_NOTES } from "./pdaNotes";

export function getLectureNotesForMachine(machineType?: string): string {
  switch (machineType?.toUpperCase()) {
    case "TM":
      return TM_NOTES;
    case "LBA":
      return LBA_NOTES;
    case "PDA":
      return PDA_NOTES;
    case "FSA":
    default:
      return FSA_NOTES;
  }
}

export { FSA_NOTES, TM_NOTES, LBA_NOTES, PDA_NOTES };

