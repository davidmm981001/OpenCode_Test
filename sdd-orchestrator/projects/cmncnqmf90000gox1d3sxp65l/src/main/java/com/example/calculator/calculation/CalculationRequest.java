package com.example.calculator.calculation;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CalculationRequest(
        @NotNull BigDecimal left,
        @NotNull BigDecimal right,
        @NotNull Operation operation
) {
}
