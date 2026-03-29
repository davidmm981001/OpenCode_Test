package com.example.testing.timer;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "timer_session")
public class TimerSession {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TimerStatus status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "duration_millis")
    private Long durationMillis;

    protected TimerSession() {
    }

    private TimerSession(UUID id, Instant startedAt) {
        this.id = id;
        this.startedAt = startedAt;
        this.status = TimerStatus.RUNNING;
    }

    public static TimerSession start(Instant startedAt) {
        return new TimerSession(UUID.randomUUID(), startedAt);
    }

    public void stop(Instant stoppedAt) {
        if (status != TimerStatus.RUNNING) {
            throw new TimerSessionAlreadyStoppedException();
        }

        this.endedAt = stoppedAt;
        this.durationMillis = Duration.between(startedAt, stoppedAt).toMillis();
        this.status = TimerStatus.COMPLETED;
    }

    public UUID getId() {
        return id;
    }

    public TimerStatus getStatus() {
        return status;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public Long getDurationMillis() {
        return durationMillis;
    }
}
