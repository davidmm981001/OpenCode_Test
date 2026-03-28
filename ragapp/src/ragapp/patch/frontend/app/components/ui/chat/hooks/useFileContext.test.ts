import { describe, expect, it } from "vitest";

import {
  buildContextText,
  composeMessageWithContext,
  escapeHtml,
  estimateTokens,
  getOpenAIContextWindow,
  getSelectionMode,
  isIgnoredPath,
  isZipFile,
  type LoadedContextFile,
} from "./useFileContext";

describe("useFileContext helpers", () => {
  const files: LoadedContextFile[] = [
    {
      id: "1",
      path: "src/app.ts",
      name: "app.ts",
      content: "const a = 1 < 2;",
      size: 16,
      source: "file",
    },
    {
      id: "2",
      path: "src/utils.ts",
      name: "utils.ts",
      content: "export const x = '&';",
      size: 21,
      source: "file",
    },
  ];

  it("escapes html before injection", () => {
    expect(escapeHtml("<code>&'\"</code>")).toBe(
      "&lt;code&gt;&amp;&#39;&quot;&lt;/code&gt;",
    );
  });

  it("estimates tokens from chars", () => {
    expect(estimateTokens("abcd")).toBe(1);
    expect(estimateTokens("abcdefgh")).toBe(2);
  });

  it("builds a readable context text", () => {
    const text = buildContextText(files);
    expect(text).toContain("Archivo 1: src/app.ts");
    expect(text).toContain("Archivo 2: src/utils.ts");
    expect(text).toContain("const a = 1 < 2;");
  });

  it("prepends context only when toggle is active", () => {
    const message = composeMessageWithContext("Hola", files, true);
    expect(message.startsWith("<code>")).toBe(true);
    expect(message).toContain("Hola");

    expect(composeMessageWithContext("Hola", files, false)).toBe("Hola");
  });

  it("detects ignore patterns and zip files", () => {
    expect(isIgnoredPath("node_modules/react/index.js")).toBe(true);
    expect(isIgnoredPath("src/main.ts")).toBe(false);
    expect(isZipFile("bundle.zip")).toBe(true);
  });

  it("infers the selection mode", () => {
    expect(getSelectionMode([])).toBe("empty");
    expect(getSelectionMode(files)).toBe("files");
    expect(
      getSelectionMode([
        { ...files[0], source: "zip", path: "pkg/src/app.ts" },
      ]),
    ).toBe("zip");
  });

  it("maps known openai context windows", () => {
    expect(getOpenAIContextWindow("gpt-5.4")).toBe(1048576);
    expect(getOpenAIContextWindow("gpt-4o-mini")).toBe(128000);
    expect(getOpenAIContextWindow("unknown-model")).toBeNull();
  });
});
