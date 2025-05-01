import * as vscode from "vscode";
import { SidebarViewProvider } from "./class/SidebarViewProvider";

/**
 * Generate a nonce string for security
 */
export function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export const activate = (context: vscode.ExtensionContext) => {
  // Register command
  const helloWorldCommand = vscode.commands.registerCommand(
    "dev.Build.helloworld",
    () => {
      vscode.window.showInformationMessage("Hello World! now!");
    }
  );
  context.subscriptions.push(helloWorldCommand);

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
};

export const deactivate = () => {};
