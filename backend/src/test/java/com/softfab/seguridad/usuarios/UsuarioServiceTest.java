package com.softfab.seguridad.usuarios;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softfab.seguridad.common.BusinessException;
import org.springframework.data.jpa.domain.Specification;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock UsuarioRepository usuarioRepository;
    @Mock BancsRepository bancsRepository;
    @Mock ObservacionRepository observacionRepository;
    @Mock ParametroRepository parametroRepository;
    @Mock PerfilRepository perfilRepository;
    @Mock EmpresaRepository empresaRepository;
    @Mock CentroRepository centroRepository;
    @Mock AuditLogRepository auditLogRepository;
    @Mock ObjectMapper objectMapper;

    @InjectMocks UsuarioService usuarioService;

    @Test
    void search_should_fail_when_filters_are_empty() {
        assertThrows(BusinessException.class, () -> usuarioService.search("", "", "", "", "", 0, 14));
    }

    @Test
    void search_should_return_paged_results() {
        when(usuarioRepository.findAll(org.mockito.Mockito.<Specification<UsuarioEntity>>any(), any(PageRequest.class))).thenReturn(
                new PageImpl<>(List.of(sampleUser()), PageRequest.of(0, 1), 2)
        );

        UsuarioPageDto page = usuarioService.search("0001", "", "", "", "", 0, 14);

        assertEquals(1, page.content().size());
        assertEquals("Existen más Datos", page.statusMessage());
    }

    @Test
    void create_should_validate_company_and_profile() throws Exception {
        when(empresaRepository.existsById("0001")).thenReturn(true);
        when(centroRepository.findByEmpresaAndCentro("0001", "0001")).thenReturn(java.util.Optional.of(new CentroEntity("0001", "0001", "Centro")));
        when(perfilRepository.existsById("ADM")).thenReturn(true);
        when(parametroRepository.existsByGrupoUsuarioAndParametro("GR", "ADM")).thenReturn(true);
        when(usuarioRepository.existsById("USR00003")).thenReturn(false);
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");

        UsuarioDetalleDto dto = usuarioService.create(new UsuarioUpsertRequest(
                "USR00003", "Nuevo Usuario", "0102030405", "Analista", "0001", "0001", "ADM", "1", "12345678", "54321", "Obs", "MSQUTODO"
        ), "admin");

        assertEquals("USR00003", dto.usuario());
    }

    private UsuarioEntity sampleUser() {
        return new UsuarioEntity("USR00001", "Juan Perez", "N", "0102030405", "00000001", "Supervisor", "0001", "0001", "ADM", "DOM1", "NOD1", "1", "20260327", "120000", "admin", "T001", "20260327", "080000", "ABC12345", "Usuario semilla", "20260327", "20260327", "MSQUTODO");
    }
}
