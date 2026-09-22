package com.wefyx.support.user;
import com.wefyx.support.resource.AuditService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import com.wefyx.support.config.AccessControl;
import com.wefyx.support.config.AccessControl.Role;

@RestController @RequestMapping("/api/employee-registrations")
public class EmployeeApprovalController {
 private final UserRepository users;private final AuditService audit;private final AccessControl access;
 public EmployeeApprovalController(UserRepository users,AuditService audit,AccessControl access){this.users=users;this.audit=audit;this.access=access;}
 private void admin(Authentication auth){access.require(auth,Role.SUPER_ADMIN);}
 @GetMapping public List<SupportUser> pending(Authentication auth){admin(auth);return users.findByStatus(UserStatus.PENDING).stream().filter(u->"EMPLOYEE".equals(u.getRole())).toList();}
 @PatchMapping("/{id}/approve")public SupportUser approve(@PathVariable Long id,Authentication auth){admin(auth);var user=users.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Employee not found"));if(!"EMPLOYEE".equals(user.getRole())||user.getStatus()!=UserStatus.PENDING)throw new ResponseStatusException(HttpStatus.CONFLICT,"Employee is not pending approval");user.setStatus(UserStatus.ACTIVE);var saved=users.save(user);audit.log("Employee registration approved","Users Management",user.getEmail());return saved;}
}
