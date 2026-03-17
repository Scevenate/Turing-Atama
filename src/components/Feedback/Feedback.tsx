import { motion } from "framer-motion";
import { useControlStore } from "@/store/control";
import { useMachineStore } from "@/store/machine";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function Feedback() {
  const controlState = useControlStore((s) => s.state);
  const stepCount = useControlStore((s) => s.stepCount);
  const level = useControlStore((s) => s.level);
  const lastResult = useControlStore((s) => s.lastResult);
  const lastError = useControlStore((s) => s.lastError);
  const checkResult = useControlStore((s) => s.checkResult);
  const machine = useMachineStore((s) => s.machine);

  const isPanic = controlState === "panic";
  const isHalt = controlState === "halted";

  const passed = isHalt && level != null
    ? checkResult(level, machine.tape)
    : false;

  if (isPanic && lastResult?.result === "panic") {
    const [panicState, panicChar] = lastResult.panicKey.split("\0");
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded border border-danger bg-surface-2"
      >
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={14} className="text-danger" />
          <span className="text-xs font-semibold text-danger">Panic — No rule matched</span>
        </div>
        <p className="text-xs text-text-muted">
          At step {stepCount}, state{" "}
          <code className="text-head">{panicState}</code> read character {" "}
          <code className="text-head">{panicChar ?? "null"}</code>{" "}
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
          className="p-3 rounded border border-success bg-surface-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-success" />
            <span className="text-xs font-semibold text-success">Level complete!</span>
          </div>
          <p className="text-xs text-text-muted">
            The tape matches the expected output.
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded border border-danger bg-surface-2"
      >
        <div className="flex items-center gap-2 mb-1">
          <XCircle size={14} className="text-danger" />
          <span className="text-xs font-semibold text-danger">Wrong output</span>
        </div>
        <p className="text-xs text-text-muted">
          The tape does not match the expected output.
        </p>
      </motion.div>
    );
  }

  // Compile / lint error
  if (lastError) {
    return (
      <div
        className="flex items-start gap-2 p-2 rounded bg-surface-2 border border-danger"
      >
        <XCircle size={12} className="text-danger mt-0.5 shrink-0" />
        <span className="text-xs text-danger">
          {lastError.line !== undefined ? `L${lastError.line}: ` : ""}{lastError.message}
        </span>
      </div>
    );
  }

  return null;
}
