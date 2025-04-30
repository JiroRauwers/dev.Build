import * as vscode from "vscode";

/**
 * Manages the sidebar webview view
 */
class SidebarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "dev.Build.sidebarView";
  private _view?: vscode.WebviewView;
  private _items: string[] = [];

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    // Configure webview
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, "dist")],
    };

    // Set HTML content
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      (message) => {
        switch (message.type) {
          case "getData":
            // Send current items to the webview
            webviewView.webview.postMessage({
              type: "update",
              data: this._items,
            });
            break;
          case "updateItems":
            // Update the items list
            this._items = message.items;
            // Store in persistent storage
            this._context.globalState.update("sidebarItems", this._items);
            break;
        }
      },
      undefined,
      this._context.subscriptions
    );

    // Load saved items from globalState
    const savedItems = this._context.globalState.get<string[]>("sidebarItems");
    if (savedItems) {
      this._items = savedItems;
      // Send to webview if it's ready
      if (this._view) {
        this._view.webview.postMessage({
          type: "update",
          data: this._items,
        });
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Get the local path to main script
    // This is the built version of our React app
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "webview", "index.js")
    );

    // Get path to CSS files
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "webview", "index.css")
    );

    // Use a nonce to allow only specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
        <title>Sidebar View</title>
        <link href="${styleUri}" rel="stylesheet" />
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
        <script>
          const ws = new WebSocket("ws://localhost:3001");
          ws.onmessage = (event) => {
            if (event.data === "reload") {
              location.reload();
            }
          };
        </script>
      </body>
      </html>`;
  }
}

/**
 * Generate a nonce string for security
 */
function getNonce() {
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
    sidebarProvider,
    {
      webviewOptions: {
        retainContextWhenHidden: true, // Keep the webview state and avoid reloading when hidden
      },
    }
  );
  context.subscriptions.push(sidebarView);
};

export const deactivate = () => {};
