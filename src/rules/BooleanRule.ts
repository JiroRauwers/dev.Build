import { Rule } from "../core/Rule";

export class BooleanRule extends Rule<unknown, FileData[]> {
  id = "boolean";

  constructor(params: unknown, input: FileData[]) {
    super(params, input);
  }

  evaluate(): boolean {
    if (Array.isArray(this.input)) {
      return this.input.length > 0;
    }
    return Boolean(this.input);
  }
}

import { RuleRegistry } from "../core/RuleRegistry";
import type { FileData } from "../types/FileData";
RuleRegistry.register("boolean", BooleanRule);
