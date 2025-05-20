// types.ts
export interface RuleConfig {
  ruleId: string;
  params?: any;
}

export interface CachedValueConfig {
  id: string;
  rules: RuleConfig[];
}

export interface ConstraintGroup {
  any?: Record<string, any>[];
  all?: Record<string, any>[];
}

export interface StatusConfig {
  id: string;
  initialValue: any;
  rules: RuleConfig[];
  constraints?: ConstraintGroup;
}

export interface Settings {
  displayedStatus: string[];
  cachedValues: CachedValueConfig[];
  status: StatusConfig[];
}
