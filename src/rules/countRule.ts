import { RuleRegistry } from "../core/RuleRegistry";
import type { FileData } from "../types/FileData";
import { Rule } from "../core/Rule";

export class CountRule extends Rule<unknown, FileData[]> {
  id = "count";

  constructor(params: unknown, input: FileData[]) {
    super(params, input);
  }

  evaluate(): number {
    return Array.isArray(this.input) ? this.input.length : 0;
  }
}

RuleRegistry.register("count", CountRule);
