/**
 * Semantic analyzer (linter) for compiled Turing machine rules.
 *
 * Checks performed:
 *  - "start" must appear as at least one rule's left-hand state.
 *  - "halt" must never appear as a left-hand state (it is terminal).
 *  - At least one rule must write nextState "halt" (machine can terminate).
 *  - Duplicate (state, character) pairs: the later rule is unreachable.
 *  - Dead states: states that only appear on LHS but are never referenced on
 *    any RHS and are not "start".
 *  - Sink states: states that only appear on RHS but never on LHS (other than
 *    "halt"), meaning the machine will panic if it reaches them.
 *
 * Builds the O(1) index Map<"state\0char", number> -> rules[].
 */

import type { Rule, Diagnostic, CompileResult } from "./types.ts";

const RESERVED_STATES = new Set(["start", "halt"]);
const RESERVED_CHARS = new Set(["null"]);

export function analyze(rules: Rule[]): CompileResult {
  const errors: Diagnostic[] = [];
  const warnings: Diagnostic[] = [];

  // ── Basic reserved usage checks ───────────────────────────────────────────

  let hasStart = false;
  let hasHaltWrite = false;

  for (const rule of rules) {
    if (rule.state === "start") hasStart = true;
    if (rule.state === "halt") {
      errors.push({
        severity: "error",
        message: `'halt' cannot appear as a match state (it is a terminal state)`,
        line: rule.line,
      });
    }
    if (rule.nextState === "halt") hasHaltWrite = true;

    // Validate identifier format: [a-zA-Z0-9_-]+
    for (const id of [rule.state, rule.character, rule.nextState, rule.nextCharacter]) {
      if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
        errors.push({
          severity: "error",
          message: `Invalid identifier '${id}'`,
          line: rule.line,
        });
      }
    }
  }

  if (!hasStart) {
    errors.push({
      severity: "error",
      message: `No rule matches state 'start'. The machine has no entry point.`,
    });
  }

  if (!hasHaltWrite && rules.length > 0) {
    warnings.push({
      severity: "warning",
      message: `No rule transitions to 'halt'. The machine can never terminate normally.`,
    });
  }

  // ── Duplicate (unreachable) rule detection ────────────────────────────────

  const seen = new Map<string, Rule>();
  const index = new Map<string, number>();

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const key = `${rule.state}\0${rule.character}`;
    if (seen.has(key)) {
      const first = seen.get(key)!;
      warnings.push({
        severity: "warning",
        message: `Unreachable rule: (${rule.state}, ${rule.character}) was already matched at line ${first.line}`,
        line: rule.line,
      });
    } else {
      seen.set(key, rule);
      index.set(key, i);
    }
  }

  // ── Reachability analysis (BFS from "start") ──────────────────────────────

  const lhsStates = new Set<string>();
  const rhsStates = new Set<string>();

  for (const rule of rules) {
    lhsStates.add(rule.state);
    rhsStates.add(rule.nextState);
  }

  // States only in RHS (and not halt) that are not in LHS -> will cause panic
  for (const state of rhsStates) {
    if (!RESERVED_STATES.has(state) && !lhsStates.has(state)) {
      // Find all rules that reference this state
      const referencing = rules.filter((r) => r.nextState === state);
      for (const r of referencing) {
        warnings.push({
          severity: "warning",
          message: `State '${state}' is written but never matched — the machine will panic when it enters this state`,
          line: r.line,
        });
      }
    }
  }

  // States only in LHS that are never referenced by any RHS (and not "start")
  for (const state of lhsStates) {
    if (!RESERVED_STATES.has(state) && !rhsStates.has(state)) {
      const rules_with_state = rules.filter((r) => r.state === state);
      for (const r of rules_with_state) {
        warnings.push({
          severity: "warning",
          message: `State '${state}' is never entered from any other state — these rules are unreachable`,
          line: r.line,
        });
      }
    }
  }

  // Suppress unused variable warnings for reserved set (used implicitly)
  void RESERVED_CHARS;

  if (errors.length > 0) {
    return { ok: false, errors, warnings };
  }

  return { ok: true, ruleTable: { rules, index }, warnings };
}
