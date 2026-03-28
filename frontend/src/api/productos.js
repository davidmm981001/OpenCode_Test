const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.mensaje || 'No se pudo completar la operacion.');
    error.tipo = data?.codigo || 'ERROR';
    error.userMessage = data?.mensaje || 'No se pudo completar la operacion.';
    throw error;
  }

  return data;
}

export function obtenerProductos() {
  return request('/api/productos');
}

export function crearProducto(producto) {
  return request('/api/productos', {
    method: 'POST',
    body: JSON.stringify(producto)
  });
}

export function eliminarProducto(id) {
  return request(`/api/productos/${id}`, {
    method: 'DELETE'
  });
}
