import { create } from "zustand";
import type { Level } from "@/levels/levels.ts";
//  Control uses source and machine stores.
import { useSourceStore } from "./source.ts";
import { useMachineStore, type StepResult } from "./machine.ts";
import type { Error } from "@/lib/compiler.ts";
import type { Tape } from "@/lib/types.ts";
import { compile } from "@/lib/compiler.ts";

/**
 * This is a page wide global state. It controls the source and machine state.
 * The control FSM: "initial" | "editing" | "compiled" | "running" | "paused" | "panic" | "halted"
 * lastError holds the most recent compile/lint error; cleared on successful compile, loadLevel, or reset.
 * - Initially the FSM is in initial state. This is only when no level is loaded.
 * - Once the level is loaded, the FSM enters editing state. The tape shall show the initial tape and the user edits source.
 * - When the user clicks step or run, the code is first compiled, and the FSM enters compiled state if successful. Source is readonly when not editing.
 * - After compile, the FSM immediately enters another state:
 *   - If the user clicked step, machine takes a step, FSM transits into paused state.
 *   - If the user clicked run, machine began running, FSM transits into running state.
 * - When running, the use may click pause to get paused. When paused, the user may click step (which is still paused), or run to resume running.
 * - FSM eventually enters panic or halt from paused or running. Only reset is available after this.
 * - The reset button brings back the user to editing state from any other state.
 */

export interface ControlState {
  level: Level | null;
  state: "initial" | "editing" | "compiled" | "running" | "paused" | "panic" | "halted";
  stepCount: number;
  speed: number;
  timeout: ReturnType<typeof setTimeout> | null;
  lastError: Error | null;
  lastResult: StepResult | null;
  
  loadLevel: (level: Level) => true;  //  Always allowed, resets the FSM
  compile: () => boolean;  //  False (with lastError set) if not from "editing" or on error, true if "compiled"
  step: () => boolean; //  False if not from "compiled" | "paused"
  run: () => boolean; //  False if not from "compiled" | "paused"
  pause: () => boolean; //  False if not from "running"
  reset: () => boolean;  //  False if from "initial" | "editing". Different from loadLevel, this doesn't clear source.
  setSpeed: (speed: number) => true;
  checkResult: (level: Level, tape: Tape) => boolean;  //  True only when "halted" and validated
  _timeout: () => void;  //  internal timeout function for run.
}

export const useControlStore = create<ControlState>((set, get) => ({
  level: null,
  state: "initial",
  stepCount: 0,
  speed: 4,
  timeout: null,
  lastError: null,
  lastResult: null,

  loadLevel(level) {
    if (get().state === "running") clearTimeout(get().timeout ?? undefined);
    set({ level, state: "editing", stepCount: 0, timeout: null, lastResult: null, lastError: null });
    useMachineStore.setState({ machine: { tape: structuredClone(level.startTape), head: 0, state: "start", ruleTable: { rules: [], index: new Map() } } });
    useSourceStore.setState({ source: "", readOnly: false });
    return true;
  },

  compile(): boolean {
    if (get().state !== "editing") {
      set({ lastError: { name: "Compile not allowed", message: "Compilation is not allowed in this state" } });
      return false;
    }
    const compileResult = compile(useSourceStore.getState().source);
    if ("name" in compileResult) { set({ lastError: compileResult }); return false; }
    useMachineStore.setState({ machine: { ...useMachineStore.getState().machine, ruleTable: compileResult } });
    useSourceStore.setState({ readOnly: true });
    set({ state: "compiled", lastError: null });
    return true;
  },

  step() {
    if (get().state !== "compiled" && get().state !== "paused") return false;
    const result = useMachineStore.getState().step();
    set({ stepCount: get().stepCount + 1, lastResult: result });
    switch (result.result) {
      case "ok":
        set({ state: "paused" });
        break;
      case "panic":
        set({ state: "panic" })
        break;
      case "halt":
        set({ state: "halted" })
        break;
    }
    return true;
  },

  run() {
    if (get().state !== "compiled" && get().state !== "paused") return false;
    set({ state: "running", timeout: setTimeout(get()._timeout) });
    return true;
  },

  pause() {
    if (get().state !== "running") return false;
    clearTimeout(get().timeout ?? undefined);
    set({ timeout: null, state: "paused" });
    return true;
  },

  reset() {
    if (get().state === "initial" || get().state === "editing") return false;
    if (get().state === "running") clearTimeout(get().timeout ?? undefined);
    set({ state: "editing", stepCount: 0, timeout: null, lastResult: null, lastError: null });
    useMachineStore.setState({ machine: { tape: structuredClone(get().level?.startTape as Tape), head: 0, state: "start", ruleTable: { rules: [], index: new Map() } } });
    useSourceStore.setState({ readOnly: false });
    return true;  
  },

  setSpeed(speed) {
    set({ speed });
    return true;
  },

  checkResult(level, tape) {
    if (get().state !== "halted") return false;
    return level.validate(tape);
  },

  _timeout() {
    if (get().state !== "running") {
      set({ timeout: null });
      return;
    }
    const result = useMachineStore.getState().step();
    set({ stepCount: get().stepCount + 1, lastResult: result });
    switch (result.result) {
      case "ok":
        set({ timeout: setTimeout(get()._timeout, 1000 / get().speed) })
        break;
      case "panic":
        set({ timeout: null, state: "panic" })
        break;
      case "halt":
        set({ timeout: null, state: "halted" })
        break;
    }
  },
}));
