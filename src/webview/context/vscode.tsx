import { createContext, useContext } from "react";

const vscode = window.acquireVsCodeApi();

const vscodeContext = createContext(vscode);
export const VscodeProvider = vscodeContext.Provider;

const useVscode = () => {
  const context = useContext(vscodeContext);
  if (!context) {
    throw new Error("useVscode must be used within a VscodeProvider");
  }
  return context;
};

const VscodeContextProvider = ({ children }: { children: React.ReactNode }) => {
  return <VscodeProvider value={vscode}>{children}</VscodeProvider>;
};

export default VscodeContextProvider;
export { useVscode };
