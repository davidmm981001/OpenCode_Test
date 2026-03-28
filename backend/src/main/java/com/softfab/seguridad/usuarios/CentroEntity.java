package com.softfab.seguridad.usuarios;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@IdClass(CentroEntity.CentroId.class)
@Table(name = "t06_tc007")
public class CentroEntity {

    @Id
    @Column(name = "empresa", length = 4)
    private String empresa;

    @Id
    @Column(name = "centro", length = 4)
    private String centro;

    @Column(name = "descripcion", nullable = false, length = 80)
    private String descripcion;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CentroId implements Serializable {
        private String empresa;
        private String centro;
    }
}
