import { Rule } from "../core/Rule";
import { RuleRegistry } from "../core/RuleRegistry";

export class DivideByCachedValueRule extends Rule<string[], number> {
  id = "divideByCachedValue";

  constructor(params: string[], input: number) {
    super(params, input);
  }

  evaluate(): number {
    // Assume Calculator.instance.getNamedValue is available
    const cachedValue =
      (globalThis as any).Calculator?.instance?.getNamedValue?.(
        this.params[0]
      ) || 1;
    if (cachedValue === 0) return 0;
    return this.input / cachedValue;
  }
}

RuleRegistry.register("divideByCachedValue", DivideByCachedValueRule);
