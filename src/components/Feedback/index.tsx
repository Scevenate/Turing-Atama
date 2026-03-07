import { motion } from "framer-motion";
import { useMachineStore, checkResult } from "@/store/machine.ts";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function Feedback() {
  const status = useMachineStore((s) => s.status);
  const tape = useMachineStore((s) => s.tape);
  const level = useMachineStore((s) => s.level);
  const panicInfo = useMachineStore((s) => s.panicInfo);
  const diagnostics = useMachineStore((s) => s.diagnostics);

  const errors = diagnostics.filter((d) => d.severity === "error");
  const warnings = diagnostics.filter((d) => d.severity === "warning");

  if (status === "panic" && panicInfo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded border border-[var(--color-danger)] bg-[var(--color-surface-2)]"
      >
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={14} className="text-[var(--color-danger)]" />
          <span className="text-xs font-bold text-[var(--color-danger)]">PANIC — No rule matched</span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          At step {panicInfo.step}, state{" "}
          <code className="text-[var(--color-head)]">{panicInfo.state}</code> read{" "}
          <code className="text-[var(--color-head)]">{panicInfo.character}</code>{" "}
          — no rule handles this case.
        </p>
      </motion.div>
    );
  }

  if (status === "halted" && tape && level) {
    const passed = checkResult(level, tape);

    if (passed) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded border border-[var(--color-success)] bg-[var(--color-surface-2)]"
        >
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-[var(--color-success)]" />
            <span className="text-xs font-bold text-[var(--color-success)]">LEVEL COMPLETE!</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            The tape matches the expected output.
          </p>
        </motion.div>
      );
    }

    // Build diff
    const diff: Array<{ pos: number; expected: string; actual: string }> = [];
    for (const [posStr, expectedChar] of Object.entries(level.expected)) {
      const pos = Number(posStr);
      const actual = tape.cells.get(pos) ?? "null";
      if (actual !== expectedChar) {
        diff.push({ pos, expected: expectedChar, actual });
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded border border-[var(--color-danger)] bg-[var(--color-surface-2)]"
      >
        <div className="flex items-center gap-2 mb-2">
          <XCircle size={14} className="text-[var(--color-danger)]" />
          <span className="text-xs font-bold text-[var(--color-danger)]">WRONG OUTPUT</span>
        </div>
        <div className="space-y-1">
          {diff.map(({ pos, expected, actual }) => (
            <div key={pos} className="text-xs font-mono text-[var(--color-text-muted)]">
              pos {pos}:{" "}
              <span className="text-[var(--color-danger)]">{actual}</span>
              {" → expected "}
              <span className="text-[var(--color-success)]">{expected}</span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Compile diagnostics
  if (errors.length > 0 || warnings.length > 0) {
    return (
      <div className="space-y-1">
        {errors.map((e, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-2 rounded bg-[var(--color-surface-2)] border border-[var(--color-danger)]"
          >
            <XCircle size={12} className="text-[var(--color-danger)] mt-0.5 shrink-0" />
            <span className="text-xs text-[var(--color-danger)] font-mono">
              {e.line !== undefined ? `L${e.line}: ` : ""}{e.message}
            </span>
          </div>
        ))}
        {warnings.map((w, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-2 rounded bg-[var(--color-surface-2)] border border-[var(--color-warning)]"
          >
            <AlertTriangle size={12} className="text-[var(--color-warning)] mt-0.5 shrink-0" />
            <span className="text-xs text-[var(--color-warning)] font-mono">
              {w.line !== undefined ? `L${w.line}: ` : ""}{w.message}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
