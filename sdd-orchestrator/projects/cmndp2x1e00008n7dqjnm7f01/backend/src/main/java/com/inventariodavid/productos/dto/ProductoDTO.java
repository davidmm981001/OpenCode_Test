package com.inventariodavid.productos.dto;

import java.math.BigDecimal;

public record ProductoDTO(Integer id, String nombre, Integer cantidad, BigDecimal precio) {
}
