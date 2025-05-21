import { Rule } from "../core/Rule";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "../core/RuleRegistry";

export class GetLineEndingVariantsRule extends Rule<unknown, FileData[]> {
  id = "getLineEndingVariants";

  constructor(params: unknown, input: FileData[]) {
    super(params, input);
  }

  evaluate(): string[] {
    const endings = new Set<string>();
    this.input.forEach((file) => {
      if (file.metadata.lineEnding) endings.add(file.metadata.lineEnding);
    });
    return Array.from(endings);
  }
}

RuleRegistry.register("getLineEndingVariants", GetLineEndingVariantsRule);
