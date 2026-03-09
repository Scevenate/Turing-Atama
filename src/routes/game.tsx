import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Group, Panel, Separator } from "react-resizable-panels";
import { levels, type Level } from "@/levels/levels.ts";
import { useControlStore } from "@/store/control.ts";
import { useSourceStore } from "@/store/source.ts";
import { useLevelsStore } from "@/store/level.ts";
import { Controls } from "@/components/Control/Control";
import { TmEditor } from "@/components/Editor/Editor";
import { TuringTape } from "@/components/Turing/Turing";
import { ProblemPanel } from "@/components/Problem/Problem";
import { Feedback } from "@/components/Feedback/Feedback";
import { ArrowLeft } from "lucide-react";

export default function GameRoute() {
  //  Update id to level, navigate away if level is not found
  const { id } = useParams<{ id: string }>();
  const [level, setLevel] = useState<Level | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const l = levels.flatMap((g) => g.levels).find((l) => l.id === Number(id)) ?? null;
    setLevel(l);
    if (!l) { navigate("/"); return; }
  }, [id]);

  //  load level, restore source
  const loadLevel = useControlStore((s) => s.loadLevel);
  const levelEntries = useLevelsStore((s) => s.levelEntries);
  useEffect(() => {
    if (!level) return;
    loadLevel(level);
    // Restore level source storage
    const saved = levelEntries.get(level.id);
    if (saved) setSource(saved.source);
  }, [level]);

  //  Save source on write
  const source = useSourceStore((s) => s.source);
  const setSource = useSourceStore((s) => s.setSource);
  const setLevelEntry = useLevelsStore((s) => s.setLevelEntry);
  useEffect(() => {
    if (!level) return;
    const levelEntry = levelEntries.get(level.id);
    if (levelEntry) {
      setLevelEntry(level.id, { ...levelEntry, source: source });
    } else {
      setLevelEntry(level.id, { state: "attempted", source: source });
    }
  }, [source]);

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
          <Controls/>
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
