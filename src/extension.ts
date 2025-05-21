import * as vscode from "vscode";
import { Scanner, Calculator, loadAllRules, SidebarViewProvider } from "./core";

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