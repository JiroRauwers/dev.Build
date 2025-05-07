import type { StatusValue } from "../type";

export const tsFileCount: StatusValue<number> = {
  id: "tsFileCount",
  label: "TypeScript Files",
  value: 0,
  update(files) {
    let count = 0;
    for (const [path] of files) {
      if (path.endsWith(".ts") || path.endsWith(".tsx")) count++;
    }
    return (this.value = count);
  },
};
