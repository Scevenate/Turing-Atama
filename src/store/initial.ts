import { create } from "zustand";

export interface InitialState {
  initial: boolean;  //  true if first run
  setInitial: () => void;
}

export const useInitialStore = create<InitialState>((set) => ({
  initial: localStorage.getItem("initial") === null,
  setInitial: () => { localStorage.setItem("initial", "false"); set({ initial: false }); },
}));