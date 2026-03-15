import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Group, Panel, Separator } from "react-resizable-panels";
import { levels } from "@/levels/levels.ts";
import { useControlStore } from "@/store/control";
import { useSourceStore } from "@/store/source";
import { useLevelsStore } from "@/store/level";
import { useMachineStore } from "@/store/machine";
import { Controls } from "@/components/Control/Control";
import { TmEditor } from "@/components/Editor/Editor";
import { TuringTape } from "@/components/Turing/Turing";
import { ProblemPanel } from "@/components/Problem/Problem";
import { Feedback } from "@/components/Feedback/Feedback";
import { ArrowLeft } from "lucide-react";

export default function GameRoute() {
  //  Update id to level, navigate away if level is not found
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const level = useControlStore((s) => s.level);
  const loadLevel = useControlStore((s) => s.loadLevel);
  const levelEntries = useLevelsStore((s) => s.levelEntries);
  const setSource = useSourceStore((s) => s.setSource);
  useEffect(() => {
    if (!id) { navigate("/"); return; }
    const l = levels.flatMap((g) => g.levels).find((l) => l.id === Number(id)) ?? null;
    if (!l) { navigate("/"); return; }
    loadLevel(l);
    // Restore level source storage
    const saved = levelEntries.get(l.id);
    if (saved) setSource(saved.source);
    
  }, [id]);

  //  Save source on write
  const source = useSourceStore((s) => s.source);
  const setLevelEntry = useLevelsStore((s) => s.setLevelEntry);
  useEffect(() => {
    if (!level) return;
    const levelEntry = levelEntries.get(level.id);
    if (levelEntry) {
      setLevelEntry(level.id, { ...levelEntry, source: source });
    } else {
      setLevelEntry(level.id, { state: "attempted", source: source, stepCount: 0 });
    }
  }, [source]);

  // Persist completion when the level is passed
  const checkResult = useControlStore((s) => s.checkResult);
  const machine = useMachineStore((s) => s.machine);
  const controlState = useControlStore((s) => s.state);
  const stepCount = useControlStore((s) => s.stepCount);
  useEffect(() => {
    if (controlState === "halted" && level != null && checkResult(level, machine.tape)) {
      setLevelEntry(level.id, { state: "completed", source: source, stepCount: stepCount });
    }
  }, [controlState]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg">
      {/* Top controls bar */}
      <div className="flex items-center border-b border-border shrink-0">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 px-3 py-3 text-xs text-text-muted hover:text-text border-r border-border transition-colors shrink-0 cursor-pointer"
        >
          <ArrowLeft size={13} />
          Levels
        </button>
        <div className="flex-1 min-w-0">
          <Controls/>
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal" className="h-full">
          {/* Left pane: problem + editor */}
          <Panel id="left" defaultSize={40} minSize={25}>
            <div
              className="h-full flex flex-col border-r border-border overflow-hidden"
            >
              {/* Problem panel */}
              <div className="shrink-0" style={{ maxHeight: "50%" }}>
                <ProblemPanel />
              </div>

              {/* Code editor fills remaining space */}
              <div className="flex-1 overflow-hidden min-h-0">
                <TmEditor />
              </div>

              {/* Feedback / diagnostics */}
              <div className="shrink-0 max-h-44 overflow-y-auto border-t border-border p-2 bg-surface">
                <Feedback />
              </div>
            </div>
          </Panel>

          <Separator
            id="sep"
            className="w-1 bg-border hover:bg-accent transition-colors cursor-col-resize"
          />

          {/* Right pane: tape visualizer */}
          <Panel id="right" defaultSize={60} minSize={40}>
            <div className="h-full bg-bg">
              <TuringTape />
            </div>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
