import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductFormModal from './ProductFormModal';

describe('ProductFormModal', () => {
  it('valida nombre requerido', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<ProductFormModal isOpen onClose={vi.fn()} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Nombre requerido')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('envía datos válidos', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(<ProductFormModal isOpen onClose={onClose} onSave={onSave} />);

    await user.type(screen.getByLabelText('Nombre'), 'Teclado USB');
    await user.type(screen.getByLabelText('Cantidad'), '50');
    await user.type(screen.getByLabelText('Precio'), '29.99');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onSave).toHaveBeenCalledWith({ nombre: 'Teclado USB', cantidad: 50, precio: 29.99 });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
