package com.inventariodavid.productos.web;

import java.net.URI;
import java.util.List;

import com.inventariodavid.productos.dto.ProductoCreateRequest;
import com.inventariodavid.productos.dto.ProductoDTO;
import com.inventariodavid.productos.service.ProductoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

  private final ProductoService productoService;

  public ProductoController(ProductoService productoService) {
    this.productoService = productoService;
  }

  @GetMapping
  @Operation(summary = "Listar productos")
  @ApiResponse(responseCode = "200", description = "Lista de productos")
  public List<ProductoDTO> listar() {
    return productoService.obtenerTodos();
  }

  @PostMapping
  @Operation(summary = "Crear producto")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Producto creado"),
      @ApiResponse(responseCode = "400", description = "Datos inválidos")
  })
  public ResponseEntity<ProductoDTO> crear(@Valid @RequestBody ProductoCreateRequest request) {
    ProductoDTO producto = productoService.agregar(request);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(producto.id()).toUri();
    return ResponseEntity.created(location).body(producto);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Eliminar producto")
  @ApiResponse(responseCode = "204", description = "Producto eliminado o inexistente")
  public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
    productoService.eliminar(id);
    return ResponseEntity.noContent().build();
  }
}
