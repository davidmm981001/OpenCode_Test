package com.example.calculator.calculation;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CalculatorControllerIT {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void calculaSumaDesdeLaApi() {
        ResponseEntity<CalculationResponse> response = restTemplate.postForEntity(
                url(),
                new CalculationRequest(new BigDecimal("4"), new BigDecimal("6"), Operation.ADD),
                CalculationResponse.class);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().result()).isEqualTo(new BigDecimal("10"));
    }

    @Test
    void rechazaDivisionPorCero() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<CalculationRequest> request = new HttpEntity<>(
                new CalculationRequest(new BigDecimal("4"), BigDecimal.ZERO, Operation.DIVIDE),
                headers);

        ResponseEntity<CalculatorExceptionHandler.ApiErrorResponse> response = restTemplate.exchange(
                url(),
                HttpMethod.POST,
                request,
                CalculatorExceptionHandler.ApiErrorResponse.class);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).contains("dividir por cero");
    }

    private String url() {
        return "http://localhost:" + port + "/api/calculate";
    }
}
