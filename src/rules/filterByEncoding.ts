import { Rule } from "../core/Rule";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "../core/RuleRegistry";
import { isRegexLiteral, regexFromLiteral } from "../lib/helpers";

export class FilterByEncodingRule extends Rule<string[], FileData[]> {
  id = "filterByEncoding";

  constructor(params: string[], input: FileData[]) {
    super(params, input);
  }

  evaluate(): FileData[] {
    return this.input.filter((file) =>
      this.params.some((pattern: string) => {
        const encoding = file.metadata.encoding || "";
        if (isRegexLiteral(pattern)) {
          return regexFromLiteral(pattern).test(encoding);
        }
        return encoding === pattern;
      })
    );
  }
}

RuleRegistry.register("filterByEncoding", FilterByEncodingRule);
