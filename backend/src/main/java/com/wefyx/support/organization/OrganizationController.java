package com.wefyx.support.organization;
import com.wefyx.support.user.UserRepository;import org.springframework.web.bind.annotation.*;import java.util.*;import java.util.stream.Collectors;
@RestController @RequestMapping("/api/organizations") public class OrganizationController{
 private final UserRepository users;public OrganizationController(UserRepository users){this.users=users;}
 @GetMapping("/summary") public List<Map<String,Object>> summary(){return users.findAll().stream().collect(Collectors.groupingBy(u->u.getOrganization(),LinkedHashMap::new,Collectors.counting())).entrySet().stream().map(e->{Map<String,Object> m=new LinkedHashMap<>();m.put("name",e.getKey());m.put("employees",e.getValue());m.put("active",true);return m;}).toList();}
}
