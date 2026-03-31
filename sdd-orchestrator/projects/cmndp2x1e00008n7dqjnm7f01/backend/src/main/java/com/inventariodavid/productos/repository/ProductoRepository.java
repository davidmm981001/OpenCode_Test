package com.inventariodavid.productos.repository;

import com.inventariodavid.productos.domain.ProductoEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<ProductoEntity, Integer> {
}
