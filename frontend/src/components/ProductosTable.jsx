import { memo } from 'react';

function formatCurrency(value) {
  const numero = Number(value || 0);
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(numero);
}

function ProductosTable({ productos, onEliminar, disabled = false }) {
  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="products-table table table-striped table-hover table-bordered align-middle mb-0">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Nombre</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Precio</th>
            <th scope="col" className="visually-hidden">Accion</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty-state empty-state-soft">
                <div>
                  <strong>No hay productos registrados.</strong>
                  <span>Agrega el primer producto para empezar a operar el inventario.</span>
                </div>
              </td>
            </tr>
          ) : (
            productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td>{producto.nombre}</td>
                <td>
                  <span className="quantity-pill">{producto.cantidad}</span>
                </td>
                <td>{formatCurrency(producto.precio)}</td>
                <td>
                  <button type="button" className="button button-ghost button-danger" onClick={() => onEliminar(producto.id)} disabled={disabled}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(ProductosTable);
