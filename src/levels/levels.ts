import type { Tape } from "../lib/types.ts";

export interface Level {
  id: number,  //  This id is globally unique across groups
  title: string;
  description: string;  //  Markdown
  startTape: Tape;
  validate(tape: Tape): boolean;
}

export interface LevelGroup {
  name: string;
  levels: Level[];
}

export const levels: LevelGroup[] = [
  {
    name: "Tutorial", levels: [
    {
      id: 1,
      title: "What's a Turing machine?",
      description: `This is Tutorial 1.`,
      startTape: new Map([]),
      validate: () => {
        return true;
      },
    }]}, {
    name: "Basics", levels: [
    {
      id: 0,
      title: "Append 1 to array",
      description: `The cells [0, n] are filled with 1. Please append another 1 to the end.

No other tape modification is allowed.`,
      startTape: new Map([[0, "1"], [1, "1"], [2, "1"], [3, "1"]]),
      validate: (tape: Tape) => {
        if (tape.size !== 5) return false;
        for (let i = 0; i < 5; i++) {
          if (tape.get(i) !== "1") return false;
        }
        return true;
      },
    }, {
      id: 2,
      title: "Erase last 1 in array",
      description: `The cells [0, n] are filled with 1. Please erase the last 1.
      
No other tape modification is allowed.`,
      startTape: new Map([[0, "1"], [1, "1"], [2, "1"], [3, "1"], [4, "1"], [5, "1"], [6, "1"]]),
      validate: (tape: Tape) => {
        if (tape.size !== 6) return false;
        for (let i = 0; i < 6; i++) {
          if (tape.get(i) !== "1") return false;
        }
        return true;
      },
    }, {
      id: 3,
      title: "Find the middle cell in array",
      description: `The cells [0, 2n] are filled with 1. Please write the cell n to 2.

You may modify the rest of the tape as you wish, but shall and only shall cell n be filled with 2.`,
      startTape: new Map([[0, "1"], [1, "1"], [2, "1"], [3, "1"], [4, "1"], [5, "1"], [6, "1"]]),
      validate: (tape: Tape) => {
        if (Array.from(tape.values()).filter(v => v === "2").length !== 1) return false;
        return tape.get(3) === "2";
      },
    }, {
      id: 4,
      title: "Duplicate the array",
      description: `The cells [1, n] are filled with 1. Please fill all [1, 2n] with 1.

You may modify the rest of the tape as you wish, but shall and only shall cells [1, 2n] be filled with 1.`,
      startTape: new Map([[0, "1"], [1, "1"], [2, "1"], [3, "1"], [4, "1"]]),
      validate: (tape: Tape) => {
        if (Array.from(tape.values()).filter(v => v === "1").length !== 10) return false;
        for (let i = 1; i < 11; i++) {
          if (tape.get(i) !== "1") return false;
        }
        return true;
      },
    }]}, {
    name: "Arithmetic", levels: [
    {
      id: 5,
      title: "Compare",
      description: `The cells [-m, -1] and [1, n] are filled with 1.

- If m < n, write L to cell 0.
- If m = n, write E to cell 0.
- If m > n, write G to cell 0.

You may modify the rest of the tape as you wish. Only cell 0 is checked.`,
      startTape: new Map([[-4, "1"], [-3, "1"], [-2, "1"], [-1, "1"], [1, "1"], [2, "1"], [3, "1"]]),
      validate: (tape: Tape) => {
        return tape.get(0) === "G";
      },
    }]}
];