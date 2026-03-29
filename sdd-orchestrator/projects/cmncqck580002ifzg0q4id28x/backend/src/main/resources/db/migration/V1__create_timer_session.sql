create table timer_session (
    id uuid primary key,
    status varchar(20) not null,
    started_at timestamptz not null,
    ended_at timestamptz null,
    duration_millis bigint null
);

create index idx_timer_session_status_started_at on timer_session (status, started_at desc);
