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
    name: "Basics", levels: [
    {
      id: 1,
      title: "Welcome: Decrement",
      description: `Welcome! This is your first Turing Atama level.

Your job here is to **write a Turing machine program** such that, given a start tape, the machine modifies the tape in the desired way.

In every level, the machine starts with the state \`start\` and head position 0. The machine halts when it enters the reserved state \`halt\`.

In this level, the cells 1 to n is filled with character \`1\`. Your job is to erase the last \`1\` in the array.

Now consider what should we instruct the Turing machine. First, the machine starts with state \`start\` and character \`base\`, so we need to address that.

Do we need to update the state? No, we just want the machine to move right consequtively.

Do we need to update the character? No, we want to keep the current character as is.

Do we need to move the head? Yes, we want to move the head right.

Therefore, we write the following line:

\`start, base: start, base, >\`

This line tells the Turing machine, when the current state is \`start\` and the current character is \`base\`, update the current state to \`start\`, update the current character to \`base\`, and move the head right one cell.

Since we did not change the state and character, this line can be simplified into \`start, base: ,, >\`, in which the new state and new character are left blank to indicate no changes.

Okay, now consider what happens next. The machine have moved to position \`1\`, which stores the character \`1\`. We still don't want to change anything, so we add another similar rule \`start, 1: ,, >\` to tell the Turing machine simply move right when the state is \`start\` and the character is \`1\`.

This will make the machine move all the way to the right. At cell n, the machine will make the final step and move out of the array. At cell n+1 stores a special character \`brk\` to signal the end of data. Now the state is \`start\` and character is \`brk\`. We want the Turing machine to go left and erase the rightmost \`1\`. How do we do that?

Firstly, we need to change the state. Otherwise after moving left, the match \`start, 1: ,, >\` will bring us into a dead loop. We need a new state, which we could give any name, suppose it's called \`1-clear_Des\` (just to show how arbitrary it is!).

Secondly, we're not told to change the data terminator brk so we'll leave the character unchanged.

Thirdly, sure we want to go back! Therefore, we add another rule:

\`start, brk: 1-clear_Des,, <\`

This will tell the machine go back, and we're now at the last \`1\`, at state \`1-clear_Des\`, it's finally coming to an end!

We want the machine to halt after this clearing step, therefore we'll let the machine transit into the resevred state \`halt\`.

We surely want to write this character, to clear it. We write this character to the special reserved character \`null\`, which is empty.

It doesn't matter if the Turing machine moves at this step. We're done! Therefore, we add one final rule: \`1-clear_Des, 1: halt, null,\`

After executing this rule, the machine will stop in state \`halt\`. The tape is successfully modified and the machine halted, this clears the level.

Now, write these four lines of rules in the program below, and hit the **Run** button on top, and you've just solved your first level!
`,
      startTape: new Map([[-1, "sp"],[0, "base"], [1, "1"], [2, "1"], [3, "1"], [4, "1"], [5, "1"], [6, "1"], [7, "1"], [8, "1"], [9, "brk"]]),
      validate: (tape: Tape) => {
        if (tape.get(0) != "base") return false;
        for (let i = 1; i < 8; i++) {
          if (tape.get(i) !== "1") return false;
        }
        if (tape.get(8) !== undefined) return false;
        if (tape.get(9) !== "brk") return false;
        return true;
      },
    },
    {
      id: 2,
      title: "Bit flip",
      description: `The cells 1 to n contains an array of 1s and 0s. Please flip every bit in the array.

The array is teminated by cell n+1 \`brk\`. You may modify the rest of the array as you wish.`,
      startTape: new Map([[-1, "sp"], [0, "base"], [1, "0"], [2, "1"], [3, "1"], [4, "0"], [5, "1"], [6, "0"], [7, "0"], [8, "0"], [9, "0"], [10, "0"], [11, "1"], [12, "1"], [13, "0"], [14, "1"], [15, "brk"]]),
      validate: (tape: Tape) => {
        const ref = ["1", "0", "0", "1", "0", "1", "1", "1", "1", "1", "0", "0", "1", "0"]
        for (let i = 1; i < 15; i++) {
          if (tape.get(i) !== ref[i-1]) return false;
        }
        return true;
      }
    }, {
      id: 3,
      title: "Find 1",
      description: `The cells 1 to n is an array of \`0\`. In which may or may not have a \`1\` inside.

If there is an \`1\`, please store a \`1\` at position -1. If there is not a \`1\`, please store a \`0\` at position \`-1\`.

You should update \`sp\` to position -2, and cell 0 and n+1 must remain \`base\` and \`brk\`. You may edit the rest of the tape as you wish.

Yes, it is possible to get a little cheesy on this. Sure you can! There's nothing wrong with that. This chapter is just to familiarize with Turing machine programming - but things are gonna get pretty wild really quick. So just make sure you're ready :)`,
      startTape: new Map([[-1, "sp"], [0, "base"], [1, "0"], [2, "0"], [3, "0"], [4, "0"], [5, "0"], [6, "0"], [7, "0"], [8, "0"], [9, "0"], [10, "0"], [11, "0"], [12, "0"], [13, "0"], [14, "1"], [15, "0"], [16, "0"], [17, "0"], [18, "brk"]]),
      validate: (tape: Tape) => {
        if (tape.get(-2) !== "sp") return false;
        if (tape.get(-1) !== "1") return false;
        if (tape.get(0) !== "base") return false;
        if (tape.get(18) !== "brk") return false;
        return true;
      }
    }]}, {
    name: "Subroutine", levels: [
    {
      id: 4,
      title: "Welcome: Find middle",
      description: `Starting from this level, it is better to design some subroutines to help you do the work. Plain Turing machine will still work, but eventually the complexity will become so overwhelming that it is impractical for human brain to do so anymore. Better adopt it early!

In this level, cells 1 to 2n+1 are filled with 1. You need to find the middle 1 and write it to 2. You may change the rest of the tape as you wish.

It is clear that this cannot be done in single pass. In this problem, we'll design a subroutine that, given an array of 1s, trims the first and last 1. By calling this subroutine iteratively, we can find the final 1 in this middle.

To formally design a subroutine, the following three things must be specified:

Firstly, the tape when the subroutine is being called. In this subroutine, relative to the calling cell, we would expect cell 0 to be \`base\`, 1 to n (n >= 3) to be \`1\`, and cell n+1 to be \`brk\`.

Secondly, how the subroutine is gonna change the tape. In this subroutine, relative to the calling cell, cell 1 is going to be written \`base\`and cell n is going to be written \`brk\`.

Thirdly, where will the subroutine return. A good and simple solution is to return where it started.

Now the subroutine is properly defined. Put into practice, the calling convention we're adopting here is to call the subroutine by setting the state \`trim-start\`. and the subroutine will return to state \`trim-halt\`. The subroutine is implemented as the rules specified below:

\`trim-start, base: trim-br,, >\`

\`trim-br, 1: trim-r, base, >\`

\`trim-r, 1: ,, >\`

\`trim-r, brk: trim-bl,, <\`

\`trim-bl, 1: trim-l, brk, <\`

\`trim-l, 1: ,, <\`

\`trim-l, base: trim-halt,, <\`

Now with the tool in hand, we're ready to solve this problem. We would just call this subroutine iteratively:

\`start, base: trim-start,,\`

\`trim-halt, base: trim-start,, >\`

But hold on! We need to stop when there's only one \`1\` left. So we change the last line into a new subroutine called test, that halts the machine when only one \`1\` is left:

\`trim-halt, base: test-start,, > # This calls the subroutine!\`

\`test-start, base: test-rr,, >\`

\`test-rr, 1: test-r,, >\`

\`test-r, 1: test-ll,, <\`

\`test-ll, 1: test-l,, <\`

\`test-l, base: test-halt,, <\`

\`test-halt, base: trim-start,, >\`

\`test-r, brk: test-f,, <\`

\`test-f, 1: halt, 2,\`

This clears the stage!

As you'll see in future chapters, it is generally not a good idea to spam your tape with \`base\` and \`brk\`. But for demostration purpose we chose this approach to simplify implementation.

One last note: everything in the line after a hashtag \`#\` is ignored (which is already shown above). Maybe comment your code!
`,
      startTape: new Map([[-1, "sp"], [0, "base"], [1, "1"], [2, "1"], [3, "1"], [4, "1"], [5, "1"], [6, "1"], [7, "1"], [8, "1"], [9, "1"], [10, "brk"]]),
      validate: (tape: Tape) => {
        return tape.get(5) === "2";
      },
    }, {
      id: 5,
      title: "Find mode",
      description: `The cells [0, 2n+1] are filled with 1s and 0s. Please find the mode and store it to cell -1.
      
You should update \`sp\` to position -2, and cell 0 and n+1 must remain \`base\` and \`brk\`. You may edit the rest of the take as you wish.`,
      startTape: new Map([[-1, "sp"], [0, "base"], [1, "0"], [2, "1"], [3, "1"], [4, "0"], [5, "0"], [6, "0"], [7, "0"], [8, "1"], [9, "0"], [10, "0"], [11, "1"], [12, "0"], [13, "1"], [14, "1"], [15, "1"], [16, "brk"]]),
      validate: (tape: Tape) => {
        if (tape.get(-2) !== "sp") return false;
        if (tape.get(-1) !== "0") return false;
        if (tape.get(0) !== "base") return false;
        if (tape.get(20) !== "brk") return false;
        return true;
      },
    }, {
      id: 6,
      title: "Sort",
      description: `m n-aligned \`1\`-arrays [1, l_0], [n+1, n+l_1], [2n+1, 2n+l_1], ..., [mn, mn+l_m] are on tape. It is guaranteed that all arrays are shorter than n, and the rest is empty. Cell (m+1)n+1 is \`brk\`.

Please sort the array in ascending order. There might be arrays of same length.

You must keep the arrays n-aligned, and not change \`base\` and \`brk\`.

This problem takes some effort; Real world sorting algorithms might inspire your subroutine design. Skills from the next chapter could also help with this one, so maybe you can leave it later. Personally my pure-finite in-place solution (no tape state storage) took 99 rules and 2,485 steps. It's not very optimal, so maybe you can beat me on that if you're that kind of person :)`,
      startTape: new Map([[-1, "sp"], [0, "base"],
        [1, "1"], [2, "1"], [3, "1"], [4, "1"], [5, "1"], [6, "1"], [7, "1"], [8, "1"],
        [11, "1"], [12, "1"], [13, "1"],
        [21, "1"], [22, "1"], [23, "1"], [24, "1"], [25, "1"], [26, "1"],
        [31, "1"], [32, "1"], [33, "1"],
        [41, "brk"]
         ]),
      validate: (tape: Tape) => {
        if (tape.get(0) !== "base") return false;
        for (let i = 1; i < 4; i++) {
          if (tape.get(i) !== "1") return false;
        }
        if (tape.get(4) !== undefined) return false;
        for (let i = 11; i < 14; i++) {
          if (tape.get(i) !== "1") return false;
        }
        if (tape.get(14) !== undefined) return false;
        for (let i = 21; i < 27; i++) {
          if (tape.get(i) !== "1") return false;
        }
        if (tape.get(27) !== undefined) return false;
        for (let i = 31; i < 39; i++) {
          if (tape.get(i) !== "1") return false;
        }
        if (tape.get(39) !== undefined) return false;
        if (tape.get(41) !== "brk") return false;
        return true;
      },
    }]}, {
      name: "State", levels: [
        {
          id: 7,
          title: "Welcome: Power of 2",
          description: `Up till this point, \`sp\` still doesn't seem useful. It shouldn't be a very surprising result - we didn't utilize the negative side of the tape at all. But not any more!

So far, everything we've done is in place, with a strictly finite state only. But sometimes some indefinite storage would be great, like it would be helpful to store the total amount of numbers in a sorting problem. But that's not a finite information, therefore we must rely on our tape to persist that information.

The left side of the tape is reserved for this purpose. It is purposely left undefined in level descriptions that the left side of the tape may serve your program runtime use. Unless otherwise specified, the negative side of the tape is never checked for level completeness. (But it's still recommended to bound your runtime by \`sp\`, just as \`brk\` for data.)

In this level, cells [1, n] are filled with an array of \`1\`. You need to fill cells [1, 2^n] with \`1\`. Cell 0 must be left \`base\`, and cell 2^n+1 must be \`brk\`.

Power is recursively defined. Therefore, we want to design a subroutine that iteratively solves the problem. The subroutine will multiply a data by 2. However, we must keep track of the power count. This is where the left comes in. We design a subroutine that:

1. Starts with base. decrese the left stored value by 1.

2. multiply the right array by 2.

3. return at base.

For setup, we need to move the initial array to left, and leave right to 1. For halting, the subroutine will halt when the left has nothing to decrease.

An implementation:

\`start, base: setup-move1,, >\`

\`setup-move1, 1: ,, >\`

\`setup-move1, brk: setup-move2,, <\`

\`setup-move2, 1: setup-move3, brk, <\`

\`setup-move3, 1: ,, <\`

\`setup-move3, base: setup-move4,, <\`

\`setup-move4, 1: ,, <\`

\`setup-move4, sp: setup-move5,, >\`

\`setup-move4, null: setup-move5,, >\`

\`setup-move5, 1: ,, >\`

\`setup-move5, base: setup-move1,, >\`

\`setup-move2, base: setup-keepup1,, >\`

\`setup-keepup1, brk: setup-keepup2, 1, <\`

\`setup-keepup2, base: mult-start,,\`

\`mult-start, base: mult-dec-find,, <\`

\`mult-dec-find, 1: ,, <\`

\`mult-dec-find, null: mult-dec,, >\`

\`mult-dec, base: halt,,\`

\`mult-dec, 1: mult-dec-back, null, >\`

\`mult-dec-back, 1: ,, >\`

\`mult-dec-back, base: mult-find,, >\`

\`mult-find, 2: ,, >\`

\`mult-find, 1: mult-add, 2, >\`

\`mult-add, 1: ,, >\`

\`mult-add, 3: ,, >\`

\`mult-add, brk: mult-back, 3, <\`

\`mult-add, null: mult-back, 3, <\`

\`mult-back, 3: ,, <\`

\`mult-back, 2: ,, <\`

\`mult-back, 1: ,, <\`

\`mult-back, base: mult-find,, >\`

\`mult-find, 3: mult-clear,, >\`

\`mult-clear, 3: ,, >\`

\`mult-clear, brk: mult-h,, <\`

\`mult-clear, null: mult-h, brk, <\`

\`mult-h, 3: , 1, <\`

\`mult-h, 2: , 1, <\`

\`mult-h, base: mult-start,,\`

`,
          startTape: new Map([[-1, "sp"], [0, "base"], [1, "1"], [2, "1"], [3, "1"], [4, "1"], [5, "brk"]]),
          validate: (tape: Tape) => {
            if (tape.get(0) !== "base") return false;
            for (let i = 1; i < 17; i++) {
              if (tape.get(i) !== "1") return false;
            }
            if (tape.get(17) !== "brk") return false;
            return true
          }
        }, {
          id: 8,
          title: "Find maximum difference",
          description: `m n-aligned \`1\`-arrays [1, l_0], [n+1, n+l_1], [2n+1, 2n+l_1], ..., [mn, mn+l_m] are on tape. It is guaranteed that all arrays are shorter than n, and the rest is empty. Cell (m+1)n+1 is \`brk\`.

The adjacent difference is the signed difference between the later number and the former number. Plase find the maximum adjacent difference and store it to [-n, -1]. Store 0 if all such difference is negative.

Cell -n-1 must be \`sp\`, cell 0 must be \`base\`. You may edit the rest of the tape as you wish.
          `,
          startTape: new Map([[-1, "sp"], [0, "base"],
            [1, "1"], [2, "1"],
            [6, "1"], [7, "1"], [8, "1"],
            [11, "1"],
            [16, "1"], [17, "1"], [18, "1"], [19, "1"],
            [21, "1"], [22, "1"], [23, "1"],
            [26, "brk"]
          ]),
          validate: (tape: Tape) => {
            if (tape.get(-4) !== "sp") return false;
            for (let i = -3; i < 0; i++) {
              if (tape.get(i) !== "1") return false;
            }
            if (tape.get(0) !== "base") return false;
            return true;
          }
        },
        {
          id: 9,
          title: "Factorial",
          description: `Cells [1, n] are filled with 1. Please fill cells [1, n!] with 1.

You must keep cell 0 \`base\`, and write cell n!+1 \`brk\`. You may edit the rest of the tape as you wish.`,
          startTape: new Map([[-1, "sp"], [0, "base"], [1, "1"], [2, "1"], [3, "1"], [4, "1"], [5, "brk"]]),
          validate: (tape: Tape) => {
            if (tape.get(0) !== "base") return false;
            for (let i = 1; i < 25; i++) {
              if (tape.get(i) !== "1") return false;
            }
            if (tape.get(25) !== "brk") return false;
            return true;
          }
        }
      ]
    }, {
    name: "Function", levels: [
    {
      id: 10,
      title: "Welcome: Factorial",
      description: `So far, we've utilized the negative side of the tape as a global storage. But sometimes we might want a subroutine to operate with its own state storage. This is when function comes in.

A function is a subroutine that, with the help of the follwing extra restrictions, operates its own state storage:

1. When called, relative to its calling cell, cell -1 is always \`sp\`, cell 0 is always \`base_ret-state\`. The data \`base\` and \`brk\` is somewhere on the right.

2. The function may store its state on left, modify previous function states on right, and the data on far right.

3. When return, \`func-halt\` should halt on its base \`base_ret-state\`. State \`func-halt\`, character \`base_ret-state\` should transit to state \`ret-state\` and write \`sp\`.

This might seems overwhelming at first, but the systematic approach empowers us to conquer problems of even bigger scale with clarity. In this level, we'll rewrite the previous iterative factorial to recursive functional approach for demostration. Cells [1, n] are filled with \`1\`. Your job is to fill cells [1, n!] with \`1\`.

We need to design the function that:

1. Takes a parameter n, halts if n is 0.

2. Multiplies the data array with n+1.

3. Call itself with parameter n-1.

Formally:

1. Accepts a null-terminated 1-array in relative cells [1, n]. This is the parameter.

2. Pushes a n length 2-array onto its stack. Multiplies the data with this array, in which process the 2s are overwritten to 1.

3. Write cell -1 to null. Then, call itself again.

And an implementation:

\`# Setup first function frame\`

\`start, base: setup-1,, >\`

\`setup-1, 2: ,, >\`

\`setup-1, 1: setup-2, 2, <\`

\`setup-2, 2: ,, <\`

\`setup-2, base: ,, <\`

\`setup-2, 1: ,, <\`

\`setup-2, null: setup-3, 1, >\`

\`setup-2, sp: setup-3, 1, >\`

\`setup-3, 1: ,, >\`

\`setup-3, base: setup-1,, >\`

\`setup-1, brk: setup-4,, <\`

\`setup-4, 2: , 1, <\`

\`setup-4, base: setup-5,, <\`

\`setup-5, 1: setup-6, null, <\`

\`setup-6, 1: ,, <\`

\`setup-6, null: setup-7, sp, >\`

\`setup-7, 1: fac-start, base_fac-call,\`

\`# Function def\`

\`fac-start, base_fac-call: fac-pull1,, >\`

\`fac-pull1, 2: ,, >\`

\`fac-pull1, 1: fac-pull2, 2, <\`

\`fac-pull2, 2: ,, <\`

\`fac-pull2, base_fac-call: fac-push2,, <\`

\`fac-push2, 2: ,, <\`

\`fac-push2, sp: fac-pull3, 2, >\`

\`fac-push2, null: fac-pull3, 2, >\`

\`fac-pull3, 2: ,, >\`

\`fac-pull3, base_fac-call: fac-pull1,, >\`

\`fac-pull1, null: fac-clear1,, <\`

\`fac-clear1, 2: , 1, <\`

\`fac-clear1, base_fac-call: fac-clearsp,, <\`

\`fac-clearsp, 2: ,, <\`

\`fac-clearsp, null: fac-mult1, sp, >\`

\`fac-clearsp, sp: halt,,\`

\`fac-mult1, 1: ,, >\`

\`fac-mult1, 2: fac-mult2, 1, >\`

\`fac-mult2, 2: ,, >\`

\`fac-mult2, base_fac-call: ,, >\`

\`fac-mult2, 1: ,, >\`

\`fac-mult2, null: ,, >\`

\`fac-mult2, base: fac-mult3,, >\`

\`fac-mult3, 2: ,, >\`

\`fac-mult3, 1: fac-mult4, 2, >\`

\`fac-mult4, 1: ,, >\`

\`fac-mult4, 3: ,, >\`

\`fac-mult4, null: fac-mult5, 3, <\`

\`fac-mult4, brk: fac-mult5, 3, <\`

\`fac-mult5, 3: ,, <\`

\`fac-mult5, 1: ,, <\`

\`fac-mult5, 2: ,, <\`

\`fac-mult5, base: fac-mult3,, >\`

\`fac-mult3, 3: fac-mult6,, <\`

\`fac-mult6, 2: , 1, <\`

\`fac-mult6, base: fac-mult7,, <\`

\`fac-mult7, null: ,, <\`

\`fac-mult7, 1: ,, <\`

\`fac-mult7, base_fac-call: ,, <\`

\`fac-mult7, 2: ,, <\`

\`fac-mult7, sp: fac-mult1,, >\`

\`fac-mult1, base_fac-call: fac-call1,, >\`

\`fac-call1, null: ,, >\`

\`fac-call1, 1: ,, >\`

\`fac-call1, 2: ,, >\`

\`fac-call1, base_fac-call: ,, >\`

\`fac-call1, base: fac-call2,, >\`

\`fac-call2, 1: ,, >\`

\`fac-call2, 3: , 1, >\`

\`fac-call2, null: fac-call3, brk, <\`

\`fac-call3, null: ,, <\`

\`fac-call3, 1: ,, <\`

\`fac-call3, 2: ,, <\`

\`fac-call3, base: ,, <\`

\`fac-call3, base_fac-call: ,, <\`

\`fac-call3, sp: fac-call4,, >\`

\`fac-call4, 1: ,, >\`

\`fac-call4, base_fac-call: fac-call5,, <\`

\`fac-call5, 1: fac-call6, null, <\`

\`fac-call6, 1: ,, <\`

\`fac-call6, sp: ,base_fac-call, <\`

\`fac-call6, null: fac-start, sp, >\`

This might seems unnecessary for a level that is just a state loop. However, as you'll see, the functional approach allows coordination of much more powerful subroutines, and that's when it really shines. :)
`,
      startTape: new Map([[-1, "sp"], [0, "base"], [1, "1"], [2, "1"], [3, "1"], [4, "1"], [5, "brk"]]),
      validate: (tape: Tape) => {
        if (tape.get(0) !== "base") return false;
        for (let i = 1; i < 25; i++) {
          if (tape.get(i) !== "1") return false;
        }
        if (tape.get(25) != "brk") return false;
        return true;
      },
    }, {
      id: 11,
      title: "Combinations",
      description: `Cells [1, n] and [n+2, n+m+1] are filled with 1. Please fill [1, C(n, m)] with 1.

n > m. Cell 0 must remain \`base\`, cell n+m+2 must be \`brk\`.`,
      startTape: new Map([[-1, "sp"], [0, "base"], [1, "1"], [2, "1"], [3, "1"], [4, "1"], [6, "1"], [7, "1"], [8, "brk"]]),
      validate: (tape: Tape) => {
        if (tape.get(0) !== "base") return false;
        for (let i = 1; i < 7; i++) {
          if (tape.get(i) !== "1") return false;
        }
        if (tape.get(7) !== "brk") return false;
        return true;
      }
    }, {
      id: 12,
      title: "Turing Atama Interpretor",
      description: `In this level, you'll emulate a Turing atama interpretor.

For your convenience, the rule table is preloaded on the left of the tape. All states and characters are 1-arrays.

The rule table is presented in the folloing format: \`[state]\` \`,\` \`[character]\` \`:\` \`[newState]\` \`,\` \`[newCharacter]\` \`,\` \`[direction]\`.

In which direction is either \`<\` or \`>\`. Note that \`[newState]\`, \`[newCharacter]\`, \`[direction]\` may be empty, which indicates no change. Rules are separated by a null character, the whole table is wrapped between \`sp\` and \`base\`.

The tape is loaded on the right side of the tape. Characters are aligned to n, and you may assume that all characters come in length [1, n). The current tape is wrapped by \`base\` and \`brk\`.

You may assume that the machine starts from state \`1\`, and is positioned at the first character. The machine does not go beyond its current tape scope (always between \`base\` and \`brk\`).

The machine halts on state \`11\`. You may assume that the machine always halts. Now, please alter the right of the tape such that it shows the tape when it halts. 

      `,
      startTape: new Map([[-33, "sp"], [-32, "1"], [-31, ":"], [-30, "1"], [-29, "1"], [-28, ":"], [-27, ","], [-26, ","], [-25, ">"], [-23, "1"], [-22, ","], [-21, "1"], [-20, ":"], [-19, "1"], [-18, "1"], [-17, "1"], [-16, ","], [-15, ","], [-14, "<"],[-12, "1"], [-11, "1"],[-10, "1"], [-9, ","], [-8, "1"], [-7, "1"], [-6, ":"], [-5, "1"], [-4, "1"], [-3, ","], [-2, "1"], [-1, ","], [0, "base"], [1, "1"], [2, "1"], [6, "1"], [7, "1"], [11, "1"], [12, "1"], [16, "1"], [21, "brk"]]),
      validate: (tape: Tape) => {
        if (tape.get(0) !== "base") return false;
        if (tape.get(1) !== "1") return false;
        if (tape.get(2) !== "1") return false;
        if (tape.get(3) !== undefined) return false;
        if (tape.get(6) !== "1") return false;
        if (tape.get(7) !== "1") return false;
        if (tape.get(8) !== undefined) return false;
        if (tape.get(11) !== "1") return false;
        if (tape.get(12) !== undefined) return false;
        if (tape.get(16) !== "1") return false;
        if (tape.get(17) !== undefined) return false;
        if (tape.get(21) !== "brk") return false;
        return true;
      }
    }]}
];