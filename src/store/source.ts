import { create } from "zustand";

export interface SourceState {
  source: string;
  readOnly: boolean;

  setSource: (source: string) => void;
  setReadOnly: (readOnly: boolean) => void;
}

export const useSourceStore = create<SourceState>((set) => ({
  source: "",
  readOnly: false,

  setSource: (source: string) => {set({ source });},
  setReadOnly: (readOnly: boolean) => {set({ readOnly });},
}));
