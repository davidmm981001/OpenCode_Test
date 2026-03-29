package com.example.calculator.calculation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CalculatorController {

    private final CalculatorService calculatorService;

    public CalculatorController(CalculatorService calculatorService) {
        this.calculatorService = calculatorService;
    }

    @PostMapping(value = "/calculate", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Calcula una operacion aritmetica basica")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operacion calculada correctamente", content = @Content),
            @ApiResponse(responseCode = "400", description = "Solicitud invalida", content = @Content)
    })
    public CalculationResponse calculate(@Valid @RequestBody CalculationRequest request) {
        return calculatorService.calculate(request);
    }
}
