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
@Table(name = "t06_tc005")
public class EmpresaEntity {

    @Id
    @Column(name = "empresa", length = 4)
    private String empresa;

    @Column(name = "descripcion", nullable = false, length = 80)
    private String descripcion;
}
