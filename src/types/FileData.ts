import type * as vscode from "vscode";

/**
 * Interface for file data stored in the cache
 */
export interface FileData {
  content: string;
  metadata: {
    lastModified: Date;
    size: number;
    normalizedPath: string;
    fullPath: string;
    // Enhanced metadata
    languageId?: string; // Language identifier for syntax highlighting
    lineEnding?: string; // CRLF or LF
    indentation?: {
      useTabs: boolean;
      tabSize: number;
    };
    encoding?: string; // File encoding (utf-8, utf-16, etc.)
    extension?: string; // File extension
    isReadOnly?: boolean; // Whether the file is read-only
    eol?: vscode.EndOfLine; // End of line sequence
  };
}
