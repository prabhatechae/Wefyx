package com.wefyx.support.resource;
import jakarta.persistence.*;import jakarta.validation.constraints.NotBlank;import java.time.LocalDateTime;
@Entity @Table(name="resource_records") public class ResourceRecord{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 private String moduleKey; @NotBlank private String name; private String owner; private String details; private String status; private LocalDateTime createdAt; private LocalDateTime updatedAt;
 protected ResourceRecord(){} @PrePersist void create(){createdAt=LocalDateTime.now();updatedAt=createdAt;} @PreUpdate void update(){updatedAt=LocalDateTime.now();}
 public Long getId(){return id;} public String getModuleKey(){return moduleKey;} public void setModuleKey(String v){moduleKey=v;} public String getName(){return name;} public void setName(String v){name=v;} public String getOwner(){return owner;} public void setOwner(String v){owner=v;} public String getDetails(){return details;} public void setDetails(String v){details=v;} public String getStatus(){return status;} public void setStatus(String v){status=v;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
