import { useControlStore } from "@/store/control.ts";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import type { StepResult } from "@/lib/types";

export function Controls() {
  const state = useControlStore((s) => s.state);
  const stepCount = useControlStore((s) => s.stepCount);
  const speed = useControlStore((s) => s.speed);
  const lastResult = useControlStore((s) => s.lastResult);

  const compile = useControlStore((s) => s.compile);
  const controlStep = useControlStore((s) => s.step);
  const step = () => {
    if (state === "editing" && !compile()) return;
    controlStep();
  };
  const controlRun = useControlStore((s) => s.run);
  const run = () => {
    if (state === "editing" && !compile()) return;
    controlRun();
  };
  const pause = useControlStore((s) => s.pause);
  const reset = useControlStore((s) => s.reset);
  const setSpeed = useControlStore((s) => s.setSpeed);

  const showRun = state !== "running";
  const canRun = state === "editing" || state === "compiled" || state === "paused";
  const canPause = state === "running";
  const canStep = state === "editing" || state === "compiled" || state === "paused";
  const canReset = state !== "initial";

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface)]">
      {/* Run / Pause */}
        {showRun && (
          <button
            onClick={run}
            disabled={!canRun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[var(--color-success)] text-[var(--color-bg)] hover:opacity-90 transition-opacity"
          >
            <Play size={12} />
            Run
          </button>
        )}
        {!showRun && (
          <button
            onClick={pause}
            disabled={!canPause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[var(--color-warning)] text-[var(--color-bg)] hover:opacity-90 transition-opacity"
          >
            <Pause size={12} />
            Pause
          </button>
        )}
        <button
          onClick={step}
          disabled={!canStep}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors",
            !canStep && "opacity-40 cursor-not-allowed",
          )}
        >
          <SkipForward size={12} />
          Step
        </button>


      {canReset && (
        <button
          onClick={reset}
          disabled={!canReset}
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
        <StatusBadge state={state} lastResult={lastResult} />
      </div>
    </div>
  );
}

function StatusBadge({ state, lastResult }: { state: string; lastResult: StepResult | null }) {
  let label: string;
  let cls: string;

  if (state === "stopped") {
    if (lastResult?.result === "halt") {
      label = "HALTED";
      cls = "text-[var(--color-success)]";
    } else if (lastResult?.result === "panic") {
      label = "PANIC";
      cls = "text-[var(--color-danger)]";
    } else {
      label = "STOPPED";
      cls = "text-[var(--color-text-muted)]";
    }
  } else {
    const map: Record<string, { label: string; cls: string }> = {
      initial:  { label: "INITIAL",  cls: "text-[var(--color-text-muted)]" },
      editing:  { label: "EDITING",  cls: "text-[var(--color-text-muted)]" },
      compiled: { label: "COMPILED", cls: "text-[var(--color-accent)]" },
      running:  { label: "RUNNING",  cls: "text-[var(--color-success)]" },
      paused:   { label: "PAUSED",   cls: "text-[var(--color-warning)]" },
    };
    const info = map[state] ?? { label: state.toUpperCase(), cls: "" };
    label = info.label;
    cls = info.cls;
  }

  return (
    <span className={`text-xs font-bold font-mono tracking-wider ${cls}`}>
      {label}
    </span>
  );
}
