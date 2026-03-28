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
@Table(name = "t01_gre20")
public class PerfilEntity {

    @Id
    @Column(name = "perfil", length = 8)
    private String perfil;

    @Column(name = "descripcion", nullable = false, length = 80)
    private String descripcion;
}
