package com.example.calculator.calculation;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum Operation {
    ADD("add"),
    SUBTRACT("subtract"),
    MULTIPLY("multiply"),
    DIVIDE("divide");

    private final String value;

    Operation(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static Operation fromValue(String value) {
        if (value == null) {
            throw new IllegalArgumentException("La operación es obligatoria.");
        }

        String normalized = value.toLowerCase(Locale.ROOT);
        for (Operation operation : values()) {
            if (operation.value.equals(normalized)) {
                return operation;
            }
        }
        throw new IllegalArgumentException("Operación no soportada: " + value);
    }
}
