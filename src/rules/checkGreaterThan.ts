import { Rule } from "../core/Rule";
import { RuleRegistry } from "../core/RuleRegistry";

export class CheckGreaterThanRule extends Rule<number[], number> {
  id = "checkGreaterThan";

  constructor(params: number[], input: number) {
    super(params, input);
  }

  evaluate(): boolean {
    if (!Array.isArray(this.params) || this.params.length === 0) return false;
    return this.input > this.params[0];
  }
}

RuleRegistry.register("checkGreaterThan", CheckGreaterThanRule);
