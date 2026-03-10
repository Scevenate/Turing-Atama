import { useNavigate } from "react-router-dom";
import { levels } from "@/levels/levels.ts";
import { useLevelsStore } from "@/store/level.ts";
import { motion } from "framer-motion";
import { Terminal, ChevronRight, CheckCircle, Trash2 } from "lucide-react";

export default function LevelsRoute() {
  const navigate = useNavigate();
  const levelEntries = useLevelsStore((s) => s.levelEntries);
  const clearLevelEntries = useLevelsStore((s) => s.clearLevelEntries);

  const allLevels = levels.flatMap((g) => g.levels);
  const totalComplete = allLevels.filter((l) => levelEntries.get(l.id)?.state === "completed").length;
  const totalLevels = allLevels.length;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-8 py-5 flex items-center gap-3">
        <Terminal size={20} className="text-accent" />
        <span className="font-semibold text-base text-text tracking-tight">
          Turing<span className="text-head">Atama</span>
        </span>
        <span className="ml-2 text-xs text-text-muted">/ select level</span>
      </header>

      {/* Level grid */}
      <main className="flex-1 p-8">
        <div className="flex items-end justify-between mb-1">
          <h1 className="text-xl font-bold text-text">Choose a Level</h1>
          <button
            onClick={clearLevelEntries}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-border text-text-muted hover:text-danger hover:border-danger transition-colors"
          >
            <Trash2 size={11} />
            Clear Progress
          </button>
        </div>
        <p className="text-sm text-text-muted mb-8">
          Code a Turing machine to solve each puzzle.{" "}
          <span className="text-accent">
            {totalComplete}/{totalLevels}
          </span>{" "}
          complete.
        </p>

        <div className="space-y-10">
          {levels.map((group) => (
            <section key={group.name}>
              <h2 className="text-xs font-semibold text-text-muted mb-4 pb-2 border-b border-border">
                {group.name}
              </h2>
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                {group.levels.map((level, idx) => {
                  const levelState = levelEntries.get(level.id)?.state;
                  const isCompleted = levelState === "completed";
                  return (
                    <motion.button
                      key={level.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      onClick={() => navigate(`/level/${level.id}`)}
                      className={`group text-left p-5 rounded-lg border transition-all duration-150 cursor-pointer ${
                        isCompleted
                          ? "border-success bg-surface hover:bg-surface-2"
                          : "border-border bg-surface hover:border-accent hover:bg-surface-2"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-mono text-text-muted tabular-nums">
                          #{String(level.id).padStart(2, "0")}
                        </span>
                        {isCompleted ? (
                          <CheckCircle size={14} className="text-success" />
                        ) : (
                          <ChevronRight
                            size={14}
                            className="text-text-muted group-hover:text-accent transition-colors"
                          />
                        )}
                      </div>
                      <h3 className={`text-sm font-semibold mb-2 transition-colors ${
                        isCompleted
                          ? "text-success"
                          : "text-text group-hover:text-accent"
                      }`}>
                        {level.title}
                      </h3>
                      <div className="flex gap-2 text-xs text-text-muted">
                        <span className="px-1.5 py-0.5 bg-surface-2 rounded font-mono">
                          {Array.from(level.startTape.values()).join(" ")}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
