import { Rule } from "../core/Rule";
import { RuleRegistry } from "../core/RuleRegistry";
import type { FileData } from "../types/FileData";
import { isRegexLiteral, regexFromLiteral } from "../lib/helpers";

export class FilterByExtensionRule extends Rule<string[], FileData[]> {
  get id() {
    return "filterByExtension";
  }

  evaluate(): FileData[] {
    return this.input.filter((file) => {
      const ext = file.metadata.extension;
      if (!ext) return false;
      return this.params.some((pattern: string) => {
        if (isRegexLiteral(pattern)) {
          return regexFromLiteral(pattern).test(ext);
        }
        return ext === pattern;
      });
    });
  }
}

RuleRegistry.register("filterByExtension", FilterByExtensionRule);
