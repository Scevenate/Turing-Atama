import { useMachineStore } from "@/store/machine.ts";
import { Play, Pause, SkipForward, RotateCcw, Zap } from "lucide-react";
import { cn } from "@/lib/utils.ts";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="ml-1 px-1 py-0.5 text-[9px] rounded border border-[var(--color-border)] text-[var(--color-text-muted)] font-mono leading-none">
      {children}
    </kbd>
  );
}

export function Controls() {
  const status = useMachineStore((s) => s.status);
  const speed = useMachineStore((s) => s.speed);
  const stepCount = useMachineStore((s) => s.stepCount);
  const run = useMachineStore((s) => s.run);
  const pause = useMachineStore((s) => s.pause);
  const stepFn = useMachineStore((s) => s.step);
  const reset = useMachineStore((s) => s.reset);
  const setSpeed = useMachineStore((s) => s.setSpeed);
  const compileSrc = useMachineStore((s) => s.compileSrc);

  const canRun = status === "ready" || status === "paused";
  const canStep = status === "ready" || status === "paused";
  const canPause = status === "running";
  const canReset = status !== "editing";
  const isTerminal = status === "halted" || status === "panic";

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface)]">
      {/* Compile */}
      {status === "editing" && (
        <button
          onClick={compileSrc}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-accent-2)] transition-colors"
        >
          <Zap size={12} />
          Compile
          <Kbd>⌘↵</Kbd>
        </button>
      )}

      {/* Run / Pause */}
      {!isTerminal && status !== "editing" && (
        <>
          {canRun && (
            <button
              onClick={run}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[var(--color-success)] text-[var(--color-bg)] hover:opacity-90 transition-opacity"
            >
              <Play size={12} />
              Run
              <Kbd>F5</Kbd>
            </button>
          )}
          {canPause && (
            <button
              onClick={pause}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[var(--color-warning)] text-[var(--color-bg)] hover:opacity-90 transition-opacity"
            >
              <Pause size={12} />
              Pause
              <Kbd>Esc</Kbd>
            </button>
          )}
          <button
            onClick={stepFn}
            disabled={!canStep}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors",
              !canStep && "opacity-40 cursor-not-allowed",
            )}
          >
            <SkipForward size={12} />
            Step
            <Kbd>⌘→</Kbd>
          </button>
        </>
      )}

      {canReset && (
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      )}

      <div className="h-4 w-px bg-[var(--color-border)] mx-1" />

      {/* Speed */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-text-muted)] hidden sm:block">Speed</span>
        <input
          type="range"
          min={1}
          max={20}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-20 accent-[var(--color-accent)] cursor-pointer"
        />
        <span className="text-xs text-[var(--color-text-muted)] w-9 tabular-nums">
          {speed >= 20 ? "MAX" : `${speed}×`}
        </span>
      </div>

      {/* Right side info */}
      <div className="ml-auto flex items-center gap-3">
        {stepCount > 0 && (
          <span className="text-xs text-[var(--color-text-muted)] font-mono tabular-nums">
            {stepCount.toLocaleString()} {stepCount === 1 ? "step" : "steps"}
          </span>
        )}
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    editing: { label: "EDITING", cls: "text-[var(--color-text-muted)]" },
    ready:   { label: "READY",   cls: "text-[var(--color-accent)]" },
    running: { label: "RUNNING", cls: "text-[var(--color-success)]" },
    paused:  { label: "PAUSED",  cls: "text-[var(--color-warning)]" },
    halted:  { label: "HALTED",  cls: "text-[var(--color-success)]" },
    panic:   { label: "PANIC",   cls: "text-[var(--color-danger)]" },
  };
  const info = map[status] ?? { label: status.toUpperCase(), cls: "" };
  return (
    <span className={`text-xs font-bold font-mono tracking-wider ${info.cls}`}>
      {info.label}
    </span>
  );
}
