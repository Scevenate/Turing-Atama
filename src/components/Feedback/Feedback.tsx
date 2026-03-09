import { useEffect } from "react";
import { motion } from "framer-motion";
import { useControlStore } from "@/store/control.ts";
import { useMachineStore } from "@/store/machine.ts";
import { useLevelsStore } from "@/store/level.ts";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useSourceStore } from "@/store/source";

export function Feedback() {
  const controlState = useControlStore((s) => s.state);
  const stepCount = useControlStore((s) => s.stepCount);
  const level = useControlStore((s) => s.level);
  const lastResult = useControlStore((s) => s.lastResult);
  const lastError = useControlStore((s) => s.lastError);
  const checkResult = useControlStore((s) => s.checkResult);
  const machine = useMachineStore((s) => s.machine);
  const source = useSourceStore((s) => s.source);
  const setLevelEntry = useLevelsStore((s) => s.setLevelEntry);

  const isStopped = controlState === "stopped";
  const isPanic = isStopped && lastResult?.result === "panic";
  const isHalt = isStopped && lastResult?.result === "halt";

  const passed = isHalt && level != null
    ? checkResult(level, machine.tape)
    : false;

  // Persist completion when the level is passed
  useEffect(() => {
    if (passed && level) {
      setLevelEntry(level.id, { state: "completed", source: source });
    }
  }, [passed, level]);

  if (isPanic && lastResult?.result === "panic") {
    const [panicState, panicChar] = lastResult.panicKey.split("\0");
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
          At step {stepCount}, state{" "}
          <code className="text-[var(--color-head)]">{panicState}</code> read{" "}
          <code className="text-[var(--color-head)]">{panicChar ?? "null"}</code>{" "}
          — no rule handles this case.
        </p>
      </motion.div>
    );
  }

  if (isHalt) {
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

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded border border-[var(--color-danger)] bg-[var(--color-surface-2)]"
      >
        <div className="flex items-center gap-2 mb-1">
          <XCircle size={14} className="text-[var(--color-danger)]" />
          <span className="text-xs font-bold text-[var(--color-danger)]">WRONG OUTPUT</span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          The tape does not match the expected output.
        </p>
      </motion.div>
    );
  }

  // Compile / lint error
  if (lastError) {
    return (
      <div
        className="flex items-start gap-2 p-2 rounded bg-[var(--color-surface-2)] border border-[var(--color-danger)]"
      >
        <XCircle size={12} className="text-[var(--color-danger)] mt-0.5 shrink-0" />
        <span className="text-xs text-[var(--color-danger)] font-mono">
          {lastError.line !== undefined ? `L${lastError.line}: ` : ""}{lastError.message}
        </span>
      </div>
    );
  }

  return null;
}
