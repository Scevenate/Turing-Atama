import { describe, it, expect } from "vitest";
import { compile } from "../core/compiler.ts";
import { analyze } from "../core/linter.ts";
import { step, buildTape, cloneTape, readCell } from "../core/interpreter.ts";
import type { RuleTable, Tape } from "../core/types.ts";

function makeRuleTable(source: string): RuleTable {
  const { rules, errors } = compile(source);
  if (errors.length > 0) throw new Error("Compile error");
  const result = analyze(rules);
  if (!result.ok) throw new Error("Analyze error: " + JSON.stringify(result.errors));
  return result.ruleTable;
}

function runToHalt(tape: Tape, ruleTable: RuleTable, maxSteps = 1000) {
  let steps = 0;
  while (steps < maxSteps) {
    const { result } = step(tape, ruleTable);
    steps++;
    if (result === "halt" || result === "panic") return { result, steps };
  }
  return { result: "timeout", steps };
}

describe("step", () => {
  it("halts immediately with a halt rule", () => {
    const rt = makeRuleTable("start, 1: halt, 1");
    const tape = buildTape({ 0: "1" });
    const { result } = step(tape, rt);
    expect(result).toBe("halt");
  });

  it("moves head right", () => {
    const rt = makeRuleTable("start, 1: halt, 1, >");
    const tape = buildTape({ 0: "1" });
    step(tape, rt);
    expect(tape.head).toBe(1);
  });

  it("moves head left", () => {
    const rt = makeRuleTable("start, 1: halt, 1, <");
    const tape = buildTape({ 0: "1" });
    step(tape, rt);
    expect(tape.head).toBe(-1);
  });

  it("writes a character", () => {
    const rt = makeRuleTable("start, 1: halt, 0");
    const tape = buildTape({ 0: "1" });
    step(tape, rt);
    expect(readCell(tape)).toBe("0");
  });

  it("panics when no rule matches", () => {
    const rt = makeRuleTable("start, 1: halt, 1");
    const tape = buildTape({ 0: "0" }); // no rule for (start, 0)
    const { result } = step(tape, rt);
    expect(result).toBe("panic");
  });

  it("reads blank cell as 'null'", () => {
    const tape = buildTape({});
    expect(readCell(tape)).toBe("null");
  });

  it("writes null erases a cell", () => {
    const rt = makeRuleTable("start, 1: halt, null");
    const tape = buildTape({ 0: "1" });
    step(tape, rt);
    expect(tape.cells.has(0)).toBe(false);
  });
});

describe("unary increment", () => {
  // Program: tape has N '1's. Add one '1' at the end.
  // Approach: scan right until null, write 1, halt.
  const src = [
    "start, 1: start, 1, >",
    "start, null: halt, 1",
  ].join("\n");

  it("increments unary 1 (tape: [1]) to [1,1]", () => {
    const rt = makeRuleTable(src);
    const tape = buildTape({ 0: "1" });
    const { result } = runToHalt(tape, rt);
    expect(result).toBe("halt");
    expect(tape.cells.get(0)).toBe("1");
    expect(tape.cells.get(1)).toBe("1");
  });

  it("increments unary 3 (tape: [1,1,1]) to [1,1,1,1]", () => {
    const rt = makeRuleTable(src);
    const tape = buildTape({ 0: "1", 1: "1", 2: "1" });
    runToHalt(tape, rt);
    expect(tape.cells.get(3)).toBe("1");
  });
});

describe("cloneTape", () => {
  it("produces an independent copy", () => {
    const tape = buildTape({ 0: "1", 1: "0" });
    const clone = cloneTape(tape);
    tape.cells.set(0, "X");
    expect(clone.cells.get(0)).toBe("1");
  });
});
