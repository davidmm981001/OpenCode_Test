package com.softfab.seguridad.usuarios;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softfab.seguridad.common.BusinessException;
import com.softfab.seguridad.common.NotFoundException;
import com.softfab.seguridad.menu.MenuOptionDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HHmmss");

    private final UsuarioRepository usuarioRepository;
    private final BancsRepository bancsRepository;
    private final ObservacionRepository observacionRepository;
    private final ParametroRepository parametroRepository;
    private final PerfilRepository perfilRepository;
    private final EmpresaRepository empresaRepository;
    private final CentroRepository centroRepository;
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public UsuarioPageDto search(String empresa, String centro, String usuario, String perfil, String nombre, int page, int size) {
        boolean empty = !StringUtils.hasText(empresa) && !StringUtils.hasText(centro)
                && !StringUtils.hasText(usuario) && !StringUtils.hasText(perfil) && !StringUtils.hasText(nombre);
        if (empty) {
            throw new BusinessException("Ingrese Criterio Consulta");
        }

        Specification<UsuarioEntity> spec = buildSpecification(empresa, centro, usuario, perfil, nombre);
        var pageRequest = PageRequest.of(Math.max(page, 0), size <= 0 ? 14 : size, Sort.by(Sort.Direction.ASC, "usuario"));
        var result = usuarioRepository.findAll(spec, pageRequest);

        List<UsuarioListItemDto> content = result.getContent().stream()
                .map(this::toListItem)
                .toList();

        String message;
        if (content.isEmpty()) {
            message = "Fin de Códigos";
        } else if (result.hasNext()) {
            message = "Existen más Datos";
        } else {
            message = "No existen más Datos";
        }

        return new UsuarioPageDto(content, result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages(), result.hasPrevious(), result.hasNext(), message);
    }

    public UsuarioDetalleDto detail(String usuario) {
        UsuarioEntity entity = usuarioRepository.findById(usuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        return toDetail(entity);
    }

    @Transactional
    public UsuarioDetalleDto create(UsuarioUpsertRequest request, String currentUser) {
        if (usuarioRepository.existsById(request.usuario())) {
            throw new BusinessException("El usuario ya existe");
        }
        validateBusinessRules(request);

        UsuarioEntity entity = new UsuarioEntity();
        entity.setUsuario(request.usuario().toUpperCase(Locale.ROOT));
        mapRequest(entity, request, true);
        usuarioRepository.save(entity);

        if (hasBancs(request)) {
            bancsRepository.save(new BancsEntity(entity.getUsuario(), request.usuarioBancs(), request.terminalBancs(), "TC"));
        }
        observacionRepository.save(new ObservacionEntity(entity.getUsuario(), request.observacion()));
        writeAudit("INGRESO", currentUser, null, toDetail(entity));
        return toDetail(entity);
    }

    @Transactional
    public UsuarioDetalleDto update(String usuario, UsuarioUpsertRequest request, String currentUser) {
        UsuarioEntity entity = usuarioRepository.findById(usuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        validateBusinessRules(request);

        UsuarioDetalleDto before = toDetail(entity);
        mapRequest(entity, request, false);
        usuarioRepository.save(entity);

        if (hasBancs(request)) {
            bancsRepository.save(new BancsEntity(entity.getUsuario(), request.usuarioBancs(), request.terminalBancs(), "AC"));
        }
        observacionRepository.save(new ObservacionEntity(entity.getUsuario(), request.observacion()));
        writeAudit("MODIFICACION", currentUser, before, toDetail(entity));
        return toDetail(entity);
    }

    @Transactional
    public void delete(String usuario, String observacion, String currentUser) {
        if (!StringUtils.hasText(observacion)) {
            throw new BusinessException("Ingrese Observaciones");
        }

        UsuarioEntity entity = usuarioRepository.findById(usuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        UsuarioDetalleDto before = toDetail(entity);

        bancsRepository.findById(usuario).ifPresent(bancs -> {
            bancs.setEstadoProceso("TE");
            bancsRepository.save(bancs);
        });
        observacionRepository.findById(usuario).ifPresent(observacionRepository::delete);
        usuarioRepository.delete(entity);
        writeAudit("ELIMINACION", currentUser, before, null);
    }

    public List<MenuOptionDto> options() {
        return List.of(
                new MenuOptionDto(1, "Administración de Usuarios", "/seguridad/usuarios"),
                new MenuOptionDto(2, "Administración de Menús", "/seguridad/menu/2"),
                new MenuOptionDto(3, "Administración Tabla Parámetros", "/seguridad/menu/3"),
                new MenuOptionDto(4, "Administración de Perfiles de recursos", "/seguridad/menu/4"),
                new MenuOptionDto(5, "Administración de Recursos de Host", "/seguridad/menu/5"),
                new MenuOptionDto(6, "Consulta de Perfiles de ventana marco", "/seguridad/menu/6"),
                new MenuOptionDto(7, "Consulta de Perfiles de recursos", "/seguridad/menu/7"),
                new MenuOptionDto(8, "Consulta de Recursos de Host", "/seguridad/menu/8"),
                new MenuOptionDto(9, "Reseteo de Claves / Modificar Dominio y Nodo", "/seguridad/menu/9")
        );
    }

    private void validateBusinessRules(UsuarioUpsertRequest request) {
        if (!StringUtils.hasText(request.observacion())) {
            throw new BusinessException("Ingrese Observaciones");
        }
        if (StringUtils.hasText(request.oficinaSwift()) && !"MSQUTODO".equals(request.oficinaSwift())) {
            throw new BusinessException("Oficina Swift inválida");
        }
        if ((StringUtils.hasText(request.usuarioBancs()) && !StringUtils.hasText(request.terminalBancs()))
                || (!StringUtils.hasText(request.usuarioBancs()) && StringUtils.hasText(request.terminalBancs()))) {
            throw new BusinessException("Usuario BANCS y Terminal BANCS deben ir juntos");
        }
        if (!empresaRepository.existsById(request.empresa())) {
            throw new BusinessException("Empresa no definida T06TC005");
        }
        if (!centroRepository.findByEmpresaAndCentro(request.empresa(), request.centro()).isPresent()) {
            throw new BusinessException("Centro no definido T06TC007");
        }
        if (!perfilRepository.existsById(request.perfil())) {
            throw new BusinessException("Perfil RE no definido en T01GRE20");
        }
        if (!parametroRepository.existsByGrupoUsuarioAndParametro("GR", request.perfil())) {
            throw new BusinessException("Perfil NO definido en T95PAR02");
        }
    }

    private boolean hasBancs(UsuarioUpsertRequest request) {
        return StringUtils.hasText(request.usuarioBancs()) && StringUtils.hasText(request.terminalBancs());
    }

    private void mapRequest(UsuarioEntity entity, UsuarioUpsertRequest request, boolean create) {
        entity.setNombre(request.nombre());
        entity.setCedula(request.cedula());
        entity.setCargo(request.cargo());
        entity.setEmpresa(request.empresa());
        entity.setCentro(request.centro());
        entity.setPerfil(request.perfil());
        entity.setAutorizador(StringUtils.hasText(request.autorizador()) ? request.autorizador() : "0");
        entity.setDominio(create || !StringUtils.hasText(entity.getDominio()) ? "DOM1" : entity.getDominio());
        entity.setNodo(create || !StringUtils.hasText(entity.getNodo()) ? "NOD1" : entity.getNodo());
        entity.setStatus(create ? "N" : entity.getStatus());
        entity.setFechaActualizacion(LocalDate.now().format(DATE_FMT));
        entity.setHoraActualizacion(LocalTime.now().format(TIME_FMT));
        entity.setUsuarioActualizacion("admin");
        entity.setTerminalActualizacion("T001");
        entity.setOficinaSwift(request.oficinaSwift());
        if (create) {
            entity.setFechaLogin("00000000");
            entity.setHoraLogin("000000");
            entity.setToken("       ");
            entity.setHistoria(" ");
            entity.setFechaNuevoPassword(LocalDate.now().format(DATE_FMT));
            entity.setFechaCambio(LocalDate.now().format(DATE_FMT));
        }
    }

    private UsuarioListItemDto toListItem(UsuarioEntity entity) {
        return new UsuarioListItemDto(
                entity.getUsuario(),
                entity.getNombre(),
                entity.getPerfil(),
                entity.getEmpresa(),
                entity.getCentro(),
                entity.getDominio(),
                entity.getNodo(),
                entity.getAutorizador()
        );
    }

    private UsuarioDetalleDto toDetail(UsuarioEntity entity) {
        BancsEntity bancs = bancsRepository.findById(entity.getUsuario()).orElse(null);
        ObservacionEntity obs = observacionRepository.findById(entity.getUsuario()).orElse(null);
        String perfilDescripcion = perfilRepository.findById(entity.getPerfil()).map(PerfilEntity::getDescripcion).orElse(null);
        String empresaNombre = empresaRepository.findById(entity.getEmpresa()).map(EmpresaEntity::getDescripcion).orElse(null);
        String centroNombre = centroRepository.findByEmpresaAndCentro(entity.getEmpresa(), entity.getCentro()).map(CentroEntity::getDescripcion).orElse(null);
        return new UsuarioDetalleDto(
                entity.getUsuario(),
                entity.getNombre(),
                entity.getCedula(),
                entity.getCargo(),
                entity.getEmpresa(),
                empresaNombre,
                entity.getCentro(),
                centroNombre,
                entity.getPerfil(),
                perfilDescripcion,
                entity.getDominio(),
                entity.getNodo(),
                entity.getAutorizador(),
                bancs != null ? bancs.getUsuarioBancs() : null,
                bancs != null ? bancs.getTerminalBancs() : null,
                obs != null ? obs.getObservacion() : null,
                entity.getOficinaSwift(),
                entity.getFechaActualizacion(),
                entity.getHoraActualizacion(),
                entity.getUsuarioActualizacion(),
                entity.getTerminalActualizacion(),
                entity.getFechaLogin(),
                entity.getHoraLogin()
        );
    }

    private Specification<UsuarioEntity> buildSpecification(String empresa, String centro, String usuario, String perfil, String nombre) {
        if (StringUtils.hasText(empresa)) {
            return (root, query, cb) -> cb.equal(root.get("empresa"), empresa);
        }
        if (StringUtils.hasText(centro)) {
            return (root, query, cb) -> cb.equal(root.get("centro"), centro);
        }
        if (StringUtils.hasText(usuario)) {
            return likeSpec("usuario", usuario);
        }
        if (StringUtils.hasText(perfil)) {
            return likeSpec("perfil", perfil);
        }
        return likeSpec("nombre", nombre);
    }

    private Specification<UsuarioEntity> likeSpec(String field, String value) {
        String pattern = "%" + value.trim().replace(' ', '%') + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get(field)), pattern.toLowerCase(Locale.ROOT));
    }

    private void writeAudit(String operation, String currentUser, Object before, Object after) {
        try {
            auditLogRepository.save(new AuditLogEntity(
                    null,
                    "T95USU03",
                    operation,
                    operation + " usuario seguridad",
                    before == null ? null : objectMapper.writeValueAsString(before),
                    after == null ? null : objectMapper.writeValueAsString(after),
                    currentUser,
                    LocalDateTime.now()
            ));
        } catch (Exception ex) {
            throw new BusinessException("No se pudo registrar auditoría");
        }
    }
}
