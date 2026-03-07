import type { Level } from "./level.ts";

export const LEVELS: Level[] = [
  {
    id: "identity",
    title: "Level 1 — Echo",
    description: `## Echo

The tape contains a single character \`1\` at position 0.

Your machine must **halt without modifying the tape**.

**Initial tape:** \`[1]\`  
**Expected tape:** \`[1]\`

### Hint
A single rule that matches \`(start, 1)\` and transitions to \`halt\` without changing the character will do it.`,
    initialTape: { 0: "1" },
    initialHead: 0,
    expected: { 0: "1" },
    starterCode: `# Echo: halt immediately, write the same character back.
start, 1: halt, 1
`,
  },
  {
    id: "flip-bits",
    title: "Level 2 — Flip Bits",
    description: `## Flip Bits

The tape contains a binary string of \`0\`s and \`1\`s followed by blank cells.  
Your machine must **invert every bit** (flip \`0 → 1\` and \`1 → 0\`), then halt.

**Initial tape:** \`0 1 1 0 1\`  
**Expected tape:** \`1 0 0 1 0\`

### Strategy
- On \`0\`: write \`1\`, move right.  
- On \`1\`: write \`0\`, move right.  
- On \`null\` (blank): halt.`,
    initialTape: { 0: "0", 1: "1", 2: "1", 3: "0", 4: "1" },
    initialHead: 0,
    expected: { 0: "1", 1: "0", 2: "0", 3: "1", 4: "0" },
    starterCode: `# Flip Bits: invert each bit, halt at blank.
start, 0: start, 1, >
start, 1: start, 0, >
start, null: halt, null
`,
  },
  {
    id: "unary-increment",
    title: "Level 3 — Unary Increment",
    description: `## Unary Increment

The tape holds a **unary number** — a run of \`1\`s starting at position 0.  
Your machine must add one more \`1\` at the end, then halt.

**Initial tape:** \`1 1 1\` (represents 3)  
**Expected tape:** \`1 1 1 1\` (represents 4)

### Strategy
Scan right, skipping over \`1\`s. When you find the first blank, write \`1\` and halt.`,
    initialTape: { 0: "1", 1: "1", 2: "1" },
    initialHead: 0,
    expected: { 0: "1", 1: "1", 2: "1", 3: "1" },
    starterCode: `# Unary Increment: scan right over 1s, write 1 at the end.
start, 1: start, 1, >
start, null: halt, 1
`,
  },
  {
    id: "copy-bit",
    title: "Level 4 — Double the Mark",
    description: `## Double the Mark

The tape has a single \`1\` at position 0. Your machine must write another \`1\` at position 1, then halt.

**Initial tape:** \`1\`  
**Expected tape:** \`1 1\`

### Strategy
Move right one cell, write \`1\`, halt.`,
    initialTape: { 0: "1" },
    initialHead: 0,
    expected: { 0: "1", 1: "1" },
    starterCode: `# Double the Mark: move right one step and write a 1.
start, 1: step2, 1, >
step2, null: halt, 1
`,
  },
  {
    id: "move-right",
    title: "Level 5 — Shift Right",
    description: `## Shift Right

The tape contains a single \`X\` at position 0. Move it **one cell to the right** (erase position 0, write \`X\` at position 1), then halt.

**Initial tape:** \`X\`  
**Expected tape:** \`null X\` (position 0 is blank, position 1 is \`X\`)

### Strategy
Read \`X\`, erase it, move right, write \`X\`, halt.`,
    initialTape: { 0: "X" },
    initialHead: 0,
    expected: { 0: "null", 1: "X" },
    starterCode: `# Shift Right: erase X, move right, write X.
start, X: move, null, >
move, null: halt, X
`,
  },
];

export type { Level };
