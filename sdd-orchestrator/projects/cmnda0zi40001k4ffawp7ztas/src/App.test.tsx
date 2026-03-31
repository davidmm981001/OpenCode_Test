import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("Calculadora", () => {
  it("resuelve una operación básica", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText(/expresión/i));
    await user.click(screen.getByRole("button", { name: "2" }));
    await user.click(screen.getByRole("button", { name: "+" }));
    await user.click(screen.getByRole("button", { name: "3" }));
    await user.click(screen.getByRole("button", { name: "Calcular" }));

    expect(screen.getAllByText("5").length).toBeGreaterThan(0);
  });

  it("convierte kg a g", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText(/valor/i));
    await user.type(screen.getByLabelText(/valor/i), "2");
    await user.selectOptions(screen.getByLabelText(/^de$/i), "kg");
    await user.selectOptions(screen.getByLabelText(/^a$/i), "g");

    expect(screen.getByText(/2000 g/i)).toBeInTheDocument();
  });
});
