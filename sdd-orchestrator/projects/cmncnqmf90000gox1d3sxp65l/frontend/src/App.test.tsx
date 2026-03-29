import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra el resultado de una suma', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 9 })
    }));

    render(<App />);

    fireEvent.change(screen.getByLabelText(/primer numero/i), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText(/segundo numero/i), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /calcular/i }));

    await waitFor(() => {
      expect(screen.getByText(/resultado: 9/i)).toBeInTheDocument();
    });
  });

  it('muestra un error cuando la division por cero es rechazada', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'No se puede dividir entre cero.' })
    }));

    render(<App />);

    fireEvent.change(screen.getByLabelText(/primer numero/i), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText(/segundo numero/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/operacion/i), { target: { value: 'divide' } });
    fireEvent.click(screen.getByRole('button', { name: /calcular/i }));

    await waitFor(() => {
      expect(screen.getByText(/no se puede dividir entre cero/i)).toBeInTheDocument();
    });
  });
});
