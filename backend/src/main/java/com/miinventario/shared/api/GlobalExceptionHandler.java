package com.miinventario.shared.api;

import com.miinventario.producto.domain.exception.ProductoFormatoException;
import com.miinventario.producto.domain.exception.ProductoNegocioException;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ProductoFormatoException.class)
    public ResponseEntity<ApiErrorResponse> handleFormato(ProductoFormatoException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiErrorResponse("FORMATO_INVALIDO", ex.getMessage()));
    }

    @ExceptionHandler({ProductoNegocioException.class, MethodArgumentNotValidException.class, BindException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiErrorResponse> handleNegocio(Exception ex) {
        String message = ex instanceof MethodArgumentNotValidException validException
            ? validException.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage() == null ? "Validacion invalida." : error.getDefaultMessage())
                .orElse("Validacion invalida.")
            : ex.getMessage();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiErrorResponse("VALIDACION_NEGOCIO", message == null ? "Validacion invalida." : message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneral(Exception ex) {
        logger.error("Error inesperado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ApiErrorResponse("ERROR_INTERNO", "Ocurrio un error inesperado."));
    }
}
