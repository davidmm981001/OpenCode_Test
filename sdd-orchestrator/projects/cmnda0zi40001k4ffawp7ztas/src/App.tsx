import { useMemo, useState } from "react";
import { calculateExpression, convertMass, formatNumber, MASS_UNITS, type MassUnit } from "./calculator";

const calculatorKeys = [
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", ".", "(", ")"],
] as const;

const operators = new Set(["+", "-", "*", "/"]);

function appendToken(current: string, token: string) {
  if (current === "Error") return token;
  if (!current || current === "0") return token;
  return `${current}${token}`;
}

export default function App() {
  const [expression, setExpression] = useState("12+3");
  const [converterValue, setConverterValue] = useState("1");
  const [fromUnit, setFromUnit] = useState<MassUnit>("kg");
  const [toUnit, setToUnit] = useState<MassUnit>("g");

  const calculation = useMemo(() => {
    try {
      return formatNumber(calculateExpression(expression));
    } catch {
      return "Error";
    }
  }, [expression]);

  const conversion = useMemo(() => {
    const value = Number(converterValue);
    if (!Number.isFinite(value)) return "Error";
    return formatNumber(convertMass(value, fromUnit, toUnit));
  }, [converterValue, fromUnit, toUnit]);

  function handleToken(token: string) {
    setExpression((current) => {
      if (token === "C") return "";
      if (token === "⌫") return current.slice(0, -1);
      if (token === "=") return calculation;
      if (operators.has(token)) {
        if (!current) return token;
        if (operators.has(current.at(-1) ?? "")) return `${current.slice(0, -1)}${token}`;
      }
      return appendToken(current, token);
    });
  }

  function swapUnits() {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Calculadora</p>
          <h1>Cálculos rápidos y conversión de masa</h1>
          <p className="hero-copy">Suma, resta, multiplica, divide y cambia de kg a g, mg o t en una sola pantalla.</p>
        </div>
        <div className="hero-metrics">
          <span>{expression || "0"}</span>
          <strong>{calculation}</strong>
        </div>
      </section>

      <section className="workspace">
        <article className="card calculator-card">
          <div className="card-header">
            <div>
              <p className="card-label">Calculadora</p>
              <h2>Operación</h2>
            </div>
            <span className="pill">Básica</span>
          </div>

          <label className="input-group">
            <span>Expresión</span>
            <input value={expression} onChange={(event) => setExpression(event.target.value)} inputMode="decimal" />
          </label>

          <div className="calculator-toolbar">
            <button type="button" className="ghost" onClick={() => handleToken("C")}>Limpiar</button>
            <button type="button" className="ghost" onClick={() => handleToken("⌫")}>Borrar</button>
            <button type="button" className="accent" onClick={() => handleToken("=")}>Calcular</button>
          </div>

          <div className="keypad" aria-label="Teclado de calculadora">
            {calculatorKeys.flat().map((key) => (
              <button key={key} type="button" onClick={() => handleToken(key)}>
                {key}
              </button>
            ))}
            <button type="button" className="operator full-width" onClick={() => handleToken("+")}>+</button>
          </div>

          <div className="result-box">
            <span>Resultado</span>
            <strong>{calculation}</strong>
          </div>
        </article>

        <article className="card converter-card">
          <div className="card-header">
            <div>
              <p className="card-label">Conversor</p>
              <h2>Masa</h2>
            </div>
            <span className="pill">kg, g, mg, t</span>
          </div>

          <div className="converter-grid">
            <label className="input-group">
              <span>Valor</span>
              <input type="number" step="any" value={converterValue} onChange={(event) => setConverterValue(event.target.value)} />
            </label>

            <label className="input-group">
              <span>De</span>
              <select value={fromUnit} onChange={(event) => setFromUnit(event.target.value as MassUnit)}>
                {MASS_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </label>

            <label className="input-group">
              <span>A</span>
              <select value={toUnit} onChange={(event) => setToUnit(event.target.value as MassUnit)}>
                {MASS_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </label>

            <button type="button" className="ghost swap-button" onClick={swapUnits}>Intercambiar</button>
          </div>

          <div className="result-box conversion-result">
            <span>Conversión</span>
            <strong>{conversion === "Error" ? "Error" : `${conversion} ${toUnit}`}</strong>
          </div>
        </article>
      </section>
    </main>
  );
}
