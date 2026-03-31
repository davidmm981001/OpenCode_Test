export interface ProductoDTO {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface ProductoCreateInput {
  nombre: string;
  cantidad: number;
  precio: number;
}
