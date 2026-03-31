import type { ProductoCreateInput, ProductoDTO } from '../types/producto';

const BASE_URL = '/api/productos';

async function parseErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      const body = (await response.json()) as { message?: string };
      return body.message ?? 'Respuesta inválida';
    } catch {
      return 'Respuesta inválida';
    }
  }

  const text = await response.text();
  return text.trim() || 'Respuesta inválida';
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(input, init);
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as T;
}

export async function obtenerProductos(): Promise<ProductoDTO[]> {
  return requestJson<ProductoDTO[]>(BASE_URL);
}

export async function crearProducto(input: ProductoCreateInput): Promise<ProductoDTO> {
  return requestJson<ProductoDTO>(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
}

export async function eliminarProducto(id: number): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}
