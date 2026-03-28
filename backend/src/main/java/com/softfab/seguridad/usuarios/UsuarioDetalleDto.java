package com.softfab.seguridad.usuarios;

public record UsuarioDetalleDto(
        String usuario,
        String nombre,
        String cedula,
        String cargo,
        String empresa,
        String empresaNombre,
        String centro,
        String centroNombre,
        String perfil,
        String perfilDescripcion,
        String dominio,
        String nodo,
        String autorizador,
        String usuarioBancs,
        String terminalBancs,
        String observacion,
        String oficinaSwift,
        String fechaActualizacion,
        String horaActualizacion,
        String usuarioActualizacion,
        String terminalActualizacion,
        String fechaLogin,
        String horaLogin
) {}
