import React from "react";
import ReactDOM from "react-dom/client";
import Sidebar from "./components/Sidebar";

// Create and initialize the vscode API for messaging
declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage: (message: any) => void;
      getState: () => any;
      setState: (state: any) => void;
    };
  }
}

// Initialize VSCode API (only once)
const vscode = window.acquireVsCodeApi();

// Set up event listener for messages from the extension
window.addEventListener("message", (event) => {
  const message = event.data;

  switch (message.type) {
    case "update":
      // Update the UI based on the message
      console.log("Received update message:", message.data);
      break;
  }
});

// Render the React root component
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Sidebar vscode={vscode} />
  </React.StrictMode>
);
