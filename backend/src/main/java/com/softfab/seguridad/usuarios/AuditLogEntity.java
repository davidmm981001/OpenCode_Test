package com.softfab.seguridad.usuarios;

import java.time.LocalDateTime;

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
@Table(name = "t95_log01")
public class AuditLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String transaccion;

    @Column(nullable = false, length = 20)
    private String operacion;

    @Column(nullable = false, length = 4000)
    private String detalle;

    @Column(name = "before_data", length = 4000)
    private String beforeData;

    @Column(name = "after_data", length = 4000)
    private String afterData;

    @Column(nullable = false, length = 80)
    private String usuario;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
