package com.inventariodavid.productos.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductoCreateRequest(
    @NotBlank(message = "Nombre requerido") String nombre,
    @NotNull(message = "Cantidad requerida") @Min(value = 0, message = "Cantidad debe ser mayor o igual a 0") Integer cantidad,
    @NotNull(message = "Precio requerido") @Digits(integer = 16, fraction = 2, message = "Precio inválido") BigDecimal precio) {
}
