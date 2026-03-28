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
@Table(name = "t95_obs04")
public class ObservacionEntity {

    @Id
    @Column(name = "usr_siglo21", length = 8)
    private String usuario;

    @Column(name = "observacion", nullable = false, length = 80)
    private String observacion;
}
