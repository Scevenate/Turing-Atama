/**
 * Turing machine interpreter.
 *
 * The interpreter is a pure function: it takes a tape snapshot and a rule
 * table, and returns the result of one step. The Zustand store drives the
 * execution loop; the interpreter holds no state.
 */

import type { Tape, RuleTable, StepResult, Rule } from "./types.ts";

/** Read the character under the head. Missing cells are blank ("null"). */
export function readCell(tape: Tape): string {
  return tape.cells.get(tape.head) ?? "null";
}

/**
 * Apply one step to the tape (mutates in-place for performance).
 * Returns the step result and, on panic, the rule key that was missing.
 */
export function step(
  tape: Tape,
  ruleTable: RuleTable,
): { result: StepResult; panicKey?: string; appliedRule?: Rule } {
  const currentChar = readCell(tape);
  const key = `${tape.state}\0${currentChar}`;
  const ruleIdx = ruleTable.index.get(key);

  if (ruleIdx === undefined) {
    return { result: "panic", panicKey: `(${tape.state}, ${currentChar})` };
  }

  const rule = ruleTable.rules[ruleIdx];

  // Write character
  if (rule.nextCharacter === "null") {
    tape.cells.delete(tape.head);
  } else {
    tape.cells.set(tape.head, rule.nextCharacter);
  }

  // Move head
  if (rule.move === "<") tape.head -= 1;
  else if (rule.move === ">") tape.head += 1;

  // Transition state
  tape.state = rule.nextState;

  if (tape.state === "halt") {
    return { result: "halt", appliedRule: rule };
  }

  return { result: "ok", appliedRule: rule };
}

/** Deep-clone a tape (for undo / snapshot history). */
export function cloneTape(tape: Tape): Tape {
  return {
    cells: new Map(tape.cells),
    head: tape.head,
    state: tape.state,
  };
}

/** Build an initial tape from a plain record. */
export function buildTape(
  initial: Record<number, string>,
  initialHead = 0,
): Tape {
  const cells = new Map<number, string>();
  for (const [pos, char] of Object.entries(initial)) {
    if (char !== "null") cells.set(Number(pos), char);
  }
  return { cells, head: initialHead, state: "start" };
}
