import * as vscode from "vscode";
import { SidebarViewProvider } from "./core/SidebarViewProvider";
import { Scanner } from "./core/scanner";
import { Calculator } from "./core/Calculator";
import settingsJson from "./fileStatusMap/sample_settings.json";
import type { Settings } from "./types/Calculator";
import { loadAllRules } from "./core/LoadRules";

const settings: Settings = settingsJson;
Calculator.instance.loadSettings(settings);

let scanner: Scanner;

export const activate = (context: vscode.ExtensionContext) => {
  loadAllRules();
  console.log("Extension activated!");
  console.log("Extension context:", context);

  // Register command
  vscode.commands.registerCommand("dev.Build.logDisplayedStatus", () => {
    const status = Calculator.instance.getDisplayedStatus();
    console.log(status);
  });

  vscode.commands.registerCommand("dev.Build.logStatus", () => {
    const status = Calculator.instance.getAllStatus();
    console.log(status);
  });

  Scanner.instance
    .init()
    .then(() => {
      console.log("Scanner is initialized and running!");
    })
    .catch((err) => {
      console.error("Failed to initialize scanner:", err);
    });

  Calculator.instance.evaluateCachedValues();

  const allTsFiles = Calculator.instance.getNamedValue("allTsFiles");
  console.log("All TS files count:", allTsFiles.length);

  // Register sidebar view provider
  const sidebarProvider = new SidebarViewProvider(
    context.extensionUri,
    context
  );
  const sidebarView = vscode.window.registerWebviewViewProvider(
    SidebarViewProvider.viewType,
    sidebarProvider
  );
  context.subscriptions.push(sidebarView);
  context.subscriptions.push({
    dispose: () => {
      // Call a dispose method if your Scanner class has cleanup logic
      Scanner.instance.dispose();
    },
  });
};

export function deactivate() {
  // The scanner will be cleaned up automatically when the extension is deactivated
  if (scanner) {
    scanner.dispose();
  }
}