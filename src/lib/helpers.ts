import { Uri } from "vscode";

export function isNotNodeModules(uri: Uri): boolean {
  return !uri.fsPath.includes("node_modules");
}

