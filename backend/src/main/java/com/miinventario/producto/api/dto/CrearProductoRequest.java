package com.miinventario.producto.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CrearProductoRequest(
    @NotBlank(message = "Nombre requerido") String nombre,
    String cantidad,
    String precio
) {
}
