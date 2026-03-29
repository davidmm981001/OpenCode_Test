package com.example.testing.timer;

import java.util.List;
import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/timers")
@Tag(name = "Timers", description = "Gestion de tiempos del stopwatch")
public class TimerController {

    private final TimerService timerService;

    public TimerController(TimerService timerService) {
        this.timerService = timerService;
    }

    @GetMapping
    @Operation(summary = "Listar tiempos")
    @ApiResponse(responseCode = "200", description = "Lista de tiempos")
    public List<TimerSessionResponse> listTimers() {
        return timerService.listTimers();
    }

    @PostMapping("/start")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Iniciar un tiempo")
    @ApiResponse(responseCode = "201", description = "Tiempo iniciado")
    public TimerSessionResponse startTimer() {
        return timerService.startTimer();
    }

    @PostMapping("/{id}/stop")
    @Operation(summary = "Detener un tiempo")
    @ApiResponse(responseCode = "200", description = "Tiempo detenido")
    public TimerSessionResponse stopTimer(@PathVariable UUID id) {
        return timerService.stopTimer(id);
    }
}
