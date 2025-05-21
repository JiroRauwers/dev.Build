import { Rule } from "../core/Rule";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "../core/RuleRegistry";

export class FilterByLineCountRule extends Rule<
  { min?: number; max?: number },
  FileData[]
> {
  id = "filterByLineCount";

  constructor(params: { min?: number; max?: number }, input: FileData[]) {
    super(params, input);
  }

  evaluate(): FileData[] {
    return this.input.filter((file) => {
      const lineCount = file.content.split("\n").length;
      if (this.params.min !== undefined && lineCount < this.params.min)
        return false;
      if (this.params.max !== undefined && lineCount > this.params.max)
        return false;
      return true;
    });
  }
}

RuleRegistry.register("filterByLineCount", FilterByLineCountRule);
