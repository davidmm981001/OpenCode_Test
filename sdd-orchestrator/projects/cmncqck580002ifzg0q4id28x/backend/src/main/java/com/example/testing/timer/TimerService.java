package com.example.testing.timer;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TimerService {

    private final TimerSessionRepository repository;
    private final Clock clock;

    public TimerService(TimerSessionRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<TimerSessionResponse> listTimers() {
        return repository.findAllByOrderByStartedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TimerSessionResponse startTimer() {
        if (repository.existsByStatus(TimerStatus.RUNNING)) {
            throw new ActiveTimerExistsException();
        }

        TimerSession timerSession = TimerSession.start(clock.instant());
        return toResponse(repository.save(timerSession));
    }

    @Transactional
    public TimerSessionResponse stopTimer(UUID id) {
        TimerSession timerSession = repository.findById(id)
                .orElseThrow(() -> new TimerSessionNotFoundException(id));

        timerSession.stop(clock.instant());
        return toResponse(repository.save(timerSession));
    }

    @Transactional(readOnly = true)
    public TimerSessionResponse getActiveTimer() {
        return repository.findFirstByStatusOrderByStartedAtDesc(TimerStatus.RUNNING)
                .map(this::toResponse)
                .orElse(null);
    }

    private TimerSessionResponse toResponse(TimerSession timerSession) {
        return new TimerSessionResponse(
                timerSession.getId(),
                timerSession.getStatus(),
                timerSession.getStartedAt(),
                timerSession.getEndedAt(),
                timerSession.getDurationMillis());
    }
}
