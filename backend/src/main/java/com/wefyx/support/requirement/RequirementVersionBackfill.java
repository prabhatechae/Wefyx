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
        migrateQuotationStatus();
        jdbc.update("UPDATE requirements SET row_version = 0 WHERE row_version IS NULL");
        jdbc.execute("ALTER TABLE vendor_quotations ADD COLUMN IF NOT EXISTS version INTEGER");
        jdbc.update("UPDATE vendor_quotations SET version = 1 WHERE version IS NULL");
    }

    // Older H2 databases used a native enum whose values Hibernate cannot extend.
    void migrateQuotationStatus() {
        String product = jdbc.execute((org.springframework.jdbc.core.ConnectionCallback<String>)
            connection -> connection.getMetaData().getDatabaseProductName());
        if (!"H2".equals(product)) return;
        var types = jdbc.queryForList("SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = CURRENT_SCHEMA AND TABLE_NAME = 'VENDOR_QUOTATIONS' AND COLUMN_NAME = 'STATUS'", String.class);
        if (types.stream().anyMatch("ENUM"::equalsIgnoreCase))
            jdbc.execute("ALTER TABLE vendor_quotations ALTER COLUMN status VARCHAR(50)");
    }
}
