// Simple Calculator singleton that logs the cache when updated

export class Calculator {
  private static _instance: Calculator;

  static get instance(): Calculator {
    if (!this._instance) {
      this._instance = new Calculator();
    }
    return this._instance;
  }

  updateFromScanner(cache: Map<string, any>) {
    // For now, just log the cache
    console.log(
      "Calculator size : ",
      cache.size
      //   "/nCalculator received cache update:",

      //   Array.from(cache.entries())
    );
  }
}
