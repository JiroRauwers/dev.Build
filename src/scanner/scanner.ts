import * as vscode from "vscode";
import * as path from "path";
import * as R from "remeda";
import * as fs from "fs";
import { isNotNodeModules } from "../lib/helpers";

/**
 * Interface for file data stored in the cache
 */
interface FileData {
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

export class Scanner {
  private static _instance: Scanner; // Singleton instance
  private cache: Map<string, FileData> = new Map(); // Cache for storing scanned files with metadata
  private watcher: vscode.Disposable | null = null;

  private includePattern: vscode.GlobPattern = "**/*"; // Include all files
  private excludePattern: vscode.GlobPattern =
    "**/{node_modules,.git/refs,.git/logs}/**"; // Exclude node_modules

  static get instance(): Scanner {
    if (!this._instance) {
      this._instance = new Scanner();
    }
    return this._instance;
  }

  async init() {
    console.log("Initializing scanner...");
    // Do initial scan
    await this.scanFiles();

    return this.watch();
  }

  /**
   * Normalizes a file path to be relative to the current workspace root
   * @param filePath The absolute file path to normalize
   * @returns The normalized path relative to the workspace root
   */
  private normalizeFilePath(filePath: string): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      // If no workspace is open, just return the filename
      return path.basename(filePath);
    }

    // Find the workspace folder that contains this file
    for (const folder of workspaceFolders) {
      const folderPath = folder.uri.fsPath;
      if (filePath.startsWith(folderPath)) {
        // Make the path relative to the workspace folder
        return filePath.substring(folderPath.length).replace(/\\/g, "/");
      }
    }

