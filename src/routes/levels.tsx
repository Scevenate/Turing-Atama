import { useNavigate } from "react-router-dom";
import { LEVELS } from "@/levels/index.ts";
import { motion } from "framer-motion";
import { Terminal, ChevronRight } from "lucide-react";

export default function LevelsRoute() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] px-8 py-5 flex items-center gap-3">
        <Terminal size={20} className="text-[var(--color-accent)]" />
        <span className="font-mono font-bold text-lg text-[var(--color-text)] tracking-tight">
          TURING<span className="text-[var(--color-head)]">ATAMA</span>
        </span>
        <span className="ml-2 text-xs text-[var(--color-text-muted)]">/ select level</span>
      </header>

      {/* Level grid */}
      <main className="flex-1 p-8">
        <h1 className="text-xl font-bold text-[var(--color-text)] mb-1">Choose a Level</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          Code a Turing machine to solve each puzzle.
        </p>

        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {LEVELS.map((level, idx) => (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              onClick={() => navigate(`/level/${level.id}`)}
              className="group text-left p-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-2)] transition-all duration-150"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-mono text-[var(--color-text-muted)]">
                  #{String(idx + 1).padStart(2, "0")}
                </span>
                <ChevronRight
                  size={14}
                  className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors"
                />
              </div>
              <h2 className="text-sm font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                {level.title}
              </h2>
              <div className="flex gap-2 text-xs text-[var(--color-text-muted)] font-mono">
                <span className="px-1.5 py-0.5 bg-[var(--color-surface-2)] rounded">
                  Initial: {Object.entries(level.initialTape).map(([, v]) => v).join(" ")}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}
