import type {
  ConstraintGroup,
  RuleConfig,
  Settings,
} from "../types/Calculator";
import type { FileData } from "../types/FileData";
import { RuleRegistry } from "./RuleRegistry";
import { minimatch } from "minimatch";
import settingsJson from "./sample_settings.json";
import { isRegexLiteral, regexFromLiteral } from "../lib/helpers";

export class Calculator {
  private static _instance: Calculator;
  private fileCache: Map<string, FileData> = new Map();
  private settings: Settings | null = null;

  private namedValues: Map<string, any> = new Map(); // cachedValues
  private statusValues: Map<string, any> = new Map(); // evaluated status entries

  private constructor() {
    // Private constructor to prevent instantiation
    this.namedValues = new Map();
    this.statusValues = new Map();
    this.fileCache = new Map();
    this.settings = settingsJson as Settings;
    console.log("Calculator initialized with settings:", this.settings);
  }

  static get instance(): Calculator {
    if (!this._instance) {
      this._instance = new Calculator();
    }
    return this._instance;
  }
  loadSettings(settings: Settings) {
    if (
      !settings ||
      !Array.isArray(settings.status) ||
      !Array.isArray(settings.displayedStatus)
    ) {
      console.error("Invalid settings provided");
      this.settings = null;
      return;
    }
    this.settings = settings;
  }

  updateFromScanner(cache: Map<string, FileData>) {
    this.fileCache = cache;
    this.evaluateCachedValues();
    this.evaluateStatusValues();
  }

  evaluateCachedValues() {
    if (!this.settings) {
      console.error("Settings not loaded");
      return;
    }
    console.log(
      "🧮  %cEvaluating cached values...",
      "color: #e2c94f; font-weight: bold;"
    );

    for (const cached of this.settings.cachedValues) {
      try {
        const result = this.evaluateRuleChain(
          cached.rules,
          Array.from(this.fileCache.values()),
          cached.constraints
        );

        console.log(
          `%c📦  Evaluated cached value: %c${cached.id}%c -> %o`,
          "color: #6ec1e4; font-weight: bold;",
          "color: #e2c94f; font-weight: bold;",
          "color: inherit;",
          result
        );
        this.namedValues.set(cached.id, result);
      } catch (err) {
        console.error(
          `%c❌  Error evaluating cached value for '%c${cached.id}%c':`,
          "color: #ff6e6e; font-weight: bold;",
          "color: #e2c94f; font-weight: bold;",
          "color: inherit;",
          err
        );
      }
    }

    console.log("🔢 Named Values: ", Array.from(this.namedValues.entries()));
  }

  evaluateStatusValues() {
    if (!this.settings) {
      console.error("Settings not loaded");
      return;
    }

    console.log(
      "🟢  %cEvaluating status values...",
      "color: #a0e46e; font-weight: bold;"
    );
    for (const status of this.settings.status) {
      try {
        console.log(
          `%c🔍  Calculating Status %c${status.id}`,
          "color: #e2c94f; font-weight: bold;",
          "color: #6ec1e4; font-weight: bold;"
        );
        let result = this.evaluateRuleChain(
          status.rules,
          Array.from(this.fileCache.values()),
          status.constraints
        );

        // Optional: apply constraints if needed in the future
        this.statusValues.set(
          status.id,
          typeof result !== "undefined" ? result : status.initialValue
        );
      } catch (err) {
        console.error(
          `%c❌  Error evaluating status value for status '%c${status.id}%c':`,
          "color: #ff6e6e; font-weight: bold;",
          "color: #e2c94f; font-weight: bold;",
          "color: inherit;",
          err
        );
        this.statusValues.set(status.id, status.initialValue);
      }
    }
  }

