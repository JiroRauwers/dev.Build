import esbuild from "esbuild";
import { configs } from "./esbuild.config";

// Build all configs (extension and webview)
Promise.all(configs.map((config) => esbuild.build(config)))
  .then(() => {
    console.log("Build completed successfully!");
  })
  .catch((error) => {
    console.error("Build failed:", error);
    process.exit(1);
  });
