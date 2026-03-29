package com.example.testing.timer;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class TimerControllerIT {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("testing")
            .withUsername("testing")
            .withPassword("testing");

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private TimerSessionRepository repository;

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    @Test
    void shouldStartStopAndListTimers() throws Exception {
        ResponseEntity<TimerSessionResponse> startResponse = restTemplate.postForEntity(
                timerUrl("/start"),
                null,
                TimerSessionResponse.class);

        assertThat(startResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        TimerSessionResponse started = startResponse.getBody();
        assertThat(started).isNotNull();
        assertThat(started.status()).isEqualTo(TimerStatus.RUNNING);

        Thread.sleep(Duration.ofMillis(25));

        ResponseEntity<TimerSessionResponse> stopResponse = restTemplate.postForEntity(
                timerUrl("/%s/stop".formatted(started.id())),
                null,
                TimerSessionResponse.class);

        assertThat(stopResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        TimerSessionResponse stopped = stopResponse.getBody();
        assertThat(stopped).isNotNull();
        assertThat(stopped.status()).isEqualTo(TimerStatus.COMPLETED);
        assertThat(stopped.durationMillis()).isNotNull();
        assertThat(stopped.durationMillis()).isGreaterThanOrEqualTo(0L);

        ResponseEntity<TimerSessionResponse[]> listResponse = restTemplate.getForEntity(
                timerUrl(""),
                TimerSessionResponse[].class);

        assertThat(listResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listResponse.getBody()).isNotNull();
        assertThat(listResponse.getBody()).hasSize(1);
        assertThat(listResponse.getBody()[0].status()).isEqualTo(TimerStatus.COMPLETED);
    }

    @Test
    void shouldRejectStartingSecondTimerWhileOneIsRunning() {
        ResponseEntity<TimerSessionResponse> startResponse = restTemplate.postForEntity(
                timerUrl("/start"),
                null,
                TimerSessionResponse.class);

        assertThat(startResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        ResponseEntity<ApiErrorResponse> conflictResponse = restTemplate.postForEntity(
                timerUrl("/start"),
                null,
                ApiErrorResponse.class);

        assertThat(conflictResponse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    private String timerUrl(String path) {
        return "http://localhost:%d/api/timers%s".formatted(port, path);
    }
}
