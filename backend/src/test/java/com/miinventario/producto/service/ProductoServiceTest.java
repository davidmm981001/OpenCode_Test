package com.miinventario.producto.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.miinventario.producto.api.dto.CrearProductoRequest;
import com.miinventario.producto.domain.ProductoEntity;
import com.miinventario.producto.domain.ProductoRepository;
import com.miinventario.producto.domain.exception.ProductoFormatoException;
import com.miinventario.producto.domain.exception.ProductoNegocioException;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private ProductoService productoService;

    @Test
    @DisplayName("obtenerTodos mapea la lista de productos")
    void obtenerTodos_shouldMapearProductos_whenExistenRegistros() {
        when(productoRepository.findAll()).thenReturn(List.of(
            new ProductoEntity(1L, "Laptop", 2, new BigDecimal("1250.50"))
        ));

        var resultado = productoService.obtenerTodos();

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).nombre()).isEqualTo("Laptop");
    }

    @Test
    @DisplayName("crear persiste un producto valido")
    void crear_shouldPersistirProducto_whenDatosSonValidos() {
        when(productoRepository.save(any(ProductoEntity.class))).thenAnswer(invocation -> {
            ProductoEntity entity = invocation.getArgument(0);
            entity.setId(10L);
            return entity;
        });

        var resultado = productoService.crear(new CrearProductoRequest("Mouse", "3", "19.99"));

        assertThat(resultado.id()).isEqualTo(10L);
        assertThat(resultado.nombre()).isEqualTo("Mouse");
        verify(productoRepository).save(any(ProductoEntity.class));
    }

    @Test
    @DisplayName("crear rechaza cantidades no numericas")
    void crear_shouldThrowFormatoException_whenCantidadEsInvalida() {
        assertThatThrownBy(() -> productoService.crear(new CrearProductoRequest("Mouse", "abc", "19.99")))
            .isInstanceOf(ProductoFormatoException.class)
            .hasMessage("Revise cantidad y precio: deben ser números válidos.");
    }

    @Test
    @DisplayName("crear rechaza nombre vacio")
    void crear_shouldThrowBusinessException_whenNombreEsVacio() {
        assertThatThrownBy(() -> productoService.crear(new CrearProductoRequest("   ", "1", "1.00")))
            .isInstanceOf(ProductoNegocioException.class)
            .hasMessage("Nombre requerido");
    }

    @Test
    @DisplayName("eliminar ignora ids inexistentes")
    void eliminar_shouldIgnoreMissingId_whenNoExisteElProducto() {
        when(productoRepository.findById(99L)).thenReturn(java.util.Optional.empty());

        productoService.eliminar(99L);

        verify(productoRepository).findById(99L);
    }
}
