package com.wefyx.support.user;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.Objects;

@Service
public class UserIdentityService {
    private final UserRepository users;
    public UserIdentityService(UserRepository users) { this.users = users; }

    public void check(String email, String phone, Long currentId) {
        users.findByEmailIgnoreCase(email).filter(u -> currentId == null || !Objects.equals(u.getId(), currentId))
            .ifPresent(u -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "Email address is already registered. Please use a different email or sign in."); });
        if (phone != null && (currentId == null ? users.existsByPhone(phone) : users.existsByPhoneAndIdNot(phone, currentId)))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mobile number is already registered. Please use a different number or sign in.");
    }
}
