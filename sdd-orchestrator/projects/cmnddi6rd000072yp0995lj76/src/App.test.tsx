import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('Reloj multizona', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra al menos tres zonas predefinidas y permite cambiar la destacada', () => {
    render(<App />);

    expect(screen.getByLabelText('Ciudad de México fija')).toBeInTheDocument();
    expect(screen.getByLabelText('Madrid destacada')).toBeInTheDocument();
    expect(screen.getByLabelText('Tokio fija')).toBeInTheDocument();

    const select = screen.getByLabelText('Zona destacada');
    fireEvent.change(select, { target: { value: 'tokio' } });

    expect(select).toHaveValue('tokio');
    expect(screen.getByLabelText('Tokio destacada')).toBeInTheDocument();
  });

  it('actualiza la hora al pasar un segundo', () => {
    render(<App />);

    expect(screen.getAllByText('14:00:00')[0]).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getAllByText('14:00:01')[0]).toBeInTheDocument();
  });
});
