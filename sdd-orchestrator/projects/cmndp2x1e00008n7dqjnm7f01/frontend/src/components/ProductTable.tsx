import type { ProductoDTO } from '../types/producto';

interface ProductTableProps {
  productos: ProductoDTO[];
  onDelete: (id: number) => Promise<void> | void;
  deletingId?: number | null;
}

function formatPrice(value: number): string {
  return Number(value).toFixed(2);
}

export default function ProductTable({ productos, onDelete, deletingId }: ProductTableProps) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover table-bordered align-middle mb-0 inventory-table">
        <thead className="table-light">
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Nombre</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Precio</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-muted py-4">
                No hay productos registrados
              </td>
            </tr>
          ) : (
            productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td>{producto.nombre}</td>
                <td>{producto.cantidad}</td>
                <td>{formatPrice(producto.precio)}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => void onDelete(producto.id)}
                    disabled={deletingId === producto.id}
                  >
                    {deletingId === producto.id ? 'Eliminando...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
