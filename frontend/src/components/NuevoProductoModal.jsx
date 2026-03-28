import { memo, useEffect, useState } from 'react';

const initialState = {
  nombre: '',
  cantidad: '',
  precio: ''
};

function NuevoProductoModal({ open, onClose, onSave }) {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initialState);
      setError('');
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await onSave(form);
      onClose();
    } catch (exception) {
      const mensaje = exception?.tipo === 'FORMATO_INVALIDO'
        ? exception.userMessage || 'Revise cantidad y precio: deben ser números válidos.'
        : `No se pudo guardar: ${exception?.userMessage || exception?.message || 'Error inesperado.'}`;
      setError(mensaje);
    }
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-card modal-enter" role="dialog" aria-modal="true" aria-labelledby="nuevo-producto-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Nuevo producto</p>
            <h2 id="nuevo-producto-title">Agregar al inventario</h2>
            <p className="modal-copy">Captura los datos esenciales con un formato rapido y sin friccion.</p>
          </div>
          <button type="button" className="icon-button" aria-label="Cerrar modal" onClick={onClose}>
            ×
          </button>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="hint-strip" aria-label="Ayuda de captura">
          <span>Nombre obligatorio</span>
          <span>Cantidad entera</span>
          <span>Precio decimal</span>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input name="nombre" value={form.nombre} onChange={handleChange} autoComplete="off" placeholder="Teclado USB" />
          </label>

          <div className="form-grid">
            <label>
              Cantidad
              <input name="cantidad" value={form.cantidad} onChange={handleChange} inputMode="numeric" autoComplete="off" placeholder="50" />
            </label>

            <label>
              Precio
              <input name="precio" value={form.precio} onChange={handleChange} inputMode="decimal" autoComplete="off" placeholder="29.99" />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="button button-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default memo(NuevoProductoModal);
