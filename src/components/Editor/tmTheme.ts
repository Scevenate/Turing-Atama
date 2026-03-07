import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

export const tmEditorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#161b22",
      color: "#e6edf3",
      height: "100%",
      fontSize: "13px",
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    },
    ".cm-content": {
      caretColor: "#58a6ff",
      padding: "8px 0",
    },
    ".cm-cursor": {
      borderLeftColor: "#58a6ff",
    },
    ".cm-activeLine": {
      backgroundColor: "#21262d",
    },
    ".cm-selectionBackground, ::selection": {
      backgroundColor: "#264f78 !important",
    },
    ".cm-gutters": {
      backgroundColor: "#161b22",
      color: "#7d8590",
      border: "none",
      borderRight: "1px solid #30363d",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      paddingLeft: "8px",
      paddingRight: "8px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#21262d",
    },
    ".cm-diagnostic-error": {
      borderBottom: "2px solid #f85149",
    },
    ".cm-diagnostic-warning": {
      borderBottom: "2px dotted #d29922",
    },
    ".cm-tooltip": {
      backgroundColor: "#21262d",
      border: "1px solid #30363d",
      color: "#e6edf3",
    },
  },
  { dark: true },
);

export const tmHighlightStyle = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.keyword, color: "#ff7b72" },       // start, halt, directions
    { tag: tags.comment, color: "#7d8590", fontStyle: "italic" },
    { tag: tags.variableName, color: "#79c0ff" },  // states
    { tag: tags.string, color: "#a5d6ff" },         // characters
    { tag: tags.atom, color: "#ffa657" },           // null
    { tag: tags.punctuation, color: "#7d8590" },
    { tag: tags.invalid, color: "#f85149", textDecoration: "underline" },
  ]),
);
