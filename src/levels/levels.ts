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
      id: 0,
      title: "Increment",
      description: `This is the tutorial level.

Your job is to **write a Turing machine program** such that, given a start tape, the machine modifies the tape in the desired way.

In every level, the machine starts with the state \`start\` and head position 0. The machine halts when it enters the reserved state \`halt\`.

In this level, the cells 0 to n is filled with character \`1\`. Your job is to append another \`1\` to the right.

Now consider what should we instruct the Turing machine. First, the machine starts with state \`start\` and character \`1\`, so we need to address that.

Do we need to update the state? No, we just want the machine to move right consequtively.

Do we need to update the character? No, we want to keep the current character as is.

Do we need to move the head? Yes, we want to move the head right.

Therefore, we write the following line:

\`start, 1: start, 1, >\`

This line tells the Turing machine, when the current state is \`start\` and the current character is \`1\`, update the current state to \`start\`, update the current character to \`1\`, and move the head right one cell.

Since we did not change the state and character, this line can be simplified into \`start, 1: ,, >\`, in which the new state and new character are left blank to indicate no changes.

Okay, now consider what happens next. The machine will all the way move to the end of the array. Then, the machine will meet a blank cell, with a state \`start\`. Here, we want the Turing machine to append the \`1\`, and halt. Therefore we add another line:

\`start, null: halt, 1,\`

This line tells the Turing machine, when the current state is \`start\`, the current character is \`null\` (which is the reserved character meaning empty), update the state into \`halt\` and write the current chararcter \`1\`. Then, don't move.

After executing this rule, the Turing machine will stop because it's in state \`halt\`. The tape is successfully modified and the machine halted, this clears the level.

Now, with the two lines of rules specified above, hit the **Run** button on top, and you've just solved your first level!
`,
      startTape: new Map([[0, "1"], [1, "1"], [2, "1"], [3, "1"], [4, "1"], [5, "1"], [6, "1"], [7, "1"], [8, "1"], [9, "1"]]),
      validate: (tape: Tape) => {
        if (tape.size !== 11) return false;
        for (let i = 0; i < 11; i++) {
          if (tape.get(i) !== "1") return false;
        }
        return true
      },
    }]}, {
    name: "Basics", levels: [
    {
      id: 1,
      title: "Decrement",
      description: `The cells [0, n] are filled with \`1\`. Please erase the right most \`1\`.

n > 0. The rest of the tape must be empty.`,
      startTape: new Map([[0, "1"], [1, "1"], [2, "1"], [3, "1"], [4, "1"], [5, "1"], [6, "1"], [7, "1"], [8, "1"], [9, "1"]]),
      validate: (tape: Tape) => {
        if (tape.size !== 9) return false;
        for (let i = 0; i < 9; i++) {
          if (tape.get(i) !== "1") return false;
        }
        return true;
      },
    }, {
      id: 2,
      title: "Addition",
      description: `The cells [0, n] and [n+m, n+m+k] are filled with \`1\`. Please merge the two arrays into one [0, n+k+1] array.
      
n, m, k > 0. The rest of the tape must be empty.`,
      startTape: new Map([[0, "1"], [1, "1"], [2, "1"], [3, "1"], [4, "1"], [5, "1"], [6, "1"], [7, "1"], [8, "1"], [10, "1"], [11, "1"], [12, "1"], [13, "1"], [14, "1"]]),
      validate: (tape: Tape) => {
        if (tape.size !== 14) return false;
        for (let i = 0; i < 14; i++) {
          if (tape.get(i) !== "1") return false;
        }
        return true;
      },
    }, {
      id: 3,
      title: "Comparison",
      description: `The cells [n, n+m] and [n+m+k, n+m+k+l] are filled with \`1\`.

If the left array is longer, please write cell 0 to \`L\`.

If the right array is longer, please write cell 0 to \`R\`.

If the two arrays are equally long, please write cell 0 to \`E\`.

n, m, k, l > 0. You may modify the rest of the tape as you wish.`,
      startTape: new Map([[8, "1"], [9, "1"], [10, "1"], [11, "1"], [14, "1"], [15, "1"], [16, "1"], [17, "1"], [18, "1"]]),
      validate: (tape: Tape) => {
        return tape.get(0) === "R";
      },
    }]}, {
    name: "Algorithm", levels: [
    {
      id: 5,
      title: "Sort",
      description: `Aligned to n, five arrays [0, a], [n, n+b], [2n, 2n+c], [3n, 3n+d], [4n, 4n+e] are filled with \`1\`.

Please sort the five arrays in length ascending order. Preserve the current alignment scheme.

n > a, b, c, d, e > 0. a, b, c, d, e are distinct. The rest of the tape must be empty.`,
      startTape: new Map([[0, "1"], [1, "1"], [2, "1"], [10, "1"], [11, "1"], [20, "1"], [21, "1"], [22, "1"], [23, "1"], [24, "1"], [30, "1"], [40, "1"], [41, "1"], [42, "1"], [43, "1"]]),
      validate: (tape: Tape) => {
        if (tape.size !== 15) return false;
        for (let index of [0, 10, 11, 20, 21, 22, 30, 31, 32, 33, 40, 41, 42, 43, 44]) {
          if (tape.get(index) !== "1") return false;
        }
        return true;
      },
    }]}
];