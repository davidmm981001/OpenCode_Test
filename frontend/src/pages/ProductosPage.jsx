import { useCallback, useEffect, useMemo, useState } from 'react';
import NuevoProductoModal from '../components/NuevoProductoModal';
import ProductosTable from '../components/ProductosTable';
import { crearProducto, eliminarProducto, obtenerProductos } from '../api/productos';

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargandoAccion, setCargandoAccion] = useState(false);

  const metricas = useMemo(() => {
    const totalProductos = productos.length;
    const totalUnidades = productos.reduce((acumulado, producto) => acumulado + Number(producto.cantidad || 0), 0);
    const valorInventario = productos.reduce((acumulado, producto) => acumulado + Number(producto.precio || 0) * Number(producto.cantidad || 0), 0);

    return [
      { label: 'Productos', value: totalProductos.toString(), detail: 'Registrados en el sistema' },
      { label: 'Unidades', value: totalUnidades.toString(), detail: 'Cantidad total disponible' },
      { label: 'Valor inventario', value: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valorInventario), detail: 'Estimado actual' }
    ];
  }, [productos]);

  const cargarProductos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const datos = await obtenerProductos();
      setProductos(datos);
    } catch (exception) {
      setError(exception?.userMessage || 'No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Mi Inventario';
    void cargarProductos();
  }, [cargarProductos]);

  const abrirModal = useCallback(() => setModalAbierto(true), []);
  const cerrarModal = useCallback(() => setModalAbierto(false), []);

  const guardarProducto = useCallback(async (form) => {
    setCargandoAccion(true);
    try {
      await crearProducto(form);
      await cargarProductos();
    } finally {
      setCargandoAccion(false);
    }
  }, [cargarProductos]);

  const handleEliminar = useCallback(async (id) => {
    try {
      setCargandoAccion(true);
      await eliminarProducto(id);
      await cargarProductos();
    } catch (exception) {
      setError(exception?.userMessage || 'No se pudo eliminar el producto.');
    } finally {
      setCargandoAccion(false);
    }
  }, [cargarProductos]);

  return (
    <section className="content-stack page-enter">
      <div className="hero-grid">
        <div className="hero-card hero-card-primary">
          <div>
            <p className="eyebrow">Inventario</p>
            <h2>Productos disponibles</h2>
            <p className="hero-copy">Consulta, alta y eliminacion directa desde una interfaz mas clara y orientada a operacion rapida.</p>
          </div>
          <div className="hero-actions">
            <button type="button" className="button button-primary button-large" onClick={abrirModal}>
              <span aria-hidden="true" className="button-icon">+</span>
              <span>Nuevo</span>
            </button>
            <p className="hero-note">Alta, baja y consulta en una sola pantalla.</p>
          </div>
        </div>
        <aside className="hero-stats" aria-label="Resumen del inventario">
          {metricas.map((metrica) => (
            <article key={metrica.label} className="stat-card">
              <p>{metrica.label}</p>
              <strong>{metrica.value}</strong>
              <span>{metrica.detail}</span>
            </article>
          ))}
        </aside>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="table-toolbar">
        <div>
          <p className="toolbar-label">Listado</p>
          <h3>{loading ? 'Sincronizando inventario...' : 'Registro completo de productos'}</h3>
        </div>
        <div className="toolbar-badge">{productos.length} items</div>
      </div>

      {loading ? (
        <div className="loading-panel">Cargando productos...</div>
      ) : (
        <ProductosTable productos={productos} onEliminar={handleEliminar} disabled={cargandoAccion} />
      )}

      <NuevoProductoModal open={modalAbierto} onClose={cerrarModal} onSave={guardarProducto} />
    </section>
  );
}
