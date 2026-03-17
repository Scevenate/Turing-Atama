import { useNavigate } from "react-router-dom";
import { levels } from "@/levels/levels.ts";
import { useLevelsStore } from "@/store/level";
import { useInitialStore } from "@/store/initial";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle, Trash2 } from "lucide-react";
import { useEffect } from "react";

export default function LevelsRoute() {
  const initial = useInitialStore((s) => s.initial);
  const navigate = useNavigate();
  const levelEntries = useLevelsStore((s) => s.levelEntries);
  const clearLevelEntries = useLevelsStore((s) => s.clearLevelEntries);

  //  Root dir - nav away if initial
  useEffect(() => {
    if (initial) {
      void navigate("/initial");
    }
  }, [initial]);

  const allLevels = levels.flatMap((g) => g.levels);
  const totalComplete = allLevels.filter((l) => levelEntries.get(l.id)?.state === "completed").length;
  const totalLevels = allLevels.length;

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* Level grid */}
      <main className="flex-1 p-8">
        <div className="flex items-end justify-between mb-1">
          <h1 className="text-2xl font-bold text-accent"><span className="">T</span><span className="relative top-1">u</span><span className="relative bottom-1.5">r</span><span className="relative bottom-0.5">i</span><span className="relative top-0.5">n</span>g Atama<span className="text-text-muted italic text-3xl relative top-0.5 pl-0.5">!!!</span></h1>
          <button
            onClick={clearLevelEntries}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-border text-text-muted hover:text-danger hover:border-danger transition-colors cursor-pointer"
          >
            <Trash2 size={11} />
            Clear Progress
          </button>
        </div>
        <p className="text-sm text-text-muted mb-8">
          Progress: {" "}
          <span className="text-accent-2">
            {totalComplete}/{totalLevels}
          </span>{" "}
          completed
        </p>

        <div className="space-y-10">
          {levels.map((group) => (
            <section key={group.name}>
              <h2 className={`text-xs font-semibold mb-4 pb-2 border-b border-border ${
                group.levels.filter(level => {
                  return levelEntries.get(level.id)?.state !== "completed"
                }).length === 0 ? "text-success" : "text-text-muted"
              }`}>
                {group.name}
              </h2>
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                {group.levels.map((level) => {
                  const levelState = levelEntries.get(level.id)?.state;
                  const isCompleted = levelState === "completed";
                  return (
                    <motion.button
                      key={level.id}
                      onClick={() => void navigate(`/level/${level.id}`)}
                      className={`group text-left p-5 rounded-lg border transition-all duration-150 cursor-pointer hover:-translate-y-0.5 ${
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
                          <div className="flex items-center align-baseline gap-1">
                            <p className="text-text-muted text-xs pb-0.5 pr-0.5">{levelEntries.get(level.id)?.stepCount} steps</p>
                            <CheckCircle size={14} className="text-success" />
                          </div>
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
                    </motion.button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
      <div className="flex flex-col my-5 items-center justify-center text-xs text-text-muted">
        <p>(c) Scevenate, 2026. Made with love!</p>
        <p>Contact: <a className="text-accent hover:text-accent-2 underline" href="mailto://scevenate@gmail.com">Scevenate@gmail.com</a> for anything UwU</p>
      </div>
    </div>
  );
}
