import { useEffect, useRef } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import {
  EditorView,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { lintGutter, setDiagnostics } from "@codemirror/lint";
import type { Diagnostic as CmDiagnostic } from "@codemirror/lint";
import { tmLanguage } from "./tmLanguage.ts";
import { tmEditorTheme, tmHighlightStyle } from "./tmTheme.ts";
import { useMachineStore } from "@/store/machine.ts";
import type { Diagnostic } from "@/core/types.ts";

const editableCompartment = new Compartment();

function toCmDiagnostics(diagnostics: Diagnostic[], doc: EditorView["state"]["doc"]): CmDiagnostic[] {
  const result: CmDiagnostic[] = [];
  for (const d of diagnostics) {
    if (d.line === undefined) continue;
    try {
      const line = doc.line(d.line);
      result.push({
        from: line.from,
        to: line.to,
        severity: d.severity,
        message: d.message,
      });
    } catch {
      // line out of range
    }
  }
  return result;
}

export function TmEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const source = useMachineStore((s) => s.source);
  const diagnostics = useMachineStore((s) => s.diagnostics);
  const setSource = useMachineStore((s) => s.setSource);
  const compileSrc = useMachineStore((s) => s.compileSrc);
  const status = useMachineStore((s) => s.status);

  const isReadOnly = status === "running" || status === "halted" || status === "panic";

  // Mount editor once
  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: source,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          tmLanguage,
          tmEditorTheme,
          tmHighlightStyle,
          lintGutter(),
          editableCompartment.of(EditorView.editable.of(true)),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setSource(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync source from outside (e.g., level load)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc !== source) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: source },
      });
    }
  }, [source]);

  // Sync diagnostics
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const cmDiags = toCmDiagnostics(diagnostics, view.state.doc);
    view.dispatch(setDiagnostics(view.state, cmDiags));
  }, [diagnostics]);

  // Sync readOnly via compartment
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: editableCompartment.reconfigure(EditorView.editable.of(!isReadOnly)),
    });
  }, [isReadOnly]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
        <span className="text-xs text-[var(--color-text-muted)] font-mono uppercase tracking-wider">
          machine.tm
        </span>
        <button
          onClick={compileSrc}
          disabled={isReadOnly}
          className="px-3 py-1 text-xs rounded bg-[var(--color-accent)] text-[var(--color-bg)] font-semibold hover:bg-[var(--color-accent-2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Compile
        </button>
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto min-h-0" />
    </div>
  );
}
