import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const storageKey = 'todo-full-app:v1';

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('permite agregar, completar, eliminar y restaurar tareas', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(screen.getByLabelText('Nueva tarea'), 'Comprar leche');
    await user.click(screen.getByRole('button', { name: 'Agregar' }));

    const checkbox = screen.getByLabelText('Marcar Comprar leche') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);

    await user.click(screen.getByRole('button', { name: /Eliminar/i }));
    expect(screen.queryByLabelText('Marcar Comprar leche')).toBeNull();

    window.localStorage.setItem(
      storageKey,
      JSON.stringify([{ id: '1', text: 'Persistida', completed: false }]),
    );

    render(<App />);
    expect(screen.getByLabelText('Marcar Persistida')).toBeTruthy();
  });
});
