package com.wefyx.support.role;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.wefyx.support.resource.AuditService;
@RestController @RequestMapping("/api/roles")
public class RoleController {
 private final RoleRepository repository;
 private final AuditService audit; public RoleController(RoleRepository r,AuditService a){repository=r;audit=a;}
 @GetMapping public List<SupportRole> all(){return repository.findAll();}
 @PostMapping public SupportRole create(@RequestBody SupportRole role){SupportRole saved=repository.save(role);audit.log("Create Role","Role Management",saved.getName());return saved;}
 @PutMapping("/{id}") public SupportRole update(@PathVariable Long id,@RequestBody SupportRole input){SupportRole role=repository.findById(id).orElseThrow();role.setName(input.getName());role.setCode(input.getCode());role.setType(input.getType());role.setUsers(input.getUsers());role.setDescription(input.getDescription());role.setOrganization(input.getOrganization());role.setActive(input.isActive());SupportRole saved=repository.save(role);audit.log("Update Role","Role Management",saved.getName());return saved;}
 @DeleteMapping("/{id}") public void delete(@PathVariable Long id){SupportRole role=repository.findById(id).orElseThrow();repository.delete(role);audit.log("Delete Role","Role Management",role.getName());}
}
