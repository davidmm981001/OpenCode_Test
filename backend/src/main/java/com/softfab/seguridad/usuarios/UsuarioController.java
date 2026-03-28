package com.softfab.seguridad.usuarios;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;

@RestController
@RequestMapping("/api/seguridad/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public UsuarioPageDto search(
            @RequestParam(required = false) String empresa,
            @RequestParam(required = false) String centro,
            @RequestParam(required = false) String usuario,
            @RequestParam(required = false) String perfil,
            @RequestParam(required = false) String nombre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "14") int size
    ) {
        return usuarioService.search(empresa, centro, usuario, perfil, nombre, page, size);
    }

    @GetMapping("/{usuario}")
    public UsuarioDetalleDto detail(@PathVariable String usuario) {
        return usuarioService.detail(usuario);
    }

    @PostMapping
    public UsuarioDetalleDto create(@Valid @RequestBody UsuarioUpsertRequest request, Authentication authentication) {
        return usuarioService.create(request, authentication.getName());
    }

    @PutMapping("/{usuario}")
    public UsuarioDetalleDto update(@PathVariable String usuario, @Valid @RequestBody UsuarioUpsertRequest request, Authentication authentication) {
        return usuarioService.update(usuario, request, authentication.getName());
    }

    @DeleteMapping("/{usuario}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String usuario, @RequestParam String observacion, Authentication authentication) {
        usuarioService.delete(usuario, observacion, authentication.getName());
    }
}
