/**
 * Compiler for the Turing machine scripting language. Pure function.
 * Compiler does not validate rules, it only tokenizes and parses them.
 *
 * Syntax:
 *   Empty lines ignored.
 *   Everything after # is ignored.
 *   All whitespace is ignored.
 *   Rule format: 
 *     state, character: [nextState], [nextCharacter] , [< | >]
 *   in which these identifiers are all url safe base64 identifiers.
 *   Reserved states: start, halt
 *   Reserved character: null (blank tape cell)
 */

import type { Token, Rule, Error, Direction } from "./types.ts";

function preprocessLine(sourceLine: string): string {
  const commentIdx = sourceLine.indexOf("#");
    if (commentIdx !== -1) sourceLine = sourceLine.slice(0, commentIdx);
  return sourceLine.trim();
}

function tokenizeLine(sourceLine: string, line: number): Token[] | Error {
  const tokens: Token[] = [];
  let identifier = "";

  for (const c of sourceLine) {
    if (c.match(/[a-zA-Z0-9_-]/)) {
      identifier += c;
      continue;
    }

    let separator: Token | null = null;
    switch (c) {
      case " ":
        break;
      case ",":
        separator = { type: "comma", value: ",", line: line };
        break;
      case ":":
        separator = { type: "colon", value: ":", line: line };
        break;
      case "<":
        separator = { type: "direction", value: "<", line: line };
        break;
      case ">":
        separator = { type: "direction", value: ">", line: line };
        break;
      default:
        return {
          name: "Invalid character",
          message: `Invalid character "${c}" at line ${line}`,
          line: line,
        };
    }

    if (identifier.length !== 0) {
      tokens.push({ type: "identifier", value: identifier, line: line });
      identifier = "";
    }
    if (separator !== null) tokens.push(separator);
  }
  if (identifier.length !== 0) {
    tokens.push({ type: "identifier", value: identifier, line: line });
    identifier = "";
  }
  return tokens;
}

function parseLine(tokens: Token[], line: number): Rule | Error {
  if (tokens.filter(t => t.type === "comma").length !== 3) return {
    name: "Incomplete rule",
    message: `Incomplete rule at line ${line}`,
    line: line,
  };
  const sequence = ["identifier", "comma", "identifier", "colon"];
  for (let i = 0; i < 4; i++) {
    if (tokens[i].type !== sequence[i]) {
      return {
        name: "Unexpected token",
        message: `Unexpected "${tokens[i].type}" at line ${line}`,
        line: line,
      };
    }
  }
  const rule: Rule = {
    state: tokens[0].value,
    character: tokens[2].value,
    line: line,
  };
  let read = 4;
  if (tokens[read].type === "identifier") {
    rule.nextState = tokens[read].value;
    read++;
  }
  if (tokens[read].type !== "comma") {
    return {
      name: "Unexpected token",
      message: `Unexpected "${tokens[read].type}" at line ${line}`,
      line: line,
    };
  }
  read++;
  if (tokens[read].type === "identifier") {
    rule.nextCharacter = tokens[read].value;
    read++;
  }
  if (tokens[read].type !== "comma") {
    return {
      name: "Unexpected token",
      message: `Unexpected "${tokens[read].type}" at line ${line}`,
      line: line,
    };
  }
  read++;
  if (tokens[read] !== undefined && tokens[read].type === "direction") {
    rule.move = tokens[read].value as Direction;
    read++;
  }
  if (read < tokens.length) {
    return {
      name: "Unexpected token",
      message: `Unexpected "${tokens[read].type}" at line ${line}`,
      line: line,
    };
  }
  if (read === 6) {
    return {
      name: "Dead rule",
      message: `Rule at ${line} does nothing`,
      line: line,
    }
  }
  return rule;
}

export function compile(source: string): Rule[] | Error {
  const rules: Rule[] = [];
  const sourceLines = source.split("\n");
  for (let i = 0; i < sourceLines.length; i++) {
    const line = i + 1;
    let sourceLine = sourceLines[i];

    sourceLine = preprocessLine(sourceLine);
    if (sourceLine.length === 0) continue;

    const tokenResult = tokenizeLine(sourceLine, line);
    if ("name" in tokenResult) return tokenResult;

    const ruleResult = parseLine(tokenResult as Token[], line);
    if ("name" in ruleResult) return ruleResult;
    rules.push(ruleResult as Rule);
  }

  return rules;
}
