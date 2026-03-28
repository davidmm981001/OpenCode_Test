package com.softfab.seguridad.usuarios;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "t95_ban04")
public class BancsEntity {

    @Id
    @Column(name = "usr_siglo21", length = 8)
    private String usuario;

    @Column(name = "usuario_bancs", length = 8)
    private String usuarioBancs;

    @Column(name = "terminal_bancs", length = 5)
    private String terminalBancs;

    @Column(name = "estado_proceso", nullable = false, length = 2)
    private String estadoProceso;
}
