package com.wefyx.support.supportrequest;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity @Table(name="public_support_requests")
public class PublicSupportRequest {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(unique=true,nullable=false) private String reference;
 @NotBlank @Size(max=120) private String name;
 @NotBlank @Email @Size(max=254) private String email;
 @Size(max=25) private String phone;
 @NotBlank @Size(max=180) private String subject;
 @NotBlank @Size(max=5000) @Column(length=5000) private String description;
 @Column(nullable=false) private String status="OPEN";
 @Column(length=5000) private String employeeReply;
 private String repliedBy; private boolean emailDelivered; private String emailError;
 private LocalDateTime createdAt; private LocalDateTime repliedAt;
 @PrePersist void created(){if(createdAt==null)createdAt=LocalDateTime.now();}
 public Long getId(){return id;} public String getReference(){return reference;} public void setReference(String v){reference=v;} public String getName(){return name;} public void setName(String v){name=v;} public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getPhone(){return phone;} public void setPhone(String v){phone=v;} public String getSubject(){return subject;} public void setSubject(String v){subject=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;} public String getStatus(){return status;} public void setStatus(String v){status=v;} public String getEmployeeReply(){return employeeReply;} public void setEmployeeReply(String v){employeeReply=v;} public String getRepliedBy(){return repliedBy;} public void setRepliedBy(String v){repliedBy=v;} public boolean isEmailDelivered(){return emailDelivered;} public void setEmailDelivered(boolean v){emailDelivered=v;} public String getEmailError(){return emailError;} public void setEmailError(String v){emailError=v;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getRepliedAt(){return repliedAt;} public void setRepliedAt(LocalDateTime v){repliedAt=v;}
}
