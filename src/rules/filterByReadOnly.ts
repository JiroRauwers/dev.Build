import { Rule } from "../core/Rule";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "../core/RuleRegistry";

export class FilterByReadOnlyRule extends Rule<boolean, FileData[]> {
  id = "filterByReadOnly";

  constructor(params: boolean, input: FileData[]) {
    super(params, input);
  }

  evaluate(): FileData[] {
    return this.input.filter(
      (file) => file.metadata.isReadOnly === this.params
    );
  }
}

RuleRegistry.register("filterByReadOnly", FilterByReadOnlyRule);
