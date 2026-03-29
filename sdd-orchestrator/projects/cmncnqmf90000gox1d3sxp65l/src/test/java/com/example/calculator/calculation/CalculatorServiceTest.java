package com.example.calculator.calculation;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CalculatorServiceTest {

    private final CalculatorService calculatorService = new CalculatorService();

    @Test
    void sumaDosNumeros() {
        assertEquals(new BigDecimal("8"), calculatorService.calculate(new BigDecimal("3"), new BigDecimal("5"), Operation.ADD));
    }

    @Test
    void restaDosNumeros() {
        assertEquals(new BigDecimal("-2"), calculatorService.calculate(new BigDecimal("3"), new BigDecimal("5"), Operation.SUBTRACT));
    }

    @Test
    void multiplicaDosNumeros() {
        assertEquals(new BigDecimal("15"), calculatorService.calculate(new BigDecimal("3"), new BigDecimal("5"), Operation.MULTIPLY));
    }

    @Test
    void divideDosNumeros() {
        assertEquals(new BigDecimal("2.5"), calculatorService.calculate(new BigDecimal("5"), new BigDecimal("2"), Operation.DIVIDE));
    }

    @Test
    void fallaAlDividirPorCero() {
        assertThrows(DivisionByZeroException.class,
                () -> calculatorService.calculate(new BigDecimal("5"), BigDecimal.ZERO, Operation.DIVIDE));
    }
}
