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
  const canReset = state !== "initial" && state !== "editing";

  const isPanic = state === "stopped" && lastResult?.result === "panic";
  const barBg =
    isPanic              ? "bg-danger"
    : state === "stopped" ? "bg-success"
    : state === "running" ? "bg-accent"
    : state === "paused"  ? "bg-warning"
    : "bg-surface";

  return (
    <div className={`flex items-center gap-2 px-3 py-2 transition-colors duration-300 ${barBg}`}>
      {/* Run / Pause */}
        {showRun && (
          <button
            onClick={run}
            disabled={!canRun}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-accent text-bg hover:opacity-90 transition-opacity",
              !canRun && "text-text-muted cursor-not-allowed"
            )}
          >
            <Play size={12} />
            Run
          </button>
        )}
        {!showRun && (
          <button
            onClick={pause}
            disabled={!canPause}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-warning text-bg hover:opacity-90 transition-opacity"
              ,!canPause && "text-text-muted cursor-not-allowed"
            )}
          >
            <Pause size={12} />
            Pause
          </button>
        )}
        <button
          onClick={step}
          disabled={!canStep}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border border-border text-text bg-surface hover:bg-surface-2 transition-colors",
            !canStep && "text-text-muted cursor-not-allowed",
          )}
        >
          <SkipForward size={12} />
          Step
        </button>


        <button
          onClick={reset}
          disabled={!canReset}
          className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border border-border bg-surface text-text hover:bg-surface-2 transition-colors",
          !canReset && "text-text-muted cursor-not-allowed"
          )}
        >
          <RotateCcw size={12} />
          Reset
        </button>


      <div className="h-4 w-px bg-border mx-1" />

      {/* Speed */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text hidden sm:block">Speed</span>
        <input
          type="range"
          min={1}
          max={20}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-20 accent-accent cursor-pointer"
        />
        <span className="text-xs text-text w-9 tabular-nums">
          {speed >= 20 ? "MAX" : `${speed}×`}
        </span>
      </div>

      {/* Right side info */}
      <div className="ml-auto flex items-center gap-3">
        {stepCount > 0 && (
          <span className="text-xs text-text-muted tabular-nums">
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

  if (state === "stopped") {
    if (lastResult?.result === "halt") {
      label = "Halted";
    } else if (lastResult?.result === "panic") {
      label = "Panic";
    } else {
      label = "Stopped";
    }
  } else {
    const map: Record<string, string> = {
      initial:  "Ready",
      editing:  "Editing",
      compiled: "Compiled",
      running:  "Running",
      paused:   "Paused",
    };
    label = map[state] ?? state;
  }

  return (
    <span className="text-xs font-medium text-text">
      {label}
    </span>
  );
}
