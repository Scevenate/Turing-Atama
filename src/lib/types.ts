//  Compile / linter types

export interface Token {
  type: "identifier" | "direction" | "comma" | "colon";
  value: string;
  line: number;
}

// Both state and character are URL-safe base64 identifiers: [a-zA-Z0-9_-]+
// Reserved states: "start", "halt"
// Reserved character: "null". This character is actually empty in tape dict.

export type State = string;
export type Character = string;
export type Direction = "<" | ">";

export interface Rule {
  state: State;
  character: Character;
  nextState?: State;
  nextCharacter?: Character;
  move?: Direction;
  line: number;
}

export interface RuleTable {
  rules: Rule[];
  index: Map<string, number>; // "state\0character" -> index into rules[] for O(1) lookup
}

//  Compile / Lint result

export interface Error {
  name: string;
  message: string;
  line?: number;
}

//  Runtime step result

export interface PanicResult {
  result: "panic";
  panicKey: string;
}

export interface OkResult {
  result: "ok";
  appliedRule: Rule;
}

export interface HaltResult {
  result: "halt";
  appliedRule: Rule;
}

export type StepResult = PanicResult | OkResult | HaltResult;

//  Machine types

export type Position = number;

export type Tape = Map<Position, Character>;  //  "null" is "not in tape dict".

export interface Machine {
  tape: Tape;
  head: Position;
  state: State;
  ruleTable: RuleTable;
}
