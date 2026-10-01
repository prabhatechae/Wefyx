package com.wefyx.support.auth;

import java.time.*;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;

class LocalOtpStoreTest {
    @Test void localTestingAcceptsFixedCodeOnlyAfterRequestAndOnlyOnce() {
        var service = new OtpService("", "", "");
        service.useLocalStore(new LocalOtpStore());
        assertThrows(ResponseStatusException.class, () -> service.verify("+971501234567", "123456"));
        service.send("+971501234567");
        assertThrows(ResponseStatusException.class, () -> service.verify("+971501234567", "000000"));
        assertEquals("+971501234567", service.verify("+971501234567", "123456"));
        assertThrows(ResponseStatusException.class, () -> service.verify("+971501234567", "123456"));
    }
    static class TestClock extends Clock {
        long time;
        public ZoneId getZone() { return ZoneOffset.UTC; }
        public Clock withZone(ZoneId zone) { return this; }
        public Instant instant() { return Instant.ofEpochMilli(time); }
    }
    @Test void expiresLimitsAttemptsAndConsumesCodes() {
        var clock = new TestClock();
        var store = new LocalOtpStore(clock, () -> 123456);
        store.send("+919876543210");
        assertThrows(ResponseStatusException.class, () -> store.verify("+971501234567", "123456"));
        assertThrows(ResponseStatusException.class, () -> store.send("+919876543210"));
        store.verify("+919876543210", "123456");
        assertThrows(ResponseStatusException.class, () -> store.verify("+919876543210", "123456"));
        clock.time += 30_000;
        store.send("+919876543210");
        for (int i = 0; i < 5; i++) assertThrows(ResponseStatusException.class, () -> store.verify("+919876543210", "000000"));
        assertThrows(ResponseStatusException.class, () -> store.verify("+919876543210", "123456"));
        clock.time += 30_000;
        store.send("+919876543210");
        clock.time += 300_000;
        assertThrows(ResponseStatusException.class, () -> store.verify("+919876543210", "123456"));
    }
    @Test void resendInvalidatesPreviousCodeAndServiceUsesLocalWithoutCredentials() {
        var clock = new TestClock();
        var sequence = new java.util.concurrent.atomic.AtomicInteger(123456);
        var store = new LocalOtpStore(clock, sequence::getAndIncrement);
        var service = new OtpService("", "", "");
        service.useLocalStore(store);
        service.send("+971 50 123 4567");
        clock.time += 30_000;
        service.send("+971501234567");
        assertThrows(ResponseStatusException.class, () -> service.verify("+971501234567", "123456"));
        assertEquals("+971501234567", service.verify("+971501234567", "123457"));
    }
}
