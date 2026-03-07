import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Group, Panel, Separator } from "react-resizable-panels";
import { LEVELS } from "@/levels/index.ts";
import { useMachineStore } from "@/store/machine.ts";
import { Controls } from "@/components/Control/index.tsx";
import { TmEditor } from "@/components/Editor/index.tsx";
import { TuringTape } from "@/components/Turing/index.tsx";
import { ProblemPanel } from "@/components/Problem/index.tsx";
import { Feedback } from "@/components/Feedback/index.tsx";
import { ArrowLeft } from "lucide-react";

export default function GameRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const loadLevel = useMachineStore((s) => s.loadLevel);
  const compileSrc = useMachineStore((s) => s.compileSrc);
  const run = useMachineStore((s) => s.run);
  const pause = useMachineStore((s) => s.pause);
  const stepFn = useMachineStore((s) => s.step);
  const reset = useMachineStore((s) => s.reset);

  useEffect(() => {
    const level = LEVELS.find((l) => l.id === id);
    if (level) {
      loadLevel(level);
    } else {
      navigate("/");
    }
  }, [id, loadLevel, navigate]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "Enter") { e.preventDefault(); compileSrc(); }
      if (ctrl && e.key === " ") { e.preventDefault(); run(); }
      if (e.key === "F5") { e.preventDefault(); run(); }
      if (e.key === "Escape") { e.preventDefault(); pause(); }
      if (ctrl && e.key === "ArrowRight") { e.preventDefault(); stepFn(); }
      if (ctrl && e.key === "r") { e.preventDefault(); reset(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [compileSrc, run, pause, stepFn, reset]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--color-bg)]">
      {/* Top controls bar */}
      <div className="flex items-center border-b border-[var(--color-border)] shrink-0">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 px-3 py-3 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] border-r border-[var(--color-border)] transition-colors shrink-0"
        >
          <ArrowLeft size={13} />
          Levels
        </button>
        <div className="flex-1 min-w-0">
          <Controls />
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal" className="h-full">
          {/* Left pane: problem + editor */}
          <Panel id="left" defaultSize={40} minSize={25}>
            <div
              className="h-full flex flex-col border-r border-[var(--color-border)] overflow-hidden"
            >
              {/* Problem panel */}
              <div className="shrink-0" style={{ maxHeight: "45%" }}>
                <ProblemPanel />
              </div>

              {/* Code editor fills remaining space */}
              <div className="flex-1 overflow-hidden min-h-0">
                <TmEditor />
              </div>

              {/* Feedback / diagnostics */}
              <div className="shrink-0 max-h-44 overflow-y-auto border-t border-[var(--color-border)] p-2 bg-[var(--color-surface)]">
                <Feedback />
              </div>
            </div>
          </Panel>

          <Separator
            id="sep"
            className="w-1 bg-[var(--color-border)] hover:bg-[var(--color-accent)] transition-colors cursor-col-resize"
          />

          {/* Right pane: tape visualizer */}
          <Panel id="right" defaultSize={60} minSize={40}>
            <div className="h-full bg-[var(--color-bg)]">
              <TuringTape />
            </div>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
