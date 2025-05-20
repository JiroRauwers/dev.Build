import { Rule } from "../core/Rule";
import { RuleRegistry } from "../core/RuleRegistry";
import type { FileData } from "../types/FileData";

export class FilterByExtensionRule extends Rule<string[], FileData[]> {
  get id() {
    return "filterByExtension";
  }

  evaluate(): FileData[] {
    return this.input.filter(
      (file) =>
        file.metadata.extension && this.params.includes(file.metadata.extension)
    );
  }
}

RuleRegistry.register("filterByExtension", FilterByExtensionRule);
