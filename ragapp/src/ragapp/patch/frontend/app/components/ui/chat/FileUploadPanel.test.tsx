import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import React from "react";

import FileUploadPanel from "./FileUploadPanel";

describe("FileUploadPanel", () => {
  it("renders file stats and toggle state", () => {
    const onToggle = vi.fn();
    const onClear = vi.fn();
    const onRemove = vi.fn();
    const onAdd = vi.fn().mockResolvedValue(undefined);

    render(
      <FileUploadPanel
        files={[
          {
            id: "1",
            path: "src/app.ts",
            name: "app.ts",
            content: "console.log('hi');",
            size: 18,
            source: "file",
          },
        ]}
        busy={false}
        applyToCurrentMessage={false}
        selectionMode="files"
        acceptedFileHint="ts, js, py"
        approxTokens={4}
        contextWindowTokens={1048576}
        usagePercent={0.1}
        modelLabel="gpt-5.4"
        providerLabel="openai"
        message={"Listo"}
        error={null}
        onApplyToCurrentMessageChange={onToggle}
        onFilesAdded={onAdd}
        onRemoveFile={onRemove}
        onClearFiles={onClear}
      />,
    );

    expect(screen.getByText("Archivos locales")).toBeInTheDocument();
    expect(screen.getByText("src/app.ts")).toBeInTheDocument();
    expect(screen.getByText("4 tokens aprox.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByText("Limpiar"));
    expect(onClear).toHaveBeenCalled();
  });
});
