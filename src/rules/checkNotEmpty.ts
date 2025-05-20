import { Rule } from "../core/Rule";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "../core/RuleRegistry";

export class CheckNotEmptyRule extends Rule<unknown, FileData[]> {
  id = "checkNotEmpty";

  constructor(params: unknown, input: FileData[]) {
    super(params, input);
  }

  evaluate(): FileData[] {
    return this.input.filter((file) => file.content.trim().length > 0);
  }
}

RuleRegistry.register("checkNotEmpty", CheckNotEmptyRule);
