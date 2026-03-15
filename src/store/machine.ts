import { create } from "zustand";
import type { Rule, Machine } from "@/lib/types.ts";

export type Position = number;

export interface PanicResult {
  result: "panic";
  panicKey: string;
}

export interface OkResult {
  result: "ok";
  appliedRule: Rule;
}

export interface HaltResult {
  result: "halt";
  appliedRule: Rule;
}

export type StepResult = PanicResult | OkResult | HaltResult;


export interface MachineState {
  machine: Machine;

  step: () => StepResult;
}

export const useMachineStore = create<MachineState>((set, get) => ({
  machine: { tape: new Map(), head: 0, state: "start", ruleTable: { rules: [], index: new Map() } },

  step(): StepResult {
    const currentChar = get().machine.tape.get(get().machine.head) ?? "null";
    const key = `${get().machine.state}\0${currentChar}`;
    const ruleIndex = get().machine.ruleTable.index.get(key);

    if (ruleIndex === undefined) {
      return { result: "panic", panicKey: `(${get().machine.state}, ${currentChar})` };
    }

    const rule = get().machine.ruleTable.rules[ruleIndex];

    // Transition state
    if (rule.nextState !== undefined) {
      set({ machine: { ...get().machine, state: rule.nextState } });
    }

    // Write character
    if (rule.nextCharacter !== undefined) {
      const newTape = new Map(get().machine.tape);
      if (rule.nextCharacter === "null") {
        newTape.delete(get().machine.head);
      } else {
        newTape.set(get().machine.head, rule.nextCharacter);
      }
      set({ machine: { ...get().machine, tape: newTape } });
    }

    // Move head
    if (rule.move === "<") set({ machine: { ...get().machine, head: get().machine.head - 1 } });
    else if (rule.move === ">") set({ machine: { ...get().machine, head: get().machine.head + 1 } });

    if (rule.nextState === "halt") return { result: "halt", appliedRule: rule };
    return { result: "ok", appliedRule: rule };
  },
}));
