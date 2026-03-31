import { type FormEvent, useEffect, useState } from 'react';
import type { ProductoCreateInput } from '../types/producto';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: ProductoCreateInput) => Promise<void>;
}

const INITIAL_STATE = {
  nombre: '',
  cantidad: '',
  precio: '',
};

export default function ProductFormModal({ isOpen, onClose, onSave }: ProductFormModalProps) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_STATE);
      setErrorMessage('');
      setSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nombre = form.nombre.trim();
    const cantidad = Number.parseInt(form.cantidad.trim(), 10);
    const precio = Number.parseFloat(form.precio.trim());

    if (!nombre) {
      setErrorMessage('Nombre requerido');
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad < 0 || !Number.isFinite(precio) || precio < 0) {
      setErrorMessage('Revise cantidad y precio: deben ser números válidos.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      await onSave({ nombre, cantidad, precio });
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado';
      setErrorMessage(`No se pudo guardar: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="modal fade show d-block" role="dialog" aria-modal="true" aria-labelledby="nuevo-producto-title">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-header">
                <h5 className="modal-title" id="nuevo-producto-title">
                  Nuevo producto
                </h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} />
              </div>
              <div className="modal-body">
                {errorMessage ? <p className="text-danger mb-3">{errorMessage}</p> : null}

                <div className="mb-3">
                  <label htmlFor="producto-nombre" className="form-label">
                    Nombre
                  </label>
                  <input
                    id="producto-nombre"
                    className="form-control"
                    type="text"
                    value={form.nombre}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, nombre: event.target.value }));
                      if (errorMessage) setErrorMessage('');
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="producto-cantidad" className="form-label">
                    Cantidad
                  </label>
                  <input
                    id="producto-cantidad"
                    className="form-control"
                    type="number"
                    min="0"
                    step="1"
                    value={form.cantidad}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, cantidad: event.target.value }));
                      if (errorMessage) setErrorMessage('');
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="producto-precio" className="form-label">
                    Precio
                  </label>
                  <input
                    id="producto-precio"
                    className="form-control"
                    type="text"
                    inputMode="decimal"
                    placeholder="29.99"
                    value={form.precio}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, precio: event.target.value }));
                      if (errorMessage) setErrorMessage('');
                    }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
