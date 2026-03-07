// ─── Token ───────────────────────────────────────────────────────────────────

export type TokenType =
  | "identifier"
  | "direction"
  | "comma"
  | "colon"
  | "comment"
  | "newline"
  | "eof";

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  col: number;
}

// ─── Rule ────────────────────────────────────────────────────────────────────

// Both state and character are URL-safe base64 identifiers: [a-zA-Z0-9_-]+
// Reserved states: "start", "halt"
// Reserved character: "null" (represents blank tape cell)

export type TmState = string;
export type TmChar = string;
export type Direction = "<" | ">";

export interface Rule {
  state: TmState;
  character: TmChar;
  nextState: TmState;
  nextCharacter: TmChar;
  move?: Direction;
  line: number;
}

export interface RuleTable {
  rules: Rule[];
  /** "state\0character" -> index into rules[] for O(1) lookup */
  index: Map<string, number>;
}

// ─── Tape / Machine ──────────────────────────────────────────────────────────

export type Position = number;

export interface Tape {
  /** Sparse map of position -> character. Missing = blank ("null"). */
  cells: Map<Position, TmChar>;
  head: Position;
  state: TmState;
}

// ─── Diagnostics ─────────────────────────────────────────────────────────────

export type DiagnosticSeverity = "error" | "warning";

export interface Diagnostic {
  severity: DiagnosticSeverity;
  message: string;
  line?: number;
  col?: number;
}

// ─── Compile Result ──────────────────────────────────────────────────────────

export type CompileResult =
  | { ok: true; ruleTable: RuleTable; warnings: Diagnostic[] }
  | { ok: false; errors: Diagnostic[]; warnings: Diagnostic[] };

// ─── Interpreter Result ──────────────────────────────────────────────────────

export type StepResult = "ok" | "halt" | "panic";
