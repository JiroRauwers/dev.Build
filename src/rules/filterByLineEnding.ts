import { Rule } from "../core/Rule";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "../core/RuleRegistry";
import { isRegexLiteral, regexFromLiteral } from "../lib/helpers";

export class FilterByLineEndingRule extends Rule<
  string | string[],
  FileData[]
> {
  id = "filterByLineEnding";

  constructor(params: string | string[], input: FileData[]) {
    super(params, input);
  }

  evaluate(): FileData[] {
    const patterns = Array.isArray(this.params) ? this.params : [this.params];
    return this.input.filter((file) => {
      const lineEnding = file.metadata.lineEnding || "";
      return patterns.some((pattern: string) => {
        if (isRegexLiteral(pattern)) {
          return regexFromLiteral(pattern).test(lineEnding);
        }
        return lineEnding === pattern;
      });
    });
  }
}

RuleRegistry.register("filterByLineEnding", FilterByLineEndingRule);
