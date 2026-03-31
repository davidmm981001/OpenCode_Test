export const MASS_UNITS = ["mg", "g", "kg", "t"] as const;

export type MassUnit = (typeof MASS_UNITS)[number];

const MASS_TO_GRAMS: Record<MassUnit, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  t: 1_000_000,
};

export function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "Error";
  if (Math.abs(value) < 1e-12) return "0";

  const rounded = Number(value.toFixed(6));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(/0+$/, "").replace(/\.$/, "");
}

export function calculateExpression(expression: string) {
  const normalized = expression.replace(/\s+/g, "").replace(/,/g, ".");

  if (!normalized) {
    throw new Error("Ingresa una operación.");
  }

  if (!/^[0-9+\-*/().]+$/.test(normalized)) {
    throw new Error("La operación contiene caracteres no permitidos.");
  }

  try {
    const value = Function(`"use strict"; return (${normalized});`)();
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error("Resultado inválido.");
    }
    return value;
  } catch {
    throw new Error("No se pudo calcular la operación.");
  }
}

export function convertMass(value: number, from: MassUnit, to: MassUnit) {
  return (value * MASS_TO_GRAMS[from]) / MASS_TO_GRAMS[to];
}
