import { describe, it, expect } from "vitest";
import { levels } from "../levels/levels.ts";

describe("level id", () => {
  it("is globally unique across groups", () => {
    const ids = levels.flatMap(group => group.levels.map(level => level.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});