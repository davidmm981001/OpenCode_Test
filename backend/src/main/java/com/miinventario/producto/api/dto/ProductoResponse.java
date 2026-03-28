package com.miinventario.producto.api.dto;

import java.math.BigDecimal;

public record ProductoResponse(Long id, String nombre, Integer cantidad, BigDecimal precio) {
}
