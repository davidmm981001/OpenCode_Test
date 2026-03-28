package com.miinventario.producto.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.miinventario.producto.api.dto.ProductoResponse;
import com.miinventario.producto.domain.exception.ProductoFormatoException;
import com.miinventario.producto.service.ProductoService;
import com.miinventario.shared.api.GlobalExceptionHandler;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProductoController.class)
@Import(GlobalExceptionHandler.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductoService productoService;

    @Test
    @DisplayName("GET /api/productos retorna la lista")
    void obtenerTodos_shouldReturnProducts() throws Exception {
        when(productoService.obtenerTodos()).thenReturn(List.of(
            new ProductoResponse(1L, "Mouse", 3, new BigDecimal("19.99"))
        ));

        mockMvc.perform(get("/api/productos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].nombre").value("Mouse"));
    }

    @Test
    @DisplayName("POST /api/productos crea un producto")
    void crear_shouldReturnCreatedProduct() throws Exception {
        when(productoService.crear(any())).thenReturn(new ProductoResponse(1L, "Mouse", 3, new BigDecimal("19.99")));

        mockMvc.perform(post("/api/productos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                    "\"nombre\":\"Mouse\"," +
                    "\"cantidad\":\"3\"," +
                    "\"precio\":\"19.99\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @DisplayName("POST /api/productos valida nombre vacio")
    void crear_shouldReturnValidationError_whenNombreEsVacio() throws Exception {
        mockMvc.perform(post("/api/productos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                    "\"nombre\":\"   \"," +
                    "\"cantidad\":\"3\"," +
                    "\"precio\":\"19.99\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.codigo").value("VALIDACION_NEGOCIO"));
    }

    @Test
    @DisplayName("POST /api/productos propaga error de formato")
    void crear_shouldReturnFormatError_whenCantidadEsInvalida() throws Exception {
        when(productoService.crear(any())).thenThrow(new ProductoFormatoException("Revise cantidad y precio: deben ser números válidos."));

        mockMvc.perform(post("/api/productos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                    "\"nombre\":\"Mouse\"," +
                    "\"cantidad\":\"abc\"," +
                    "\"precio\":\"19.99\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.codigo").value("FORMATO_INVALIDO"))
            .andExpect(jsonPath("$.mensaje").value("Revise cantidad y precio: deben ser números válidos."));
    }

    @Test
    @DisplayName("DELETE /api/productos/{id} elimina sin error")
    void eliminar_shouldReturnNoContent() throws Exception {
        doNothing().when(productoService).eliminar(eq(1L));

        mockMvc.perform(delete("/api/productos/1"))
            .andExpect(status().isNoContent())
            .andExpect(content().string(""));
    }
}
