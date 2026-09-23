package com.wefyx.support.user;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import com.wefyx.support.resource.AuditService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@RestController @RequestMapping("/api/users")
public class UserController {
    private final UserRepository repository;
    private final AuditService audit;
    private final BCryptPasswordEncoder passwords=new BCryptPasswordEncoder();
    public UserController(UserRepository repository,AuditService audit){this.repository=repository;this.audit=audit;}
    @GetMapping public List<SupportUser> all(@RequestParam(required=false) UserStatus status,@RequestParam(required=false) String organization,@RequestParam(required=false) String role){List<SupportUser> rows;if(organization!=null&&!organization.isBlank())rows=status==null?repository.findByOrganization(organization):repository.findByOrganizationAndStatus(organization,status);else rows=status==null?repository.findAll():repository.findByStatus(status);if(role!=null&&!role.isBlank())return rows.stream().filter(u->u.getRole()!=null&&u.getRole().toUpperCase().contains(role.toUpperCase())).toList();return rows;}
    @GetMapping("/{id}") public SupportUser one(@PathVariable Long id){return repository.findById(id).orElseThrow();}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public SupportUser create(@Valid @RequestBody SupportUser user){if(user.getPassword()==null||user.getPassword().length()<8)throw new IllegalArgumentException("Employee password must contain at least 8 characters");user.setPasswordHash(passwords.encode(user.getPassword()));if(user.getJoinedOn()==null)user.setJoinedOn(LocalDateTime.now());SupportUser saved=repository.save(user);audit.log("Create User","Users Management",saved.getName());return saved;}
    @PutMapping("/{id}") public SupportUser update(@PathVariable Long id,@Valid @RequestBody SupportUser input){SupportUser u=repository.findById(id).orElseThrow();u.setName(input.getName());u.setEmail(input.getEmail());u.setRole(input.getRole());u.setOrganization(input.getOrganization());u.setLocation(input.getLocation());u.setStatus(input.getStatus());if(input.getPassword()!=null&&!input.getPassword().isBlank()){if(input.getPassword().length()<8)throw new IllegalArgumentException("Employee password must contain at least 8 characters");u.setPasswordHash(passwords.encode(input.getPassword()));}SupportUser saved=repository.save(u);audit.log("Update User","Users Management",saved.getName());return saved;}
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){SupportUser user=repository.findById(id).orElseThrow();repository.delete(user);audit.log("Delete User","Users Management",user.getName());}
}
