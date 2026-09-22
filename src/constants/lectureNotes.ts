import { getLectureNotesForMachine, FSA_NOTES, TM_NOTES, LBA_NOTES, PDA_NOTES } from "./notes";

export const LECTURE_NOTES: Record<string, string> = {
  FSA: FSA_NOTES,
  TM: TM_NOTES,
  LBA: LBA_NOTES,
  PDA: PDA_NOTES,
};

export { getLectureNotesForMachine };
