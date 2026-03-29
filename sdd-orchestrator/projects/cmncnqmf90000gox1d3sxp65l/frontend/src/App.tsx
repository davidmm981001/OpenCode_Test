import { FormEvent, useState } from 'react';
import './App.css';

type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

type ApiError = {
  message: string;
};

type ApiResponse = {
  result: number;
};

const operations: Array<{ value: Operation; label: string }> = [
  { value: 'add', label: 'Suma' },
  { value: 'subtract', label: 'Resta' },
  { value: 'multiply', label: 'Multiplicacion' },
  { value: 'divide', label: 'Division' }
];

export default function App() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [operation, setOperation] = useState<Operation>('add');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          left: Number(left),
          right: Number(right),
          operation
        })
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as ApiError;
        throw new Error(errorBody.message ?? 'No se pudo calcular el resultado.');
      }

      const data = (await response.json()) as ApiResponse;
      setResult(String(data.result));
    } catch (submitError) {
      setResult('');
      setError(submitError instanceof Error ? submitError.message : 'No se pudo calcular el resultado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="calculator-card">
        <p className="eyebrow">Calculadora basica</p>
        <h1>Operaciones simples desde React</h1>

        <form onSubmit={handleSubmit} className="calculator-form">
          <label>
            Primer numero
            <input
              type="number"
              step="any"
              value={left}
              onChange={(event) => setLeft(event.target.value)}
              placeholder="0"
              required
            />
          </label>

          <label>
            Segundo numero
            <input
              type="number"
              step="any"
              value={right}
              onChange={(event) => setRight(event.target.value)}
              placeholder="0"
              required
            />
          </label>

          <label>
            Operacion
            <select value={operation} onChange={(event) => setOperation(event.target.value as Operation)}>
              {operations.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Calculando...' : 'Calcular'}
          </button>
        </form>

        {result && (
          <output className="result" aria-live="polite">
            Resultado: {result}
          </output>
        )}

        {error && (
          <output className="error" aria-live="assertive">
            {error}
          </output>
        )}
      </section>
    </main>
  );
}
