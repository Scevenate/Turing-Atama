import { describe, it, expect } from "vitest";
import { compile } from "@/lib/compiler.ts";

describe("compile", () => {
  it("parses a minimal rule without direction", () => {
    const result = compile("start, 1: halt, 1,");
    expect(result).toEqual([
      {
      state: "start",
      character: "1",
      nextState: "halt", 
      nextCharacter: "1",
      line: 1,
    }]);
  });

  it("parses a rule with right direction", () => {
    const result = compile("start, null: start, null, >");
    expect(result).toEqual([
        {
          state: "start",
          character: "null",
          nextState: "start",
          nextCharacter: "null",
          move: ">",
          line: 1,
        }
      ]);
  });

  it("parses a rule with left direction", () => {
    const result = compile("start, null: halt, null, <");
    expect(result).toEqual([
      {
        state: "start",
        character: "null",
        nextState: "halt",
        nextCharacter: "null",
        move: "<",
        line: 1,
      },
    ]);
  });

  it("ignores comment lines", () => {
    const result = compile("# this is a comment\nstart, 1: halt, 1,");
    expect(result).toEqual([
      {
      state: "start",
      character: "1",
      nextState: "halt",
      nextCharacter: "1",
      line: 2,
    }]);
  });

  it("ignores inline comments", () => {
    const result = compile("start, 1: halt, 1, # inline");
    expect(result).toEqual([
      {
      state: "start",
      character: "1",
      nextState: "halt",
      nextCharacter: "1",
      line: 1,
    }]);
  });

  it("ignores empty lines", () => {
    const result = compile("\n\n  \nstart, 1: halt, 1,\n\n");
    expect(result).toEqual([
      {
      state: "start",
      character: "1",
      nextState: "halt",
      nextCharacter: "1",
      line: 4,
    }]);
  });

  it("parses multiple rules", () => {
    const src = [
      "start, 0: write1, 1, >",
      "write1, null: halt, null,",
    ].join("\n");
    const result = compile(src);
    expect(result).toEqual([
      {
      state: "start",
      character: "0",
      nextState: "write1",
      nextCharacter: "1",
      move: ">",
      line: 1,
    },
    {
      state: "write1",
      character: "null",
      nextState: "halt",
      nextCharacter: "null",
      line: 2,
      },
    ]);
  });

  it("error on dead rule", () => {
    const result = compile("start, 1: ,,\nstart, 2: halt, 2, <");
    expect(result).toHaveProperty("name", "Dead rule");
  });

  it("returns error for unexpected character", () => {
    const result = compile("start, 1: halt, @");
    expect(result).toHaveProperty("name", "Invalid character");
  });
});
