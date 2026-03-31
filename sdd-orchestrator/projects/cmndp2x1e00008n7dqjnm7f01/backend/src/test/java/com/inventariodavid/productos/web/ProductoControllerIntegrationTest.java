package com.inventariodavid.productos.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Testcontainers
class ProductoControllerIntegrationTest {

  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
      .withDatabaseName("inventario")
      .withUsername("inventario")
      .withPassword("inventario");

  @DynamicPropertySource
  static void configureProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
    registry.add("app.cors.allowed-origins", () -> "*");
  }

  @Autowired
  private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Test
  void listaProductosSemilla() throws Exception {
    mockMvc.perform(get("/api/productos"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].nombre").value("Teclado USB"));
  }

  @Test
  void creaYEliminaProducto() throws Exception {
    String payload = """
        {
          "nombre": "Auriculares",
          "cantidad": 10,
          "precio": 59.90
        }
        """;

    String response = mockMvc.perform(post("/api/productos")
            .contentType(MediaType.APPLICATION_JSON)
            .content(payload))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").exists())
        .andReturn().getResponse().getContentAsString();

    JsonNode created = objectMapper.readTree(response);
    Integer id = created.get("id").asInt();

    mockMvc.perform(delete("/api/productos/{id}", id))
        .andExpect(status().isNoContent());

    mockMvc.perform(get("/api/productos"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(3)));
  }

  @Test
  void validaNombreRequerido() throws Exception {
    String payload = """
        {
          "nombre": " ",
          "cantidad": 1,
          "precio": 10.00
        }
        """;

    mockMvc.perform(post("/api/productos")
            .contentType(MediaType.APPLICATION_JSON)
            .content(payload))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Nombre requerido")));
  }
}
