import * as vscode from "vscode";

import * as R from "remeda";
import { isNotNodeModules } from "../lib/helpers";

export class Scanner {
  private static _instance: Scanner; // Singleton instance
  private cache: Map<string, string> = new Map(); // Cache for storing scanned files

  private includePattern: vscode.GlobPattern = "**/*"; // Include all files
  private excludePattern: vscode.GlobPattern = "**/node_modules/**"; // Exclude node_modules

  static get instance(): Scanner {
    if (!this._instance) {
      this._instance = new Scanner();
    }
    return this._instance;
  }

  async init() {
    // Do initial scan
    await this.scanFiles();

    this.watch();
  }

  async scanFiles() {
    const workspace = vscode.workspace;

    const files = await workspace.findFiles(
      this.includePattern,
      this.excludePattern
    );

    for (const file of files) {
      const filePath = file.fsPath;
      const fileContent = await workspace.fs.readFile(file);
      this.cache.set(filePath, Buffer.from(fileContent).toString("utf-8"));
    }

    // StatusRegistry.updateAllFromScanner(this.cache);
  }

  watch() {
    const watcher = vscode.workspace.createFileSystemWatcher(
      this.includePattern,
      false,
      false,
      false
    );

    watcher.onDidChange(R.pipe(R.when(isNotNodeModules, this.updateFile)));
    watcher.onDidCreate(R.pipe(R.when(isNotNodeModules, this.updateFile)));
    watcher.onDidDelete(R.pipe(R.when(isNotNodeModules, this.removeFile)));
  }

  private async updateFile(uri: vscode.Uri) {
    console.log(`Updating file: ${uri.fsPath}`);
    const content = await vscode.workspace.fs.readFile(uri);
    this.cache.set(uri.fsPath, Buffer.from(content).toString("utf-8"));
    // StatusRegistry.updateFromScanner(uri.fsPath, this.cache.get(uri.fsPath));
  }

  private async removeFile(uri: vscode.Uri) {
    console.log(`Removing file: ${uri.fsPath}`);
    this.cache.delete(uri.fsPath);
    // StatusRegistry.removeFromScanner(uri.fsPath);
  }
}
