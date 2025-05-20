import type { RuleConfig, Settings } from "../types/Calculator";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "./RuleRegistry";

export class Calculator {
  private static _instance: Calculator;
  private fileCache: Map<string, FileData> = new Map();
  private settings: Settings | null = null;

  private namedValues = new Map<string, any>(); // cachedValues
  private statusValues = new Map<string, any>(); // evaluated status entries

  static get instance(): Calculator {
    if (!this._instance) {
      this._instance = new Calculator();
    }
    return this._instance;
  }

  loadSettings(settings: Settings) {
    this.settings = settings;
  }

  updateFromScanner(cache: Map<string, FileData>) {
    this.fileCache = cache;
    this.evaluateCachedValues();
    this.evaluateStatusValues(); // <-- NEW
  }

  evaluateCachedValues() {
    if (!this.settings) throw new Error("Settings not loaded");

    for (const cachedValue of this.settings.cachedValues) {
      const result = this.evaluateRuleChain(
        cachedValue.rules,
        Array.from(this.fileCache.values())
      );
      this.namedValues.set(cachedValue.id, result);
    }
  }

  evaluateStatusValues() {
    if (!this.settings) throw new Error("Settings not loaded");

    for (const status of this.settings.status) {
      let result = this.evaluateRuleChain(
        status.rules,
        Array.from(this.fileCache.values())
      );

      // Optional: apply constraints if needed in the future
      this.statusValues.set(status.id, result ?? status.initialValue);
    }
  }

  private evaluateRuleChain(rules: RuleConfig[], initialInput: any): any {
    let value = initialInput;

    for (const ruleConfig of rules) {
      const RuleClass = RuleRegistry.get(ruleConfig.ruleId);
      if (!RuleClass) {
        throw new Error(`Rule "${ruleConfig.ruleId}" not found`);
      }

      const instance = new RuleClass(ruleConfig.params, value);
      value = instance.evaluate();
    }

    return value;
  }

  getNamedValue(id: string) {
    return this.namedValues.get(id);
  }

  getStatusValue(id: string) {
    return this.statusValues.get(id);
  }

  getDisplayedStatus(): Record<string, any> {
    if (!this.settings) return {};
    const display: Record<string, any> = {};
    for (const key of this.settings.displayedStatus) {
      display[key] = this.getStatusValue(key);
    }
    return display;
  }

  getAllStatus(): Record<string, any> {
    if (!this.settings) return {};
    const allStatus: Record<string, any> = {};
    for (const status of this.settings.status) {
      allStatus[status.id] = this.getStatusValue(status.id);
    }
    return allStatus;
  }
}
