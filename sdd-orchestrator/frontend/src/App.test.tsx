import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("renders the empty project shell", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("No hay proyectos todavía. Crea uno para empezar.");
  });
});
