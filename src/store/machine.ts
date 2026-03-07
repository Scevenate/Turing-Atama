import { create } from "zustand";
import { compile } from "@/core/compiler.ts";
import { analyze } from "@/core/linter.ts";
import { step as interpreterStep, cloneTape, buildTape } from "@/core/interpreter.ts";
import type { Tape, RuleTable, Diagnostic, Rule } from "@/core/types.ts";
import type { Level } from "@/levels/level.ts";

export type MachineStatus =
  | "editing"   // no compiled rule table yet
  | "ready"     // compiled, waiting to run
  | "running"   // auto-stepping
  | "paused"    // paused mid-run
  | "halted"    // machine reached halt state
  | "panic";    // no rule matched

export interface PanicInfo {
  state: string;
  character: string;
  step: number;
}

export interface MachineState {
  // ── Level ──────────────────────────────────────────────────────────────────
  level: Level | null;

  // ── Editor ─────────────────────────────────────────────────────────────────
  source: string;

  // ── Compile output ─────────────────────────────────────────────────────────
  diagnostics: Diagnostic[];
  ruleTable: RuleTable | null;

  // ── Runtime ────────────────────────────────────────────────────────────────
  tape: Tape | null;
  status: MachineStatus;
  stepCount: number;
  panicInfo: PanicInfo | null;
  lastAppliedRule: Rule | null;

  // ── Controls ───────────────────────────────────────────────────────────────
  /** Steps per second when running */
  speed: number;

  // ── Actions ────────────────────────────────────────────────────────────────
  loadLevel: (level: Level) => void;
  setSource: (source: string) => void;
  compileSrc: () => void;
  step: () => void;
  run: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
}

/** Internal interval handle for the run loop */
let _runInterval: ReturnType<typeof setInterval> | null = null;

function stopRunLoop() {
  if (_runInterval !== null) {
    clearInterval(_runInterval);
    _runInterval = null;
  }
}

export const useMachineStore = create<MachineState>((set, get) => ({
  level: null,
  source: "",
  diagnostics: [],
  ruleTable: null,
  tape: null,
  status: "editing",
  stepCount: 0,
  panicInfo: null,
  lastAppliedRule: null,
  speed: 4,

  loadLevel(level) {
    stopRunLoop();
    set({
      level,
      source: level.starterCode ?? "",
      diagnostics: [],
      ruleTable: null,
      tape: buildTape(level.initialTape, level.initialHead),
      status: "editing",
      stepCount: 0,
      panicInfo: null,
      lastAppliedRule: null,
    });
  },

  setSource(source) {
    set({ source });
  },

  compileSrc() {
    stopRunLoop();
    const { source, level } = get();
    const { rules, errors: compileErrors } = compile(source);

    if (compileErrors.length > 0) {
      set({
        diagnostics: compileErrors,
        ruleTable: null,
        status: "editing",
      });
      return;
    }

    const analyzeResult = analyze(rules);
    const warnings = analyzeResult.warnings;

    if (!analyzeResult.ok) {
      set({
        diagnostics: [...analyzeResult.errors, ...warnings],
        ruleTable: null,
        status: "editing",
      });
      return;
    }

    const initialTape = level
      ? buildTape(level.initialTape, level.initialHead)
      : { cells: new Map(), head: 0, state: "start" };

    set({
      diagnostics: warnings,
      ruleTable: analyzeResult.ruleTable,
      tape: initialTape,
      status: "ready",
      stepCount: 0,
      panicInfo: null,
      lastAppliedRule: null,
    });
  },

  step() {
    const { tape, ruleTable, status } = get();
    if (!tape || !ruleTable) return;
    if (status !== "ready" && status !== "paused") return;

    const tapeCopy = cloneTape(tape);
    const { result, panicKey, appliedRule } = interpreterStep(tapeCopy, ruleTable);
    const newStep = get().stepCount + 1;

    if (result === "halt") {
      stopRunLoop();
      set({ tape: tapeCopy, status: "halted", stepCount: newStep, lastAppliedRule: appliedRule ?? null });
    } else if (result === "panic") {
      stopRunLoop();
      const [state, character] = (panicKey ?? ",").replace(/[()]/g, "").split(", ");
      set({
        tape: tapeCopy,
        status: "panic",
        stepCount: newStep,
        panicInfo: { state: state ?? "?", character: character ?? "?", step: newStep },
      });
    } else {
      set({ tape: tapeCopy, status: "paused", stepCount: newStep, lastAppliedRule: appliedRule ?? null });
    }
  },

  run() {
    const { status, speed } = get();
    if (status !== "ready" && status !== "paused") return;

    set({ status: "running" });

    stopRunLoop();
    _runInterval = setInterval(() => {
      const { tape, ruleTable, stepCount } = get();
      if (!tape || !ruleTable) {
        stopRunLoop();
        return;
      }

      const tapeCopy = cloneTape(tape);
      const { result, panicKey, appliedRule } = interpreterStep(tapeCopy, ruleTable);
      const newStep = stepCount + 1;

      if (result === "halt") {
        stopRunLoop();
        set({ tape: tapeCopy, status: "halted", stepCount: newStep, lastAppliedRule: appliedRule ?? null });
      } else if (result === "panic") {
        stopRunLoop();
        const [state, character] = (panicKey ?? ",").replace(/[()]/g, "").split(", ");
        set({
          tape: tapeCopy,
          status: "panic",
          stepCount: newStep,
          panicInfo: { state: state ?? "?", character: character ?? "?", step: newStep },
        });
      } else {
        set({ tape: tapeCopy, stepCount: newStep, lastAppliedRule: appliedRule ?? null });
      }
    }, Math.round(1000 / speed));
  },

  pause() {
    stopRunLoop();
    const { status } = get();
    if (status === "running") {
      set({ status: "paused" });
    }
  },

  reset() {
    stopRunLoop();
    const { level, ruleTable } = get();
    const tape = level
      ? buildTape(level.initialTape, level.initialHead)
      : { cells: new Map(), head: 0, state: "start" };
    set({
      tape,
      status: ruleTable ? "ready" : "editing",
      stepCount: 0,
      panicInfo: null,
      lastAppliedRule: null,
    });
  },

  setSpeed(speed) {
    const { status } = get();
    set({ speed });
    if (status === "running") {
      // Restart loop with new speed
      get().pause();
      get().run();
    }
  },
}));

/** Check whether the current tape matches the level's expected output */
export function checkResult(level: Level, tape: Tape): boolean {
  for (const [posStr, expectedChar] of Object.entries(level.expected)) {
    const pos = Number(posStr);
    const actual = tape.cells.get(pos) ?? "null";
    if (actual !== expectedChar) return false;
  }
  return true;
}
