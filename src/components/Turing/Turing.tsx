import { motion, AnimatePresence } from "framer-motion";
import { useControlStore } from "@/store/control.ts";
import { useMachineStore } from "@/store/machine.ts";
import type { OkResult, HaltResult } from "@/lib/types";

const VISIBLE_CELLS = 17; // must be odd
const HALF = Math.floor(VISIBLE_CELLS / 2);
const CELL_WIDTH = 52;

export function TuringTape() {
  const controlState = useControlStore((s) => s.state);
  const stepCount = useControlStore((s) => s.stepCount);
  const lastResult = useControlStore((s) => s.lastResult);
  const machine = useMachineStore((s) => s.machine);

  const isHalted = controlState === "stopped" && lastResult?.result === "halt";
  const isPanic = controlState === "stopped" && lastResult?.result === "panic";
  const isRunning = controlState === "running";
  const isInitial = controlState === "initial";

  const lastAppliedRule =
    lastResult?.result === "ok" || lastResult?.result === "halt"
      ? (lastResult as OkResult | HaltResult).appliedRule
      : null;

  if (isInitial) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Load a level to begin.
      </div>
    );
  }

  const head = machine.head;
  const positions = Array.from({ length: VISIBLE_CELLS }, (_, i) => head - HALF + i);

  const showRule =
    lastAppliedRule !== null &&
    controlState !== "editing" &&
    controlState !== "compiled";

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 select-none">
      {/* State label */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-muted">State</span>
        <motion.div
          key={machine.state}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`px-4 py-1 rounded font-mono font-bold text-sm border ${
            machine.state === "halt"
              ? "border-success text-success"
              : machine.state === "start"
              ? "border-accent text-accent"
              : "border-head text-head"
          }`}
        >
          {machine.state}
        </motion.div>
        {stepCount > 0 && (
          <span className="text-xs text-text-muted">
            step {stepCount}
          </span>
        )}
      </div>

      {/* Head arrow */}
      <div className="flex flex-col items-center">
        <div
          className="text-head text-lg leading-none"
          style={{ marginBottom: 2 }}
        >
          ▼
        </div>

        {/* Tape cells */}
        <div
          className="flex border border-border rounded overflow-hidden"
          style={{ width: VISIBLE_CELLS * CELL_WIDTH }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {positions.map((pos) => {
              const char = machine.tape.get(pos) ?? "null";
              const isHead = pos === head;
              const wasWritten =
                isHead && lastAppliedRule !== null && controlState !== "editing";

              return (
                <motion.div
                  key={pos}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`relative flex items-center justify-center font-mono text-sm font-bold border-r border-border last:border-r-0 transition-colors duration-150 ${
                    isHead
                      ? "bg-head text-bg"
                      : char === "null"
                      ? "bg-surface text-border"
                      : "bg-surface-2 text-text"
                  }`}
                  style={{ width: CELL_WIDTH, height: CELL_WIDTH }}
                >
                  {wasWritten && (
                    <motion.div
                      initial={{ scale: 2, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 bg-head rounded"
                    />
                  )}
                  <span className="relative z-10">
                    {char === "null" ? (
                      <span className="opacity-20">∅</span>
                    ) : (
                      char
                    )}
                  </span>
                  <span className="absolute bottom-0.5 right-1 text-[9px] opacity-30 font-light">
                    {pos}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Status banner under tape */}
        <div className="mt-3 h-6">
          {isHalted && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold text-success"
            >
              ✓ Halted
            </motion.div>
          )}
          {isPanic && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold text-danger"
            >
              ✗ Panic
            </motion.div>
          )}
          {isRunning && (
            <div className="flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, delay: i * 0.3, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-accent"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Last rule applied */}
      {showRule && lastAppliedRule && (
        <motion.div
          key={stepCount}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-text-muted font-mono px-3 py-1 bg-surface-2 rounded border border-border"
        >
          {lastAppliedRule.state}, {lastAppliedRule.character} →{" "}
          {lastAppliedRule.nextState}, {lastAppliedRule.nextCharacter}
          {lastAppliedRule.move && ` [${lastAppliedRule.move === "<" ? "←" : "→"}]`}
        </motion.div>
      )}
    </div>
  );
}
