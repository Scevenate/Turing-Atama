import { describe, it, expect } from "vitest";
import { compile } from "../core/compiler.ts";

describe("compile", () => {
  it("parses a minimal rule without direction", () => {
    const { rules, errors } = compile("start, 1: halt, 1");
    expect(errors).toHaveLength(0);
    expect(rules).toHaveLength(1);
    expect(rules[0]).toMatchObject({
      state: "start",
      character: "1",
      nextState: "halt",
      nextCharacter: "1",
      move: undefined,
    });
  });

  it("parses a rule with right direction", () => {
    const { rules, errors } = compile("start, null: start, null, >");
    expect(errors).toHaveLength(0);
    expect(rules[0].move).toBe(">");
  });

  it("parses a rule with left direction", () => {
    const { rules, errors } = compile("start, null: halt, null, <");
    expect(errors).toHaveLength(0);
    expect(rules[0].move).toBe("<");
  });

  it("ignores comment lines", () => {
    const { rules, errors } = compile("# this is a comment\nstart, 1: halt, 1");
    expect(errors).toHaveLength(0);
    expect(rules).toHaveLength(1);
  });

  it("ignores inline comments", () => {
    const { rules, errors } = compile("start, 1: halt, 1 # inline");
    expect(errors).toHaveLength(0);
    expect(rules).toHaveLength(1);
  });

  it("ignores empty lines", () => {
    const { rules, errors } = compile("\n\n  \nstart, 1: halt, 1\n\n");
    expect(errors).toHaveLength(0);
    expect(rules).toHaveLength(1);
  });

  it("parses multiple rules", () => {
    const src = [
      "start, 0: write1, 1, >",
      "write1, null: halt, null",
    ].join("\n");
    const { rules, errors } = compile(src);
    expect(errors).toHaveLength(0);
    expect(rules).toHaveLength(2);
  });

  it("returns error for unexpected character", () => {
    const { errors } = compile("start, 1: halt, @");
    expect(errors).toHaveLength(1);
    expect(errors[0].severity).toBe("error");
    expect(errors[0].message).toMatch(/unexpected character/i);
  });

  it("returns error for incomplete rule", () => {
    const { errors } = compile("start, 1: halt");
    expect(errors).toHaveLength(1);
    expect(errors[0].severity).toBe("error");
  });

  it("continues parsing after an error on one line", () => {
    const src = "start, @: halt, 1\nstart, 1: halt, 1";
    const { rules, errors } = compile(src);
    expect(errors).toHaveLength(1);
    expect(rules).toHaveLength(1);
  });
});
