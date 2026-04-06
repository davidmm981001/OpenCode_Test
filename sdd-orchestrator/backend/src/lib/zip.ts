import fs from "node:fs";
import path from "node:path";

import archiver from "archiver";

const zipIgnorePatterns = [
  "**/.git/**",
  "**/.idea/**",
  "**/.vscode/**",
  "**/.cache/**",
  "**/.next/**",
  "**/.parcel-cache/**",
  "**/.turbo/**",
  "**/.vite/**",
  "**/build/**",
  "**/completed-projects/**",
  "**/coverage/**",
  "**/dist/**",
  "**/node_modules/**",
  "**/target/**",
  "**/*.log",
  "**/*.tmp",
  "**/*.temp",
];

export async function zipDirectory(sourceDir: string, outputPath: string) {
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

  return new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 3 } });

    output.on("close", () => resolve());
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    archive.glob("**/*", {
      cwd: sourceDir,
      dot: true,
      ignore: zipIgnorePatterns,
    });
    void archive.finalize();
  });
}
