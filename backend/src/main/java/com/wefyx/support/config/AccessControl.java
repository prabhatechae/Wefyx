package com.wefyx.support.config;

import com.wefyx.support.user.UserRepository;
import com.wefyx.support.user.UserStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AccessControl {
    public enum Role { SUPER_ADMIN, EMPLOYEE, VENDOR, CUSTOMER }

    private final UserRepository users;
    private final String adminEmail;
    private final String configuredVendorEmail;

    public AccessControl(UserRepository users,
                         @Value("${wefyx.auth.email}") String adminEmail,
                         @Value("${wefyx.auth.vendor-email:}") String configuredVendorEmail) {
        this.users = users;
        this.adminEmail = adminEmail;
        this.configuredVendorEmail = configuredVendorEmail;
    }

    public Role role(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in is required");
        }
        String email = authentication.getName();
        if (email.equalsIgnoreCase(adminEmail)) return Role.SUPER_ADMIN;
        if (!configuredVendorEmail.isBlank() && email.equalsIgnoreCase(configuredVendorEmail)) return Role.VENDOR;
        var user = users.findByEmailIgnoreCase(email)
            .filter(item -> item.getStatus() == UserStatus.ACTIVE)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active"));
        String value = String.valueOf(user.getRole()).toUpperCase(Locale.ROOT);
        if (value.contains("SUPER") || value.contains("ADMINISTRATOR")) return Role.SUPER_ADMIN;
        if (value.contains("CUSTOMER") || value.contains("CLIENT")) return Role.CUSTOMER;
        if (value.contains("VENDOR") || value.contains("PARTNER")) return Role.VENDOR;
        return Role.EMPLOYEE;
    }

    public Role require(Authentication authentication, Role... allowed) {
        Role actual = role(authentication);
        for (Role candidate : allowed) if (candidate == actual) return actual;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This account cannot perform that action");
    }
}
