package com.example.testing.timer;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TimerSessionRepository extends JpaRepository<TimerSession, UUID> {

    List<TimerSession> findAllByOrderByStartedAtDesc();

    Optional<TimerSession> findFirstByStatusOrderByStartedAtDesc(TimerStatus status);

    boolean existsByStatus(TimerStatus status);
}
