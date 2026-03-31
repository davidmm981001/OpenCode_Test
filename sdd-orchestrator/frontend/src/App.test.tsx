import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("muestra el texto de smoke transcript", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("OpenCode responde y el transcript se sincroniza.");
  });
});
