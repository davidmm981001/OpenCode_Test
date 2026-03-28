package com.softfab.seguridad.usuarios;

public record UsuarioListItemDto(
        String usuario,
        String nombres,
        String perfil,
        String empresa,
        String centro,
        String dominio,
        String nodo,
        String autorizador
) {}
