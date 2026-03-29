package com.example.testing.timer;

import java.util.UUID;

public class TimerSessionNotFoundException extends RuntimeException {

    public TimerSessionNotFoundException(UUID id) {
        super("No se encontro el tiempo con id " + id);
    }
}
