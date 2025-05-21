import { Rule } from "../core/Rule";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "../core/RuleRegistry";

export class DetectTsStrictModeRule extends Rule<undefined, FileData[]> {
  id = "detectTsStrictMode";

  constructor(params: undefined, input: FileData[]) {
    super(params, input);
  }

  evaluate(): FileData[] {
    // Parse JSON from file content directly
    return this.input.filter((file) => {
      try {
        const json = JSON.parse(file.content);
        return (
          json && json.compilerOptions && json.compilerOptions.strict === true
        );
      } catch {
        return false;
      }
    });
  }
}

RuleRegistry.register("detectTsStrictMode", DetectTsStrictModeRule);
