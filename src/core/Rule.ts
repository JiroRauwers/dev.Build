export abstract class Rule<T = unknown, R = unknown> {
  constructor(protected params: T, protected input: R) {}

  abstract get id(): string;
  abstract evaluate(): any;
}
