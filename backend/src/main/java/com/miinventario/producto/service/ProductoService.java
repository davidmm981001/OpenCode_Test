package com.miinventario.producto.service;

import com.miinventario.producto.api.dto.CrearProductoRequest;
import com.miinventario.producto.api.dto.ProductoResponse;
import com.miinventario.producto.domain.ProductoEntity;
import com.miinventario.producto.domain.ProductoRepository;
import com.miinventario.producto.domain.exception.ProductoFormatoException;
import com.miinventario.producto.domain.exception.ProductoNegocioException;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductoService {

    private static final String MENSAJE_FORMATO_INVALIDO = "Revise cantidad y precio: deben ser números válidos.";

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> obtenerTodos() {
        return productoRepository.findAll().stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public ProductoResponse crear(CrearProductoRequest request) {
        String nombre = normalizarNombre(request.nombre());
        if (nombre.isBlank()) {
            throw new ProductoNegocioException("Nombre requerido");
        }

        Integer cantidad = parseEntero(request.cantidad());
        BigDecimal precio = parseDecimal(request.precio());

        ProductoEntity entity = new ProductoEntity();
        entity.setNombre(nombre);
        entity.setCantidad(cantidad);
        entity.setPrecio(precio);

        return toResponse(productoRepository.save(entity));
    }

    @Transactional
    public void eliminar(Long id) {
        productoRepository.findById(id).ifPresent(productoRepository::delete);
    }

    private ProductoResponse toResponse(ProductoEntity entity) {
        return new ProductoResponse(entity.getId(), entity.getNombre(), entity.getCantidad(), entity.getPrecio());
    }

    private String normalizarNombre(String nombre) {
        return nombre == null ? "" : nombre.trim();
    }

    private Integer parseEntero(String value) {
        try {
            return Integer.parseInt(normalizarEntrada(value));
        } catch (NumberFormatException ex) {
            throw new ProductoFormatoException(MENSAJE_FORMATO_INVALIDO);
        }
    }

    private BigDecimal parseDecimal(String value) {
        try {
            return new BigDecimal(normalizarEntrada(value));
        } catch (NumberFormatException ex) {
            throw new ProductoFormatoException(MENSAJE_FORMATO_INVALIDO);
        }
    }

    private String normalizarEntrada(String value) {
        if (value == null) {
            throw new ProductoFormatoException(MENSAJE_FORMATO_INVALIDO);
        }
        return value.trim();
    }
}
