package com.softfab.seguridad.usuarios;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ParametroRepository extends JpaRepository<ParametroEntity, Long> {
    boolean existsByGrupoUsuarioAndParametro(String grupoUsuario, String parametro);
}
