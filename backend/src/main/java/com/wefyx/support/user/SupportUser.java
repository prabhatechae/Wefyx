package com.wefyx.support.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_users")
public class SupportUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @NotBlank private String name;
    @Email @NotBlank @Column(unique = true) private String email;
    @NotBlank private String role;
    @NotBlank private String organization;
    private String location;
    @Enumerated(EnumType.STRING) private UserStatus status;
    private LocalDateTime lastLogin;
    private LocalDateTime joinedOn;
    @JsonIgnore
    private String passwordHash;
    @Transient
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    protected SupportUser() {}
    public SupportUser(String name,String email,String role,String organization,String location,UserStatus status,LocalDateTime lastLogin,LocalDateTime joinedOn){this.name=name;this.email=email;this.role=role;this.organization=organization;this.location=location;this.status=status;this.lastLogin=lastLogin;this.joinedOn=joinedOn;}
    public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;} public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getRole(){return role;} public void setRole(String v){role=v;} public String getOrganization(){return organization;} public void setOrganization(String v){organization=v;} public String getLocation(){return location;} public void setLocation(String v){location=v;} public UserStatus getStatus(){return status;} public void setStatus(UserStatus v){status=v;} public LocalDateTime getLastLogin(){return lastLogin;} public void setLastLogin(LocalDateTime v){lastLogin=v;} public LocalDateTime getJoinedOn(){return joinedOn;} public void setJoinedOn(LocalDateTime v){joinedOn=v;}
    public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String v){passwordHash=v;} public String getPassword(){return password;} public void setPassword(String v){password=v;}
}
