import { Rule } from "../core/Rule";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "../core/RuleRegistry";

export class ContainsImportRule extends Rule<string[], FileData[]> {
  id = "containsImport";

  constructor(params: string[], input: FileData[]) {
    super(params, input);
  }

  evaluate(): FileData[] {
    return this.input.filter((file) => {
      const content = file.content || "";
      return this.params.some(
        (imp) =>
          new RegExp(`import.*['\"]${imp}['\"]`).test(content) ||
          new RegExp(`require\(['\"]${imp}['\"]\)`).test(content)
      );
    });
  }
}

RuleRegistry.register("containsImport", ContainsImportRule);
