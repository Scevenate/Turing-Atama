import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useControlStore } from "@/store/control.ts";

export function ProblemPanel() {
  const level = useControlStore((s) => s.level);
  const [collapsed, setCollapsed] = useState(false);

  if (!level) {
    return (
      <div className="p-4 text-text-muted text-sm">
        Select a level to begin.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-b border-border">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-muted hover:text-text border-b border-border bg-surface transition-colors w-full text-left"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        {level.title}
      </button>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4 prose-sm text-text">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className="text-sm font-bold text-accent mt-0 mb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xs font-semibold text-text-muted mt-3 mb-1">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-sm text-text mb-2 leading-relaxed">
                  {children}
                </p>
              ),
              code: ({ children }) => (
                <code className="px-1 py-0.5 rounded text-xs bg-surface-2 text-head font-mono">
                  {children}
                </code>
              ),
              ul: ({ children }) => (
                <ul className="text-sm text-text mb-2 pl-4 list-disc space-y-1">
                  {children}
                </ul>
              ),
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => (
                <strong className="text-text font-semibold">{children}</strong>
              ),
            }}
          >
            {level.description}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
