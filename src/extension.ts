import * as vscode from "vscode";
import { SidebarViewProvider } from "./class/SidebarViewProvider";

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
