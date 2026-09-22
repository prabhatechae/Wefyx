package com.wefyx.support.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import com.wefyx.support.user.SupportUser;
import org.springframework.web.server.ResponseStatusException;
import com.wefyx.support.user.UserRepository;
import com.wefyx.support.user.UserStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.Authentication;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final JwtService jwt;
    private final String adminEmail, adminPassword, vendorEmail, vendorPassword, vendorName;
    private final UserRepository users;
    private final BCryptPasswordEncoder passwords=new BCryptPasswordEncoder();
    public AuthController(JwtService jwt,
                          @Value("${wefyx.auth.email}") String email,
                          @Value("${wefyx.auth.password}") String password,
                          @Value("${wefyx.auth.vendor-email}") String vendorEmail,
                          @Value("${wefyx.auth.vendor-password}") String vendorPassword,
                          @Value("${wefyx.auth.vendor-name}") String vendorName,
                          UserRepository users) {
        this.jwt=jwt; this.adminEmail=email; this.adminPassword=password;
        this.vendorEmail=vendorEmail; this.vendorPassword=vendorPassword; this.vendorName=vendorName;
        this.users=users;
    }
    @PostMapping("/login") public ResponseEntity<?> login(@RequestBody LoginRequest request){
        String suppliedEmail=String.valueOf(request.email()), suppliedPassword=String.valueOf(request.password());
        if(matches(adminEmail,adminPassword,suppliedEmail,suppliedPassword))
            return session(adminEmail,"System Administrator","SUPER_ADMIN");
        if(!vendorEmail.isBlank() && !vendorPassword.isBlank() && matches(vendorEmail,vendorPassword,suppliedEmail,suppliedPassword))
            return session(vendorEmail,vendorName,"VENDOR");
        var employee=users.findByEmailIgnoreCase(suppliedEmail).orElse(null);
        if(employee!=null && employee.getStatus()==UserStatus.PENDING && employee.getPasswordHash()!=null && passwords.matches(suppliedPassword,employee.getPasswordHash()))return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message","Your "+loginRole(employee.getRole()).toLowerCase()+" registration is pending admin approval."));
        if(employee!=null && employee.getStatus()==UserStatus.ACTIVE && employee.getPasswordHash()!=null && passwords.matches(suppliedPassword,employee.getPasswordHash())){
            employee.setLastLogin(java.time.LocalDateTime.now()); users.save(employee);
            return session(employee);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","Invalid email or password"));
    }
    private boolean matches(String expectedEmail,String expectedPassword,String email,String password){
        return MessageDigest.isEqual(expectedEmail.toLowerCase().getBytes(StandardCharsets.UTF_8),email.toLowerCase().getBytes(StandardCharsets.UTF_8))
            && MessageDigest.isEqual(expectedPassword.getBytes(StandardCharsets.UTF_8),password.getBytes(StandardCharsets.UTF_8));
    }
    @PostMapping("/register") public ResponseEntity<?> register(@Valid @RequestBody RegistrationRequest request){
        String email=request.email().trim().toLowerCase();
        if(!java.util.Set.of("CUSTOMER","VENDOR","EMPLOYEE").contains(request.role()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid registration role");
        if(users.findByEmailIgnoreCase(email).isPresent()||email.equalsIgnoreCase(adminEmail)||email.equalsIgnoreCase(vendorEmail))throw new ResponseStatusException(HttpStatus.CONFLICT,"An account already exists with this email");
        var now=java.time.LocalDateTime.now();
        boolean pending=java.util.Set.of("EMPLOYEE","VENDOR").contains(request.role());
        var user=new SupportUser(request.name().trim(),email,request.role(),request.organization().trim(),"",pending?UserStatus.PENDING:UserStatus.ACTIVE,null,now);
        user.setPhone(request.phone()==null?"":request.phone().trim());
        user.setPasswordHash(passwords.encode(request.password()));users.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message",pending?"Registration submitted. A Wefyx administrator must approve your "+request.role().toLowerCase()+" account before sign in.":"Account created. Please sign in.","email",email,"role",request.role(),"status",pending?"PENDING":"ACTIVE"));
    }
    private ResponseEntity<?> session(String email,String name,String role){
        return ResponseEntity.ok(Map.of("token",jwt.issue(email,role),"user",Map.of("email",email,"name",name,"role",role)));
    }
    private ResponseEntity<?> session(SupportUser user){
        String role=loginRole(user.getRole());
        Map<String,Object> profile=new java.util.LinkedHashMap<>();
        profile.put("email",user.getEmail());profile.put("name",user.getName());profile.put("role",role);
        profile.put("organization",user.getOrganization());profile.put("phone",user.getPhone()==null?"":user.getPhone());
        return ResponseEntity.ok(Map.of("token",jwt.issue(user.getEmail(),role),"user",profile));
    }
    private String loginRole(String configuredRole){
        String role=configuredRole==null?"":configuredRole.toUpperCase();
        if(role.contains("SUPER")||role.contains("ADMINISTRATOR"))return "SUPER_ADMIN";
        if(role.contains("CUSTOMER")||role.contains("CLIENT"))return "CUSTOMER";
        if(role.contains("VENDOR")||role.contains("PARTNER"))return "VENDOR";
        return "EMPLOYEE";
    }
    @GetMapping("/me") public Map<String,Object> me(Authentication authentication){
        if(authentication==null)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Session is not valid");
        String email=authentication.getName();
        if(email.equalsIgnoreCase(adminEmail))return Map.of("email",adminEmail,"name","System Administrator","role","SUPER_ADMIN");
        if(!vendorEmail.isBlank()&&email.equalsIgnoreCase(vendorEmail))return Map.of("email",vendorEmail,"name",vendorName,"role","VENDOR");
        var user=users.findByEmailIgnoreCase(email).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Account no longer exists"));
        if(user.getStatus()!=UserStatus.ACTIVE)throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Account is not active");
        Map<String,Object> profile=new java.util.LinkedHashMap<>();profile.put("email",user.getEmail());profile.put("name",user.getName());profile.put("role",loginRole(user.getRole()));profile.put("organization",user.getOrganization());profile.put("phone",user.getPhone()==null?"":user.getPhone());return profile;
    }
    public record LoginRequest(String email,String password){}
    public record RegistrationRequest(@NotBlank @Size(max=120) String name,@NotBlank @Email @Size(max=254) String email,@NotBlank @Size(min=8,max=72) String password,@NotBlank @Size(max=200) String organization,@Size(max=25) String phone,@NotBlank String role){}
}