    // If the file is not in any workspace folder, return the full path
    return filePath;
  }

  async scanFiles() {
    const workspace = vscode.workspace;

    const files = await workspace.findFiles(
      this.includePattern,
      this.excludePattern
    );

    for (const file of files) {
      const filePath = file.fsPath;
      const normalizedPath = this.normalizeFilePath(filePath);
      const fileContent = await workspace.fs.readFile(file);
      const contentString = Buffer.from(fileContent).toString("utf-8");
      const stat = await workspace.fs.stat(file);

      // Collect enhanced metadata
      const enhancedMetadata = await this.collectEnhancedMetadata(
        file,
        contentString
      );

      // Create file data object with content and metadata
      const fileData: FileData = {
        content: contentString,
        metadata: {
          lastModified: new Date(stat.mtime),
          size: stat.size,
          normalizedPath: normalizedPath,
          fullPath: filePath,
          ...enhancedMetadata, // Merge in the enhanced metadata
        },
      };

      console.log({ normalizedPath, fileData });
      this.cache.set(normalizedPath, fileData);
    }

    console.log("Initial files scanned:", Array.from(this.cache.keys()));
    // StatusRegistry.updateAllFromScanner(this.cache);
  }

  watch() {
    const watcher = vscode.workspace.createFileSystemWatcher(
      this.includePattern,
      false,
      false,
      false
    );

    watcher.onDidChange(
      R.pipe(
        R.when(isNotNodeModules, (uri) => {
          console.log(`File changed: ${uri.fsPath}`);
          this.updateFile(uri);
        })
      )
    );
    watcher.onDidCreate(
      R.pipe(
        R.when(isNotNodeModules, (uri) => {
          console.log(`File created: ${uri.fsPath}`);
          this.updateFile(uri);
        })
      )
    );
    watcher.onDidDelete(
      R.pipe(
        R.when(isNotNodeModules, (uri) => {
          console.log(`File deleted: ${uri.fsPath}`);
          this.removeFile(uri);
        })
      )
    );

    // Store the watcher in the instance property so it doesn't get garbage collected
    this.watcher = watcher;

    console.log("File system watcher is now active");
    return this.watcher;
  }

  dispose() {
    if (this.watcher) {
      this.watcher.dispose();
    }
  }

  private async updateFile(uri: vscode.Uri) {
    console.log(`Updating file: ${uri.fsPath}`);
    const normalizedPath = this.normalizeFilePath(uri.fsPath);
    const content = await vscode.workspace.fs.readFile(uri);
    const contentString = Buffer.from(content).toString("utf-8");
    const stat = await vscode.workspace.fs.stat(uri);

    // Collect enhanced metadata
    const enhancedMetadata = await this.collectEnhancedMetadata(
      uri,
      contentString
    );

    // Create file data object with content and metadata
    const fileData: FileData = {
      content: contentString,
      metadata: {
        lastModified: new Date(stat.mtime),
        size: stat.size,
        normalizedPath: normalizedPath,
        fullPath: uri.fsPath,
        ...enhancedMetadata, // Merge in the enhanced metadata
      },
    };

    console.log('new file content', {fileData})

    this.cache.set(normalizedPath, fileData);
    // StatusRegistry.updateFromScanner(normalizedPath, this.cache.get(normalizedPath));
  }

  /**
   * Collects enhanced metadata for a file
   * @param uri The URI of the file
   * @param content The content of the file
   * @returns Object containing the enhanced metadata
   */
  private async collectEnhancedMetadata(
    uri: vscode.Uri,
    content: string
  ): Promise<Partial<FileData["metadata"]>> {
    const metadata: Partial<FileData["metadata"]> = {};

    try {
      // Get file extension
      metadata.extension = path.extname(uri.fsPath);

      // Try to determine language ID based on the file
      const textDocument = await vscode.workspace.openTextDocument(uri);
      metadata.languageId = textDocument.languageId;

      // Get line ending type
      metadata.eol = textDocument.eol;
      metadata.lineEnding =
        textDocument.eol === vscode.EndOfLine.CRLF ? "CRLF" : "LF";

      // Get indentation settings - first try document-specific settings
      const indentUseTabs =
        textDocument.uri &&
        vscode.window.visibleTextEditors.find(
          (editor) =>
            editor.document.uri.toString() === textDocument.uri.toString()
        )?.options.insertSpaces === false;

      // If not found, get workspace settings for this language
      const config = vscode.workspace.getConfiguration("editor", {
        languageId: textDocument.languageId,
      });

      metadata.indentation = {
        useTabs:
          indentUseTabs !== undefined
            ? indentUseTabs
            : !config.get("insertSpaces", true),
        tabSize: Number(config.get("tabSize", 4)),
      };

      // Try to determine if the file is read-only
      try {
        const fileStats = fs.statSync(uri.fsPath);
        // Check if file is writable by the current user
        metadata.isReadOnly = (fileStats.mode & 0o200) === 0; // Check write permission bit
      } catch (error) {
        // If we can't access the file stats, assume it's not read-only
        metadata.isReadOnly = false;
      }

      // Determine encoding by checking for BOM markers or trying common encodings
      // This is a simplified approach - for a robust solution, use a library like 'chardet'
      const buffer = Buffer.from(content);
      if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
        metadata.encoding = "utf-16le";
      } else if (
        buffer.length >= 2 &&
        buffer[0] === 0xfe &&
        buffer[1] === 0xff
      ) {
        metadata.encoding = "utf-16be";
      } else if (
        buffer.length >= 3 &&
        buffer[0] === 0xef &&
        buffer[1] === 0xbb &&
        buffer[2] === 0xbf
      ) {
        metadata.encoding = "utf-8 with BOM";
      } else {
        metadata.encoding = "utf-8";
      }
    } catch (error) {
      console.error(`Error collecting metadata for ${uri.fsPath}:`, error);
      // Return partial metadata if there's an error collecting some information
    }

    return metadata;
  }

  /**
   * Gets a file's content and metadata by its normalized path
   * @param normalizedPath The normalized path of the file
   * @returns The file data or undefined if not found
   */
  public getFile(normalizedPath: string): FileData | undefined {
    return this.cache.get(normalizedPath);
  }

  /**
   * Gets just the content of a file by its normalized path
   * @param normalizedPath The normalized path of the file
   * @returns The file content or undefined if not found
   */
  public getFileContent(normalizedPath: string): string | undefined {
    const fileData = this.cache.get(normalizedPath);
    return fileData?.content;
  }

  /**
   * Gets just the metadata of a file by its normalized path
   * @param normalizedPath The normalized path of the file
   * @returns The file metadata or undefined if not found
   */
  public getFileMetadata(
    normalizedPath: string
  ): FileData["metadata"] | undefined {
    const fileData = this.cache.get(normalizedPath);
    return fileData?.metadata;
  }

  /**
   * Gets an array of all cached files
   * @returns Array of file data objects
   */
  public getAllFiles(): FileData[] {
    return Array.from(this.cache.values());
  }

  /**
   * Gets all file paths in the cache
   * @returns Array of normalized file paths
   */
  public getAllFilePaths(): string[] {
    return Array.from(this.cache.keys());
  }

  private async removeFile(uri: vscode.Uri) {
    console.log(`Removing file: ${uri.fsPath}`);
    const normalizedPath = this.normalizeFilePath(uri.fsPath);
    this.cache.delete(normalizedPath);
    // StatusRegistry.removeFromScanner(normalizedPath);
  }
}
