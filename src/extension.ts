import * as vscode from "vscode";
import { SidebarViewProvider } from "./class/SidebarViewProvider";
import { Scanner } from "./scanner/scanner";

let scanner: Scanner;

export const activate = (context: vscode.ExtensionContext) => {
  console.log("Extension activated!");
  console.log("Extension context:", context);

  // Register command
  const helloWorldCommand = vscode.commands.registerCommand(
    "dev.Build.helloworld",
    () => {
      vscode.window.showInformationMessage("Hello World! now!");
    }
  );

  // Initialize the scanner and start watching files
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