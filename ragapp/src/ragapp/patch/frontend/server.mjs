import { createServer } from "http";
import { extname, join, resolve } from "path";
import { readFile, stat } from "fs/promises";
import { fileURLToPath } from "url";

const rootDir = resolve(fileURLToPath(new URL(".", import.meta.url)), "out");
const port = Number(process.env.PORT || 3000);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".mjs", "application/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"],
]);

async function resolvePath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);

  const candidates = [];
  if (cleanPath === "/") {
    candidates.push("index.html");
  } else {
    const trimmed = cleanPath.replace(/^\//, "");
    candidates.push(trimmed);
    candidates.push(`${trimmed}.html`);
    candidates.push(join(trimmed, "index.html"));
  }

  for (const candidate of candidates) {
    const filePath = resolve(rootDir, candidate);
    try {
      const fileStat = await stat(filePath);
      if (fileStat.isFile()) return filePath;
    } catch {
      // ignore missing candidates
    }
  }

  return null;
}

createServer(async (req, res) => {
  try {
    const method = req.method || "GET";
    if (method !== "GET" && method !== "HEAD") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }

    const requestUrl = req.url || "/";
    const resolved = await resolvePath(requestUrl);
    if (!resolved) {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }

    const type = contentTypes.get(extname(resolved)) || "application/octet-stream";
    const data = await readFile(resolved);

    res.statusCode = 200;
    res.setHeader("Content-Type", type);
    res.setHeader("Cache-Control", "no-store");
    res.end(method === "HEAD" ? undefined : data);
  } catch (error) {
    res.statusCode = 500;
    res.end(error instanceof Error ? error.message : "Internal Server Error");
  }
}).listen(port, () => {
  console.log(`Static server running at http://localhost:${port}`);
});
