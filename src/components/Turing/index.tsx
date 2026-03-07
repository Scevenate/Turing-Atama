import { motion, AnimatePresence } from "framer-motion";
import { useMachineStore } from "@/store/machine.ts";

const VISIBLE_CELLS = 17; // must be odd
const HALF = Math.floor(VISIBLE_CELLS / 2);
const CELL_WIDTH = 52;

export function TuringTape() {
  const tape = useMachineStore((s) => s.tape);
  const status = useMachineStore((s) => s.status);
  const stepCount = useMachineStore((s) => s.stepCount);
  const lastAppliedRule = useMachineStore((s) => s.lastAppliedRule);

  if (!tape) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-text-muted)] text-sm">
        Load a level to begin.
      </div>
    );
  }

  const head = tape.head;
  const positions = Array.from({ length: VISIBLE_CELLS }, (_, i) => head - HALF + i);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 select-none">
      {/* State label */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">State</span>
        <motion.div
          key={tape.state}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`px-4 py-1 rounded font-mono font-bold text-sm border ${
            tape.state === "halt"
              ? "border-[var(--color-success)] text-[var(--color-success)]"
              : tape.state === "start"
              ? "border-[var(--color-accent)] text-[var(--color-accent)]"
              : "border-[var(--color-head)] text-[var(--color-head)]"
          }`}
        >
          {tape.state}
        </motion.div>
        {stepCount > 0 && (
          <span className="text-xs text-[var(--color-text-muted)]">
            step {stepCount}
          </span>
        )}
      </div>

      {/* Head arrow */}
      <div className="flex flex-col items-center">
        <div
          className="text-[var(--color-head)] text-lg leading-none"
          style={{ marginBottom: 2 }}
        >
          ▼
        </div>

        {/* Tape cells */}
        <div
          className="flex border border-[var(--color-border)] rounded overflow-hidden"
          style={{ width: VISIBLE_CELLS * CELL_WIDTH }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {positions.map((pos) => {
              const char = tape.cells.get(pos) ?? "null";
              const isHead = pos === head;
              const wasWritten =
                isHead && lastAppliedRule !== null && status !== "editing";

              return (
                <motion.div
                  key={pos}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`relative flex items-center justify-center font-mono text-sm font-bold border-r border-[var(--color-border)] last:border-r-0 transition-colors duration-150 ${
                    isHead
                      ? "bg-[var(--color-head)] text-[var(--color-bg)]"
                      : char === "null"
                      ? "bg-[var(--color-surface)] text-[var(--color-border)]"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text)]"
                  }`}
                  style={{ width: CELL_WIDTH, height: CELL_WIDTH }}
                >
                  {wasWritten && (
                    <motion.div
                      initial={{ scale: 2, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 bg-[var(--color-head)] rounded"
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
          {status === "halted" && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold text-[var(--color-success)]"
            >
              ✓ Halted
            </motion.div>
          )}
          {status === "panic" && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold text-[var(--color-danger)]"
            >
              ✗ Panic
            </motion.div>
          )}
          {status === "running" && (
            <div className="flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, delay: i * 0.3, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Last rule applied */}
      {lastAppliedRule && status !== "editing" && status !== "ready" && (
        <motion.div
          key={stepCount}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[var(--color-text-muted)] font-mono px-3 py-1 bg-[var(--color-surface-2)] rounded border border-[var(--color-border)]"
        >
          {lastAppliedRule.state}, {lastAppliedRule.character} →{" "}
          {lastAppliedRule.nextState}, {lastAppliedRule.nextCharacter}
          {lastAppliedRule.move && ` [${lastAppliedRule.move === "<" ? "←" : "→"}]`}
        </motion.div>
      )}
    </div>
  );
}
