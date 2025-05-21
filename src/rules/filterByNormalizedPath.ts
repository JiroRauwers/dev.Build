import { Rule } from "../core/Rule";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "../core/RuleRegistry";
import { isRegexLiteral, regexFromLiteral } from "../lib/helpers";

/**
 * Filters files based on their normalized path using glob-style regex matching.
 * Supports both simplified array and includes/excludes object format.
 */
export class FilterByNormalizedPathRule extends Rule<FileData[], FileData[]> {
  id = "filterByNormalizedPath";

  private includes: RegExp[] = [];
  private excludes: RegExp[] = [];

  constructor(params: any, input: FileData[]) {
    super(params, input);

    // Convert pattern to regex, supporting both regex literals and glob-style
    const toRegex = (pattern: string): RegExp => {
      if (isRegexLiteral(pattern)) {
        return regexFromLiteral(pattern);
      }
      // fallback to glob-style -> regex
      return new RegExp(
        "^" + pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*") + "$"
      );
    };

    if (Array.isArray(params)) {
      this.includes = params.map(toRegex);
    } else {
      this.includes = (params.includes || []).map(toRegex);
      this.excludes = (params.excludes || []).map(toRegex);
    }
  }

  evaluate(): FileData[] {
    let filtered = this.input;

    if (this.includes.length > 0) {
      filtered = filtered.filter((file) =>
        this.includes.some((regex) => regex.test(file.metadata.normalizedPath))
      );
    }

    if (this.excludes.length > 0) {
      filtered = filtered.filter(
        (file) =>
          !this.excludes.some((regex) =>
            regex.test(file.metadata.normalizedPath)
          )
      );
    }

    return filtered;
  }
}

RuleRegistry.register("filterByNormalizedPath", FilterByNormalizedPathRule);
