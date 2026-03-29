package com.example.testing.timer;

import java.time.Instant;
import java.util.UUID;

public record TimerSessionResponse(
        UUID id,
        TimerStatus status,
        Instant startedAt,
        Instant endedAt,
        Long durationMillis) {
}
