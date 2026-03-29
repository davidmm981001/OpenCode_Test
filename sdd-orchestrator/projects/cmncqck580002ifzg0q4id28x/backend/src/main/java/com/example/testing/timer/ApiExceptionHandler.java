package com.example.testing.timer;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ActiveTimerExistsException.class)
    public ResponseEntity<ApiErrorResponse> handleActiveTimerExists(ActiveTimerExistsException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(TimerSessionNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(TimerSessionNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(TimerSessionAlreadyStoppedException.class)
    public ResponseEntity<ApiErrorResponse> handleAlreadyStopped(TimerSessionAlreadyStoppedException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    private ResponseEntity<ApiErrorResponse> build(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ApiErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message));
    }
}
