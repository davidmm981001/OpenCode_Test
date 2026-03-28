package com.softfab.seguridad.usuarios;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
@Table(name = "t95_par02")
public class ParametroEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cod_grupo_usuario", nullable = false, length = 8)
    private String grupoUsuario;

    @Column(name = "cod_parametro", nullable = false, length = 8)
    private String parametro;

    @Column(name = "descripcion", nullable = false, length = 80)
    private String descripcion;
}
