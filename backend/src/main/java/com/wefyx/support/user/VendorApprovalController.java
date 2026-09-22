package com.wefyx.support.user;

import com.wefyx.support.config.AccessControl;
import com.wefyx.support.config.AccessControl.Role;
import com.wefyx.support.resource.AuditService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/vendor-registrations")
public class VendorApprovalController {
    private final UserRepository users;
    private final AuditService audit;
    private final AccessControl access;

    public VendorApprovalController(UserRepository users, AuditService audit, AccessControl access) {
        this.users = users;
        this.audit = audit;
        this.access = access;
    }

    @GetMapping
    public List<SupportUser> pending(Authentication auth) {
        access.require(auth, Role.SUPER_ADMIN);
        return users.findByStatus(UserStatus.PENDING).stream()
                .filter(user -> "VENDOR".equalsIgnoreCase(user.getRole()))
                .toList();
    }

    @PatchMapping("/{id}/approve")
    public SupportUser approve(@PathVariable Long id, Authentication auth) {
        access.require(auth, Role.SUPER_ADMIN);
        var user = users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor not found"));
        if (!"VENDOR".equalsIgnoreCase(user.getRole()) || user.getStatus() != UserStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vendor is not pending approval");
        }
        user.setStatus(UserStatus.ACTIVE);
        var saved = users.save(user);
        audit.log("Vendor registration approved", "Users Management", user.getEmail());
        return saved;
    }
}
