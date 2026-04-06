import { describe, expect, it } from "vitest";

import { buildGenerationCacheKey, createGenerationCacheMetadata, resolveGenerationCacheVersion } from "./generation-cache";

describe("generation cache helpers", () => {
  it("builds a stable per-project cache key", () => {
    expect(buildGenerationCacheKey(" proj-1 ", " run-9 ")).toBe("proj-1::run-9");
  });

  it("reads the SDD version marker from the stories blob header", () => {
    const blob = '<!-- nexti-sdd-meta {"projectId":"proj-1","sourceRunId":"run-9"} -->\n\n## 1. Story';

    expect(resolveGenerationCacheVersion(blob)).toBe("run-9");
  });

  it("normalizes cache metadata fields", () => {
    const metadata = createGenerationCacheMetadata({
      projectId: " proj-1 ",
      versionId: " run-9 ",
      tab: "result",
      completed: true,
      status: "completed",
      phase: "completed",
      sessionId: " session-1 ",
      inputEnabled: false,
      zipPath: " /tmp/result.zip ",
      workspaceFileCount: 3,
      totalBytes: 42,
      consoleLineCount: 9,
      zipSizeBytes: 1024,
      completedAt: " 2026-04-06T00:00:00.000Z ",
      lastError: " ",
      message: " ok ",
      updatedAt: "2026-04-06T00:00:00.000Z",
    });

    expect(metadata).toMatchObject({
      projectId: "proj-1",
      versionId: "run-9",
      sessionId: "session-1",
      zipPath: "/tmp/result.zip",
      completedAt: "2026-04-06T00:00:00.000Z",
      message: "ok",
      lastError: null,
    });
  });
});
