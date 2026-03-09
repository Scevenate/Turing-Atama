import { describe, it, expect } from "vitest";
import { compile } from "@/lib/compiler.ts";
import { analyze } from "@/lib/linter.ts";
import type { RuleTable, Error } from "../lib/types.ts";

function compileAndAnalyze(source: string): RuleTable | Error {
  const compileResult = compile(source);
  if ("name" in compileResult) throw new Error("Compile error");
  return analyze(compileResult);
}

describe("analyze", () => {
  it("accepts a valid single-rule program", () => {
    const result = compileAndAnalyze("start, 1: halt, 1,");
    expect(result).toEqual({
      rules: [
        {
          state: "start",
          character: "1",
          nextState: "halt",
          nextCharacter: "1",
          line: 1,
        }],
      index: new Map([["start\x001", 0]]),
    });
  });

  it("errors if no 'start' rule exists", () => {
    const result = compileAndAnalyze("ghost, 1: halt,,\nghost, 2: ghost,,");
    expect(result).toHaveProperty("name", "No entry point");
  });
  
  it("errors if 'halt' is used as a match state", () => {
    const result = compileAndAnalyze("halt, 1: halt,,\nstart, 1: halt,,");
    expect(result).toHaveProperty("name", "Matching terminated state");
  });

  it("errors if no rule transitions to 'halt'", () => {
    const result = compileAndAnalyze("start, 1: start, 1,");
    expect(result).toHaveProperty("name", "Never terminates");
  });

  it("errors on duplicate (state, char) pair", () => {
    const src = "start, 1: halt,,\nstart, 1: halt,,";
    const result = compileAndAnalyze(src);
    expect(result).toHaveProperty("name", "Unreachable rule");
  });

  it("errors sink state", () => {
    const src = "start, 1: ghost, 1,>\nstart, null: halt,,>";
    const result = compileAndAnalyze(src);
    expect(result).toHaveProperty("name", "Sink state");
  });

  it("errors dead state", () => {
    const src = "ghost, 1: halt, 1,\nstart, null: halt,,>";
    const result = compileAndAnalyze(src);
    expect(result).toHaveProperty("name", "Dead state");
  });
});
