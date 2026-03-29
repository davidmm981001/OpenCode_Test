package com.example.testing.timer;

public class ActiveTimerExistsException extends RuntimeException {

    public ActiveTimerExistsException() {
        super("Ya existe un tiempo en ejecucion");
    }
}
