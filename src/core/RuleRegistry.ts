import type { Rule } from "./Rule";

type RuleConstructor = new (params: any, input: any) => Rule;

const registry = new Map<string, RuleConstructor>();

export const RuleRegistry = {
  register(id: string, ruleClass: RuleConstructor) {
    if (registry.has(id)) {
      throw new Error(`❌ Rule "${id}" already registered`);
    }
    registry.set(id, ruleClass);
  },

  get(id: string): RuleConstructor {
    const rule = registry.get(id);
    if (!rule) throw new Error(`❌ Rule "${id}" not found`);
    return rule;
  },

  has(id: string): boolean {
    return registry.has(id);
  },
  list(): string[] {
    return Array.from(registry.keys());
  },
};
