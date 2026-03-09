import { describe, it, expect } from "vitest";
import { compile } from "@/lib/compiler.ts";
import { analyze } from "@/lib/linter.ts";
import { step } from "@/lib/interpreter.ts";
import type { RuleTable, Machine, Tape } from "../lib/types.ts";

function makeRuleTable(source: string): RuleTable {
  const compileResult = compile(source);
  if ("name" in compileResult) throw new Error("Compile error");
  const analyzeResult = analyze(compileResult);
  if ("name" in analyzeResult) throw new Error("Analyze error");
  return analyzeResult;
}

function runToHalt(tape: Tape, ruleTable: RuleTable, maxSteps = 1000) {
  let steps = 0;
  const machine: Machine = { tape: tape, head: 0, state: "start", ruleTable };
  while (steps < maxSteps) {
    const result = step(machine);
    steps++;
    if (result.result === "halt" || result.result === "panic") return { result, steps };
  }
  return { result: { result: "timeout" }, steps };
}

describe("step", () => {
  it("halts immediately with a halt rule", () => {
    const rt = makeRuleTable("start, 1: halt, 1,");
    const tape = new Map([[0, "1"]]);
    const { result, steps } = runToHalt(tape, rt);
    expect(result.result).toBe("halt");
    expect(steps).toBe(1);
  });

  it("moves head right", () => {
    const rt = makeRuleTable("start, 1: halt, 1, >");
    const tape = new Map([[0, "1"]]);
    const { result, steps } = runToHalt(tape, rt);
    expect(result.result).toBe("halt");
    expect(steps).toBe(1);
  });

  it("moves head left", () => {
    const rt = makeRuleTable("start, 1: halt, 1, <");
    const tape = new Map([[0, "1"]]);
    const { result, steps } = runToHalt(tape, rt);
    expect(result.result).toBe("halt");
    expect(steps).toBe(1);
  });

  it("writes a character", () => {
    const rt = makeRuleTable("start, 1: halt, 0,");
    const tape = new Map([[0, "1"]]);
    const { result, steps } = runToHalt(tape, rt);
    expect(result.result).toBe("halt");
    expect(steps).toBe(1);
    expect(tape.get(0)).toBe("0");
  });

  it("panics when no rule matches", () => {
    const rt = makeRuleTable("start, 1: halt, 1,");
    const tape = new Map([[0, "0"]]); // no rule for (start, 0)
    const { result, steps } = runToHalt(tape, rt);
    expect(result.result).toBe("panic");
    expect(steps).toBe(1);
  });

  it("writes null erases a cell", () => {
    const rt = makeRuleTable("start, 1: halt, null,");
    const tape = new Map([[0, "1"]]);
    const { result, steps } = runToHalt(tape, rt);
    expect(result.result).toBe("halt");
    expect(steps).toBe(1);
    expect(tape.get(0)).toBe(undefined);
  });

  it("null head test", () => {
    const rt = makeRuleTable("start, null: halt, null, >");
    const tape = new Map<number, string>([]);
    const { result, steps } = runToHalt(tape, rt);
    expect(result.result).toBe("halt");
    expect(steps).toBe(1);
  });
});

describe("unary increment", () => {
  // Program: tape has N '1's. Add one '1' at the end.
  // Approach: scan right until null, write 1, halt.
  const src = [
    "start, 1: start, 1, >",
    "start, null: halt, 1,",
  ].join("\n");

  it("increments unary 1 (tape: [1]) to [1,1]", () => {
    const rt = makeRuleTable(src);
    const tape = new Map([[0, "1"]]);
    const { result } = runToHalt(tape, rt);
    expect(result.result).toBe("halt");
    expect(tape.get(0)).toBe("1");
    expect(tape.get(1)).toBe("1");
  });

  it("increments unary 3 (tape: [1,1,1]) to [1,1,1,1]", () => {
    const rt = makeRuleTable(src);
    const tape = new Map([[0, "1"], [1, "1"], [2, "1"]]);
    const { result, steps } = runToHalt(tape, rt);
    expect(result.result).toBe("halt");
    expect(steps).toBe(4);
    expect(tape.get(3)).toBe("1");
  });
});
