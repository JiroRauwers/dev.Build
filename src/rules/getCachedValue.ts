import { Calculator } from "../core/Calculator";
import { Rule } from "../core/Rule";
import { RuleRegistry } from "../core/RuleRegistry";

export class GetCachedValueRule extends Rule<unknown, unknown> {
  id = "getCachedValue";

  private cachedId: string;

  constructor(params: string[], input: unknown) {
    super(params, input);
    this.cachedId = params[0];
  }

  evaluate(): unknown {
    const value = Calculator.instance.getNamedValue(this.cachedId);
    if (value === undefined) {
      throw new Error(`Cached value '${this.cachedId}' not found`);
    }
    return value;
  }
}

RuleRegistry.register("getCachedValue", GetCachedValueRule);
