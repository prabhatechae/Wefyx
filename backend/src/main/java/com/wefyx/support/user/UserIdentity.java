package com.wefyx.support.user;

import com.wefyx.support.auth.OtpService;
import java.util.Locale;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class UserIdentity {
    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();
    private record EmailValue(@NotBlank @Email @Size(max=254) String email) {}
    private UserIdentity() {}

    public static String email(String raw) {
        String value = raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT);
        if (!VALIDATOR.validate(new EmailValue(value)).isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid email address");
        return value;
    }

    public static String phone(String raw, boolean required) {
        if (raw == null || raw.isBlank()) {
            if (required) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mobile number is required");
            return null;
        }
        return OtpService.normalize(raw);
    }

    /** Preserve historical contacts without treating them as newly validated mobiles. */
    public static String legacyPhone(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String compact = raw.trim().replaceAll("[\\s()\\-]", "");
        if (compact.startsWith("00971") || compact.startsWith("0091")) compact = "+" + compact.substring(2);
        return compact;
    }
}
