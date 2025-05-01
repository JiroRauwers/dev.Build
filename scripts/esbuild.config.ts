import type { BuildOptions } from "esbuild";
import fg from "fast-glob";

// Common configuration settings
const commonConfig: BuildOptions = {
  bundle: true,
  minify: true,
  sourcemap: true,
  logLevel: "info",
};

// Extension host bundle configuration
const extensionConfig: BuildOptions = {
  ...commonConfig,
  entryPoints: ["./src/extension.ts"],
  platform: "node",
  target: "node12",
  outdir: "./dist",
  outbase: "./src",
  outExtension: {
    ".js": ".cjs",
  },
  format: "cjs",
  external: ["vscode"],
  loader: {
    ".ts": "ts",
    ".js": "js",
  },
};

// Dynamically resolve entry points for the webview - exclude CSS files as direct entry points
const webviewEntryPoints = fg.sync("src/webview/**/*.{ts,tsx}", {
  ignore: ["**/*.d.ts", "**/*test.{ts,tsx}"],
});

// Webview (React) bundle configuration
const webviewConfig: BuildOptions = {
  ...commonConfig,
  entryPoints: webviewEntryPoints,
  platform: "browser",
  target: "es2020",
  outdir: "./dist/webview",
  format: "esm",
  loader: {
    ".ts": "ts",
    ".js": "js",
    ".tsx": "tsx",
    ".jsx": "jsx",
    ".css": "css", // CSS files will only be processed when imported by components
    ".svg": "dataurl",
    ".png": "dataurl",
    ".jpg": "dataurl",
    ".gif": "dataurl",
  },
  jsx: "automatic", // Use React automatic JSX transform
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  // Enable CSS bundling
  bundle: true,
  metafile: true,
  // Allow tree shaking of CSS but mark css files as having side effects
  treeShaking: true,
};

export const configs = [extensionConfig, webviewConfig];
export default extensionConfig;
