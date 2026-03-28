package com.softfab.seguridad.usuarios;

import java.util.List;

public record UsuarioPageDto(
        List<UsuarioListItemDto> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasPrevious,
        boolean hasNext,
        String statusMessage
) {}
