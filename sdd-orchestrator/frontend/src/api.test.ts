import { describe, expect, it, vi } from "vitest";

import { getAppLinks } from "./api";

describe("app links", () => {
  it("uses the configured URLs", () => {
    vi.stubEnv("VITE_RAGAPP_URL", "http://example.com/rag");
    vi.stubEnv("VITE_MANAGER_URL", "http://example.com/admin");
    vi.stubEnv("VITE_SDD_URL", "http://example.com/sdd");

    expect(getAppLinks()).toEqual({
      rag: "http://example.com/rag",
      manager: "http://example.com/admin",
      sdd: "http://example.com/sdd",
    });
  });
});
