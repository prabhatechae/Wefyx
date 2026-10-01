package com.wefyx.support.auth;

import java.time.Clock;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.function.IntSupplier;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Only loaded by the explicit, loopback-bound local-otp profile. */
@Component
@Profile("local-otp & !prod & !production")
public class LocalOtpStore {
    private record Entry(String code, long sentAt, int failures) {}
    private final Map<String, Entry> entries = new HashMap<>();
    private final Clock clock;
    private final IntSupplier random;
    // Temporary fixed code for local testing; this bean is excluded from production.
    public LocalOtpStore() { this(Clock.systemUTC(), () -> 123456); }
    LocalOtpStore(Clock clock, IntSupplier random) { this.clock = clock; this.random = random; }

    public synchronized void send(String phone) {
        long now = clock.millis();
        entries.entrySet().removeIf(e -> now - e.getValue().sentAt() >= 300_000);
        Entry previous = entries.get(phone);
        if (previous != null && now - previous.sentAt() < 30_000)
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Wait 30 seconds before requesting another code");
        if (entries.size() >= 1000 && previous == null)
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many local OTP requests");
        String code = String.format(Locale.ROOT, "%06d", random.getAsInt());
        entries.put(phone, new Entry(code, now, 0));
        org.slf4j.LoggerFactory.getLogger(getClass()).info("LOCAL DEVELOPMENT OTP for {}: {} (expires in 5 minutes; no SMS sent)", phone, code);
    }

    public synchronized void verify(String phone, String code) {
        Entry entry = entries.get(phone);
        if (entry == null || clock.millis() - entry.sentAt() >= 300_000 || entry.failures() >= 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid, expired or already used OTP. Request a new code.");
        }
        if (!entry.code().equals(code)) {
            entries.put(phone, new Entry(entry.code(), entry.sentAt(), entry.failures() + 1));
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }
        // Keep a spent entry to enforce the resend cooldown even after success.
        entries.put(phone, new Entry("", entry.sentAt(), 5));
    }
}
