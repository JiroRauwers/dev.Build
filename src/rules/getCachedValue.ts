import { Calculator } from "../core/Calculator";
import { Rule } from "../core/Rule";
import { RuleRegistry } from "../core/RuleRegistry";

export class GetCachedValueRule extends Rule<unknown, unknown> {
  id = "getCachedValue";

  private cachedId: string[];

  constructor(params: string[], input: unknown) {
    super(params, input);
    if (!Array.isArray(params)) this.cachedId = [params];
    else this.cachedId = params;

    this.cachedId = this.cachedId
      .map((id) => {
        if (!id) return undefined;
        return id;
      })
      .filter(Boolean) as string[];
  }

  evaluate(): unknown {
    try {
      if (!Calculator.instance) {
        throw new Error("Calculator instance is not available");
      }
      const value = this.cachedId
        .map((id) => Calculator.instance.getNamedValue(id))
        .flat();
      if (value === undefined) {
        throw new Error(`Cached value '${this.cachedId}' not found`);
      }
      return value;
    } catch (err) {
      console.error(`Error in rule '${this.id}':`, err);
      return undefined; // or handle the error as needed
    }
  }
}

RuleRegistry.register("getCachedValue", GetCachedValueRule);
