package com.softfab.seguridad.usuarios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UsuarioRepository extends JpaRepository<UsuarioEntity, String>, JpaSpecificationExecutor<UsuarioEntity> {}
