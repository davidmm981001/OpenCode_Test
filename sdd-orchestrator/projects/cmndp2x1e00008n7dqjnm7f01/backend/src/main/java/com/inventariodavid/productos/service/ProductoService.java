package com.inventariodavid.productos.service;

import java.util.List;

import com.inventariodavid.productos.domain.ProductoEntity;
import com.inventariodavid.productos.dto.ProductoCreateRequest;
import com.inventariodavid.productos.dto.ProductoDTO;
import com.inventariodavid.productos.dto.ProductoMapper;
import com.inventariodavid.productos.repository.ProductoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductoService {

  private final ProductoRepository productoRepository;

  public ProductoService(ProductoRepository productoRepository) {
    this.productoRepository = productoRepository;
  }

  @Transactional(readOnly = true)
  public List<ProductoDTO> obtenerTodos() {
    return productoRepository.findAll().stream().map(ProductoMapper::toDto).toList();
  }

  @Transactional
  public ProductoDTO agregar(ProductoCreateRequest request) {
    if (request.nombre() == null || request.nombre().isBlank()) {
      throw new IllegalArgumentException("Nombre requerido");
    }

    ProductoEntity entity = new ProductoEntity(request.nombre().trim(), request.cantidad(), request.precio());
    ProductoEntity saved = productoRepository.save(entity);
    return ProductoMapper.toDto(saved);
  }

  @Transactional
  public void eliminar(Integer id) {
    productoRepository.findById(id).ifPresent(productoRepository::delete);
  }
}
