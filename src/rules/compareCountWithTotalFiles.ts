import { Rule } from "../core/Rule";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "../core/RuleRegistry";

export class CompareCountWithTotalFilesRule extends Rule<string, FileData[]> {
  id = "compareCountWithTotalFiles";

  constructor(params: string, input: FileData[]) {
    super(params, input);
  }

  evaluate(): boolean {
    // Assume Calculator.instance.totalFiles is available
    const totalFiles =
      (globalThis as any).Calculator?.instance?.totalFiles || 0;
    return Array.isArray(this.input) && this.input.length === totalFiles;
  }
}

RuleRegistry.register(
  "compareCountWithTotalFiles",
  CompareCountWithTotalFilesRule
);
