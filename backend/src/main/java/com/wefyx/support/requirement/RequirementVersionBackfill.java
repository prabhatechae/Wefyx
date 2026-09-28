package com.wefyx.support.requirement;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** Initializes the optimistic-lock version for requirements created before the version field existed. */
@Component
public class RequirementVersionBackfill implements ApplicationRunner {
    private final JdbcTemplate jdbc;

    public RequirementVersionBackfill(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        jdbc.update("UPDATE requirements SET row_version = 0 WHERE row_version IS NULL");
    }
}
