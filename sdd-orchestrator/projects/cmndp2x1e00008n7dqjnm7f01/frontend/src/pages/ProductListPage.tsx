import { useCallback, useEffect, useState } from 'react';
import ProductFormModal from '../components/ProductFormModal';
import ProductTable from '../components/ProductTable';
import { crearProducto, eliminarProducto, obtenerProductos } from '../api/productos';
import type { ProductoCreateInput, ProductoDTO } from '../types/producto';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function ProductListPage() {
  const [productos, setProductos] = useState<ProductoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useDocumentTitle('Home');

  const loadProductos = useCallback(async () => {
    setLoading(true);
    setPageError('');

    try {
      const items = await obtenerProductos();
      setProductos(items);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado';
      setPageError(`No se pudieron cargar los productos: ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProductos();
  }, [loadProductos]);

  async function handleSaveProducto(input: ProductoCreateInput) {
    const created = await crearProducto(input);
    setProductos((current) => [...current, created]);
  }

  async function handleDeleteProducto(id: number) {
    const confirmed = window.confirm('¿Está seguro de que desea eliminar este producto?');

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setPageError('');

    try {
      await eliminarProducto(id);
      await loadProductos();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado';
      setPageError(`No se pudo eliminar el producto: ${message}`);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Inventario</h1>
          <p className="text-muted mb-0">Consulta, agrega y elimina productos del inventario.</p>
        </div>
        <button type="button" className="btn btn-success align-self-start" onClick={() => setModalOpen(true)}>
          <span className="me-2">+</span>Nuevo
        </button>
      </div>

      {pageError ? <div className="alert alert-danger" role="alert">{pageError}</div> : null}

      {loading ? (
        <div className="text-center py-5 text-muted">Cargando productos...</div>
      ) : (
        <ProductTable productos={productos} onDelete={handleDeleteProducto} deletingId={deletingId} />
      )}

      <ProductFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveProducto} />
    </section>
  );
}
