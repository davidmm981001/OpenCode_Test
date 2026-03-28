package com.softfab.seguridad.usuarios;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CentroRepository extends JpaRepository<CentroEntity, CentroEntity.CentroId> {
    Optional<CentroEntity> findByEmpresaAndCentro(String empresa, String centro);
}
