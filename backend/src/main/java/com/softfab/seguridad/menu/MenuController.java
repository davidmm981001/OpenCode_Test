package com.softfab.seguridad.menu;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

import com.softfab.seguridad.auth.AuthUserRepository;
import com.softfab.seguridad.usuarios.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/seguridad/menu")
@RequiredArgsConstructor
public class MenuController {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    private final UsuarioService usuarioService;
    private final AuthUserRepository authUserRepository;

    @GetMapping
    public MenuResponse menu(Authentication authentication) {
        var user = authUserRepository.findByUsernameAndActiveTrue(authentication.getName()).orElseThrow();
        return new MenuResponse(
                "Módulo de Seguridad",
                user.getUsername(),
                user.getFullName(),
                LocalDate.now().format(DATE_FMT),
                LocalTime.now().format(TIME_FMT),
                usuarioService.options()
        );
    }
}
