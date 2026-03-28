import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductosPage from './ProductosPage';

const obtenerProductos = vi.fn();
const crearProducto = vi.fn();
const eliminarProducto = vi.fn();

vi.mock('../api/productos', () => ({
  obtenerProductos: (...args) => obtenerProductos(...args),
  crearProducto: (...args) => crearProducto(...args),
  eliminarProducto: (...args) => eliminarProducto(...args)
}));

describe('ProductosPage', () => {
  beforeEach(() => {
    obtenerProductos.mockReset();
    crearProducto.mockReset();
    eliminarProducto.mockReset();
  });

  it('muestra la grilla al cargar', async () => {
    obtenerProductos.mockResolvedValue([{ id: 1, nombre: 'Mouse', cantidad: 3, precio: '19.99' }]);

    render(<ProductosPage />);

    expect(screen.getByText('Cargando productos...')).toBeInTheDocument();

    await screen.findByText('Mouse');
    expect(screen.getByText(/MXN|\$19\.99/)).toBeInTheDocument();
  });

  it('abre el modal de nuevo producto', async () => {
    obtenerProductos.mockResolvedValue([]);

    render(<ProductosPage />);

    await screen.findByText('No hay productos registrados.');
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo' }));

    expect(screen.getByLabelText('Nombre')).toHaveValue('');
    expect(screen.getByLabelText('Cantidad')).toHaveValue('');
    expect(screen.getByLabelText('Precio')).toHaveValue('');
  });

  it('elimina un producto y recarga la lista', async () => {
    obtenerProductos
      .mockResolvedValueOnce([{ id: 1, nombre: 'Mouse', cantidad: 3, precio: '19.99' }])
      .mockResolvedValueOnce([]);
    eliminarProducto.mockResolvedValue(undefined);

    render(<ProductosPage />);

    await screen.findByText('Mouse');
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await screen.findByText('No hay productos registrados.');
    expect(eliminarProducto).toHaveBeenCalledWith(1);
  });
});
