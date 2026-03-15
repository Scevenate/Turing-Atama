import { create } from "zustand";

interface LevelEntry {
  state: "attempted" | "completed";
  source: string;
  stepCount: number;  //  Used only when level is completed.
}

//  localStorage wrapper

const LOCAL_STORAGE_KEY = "LevelEntries";

function getStorage(): Map<number, LevelEntry> {
  return new Map(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "[]"));
}

function setStorage(entries: Map<number, LevelEntry>): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(entries.entries())));
}



export interface LevelsState {
  levelEntries: Map<number, LevelEntry>;

  setLevelEntry: (id: number, entry: LevelEntry) => void;
  clearLevelEntries: () => void;
}

export const useLevelsStore = create<LevelsState>((set, get) => ({
  levelEntries: getStorage(),

  setLevelEntry: (id: number, entry: LevelEntry): void => {
    const newEntries = new Map(get().levelEntries);
    newEntries.set(id, entry);
    set({ levelEntries: newEntries });
    setStorage(newEntries);
  },
  clearLevelEntries: (): void => {
    set({ levelEntries: new Map() });
    setStorage(new Map());
  },
}));
