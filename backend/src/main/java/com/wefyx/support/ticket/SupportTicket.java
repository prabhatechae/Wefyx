package com.wefyx.support.ticket;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity @Table(name="support_tickets")
public class SupportTicket {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(unique=true) private String reference;
 @NotBlank private String subject;
 @NotBlank private String customer;
 @NotBlank private String assignee;
 @NotNull @Enumerated(EnumType.STRING) private TicketPriority priority;
 @NotNull @Enumerated(EnumType.STRING) private TicketStatus status;
 private String category;
 private LocalDateTime createdAt;
 private LocalDateTime updatedAt;
 protected SupportTicket(){}
 public SupportTicket(String reference,String subject,String customer,String assignee,TicketPriority priority,TicketStatus status,String category){this.reference=reference;this.subject=subject;this.customer=customer;this.assignee=assignee;this.priority=priority;this.status=status;this.category=category;this.createdAt=LocalDateTime.now();this.updatedAt=LocalDateTime.now();}
 @PrePersist void beforeCreate(){if(createdAt==null)createdAt=LocalDateTime.now();updatedAt=LocalDateTime.now();}
 @PreUpdate void beforeUpdate(){updatedAt=LocalDateTime.now();}
 public Long getId(){return id;} public String getReference(){return reference;} public void setReference(String v){reference=v;} public String getSubject(){return subject;} public void setSubject(String v){subject=v;} public String getCustomer(){return customer;} public void setCustomer(String v){customer=v;} public String getAssignee(){return assignee;} public void setAssignee(String v){assignee=v;} public TicketPriority getPriority(){return priority;} public void setPriority(TicketPriority v){priority=v;} public TicketStatus getStatus(){return status;} public void setStatus(TicketStatus v){status=v;} public String getCategory(){return category;} public void setCategory(String v){category=v;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