  private evaluateRuleChain(
    rules: RuleConfig[],
    initialInput: FileData[],
    constraints?: ConstraintGroup
  ): any {
    let value: FileData[] | undefined = initialInput;
    // Filter the current value with constraints if any
    if (constraints) {
      value = this.filterByConstraints(value, constraints);
    }
    12;

    for (const ruleConfigRaw of rules) {
      try {
        if (!value) break; // If value is undefined, break the loop

        // Support rule as string shorthand
        let ruleConfig: RuleConfig;
        if (typeof ruleConfigRaw === "string") {
          ruleConfig = { ruleId: ruleConfigRaw, params: undefined };
        } else {
          ruleConfig = ruleConfigRaw;
        }

        const RuleClass = RuleRegistry.get(ruleConfig.ruleId);
        if (!RuleClass) {
          throw new Error(`Rule \"${ruleConfig.ruleId}\" not found`);
        }

        // Always call with two arguments, but allow params to be undefined
        value = new RuleClass(ruleConfig.params, value).evaluate();
        console.log("Evaluated rule ", ruleConfig.ruleId, " result", value);
      } catch (err) {
        console.error(
          `%c❌  Error in rule '%c${
            typeof ruleConfigRaw === "string"
              ? ruleConfigRaw
              : ruleConfigRaw.ruleId
          }%c':`,
          "color: #ff6e6e; font-weight: bold;",
          "color: #e2c94f; font-weight: bold;",
          "color: inherit;",
          err
        );
        // Optionally, break or continue; here we continue to next rule
        value = undefined; // Reset value on error
        break;
      }
    }

    return value;
  }

  private filterByConstraints(
    input: any[],
    constraints?: ConstraintGroup
  ): any[] {
    if (!constraints) return input;
    console.log(
      "%c⚙️  Applying constraints ",
      "color: #e2c94f; font-weight: bold;",
      constraints
    );

    return input.filter((item) => {
      try {
        // None: exclude if any of these match
        if (
          constraints.none &&
          constraints.none.some((cond) => this.checkConstraint(item, cond))
        ) {
          return false;
        }

        // Any: require at least one match
        if (
          constraints.any &&
          !constraints.any.some((cond) => this.checkConstraint(item, cond))
        ) {
          return false;
        }

        // All: require all to match
        if (
          constraints.all &&
          !constraints.all.every((cond) => this.checkConstraint(item, cond))
        ) {
          return false;
        }
      } catch (err) {
        console.error(
          "%c❌  Error filtering by constraints:",
          "color: #ff6e6e; font-weight: bold;",
          err
        );
      }
      return true; // or true, depending on your logic
    });
  }

  getNamedValue(id: string) {
    try {
      if (!this.namedValues.has(id)) {
        console.error(
          `%c❌  Named value '%c${id}%c' not found`,
          "color: #ff6e6e; font-weight: bold;",
          "color: #e2c94f; font-weight: bold;",
          "color: inherit;"
        );
        return undefined;
      }

      const response = this.namedValues.get(id);
      if (response === undefined) {
        console.error(
          `%c❌  Named value '%c${id}%c' is undefined`,
          "color: #ff6e6e; font-weight: bold;",
          "color: #e2c94f; font-weight: bold;",
          "color: inherit;"
        );
        return undefined;
      }
      console.log(
        "%c🟢  Named value: %c%s%c -> %o",
        "color: #a0e46e; font-weight: bold;",
        "color: #e2c94f; font-weight: bold;",
        id,
        "color: inherit;",
        response
      );
      return response;
    } catch (err) {
      console.error(
        `%c❌  Error getting named value '%c${id}%c':`,
        "color: #ff6e6e; font-weight: bold;",
        "color: #e2c94f; font-weight: bold;",
        "color: inherit;",
        err
      );
      return undefined;
    }
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

  // Centralized matching function for constraint values
  private matchesConstraint(value: string, conditionValue: string): boolean {
    if (isRegexLiteral(conditionValue)) {
      const regex = regexFromLiteral(conditionValue);
      const result = regex.test(value);
      console.log(
        `%c🔎  Regex match: %c${regex}%c.test(%c${value}%c) => %c${result}`,
        "color: #6ec1e4; font-weight: bold;",
        "color: #e2c94f; font-weight: bold;",
        "color: inherit;",
        "color: #a0e46e; font-weight: bold;",
        "color: inherit;",
        result
          ? "color: #a0e46e; font-weight: bold;"
          : "color: #ff6e6e; font-weight: bold;"
      );
      return result;
    } else {
      const result = minimatch(value, conditionValue);
      console.log(
        `%c🟡  Glob match: %c${conditionValue}%c vs %c${value}%c => %c${result}`,
        "color: #6ec1e4; font-weight: bold;",
        "color: #e2c94f; font-weight: bold;",
        "color: inherit;",
        "color: #a0e46e; font-weight: bold;",
        "color: inherit;",
        result
          ? "color: #a0e46e; font-weight: bold;"
          : "color: #ff6e6e; font-weight: bold;"
      );
      return result;
    }
  }

  // Example constraint evaluation that uses matchesConstraint
  private checkConstraint(
    file: FileData,
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
