package com.wefyx.support.requirement;

import com.wefyx.support.config.AccessControl;
import com.wefyx.support.config.AccessControl.Role;
import com.wefyx.support.notification.NotificationService;
import com.wefyx.support.resource.AuditService;
import com.wefyx.support.user.UserRepository;
import com.wefyx.support.user.UserStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/api/requirements/{requirementId}/messages")
public class RequirementMessageController {

    private final RequirementRepository requirements;
    private final RequirementMessageRepository messages;
    private final AuditService audit;
    private final NotificationService notifications;
    private final VendorQuotationRepository quotations;
    private final AccessControl access;
    private final UserRepository users;
    private final String adminEmail;

    public RequirementMessageController(
            RequirementRepository r,
            RequirementMessageRepository m,
            AuditService a,
            NotificationService n,
            VendorQuotationRepository q,
            AccessControl access,
            UserRepository users,
            @Value("${wefyx.auth.email}") String adminEmail
    ) {
        this.requirements = r;
        this.messages = m;
        this.audit = a;
        this.notifications = n;
        this.quotations = q;
        this.access = access;
        this.users = users;
        this.adminEmail = adminEmail;
    }

    @GetMapping
    public List<RequirementMessage> list(@PathVariable Long requirementId, Authentication auth) {
        var r = find(requirementId);
        authorize(r, auth);
        return messages.findByRequirementIdOrderByCreatedAtAsc(requirementId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RequirementMessage send(
            @PathVariable Long requirementId,
            @RequestBody Map<String, String> body,
            Authentication auth
    ) {
        var r = find(requirementId);
        Role role = authorize(r, auth);

        String text = body.getOrDefault("message", "").trim();
        if (text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is required");
        }

        var m = new RequirementMessage();
        m.setRequirementId(requirementId);
        m.setSenderEmail(auth.getName());
        
        String name = body.getOrDefault("senderName", "").trim();
        if (name.isBlank()) {
            name = users.findByEmailIgnoreCase(auth.getName())
                    .map(u -> u.getName())
                    .orElse(auth.getName());
        }
        m.setSenderName(name);
        
        String senderRole = body.getOrDefault("senderRole", "").trim();
        if (senderRole.isBlank()) {
            senderRole = role != null ? role.name() : "USER";
        }
        m.setSenderRole(senderRole);
        m.setMessage(text);

        String vendorEmail = body.getOrDefault("vendorEmail", "").trim();
        if (!vendorEmail.isBlank()) {
            m.setVendorEmail(vendorEmail);
            m.setVendorName(body.getOrDefault("vendorName", "Vendor Partner"));
        } else if (role == Role.VENDOR) {
            m.setVendorEmail(auth.getName());
            m.setVendorName(name);
        }

        var saved = messages.save(m);
        audit.log("Requirement message sent", "Requirements", r.getReference());

        // Notify all relevant stakeholders
        notifyStakeholders(r, auth.getName(), saved);

        return saved;
    }

    private Requirement find(Long id) {
        return requirements.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Requirement not found"));
    }

    private Role authorize(Requirement r, Authentication auth) {
        String email = auth.getName();
        Role role = access.role(auth);

        boolean allowed = role == Role.SUPER_ADMIN
                || role == Role.EMPLOYEE
                || role == Role.CUSTOMER
                || role == Role.VENDOR;

        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access messages on this requirement");
        }
        return role;
    }

    private void notifyStakeholders(Requirement r, String actor, RequirementMessage m) {
        Set<String> recipients = new LinkedHashSet<>();
        
        // Add customer
        if (r.getCustomerEmail() != null && !r.getCustomerEmail().isBlank()) {
            recipients.add(r.getCustomerEmail());
        }
        
        // Add assigned employee
        if (r.getEmployeeEmail() != null && !r.getEmployeeEmail().isBlank()) {
            recipients.add(r.getEmployeeEmail());
        }
        
        // Add admin
        if (adminEmail != null && !adminEmail.isBlank()) {
            recipients.add(adminEmail);
        }

        // Add vendors who have active quotes
        quotations.findByRequirementId(r.getId()).forEach(q -> {
            if (q.getVendorEmail() != null && !q.getVendorEmail().isBlank()) {
                recipients.add(q.getVendorEmail());
            }
        });

        // Dispatch notifications to everyone except the sender
        recipients.forEach(email -> {
            if (!email.equalsIgnoreCase(actor)) {
                notifications.send(
                        email,
                        r.getId(),
                        "REQUIREMENT_MESSAGE",
                        "New message on " + r.getReference(),
                        m.getSenderName() + " (" + m.getSenderRole() + "): " + m.getMessage()
                );
            }
        });
    }
}
