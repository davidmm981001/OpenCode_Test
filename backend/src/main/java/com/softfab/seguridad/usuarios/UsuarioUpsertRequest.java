package com.softfab.seguridad.usuarios;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UsuarioUpsertRequest(
        @NotBlank(message = "Ingrese Usuario")
        @Size(max = 8)
        String usuario,

        @NotBlank(message = "Ingrese Nombre de Usr.")
        @Size(max = 43)
        String nombre,

        @Size(max = 10)
        String cedula,

        @Size(max = 18)
        String cargo,

        @NotBlank(message = "Ingrese Código de Empresa")
        @Size(max = 4)
        String empresa,

        @NotBlank(message = "Ingrese Código de Centro")
        @Size(max = 4)
        String centro,

        @NotBlank(message = "Ingrese Perfil de VM")
        @Size(max = 8)
        String perfil,

        @Pattern(regexp = "^[01]$", message = "Autorizador inválido")
        String autorizador,

        @Size(max = 8)
        String usuarioBancs,

        @Size(max = 5)
        String terminalBancs,

        @NotBlank(message = "Ingrese Observaciones")
        @Size(max = 80)
        String observacion,

        @Size(max = 20)
        String oficinaSwift
) {}
