package com.example.testing.timer;

public class TimerSessionAlreadyStoppedException extends RuntimeException {

    public TimerSessionAlreadyStoppedException() {
        super("El tiempo ya fue detenido");
    }
}
