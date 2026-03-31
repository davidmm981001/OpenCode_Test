import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('muestra el layout y el listado inicial', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify([{ id: 1, nombre: 'Teclado USB', cantidad: 50, precio: 29.99 }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );

    render(<App />);

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Teclado USB')).toBeInTheDocument());
    expect(screen.getByText(/©/)).toBeInTheDocument();
  });
});
