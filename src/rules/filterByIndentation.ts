import { Rule } from "../core/Rule";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "../core/RuleRegistry";

interface FilterByIndentationParams {
  useTabs: boolean;
}

export class FilterByIndentationRule extends Rule<
  FilterByIndentationParams,
  FileData[]
> {
  id = "filterByIndentation";

  private useTabs: boolean;

  constructor(params: FilterByIndentationParams, input: FileData[]) {
    super(params, input);
    this.useTabs = params.useTabs;
  }

  evaluate(): FileData[] {
    return this.input.filter((file) => {
      const indentation = file.metadata.indentation;
      return indentation?.useTabs === this.useTabs;
    });
  }
}

RuleRegistry.register("filterByIndentation", FilterByIndentationRule);
