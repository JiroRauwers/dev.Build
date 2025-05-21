import { Rule } from "../core/Rule";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "../core/RuleRegistry";

export class HasDependencyRule extends Rule<string[], FileData[]> {
  id = "hasDependency";

  constructor(params: string[], input: FileData[]) {
    super(params, input);
  }

  evaluate(): FileData[] {
    // Parse JSON from file content directly
    return this.input.filter((file) => {
      try {
        const pkg = JSON.parse(file.content);
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
          ...pkg.peerDependencies,
        };
        return this.params.some((dep) => dep in allDeps);
      } catch {
        return false;
      }
    });
  }
}

RuleRegistry.register("hasDependency", HasDependencyRule);
