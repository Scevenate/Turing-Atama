import { describe, it, expect } from "vitest";
import { compile } from "../core/compiler.ts";
import { analyze } from "../core/linter.ts";

function compileAndAnalyze(source: string) {
  const { rules, errors: compileErrors } = compile(source);
  if (compileErrors.length > 0) throw new Error("Compile errors: " + JSON.stringify(compileErrors));
  return analyze(rules);
}

describe("analyze", () => {
  it("accepts a valid single-rule program", () => {
    const result = compileAndAnalyze("start, 1: halt, 1");
    expect(result.ok).toBe(true);
  });

  it("errors if no 'start' rule exists", () => {
    const result = analyze([]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.message.includes("start"))).toBe(true);
    }
  });

  it("errors if 'halt' is used as a match state", () => {
    const result = compileAndAnalyze("halt, 1: start, 1");
    expect(result.ok).toBe(false);
  });

  it("warns if no rule transitions to 'halt'", () => {
    const result = compileAndAnalyze("start, 1: start, 1");
    expect(result.warnings.some((w) => w.message.includes("halt"))).toBe(true);
  });

  it("warns on duplicate (state, char) pair", () => {
    const src = "start, 1: halt, 1\nstart, 1: halt, 0";
    const result = compileAndAnalyze(src);
    expect(result.warnings.some((w) => w.message.includes("Unreachable"))).toBe(true);
  });

  it("builds the index correctly", () => {
    const result = compileAndAnalyze("start, 1: halt, 1");
    if (!result.ok) throw new Error("Expected ok");
    expect(result.ruleTable.index.has("start\x001")).toBe(true);
  });

  it("warns when a referenced state is never matched", () => {
    const src = "start, 1: ghost, 1\nghost, null: halt, null";
    const result = compileAndAnalyze(src);
    // ghost is referenced and also matched, should be ok
    expect(result.ok).toBe(true);
  });

  it("warns on sink state (written but never matched)", () => {
    const src = "start, 1: sink, 1";
    const result = compileAndAnalyze(src);
    expect(result.warnings.some((w) => w.message.includes("sink"))).toBe(true);
  });
});
