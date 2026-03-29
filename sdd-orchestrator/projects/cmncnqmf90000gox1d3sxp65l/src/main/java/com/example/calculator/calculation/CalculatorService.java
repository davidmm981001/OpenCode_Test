package com.example.calculator.calculation;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;

@Service
public class CalculatorService {

    public CalculationResponse calculate(CalculationRequest request) {
        BigDecimal result = calculate(request.left(), request.right(), request.operation());
        return new CalculationResponse(result);
    }

    BigDecimal calculate(BigDecimal left, BigDecimal right, Operation operation) {
        return switch (operation) {
            case ADD -> left.add(right);
            case SUBTRACT -> left.subtract(right);
            case MULTIPLY -> left.multiply(right);
            case DIVIDE -> divide(left, right);
        };
    }

    private BigDecimal divide(BigDecimal left, BigDecimal right) {
        if (right.compareTo(BigDecimal.ZERO) == 0) {
            throw new DivisionByZeroException("No se puede dividir entre cero.");
        }
        return left.divide(right, MathContext.DECIMAL64);
    }
}
