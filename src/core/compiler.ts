/**
 * Compiler for the Turing machine scripting language.
 *
 * Syntax (one rule per non-empty line):
 *   state, char: nextState, nextChar [, < | >]
 *
 * Reserved states: start, halt
 * Reserved character: null (blank tape cell)
 * Comments: lines beginning with # are ignored.
 * Identifiers: [a-zA-Z0-9_-]+
 */

import type { Token, TokenType, Rule, Diagnostic } from "./types.ts";

// ─── Lexer ───────────────────────────────────────────────────────────────────

const IDENTIFIER_RE = /^[a-zA-Z0-9_-]+/;
const DIRECTION_RE = /^[<>]/;

function tokenizeLine(source: string, lineNum: number): Token[] | Diagnostic {
  const tokens: Token[] = [];
  let col = 0;

  while (col < source.length) {
    // Skip whitespace (spaces and tabs only, not newlines)
    if (source[col] === " " || source[col] === "\t") {
      col++;
      continue;
    }

    const ch = source[col];

    if (ch === ",") {
      tokens.push({ type: "comma", value: ",", line: lineNum, col });
      col++;
      continue;
    }

    if (ch === ":") {
      tokens.push({ type: "colon", value: ":", line: lineNum, col });
      col++;
      continue;
    }

    // Try direction (only valid in certain position, but we lex it regardless)
    const dirMatch = source.slice(col).match(DIRECTION_RE);
    if (dirMatch) {
      tokens.push({
        type: "direction",
        value: dirMatch[0],
        line: lineNum,
        col,
      });
      col += dirMatch[0].length;
      continue;
    }

    // Try identifier
    const idMatch = source.slice(col).match(IDENTIFIER_RE);
    if (idMatch) {
      tokens.push({
        type: "identifier",
        value: idMatch[0],
        line: lineNum,
        col,
      });
      col += idMatch[0].length;
      continue;
    }

    return {
      severity: "error",
      message: `Unexpected character '${ch}'`,
      line: lineNum,
      col,
    };
  }

  return tokens;
}

// ─── Parser ──────────────────────────────────────────────────────────────────

/**
 * Parse one line's tokens into a Rule.
 * Expected sequences:
 *   IDENT COMMA IDENT COLON IDENT COMMA IDENT
 *   IDENT COMMA IDENT COLON IDENT COMMA IDENT COMMA DIRECTION
 */
function parseLine(tokens: Token[], lineNum: number): Rule | Diagnostic {
  function expect(idx: number, type: TokenType): Token | Diagnostic {
    const tok = tokens[idx];
    if (!tok) {
      return {
        severity: "error",
        message: `Unexpected end of line, expected ${type}`,
        line: lineNum,
      };
    }
    if (tok.type !== type) {
      return {
        severity: "error",
        message: `Expected ${type} but got '${tok.value}'`,
        line: lineNum,
        col: tok.col,
      };
    }
    return tok;
  }

  function isError(v: Token | Diagnostic): v is Diagnostic {
    return "severity" in v;
  }

  const t0 = expect(0, "identifier");
  if (isError(t0)) return t0;
  const t1 = expect(1, "comma");
  if (isError(t1)) return t1;
  const t2 = expect(2, "identifier");
  if (isError(t2)) return t2;
  const t3 = expect(3, "colon");
  if (isError(t3)) return t3;
  const t4 = expect(4, "identifier");
  if (isError(t4)) return t4;
  const t5 = expect(5, "comma");
  if (isError(t5)) return t5;
  const t6 = expect(6, "identifier");
  if (isError(t6)) return t6;

  let move: Rule["move"] | undefined;

  if (tokens.length === 9) {
    const t7 = expect(7, "comma");
    if (isError(t7)) return t7;
    const t8 = expect(8, "direction");
    if (isError(t8)) return t8;
    move = t8.value as Rule["move"];
  } else if (tokens.length !== 7) {
    const extra = tokens[7];
    return {
      severity: "error",
      message: `Unexpected token '${extra?.value ?? "?"}'`,
      line: lineNum,
      col: extra?.col,
    };
  }

  return {
    state: t0.value,
    character: t2.value,
    nextState: t4.value,
    nextCharacter: t6.value,
    move,
    line: lineNum,
  };
}

// ─── Public compile function ──────────────────────────────────────────────────

export interface CompilerOutput {
  rules: Rule[];
  errors: Diagnostic[];
}

export function compile(source: string): CompilerOutput {
  const errors: Diagnostic[] = [];
  const rules: Rule[] = [];

  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    let line = lines[i];

    // Strip comment
    const commentIdx = line.indexOf("#");
    if (commentIdx !== -1) line = line.slice(0, commentIdx);

    line = line.trim();
    if (line.length === 0) continue;

    const tokenResult = tokenizeLine(line, lineNum);
    if (!Array.isArray(tokenResult)) {
      errors.push(tokenResult);
      continue;
    }

    if (tokenResult.length === 0) continue;

    const ruleResult = parseLine(tokenResult, lineNum);
    if ("severity" in ruleResult) {
      errors.push(ruleResult);
    } else {
      rules.push(ruleResult);
    }
  }

  return { rules, errors };
}
