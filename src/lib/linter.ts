/**
 * Linter for compiled Turing machine rules. Also a pure function.
 * Takes a compiled, but unvalidated rules array, and returns a validated RuleTable.
 * This section builds the index and checks the following conditions:
 *  - "start" must has appeared as matching state.
 *  - "halt" must never appear as matching state.
 *  - "halt" must has appeared as next state.
 *  - No unreachable rules. (duplicate)
 *  - No dead states. (LHS only, start excluded)
 *  - No sink states. (RHS only, halt excluded)
 */

import type { Rule, Error, RuleTable, State } from "./types.ts";

export function analyze(rules: Rule[]): RuleTable | Error {

  let hasStart = false;
  let hasHaltWrite = false;
  const lhsStates = new Set<State>();
  const rhsStates = new Set<State>();
  const index = new Map<string, number>(); // "state\0character" -> index in rules[]

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (rule.state === "halt") return {
        name: 'Matching terminated state',
        message: '"halt" cannot appear as a match state, as the machine is terminated.',
        line: rule.line,
    };
    else if (rule.state === "start") hasStart = true;
    else lhsStates.add(rule.state);
    if (rule.nextState === "halt") hasHaltWrite = true;
    else if (rule.nextState !== "start" && rule.nextState !== undefined) rhsStates.add(rule.nextState);
    const key = `${rule.state}\0${rule.character}`;
    if (index.has(key)) return {
      name: "Unreachable rule",
      message: `Rule (${rule.state}, ${rule.character}) is unreachable`,
      line: rule.line,
    };
    index.set(key, i);
  }

  if (!hasStart) return {
      name: "No entry point",
      message: 'No rule matches state "start". The machine has no entry point.',
  };

  if (!hasHaltWrite) return {
      name: "Never terminates",
      message: 'No rule transitions to "halt". The machine can never terminate normally.',
  };

  const deadState = Array.from(lhsStates).find((state) => !rhsStates.has(state));
  if (deadState !== undefined) return {
    name: "Dead state",
    message: `State ${deadState} is matched but never assigned`,
    line: (rules.find((rule) => rule.state === deadState) as Rule).line,
  };

  const sinkState = Array.from(rhsStates).find((state) => !lhsStates.has(state));
  if (sinkState !== undefined) return {
    name: "Sink state",
    message: `State ${sinkState} is assigned but never matched`,
    line: (rules.find((rule) => rule.nextState === sinkState) as Rule).line,
  };

  return { rules: rules, index: index };
}
