import fs from "node:fs";
import path from "node:path";

import archiver from "archiver";

export async function zipDirectory(sourceDir: string, outputPath: string) {
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

  return new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    archive.glob("**/*", {
      cwd: sourceDir,
      dot: true,
    });
    void archive.finalize();
  });
}
