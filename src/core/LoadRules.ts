import fg from "fast-glob";
import path from "path";
import { RuleRegistry } from "./RuleRegistry";
import "../rules";

export async function loadAllRules() {
  const files = await fg(path.join(__dirname, "../rules/**/*.ts"));

  for (const file of files) {
    require(file); // Triggers side-effect registration
  }

  console.log("📦 Loaded rules:", RuleRegistry.list());
}
