package com.softfab.seguridad.usuarios;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "t95_usu03")
public class UsuarioEntity {

    @Id
    @Column(name = "usr_siglo21", length = 8)
    private String usuario;

    @Column(name = "usr_nombre", nullable = false, length = 43)
    private String nombre;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "usr_status", nullable = false, length = 1)
    private String status;

    @Column(name = "usr_cid", length = 10)
    private String cedula;

    @Column(name = "usr_offset", length = 8)
    private String offset;

    @Column(name = "usr_cargo", length = 18)
    private String cargo;

    @Column(name = "usr_empresa", nullable = false, length = 4)
    private String empresa;

    @Column(name = "usr_centro", nullable = false, length = 4)
    private String centro;

    @Column(name = "usr_pers", nullable = false, length = 8)
    private String perfil;

    @Column(name = "usr_dominio", length = 4)
    private String dominio;

    @Column(name = "usr_nodo", length = 4)
    private String nodo;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "usr_autoriza", nullable = false, length = 1)
    private String autorizador;

    @Column(name = "usr_updfch", length = 8)
    private String fechaActualizacion;

    @Column(name = "usr_updtime", length = 6)
    private String horaActualizacion;

    @Column(name = "usr_updusr", length = 8)
    private String usuarioActualizacion;

    @Column(name = "usr_updterm", length = 4)
    private String terminalActualizacion;

    @Column(name = "usr_fchlogon", length = 8)
    private String fechaLogin;

    @Column(name = "usr_timelogon", length = 6)
    private String horaLogin;

    @Column(name = "usr_token", length = 8)
    private String token;

    @Column(name = "usr_historia", length = 80)
    private String historia;

    @Column(name = "usr_fchnewpass", length = 8)
    private String fechaNuevoPassword;

    @Column(name = "usr_fchcambio", length = 8)
    private String fechaCambio;

    @Column(name = "usr_oficina_swift", length = 20)
    private String oficinaSwift;
}
