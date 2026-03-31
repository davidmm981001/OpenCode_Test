package com.inventariodavid.productos.domain;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "productos")
public class ProductoEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(nullable = false, length = 255)
  private String nombre;

  @Column(nullable = false)
  private Integer cantidad;

  @Column(nullable = false, precision = 18, scale = 2)
  private BigDecimal precio;

  protected ProductoEntity() {
  }

  public ProductoEntity(String nombre, Integer cantidad, BigDecimal precio) {
    this.nombre = nombre;
    this.cantidad = cantidad;
    this.precio = precio;
  }

  public Integer getId() {
    return id;
  }

  public void setId(Integer id) {
    this.id = id;
  }

  public String getNombre() {
    return nombre;
  }

  public void setNombre(String nombre) {
    this.nombre = nombre;
  }

  public Integer getCantidad() {
    return cantidad;
  }

  public void setCantidad(Integer cantidad) {
    this.cantidad = cantidad;
  }

  public BigDecimal getPrecio() {
    return precio;
  }

  public void setPrecio(BigDecimal precio) {
    this.precio = precio;
  }
}
