import { Uri } from "vscode";

export function isNotNodeModules(uri: Uri): boolean {
  return !uri.fsPath.includes("node_modules");
}

// Regex/Glob helpers for constraints and rules

/**
 * Checks if a string is a regex literal, e.g. "/pattern/flags"
 */
export function isRegexLiteral(value: string): boolean {
  if (typeof value !== "string") return false;
  if (value.length < 2) return false;
  if (value[0] !== "/") return false;
  const lastSlash = value.lastIndexOf("/");
  if (lastSlash === 0) return false; // no closing slash
  const pattern = value.slice(1, lastSlash);
  if (!pattern) return false; // empty pattern
  const flags = value.slice(lastSlash + 1);
  return /^[gimsuyd]*$/.test(flags);
}

/**
 * Converts a regex literal string to a RegExp object
 */
export function regexFromLiteral(value: string): RegExp {
  const lastSlash = value.lastIndexOf("/");
  const pattern = value.slice(1, lastSlash);
  const flags = value.slice(lastSlash + 1);
  return new RegExp(pattern, flags);
}
