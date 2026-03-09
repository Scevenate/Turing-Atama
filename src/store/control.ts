import { create } from "zustand";
import type { Level } from "@/levels/levels.ts";
import type { Tape } from "@/lib/types.ts";
//  Control uses source and machine stores.
import { useSourceStore } from "./source.ts";
import { useMachineStore } from "./machine.ts";
import type { StepResult, Error } from "@/lib/types.ts";
import { compile } from "@/lib/compiler.ts";
import { analyze } from "@/lib/linter.ts";

/**
 * The control FSM: "initial" | "editing" | "compiled" | "running" | "paused" | "stopped"
 * lastError holds the most recent compile/lint error; cleared on successful compile, loadLevel, or reset.
 * - Initially the FSM is in initial state. This is only when no level is loaded.
 * - Once the level is loaded, the FSM enters editing state. The tape shall show the initial tape and the user edits source.
 * - When the user clicks step or run, the code is first compiled, and the FSM enters compiled state if successful. Source is readonly when not editing.
 * - After compile, the FSM immediately enters another state:
 *   - If the user clicked step, machine takes a step, FSM transits into paused state.
 *   - If the user clicked run, machine began running, FSM transits into running state.
 * - When running, the use may click pause to get paused. When paused, the user may click step (which is still paused), or run to resume running.
 * - FSM eventually enters stopped from paused or running. Only reset is available in this state.
 * - The reset button brings back the user to editing state from any other state.
 */

export interface ControlState {
  level: Level | null;
  state: "initial" | "editing" | "compiled" | "running" | "paused" | "stopped";
  stepCount: number;
  speed: number;
  interval: ReturnType<typeof setInterval> | null;
  lastError: Error | null;
  lastResult: StepResult | null;
  
  loadLevel: (level: Level) => true;  //  Always allowed, resets the FSM
  compile: () => boolean;  //  False (with lastError set) if not from "editing" or on error, true if compiled successfully
  step: () => boolean; //  False if not from "compiled" | "paused"
  run: () => boolean; //  False if not from "compiled" | "paused"
  pause: () => boolean; //  False if not from "running"
  reset: () => boolean;  //  True unless "initial". Different from loadLevel, this doesn't clear source.
  setSpeed: (speed: number) => true;
  checkResult: (level: Level, tape: Tape) => boolean;  //  True only when "stopped" and validated
}

export const useControlStore = create<ControlState>((set, get) => ({
  level: null,
  state: "initial",
  stepCount: 0,
  speed: 4,
  interval: null,
  lastError: null,
  lastResult: null,

  loadLevel(level) {
    if (get().state === "running") clearInterval(get().interval ?? undefined);
    set({ level, state: "editing", stepCount: 0, interval: null, lastResult: null, lastError: null });
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
    const analyzeResult = analyze(compileResult);
    if ("name" in analyzeResult) { set({ lastError: analyzeResult }); return false; }
    useMachineStore.setState({ machine: { ...useMachineStore.getState().machine, ruleTable: analyzeResult } });
    useSourceStore.setState({ readOnly: true });
    set({ state: "compiled", lastError: null });
    return true;
  },

  step() {
    if (get().state !== "compiled" && get().state !== "paused") return false;
    const result = useMachineStore.getState().step();
    set({ stepCount: get().stepCount + 1, lastResult: result });
    if (result.result === "ok") set({ state: "paused" });
    else set({ state: "stopped" });
    return true;
  },

  run() {
    if (get().state !== "compiled" && get().state !== "paused") return false;
    set({ state: "running", interval: setInterval(() => {
      if (get().state !== "running") {
        clearInterval(get().interval ?? undefined);
        set({ interval: null });
        return;
      }
      const result = useMachineStore.getState().step();
      set({ stepCount: get().stepCount + 1, lastResult: result });
      if (result.result !== "ok") {
        clearInterval(get().interval ?? undefined);
        set({ interval: null, state: "stopped" });
        return;
      }
    }, 1000 / get().speed) });
    return true;
  },

  pause() {
    if (get().state !== "running") return false;
    clearInterval(get().interval ?? undefined);
    set({ interval: null, state: "paused" });
    return true;
  },

  reset() {
    if (get().state === "initial") return false;
    if (get().state === "running") clearInterval(get().interval ?? undefined);
    set({ state: "editing", stepCount: 0, interval: null, lastResult: null, lastError: null });
    useMachineStore.setState({ machine: { tape: structuredClone(get().level?.startTape as Tape), head: 0, state: "start", ruleTable: { rules: [], index: new Map() } } });
    useSourceStore.setState({ readOnly: false });
    return true;  
  },

  setSpeed(speed) {
    set({ speed });
    return true;
  },

  checkResult(level, tape) {
    if (get().state !== "stopped") return false;
    return level.validate(tape);
  },
}));
