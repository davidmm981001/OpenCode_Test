package com.inventariodavid.productos.dto;

import com.inventariodavid.productos.domain.ProductoEntity;

public final class ProductoMapper {

  private ProductoMapper() {
  }

  public static ProductoDTO toDto(ProductoEntity entity) {
    return new ProductoDTO(entity.getId(), entity.getNombre(), entity.getCantidad(), entity.getPrecio());
  }
}
