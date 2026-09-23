package com.wefyx.support.requirement;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name="requirement_messages")
public class RequirementMessage {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private Long requirementId;
 @Column(nullable=false) private String senderEmail;
 private String senderName;
 private String senderRole;
 @Column(nullable=false,length=4000) private String message;
 private LocalDateTime createdAt;
 @PrePersist void created(){if(createdAt==null)createdAt=LocalDateTime.now();}
 public Long getId(){return id;} public Long getRequirementId(){return requirementId;} public void setRequirementId(Long v){requirementId=v;}
 public String getSenderEmail(){return senderEmail;} public void setSenderEmail(String v){senderEmail=v;} public String getSenderName(){return senderName;} public void setSenderName(String v){senderName=v;}
 public String getSenderRole(){return senderRole;} public void setSenderRole(String v){senderRole=v;} public String getMessage(){return message;} public void setMessage(String v){message=v;} public LocalDateTime getCreatedAt(){return createdAt;}
}
