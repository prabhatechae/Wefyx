package com.wefyx.support.requirement;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import static org.junit.jupiter.api.Assertions.*;

class QuotationStatusMigrationTest {
    @Test void legacyEnumIsMigratedWithoutLosingQuotations() {
        var jdbc = new JdbcTemplate(new DriverManagerDataSource("jdbc:h2:mem:legacy-quote-status;DB_CLOSE_DELAY=-1", "sa", ""));
        jdbc.execute("CREATE TABLE vendor_quotations (id BIGINT PRIMARY KEY, status ENUM('INVITED','SUBMITTED','SELECTED'))");
        jdbc.update("INSERT INTO vendor_quotations VALUES (1, 'INVITED'), (2, 'SUBMITTED')");
        assertThrows(org.springframework.dao.DataAccessException.class,
            () -> jdbc.update("UPDATE vendor_quotations SET status = 'ACCEPTED' WHERE id = 1"));
        var migration = new RequirementVersionBackfill(jdbc);
        migration.migrateQuotationStatus();
        migration.migrateQuotationStatus();
        assertEquals("SUBMITTED", jdbc.queryForObject("SELECT status FROM vendor_quotations WHERE id = 2", String.class));
        for (var status : VendorQuotationStatus.values()) {
            jdbc.update("UPDATE vendor_quotations SET status = ? WHERE id = 1", status.name());
            assertEquals(status.name(), jdbc.queryForObject("SELECT status FROM vendor_quotations WHERE id = 1", String.class));
        }
        assertEquals(2, jdbc.queryForObject("SELECT COUNT(*) FROM vendor_quotations", Integer.class));
    }
}
