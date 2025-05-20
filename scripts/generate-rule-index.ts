// scripts/generate-rule-index.ts
import fg from "fast-glob";
import fs from "fs";

const ruleFiles = fg.sync("src/rules/**/*.ts", { ignore: ["**/index.ts"] });
const imports = ruleFiles
  .map(
    (file, i) =>
      `export * from "./${file.replace("src/rules/", "").replace(".ts", "")}";`
  )
  .join("\n");

fs.writeFileSync("src/rules/index.ts", imports);
console.log("✅ Rule index generated");
