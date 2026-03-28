import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NuevoProductoModal from './NuevoProductoModal';

describe('NuevoProductoModal', () => {
  it('limpia formulario y errores al abrir', () => {
    render(<NuevoProductoModal open onClose={vi.fn()} onSave={vi.fn()} />);

    expect(screen.getByLabelText('Nombre')).toHaveValue('');
    expect(screen.getByLabelText('Cantidad')).toHaveValue('');
    expect(screen.getByLabelText('Precio')).toHaveValue('');
  });

  it('muestra un error de formato cuando el guardado falla con formato', async () => {
    const onSave = vi.fn().mockRejectedValue({ tipo: 'FORMATO_INVALIDO', userMessage: 'Revise cantidad y precio: deben ser números válidos.' });

    render(<NuevoProductoModal open onClose={vi.fn()} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Mouse' } });
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText('Precio'), { target: { value: '19.99' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(screen.getByText('Revise cantidad y precio: deben ser números válidos.')).toBeInTheDocument());
  });
});
