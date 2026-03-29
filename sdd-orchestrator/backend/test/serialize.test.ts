import { describe, expect, it } from "vitest";

import { projectToJson } from "../src/lib/serialize.js";

describe("project serialization", () => {
  it("converts dates and bigints to JSON-safe values", () => {
    const json = projectToJson({
      id: "1",
      name: "Demo",
      userStories: "Story",
      status: "idle",
      workspacePath: "/tmp/demo",
      zipPath: null,
      zipSizeBytes: BigInt(42),
      fileCount: 3,
      completedAt: null,
      lastError: null,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });

    expect(json.zipSizeBytes).toBe(42);
    expect(json.createdAt).toContain("2026-01-01");
  });
});
