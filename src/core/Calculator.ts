import type { ConstraintGroup, RuleConfig, Settings } from "../types/Calculator";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "./RuleRegistry";
import {minimatch} from "minimatch";

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

    for (const status of this.settings.status) {
      let filteredInput = this.filterByConstraints(
        Array.from(this.fileCache.values()),
        status.constraints
      );
  
      const result = this.evaluateRuleChain(status.rules, filteredInput, status.constraints);
      this.namedValues.set(status.id, result);
    }

    console.log("🔢 Named Values: ", this.namedValues);
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

  private evaluateRuleChain(rules: RuleConfig[], initialInput: any, constraints?: ConstraintGroup): any {
    let value = initialInput;
  
    for (const ruleConfig of rules) {
      // Filter the current value with constraints if any
      if (constraints) {
        value = this.filterByConstraints(value, constraints);
      }
  
      const RuleClass = RuleRegistry.get(ruleConfig.ruleId);
      if (!RuleClass) {
        throw new Error(`Rule "${ruleConfig.ruleId}" not found`);
      }
  
      const instance = new RuleClass(ruleConfig.params, value);
      value = instance.evaluate();
    }
  
    return value;
  }
  

  private filterByConstraints(input: any[], constraints?: ConstraintGroup): any[] {
    if (!constraints) return input;
  
    return input.filter((item) => {
       // None: exclude if any of these match
    if (constraints.none && constraints.none.some(cond => this.checkConstraint(item, cond))) {
      return false;
    }

    // Any: require at least one match
    if (constraints.any && !constraints.any.some(cond => this.checkConstraint(item, cond))) {
      return false;
    }

    // All: require all to match
    if (constraints.all && !constraints.all.every(cond => this.checkConstraint(item, cond))) {
      return false;
    }

    return true;
      return true;
    });
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


  // Private helper to test if a string is a regex literal, e.g. "/pattern/flags"
  private isRegexLiteral(value: string): boolean {
    return (
      typeof value === "string" &&
      value.startsWith("/") &&
      value.lastIndexOf("/") > 0
    );
  }

  // Private helper to create RegExp from regex literal string
  private regexFromLiteral(value: string): RegExp {
    const lastSlash = value.lastIndexOf("/");
    const pattern = value.slice(1, lastSlash);
    const flags = value.slice(lastSlash + 1);
    return new RegExp(pattern, flags);
  }

  // Centralized matching function for constraint values
  private matchesConstraint(value: string, conditionValue: string): boolean {
    if (this.isRegexLiteral(conditionValue)) {
      const regex = this.regexFromLiteral(conditionValue);
      return regex.test(value);
    } else {
      // fallback to glob matching with minimatch
      return minimatch(value, conditionValue);
    }
  }

  // Example constraint evaluation that uses matchesConstraint
  private checkConstraint(
    file: any,
    constraint: Record<string, any>
  ): boolean {
    // constraint like { "metadata.normalizedPath": "**/*.ts" }
    for (const key in constraint) {
      const expected = constraint[key];
      const actual = this.getPropertyByPath(file, key);
      if (typeof actual !== "string") return false;
      if (!this.matchesConstraint(actual, expected)) return false;
    }
    return true;
  }

  // Utility to get nested property by string path like "metadata.normalizedPath"
  private getPropertyByPath(obj: any, path: string): any {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  }

}
