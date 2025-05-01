import React from "react";
import ReactDOM from "react-dom/client";
import Sidebar from "./components/Sidebar";
import VscodeContextProvider from "./context/vscode";
import type { messages } from "../types/messages";

// Create and initialize the vscode API for messaging
declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage: (message: messages) => void;
      getState: () => any;
      setState: (state: messages) => void;
    };
  }
}

// Render the React root component
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <VscodeContextProvider>
      <Sidebar />
    </VscodeContextProvider>
  </React.StrictMode>
);
