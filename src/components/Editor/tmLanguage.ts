/**
 * CodeMirror 6 StreamParser for the Turing machine scripting language.
 *
 * Grammar per line:
 *   state , char : nextState , nextChar [, < | >]
 *
 * We use a line-level token counter to assign distinct colors to positional
 * tokens (LHS state vs character vs RHS state vs character).
 */

import { StreamLanguage } from "@codemirror/language";
import type { StringStream } from "@codemirror/language";

interface State {
  tokenCount: number;
  afterColon: boolean;
}

const ID_RE = /[a-zA-Z0-9_-]/;

export const tmLanguage = StreamLanguage.define<State>({
  name: "turing-machine",

  startState: () => ({ tokenCount: 0, afterColon: false }),

  token(stream: StringStream, state: State): string | null {
    // Comment
    if (stream.peek() === "#") {
      stream.skipToEnd();
      return "comment";
    }

    // Whitespace
    if (stream.eatSpace()) return null;

    const ch = stream.peek();
    if (ch === null) return null;

    // Comma
    if (ch === ",") {
      stream.next();
      return "punctuation";
    }

    // Colon
    if (ch === ":") {
      stream.next();
      state.afterColon = true;
      return "punctuation";
    }

    // Direction
    if (ch === "<" || ch === ">") {
      stream.next();
      return "keyword";
    }

    // Identifier
    if (ch && ID_RE.test(ch)) {
      stream.eatWhile(ID_RE);
      const word = stream.current();
      state.tokenCount++;

      // Reserved identifiers
      if (word === "start" || word === "halt") return "keyword";
      if (word === "null") return "atom";

      // Position-based coloring
      if (!state.afterColon) {
        return state.tokenCount === 1 ? "variableName" : "string";
      } else {
        // After colon: first identifier is nextState, second is nextChar
        const rhsPos = state.tokenCount - 2; // rough estimate post-colon
        return rhsPos <= 1 ? "variableName" : "string";
      }
    }

    // Unknown
    stream.next();
    return "invalid";
  },

  blankLine(_state: State) {
    // no-op (state reset is per-line automatic in StreamLanguage)
  },

  // Reset state at start of each line
  indent: undefined,
  languageData: {
    commentTokens: { line: "#" },
  },
});
