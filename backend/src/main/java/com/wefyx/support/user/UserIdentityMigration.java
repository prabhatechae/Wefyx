package com.wefyx.support.user;

import java.util.HashSet;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Validate every row before updating; never merge or delete conflicting accounts. */
@Component
@Order(-100)
public class UserIdentityMigration implements ApplicationRunner {
    private final JdbcTemplate jdbc;
    public UserIdentityMigration(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    private record Identity(long id, String email, String phone) {}

    @Override @Transactional
    public void run(ApplicationArguments args) {
        var rows = jdbc.query("SELECT id, email, phone FROM support_users ORDER BY id", (rs, row) ->
            new Identity(rs.getLong("id"), UserIdentity.email(rs.getString("email")), UserIdentity.legacyPhone(rs.getString("phone"))));
        var emails = new HashSet<String>();
        var phones = new HashSet<String>();
        for (var row : rows) {
            if (!emails.add(row.email()))
                throw new IllegalStateException("Duplicate account identity at support_users id=" + row.id()
                    + ". Resolve existing email/mobile conflicts before restarting. No accounts were merged.");
        }
        // Reserve each historical mobile once, preserving every duplicate account.
        jdbc.execute("ALTER TABLE support_users ADD COLUMN IF NOT EXISTS phone_identity VARCHAR(255)");
        jdbc.execute("DROP INDEX IF EXISTS ux_support_users_phone");
        jdbc.update("UPDATE support_users SET phone_identity = NULL");
        for (var row : rows) {
            boolean owner = row.phone() != null && phones.add(row.phone());
            jdbc.update("UPDATE support_users SET email = ?, phone = ?, phone_identity = ? WHERE id = ?",
                row.email(), row.phone(), owner ? row.phone() : null, row.id());
            if (row.phone() != null && !owner)
                org.slf4j.LoggerFactory.getLogger(getClass()).warn("Legacy duplicate mobile on account id={}; new reuse is blocked. Review this account.", row.id());
        }
        jdbc.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_support_users_email_ci ON support_users(email)");
        jdbc.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_support_users_phone_identity ON support_users(phone_identity)");
    }
}
