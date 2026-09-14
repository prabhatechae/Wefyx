package com.wefyx.support.notification;
import jakarta.persistence.*;import java.time.LocalDateTime;
@Entity @Table(name="account_notifications") public class AccountNotification{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;@Column(nullable=false)private String recipientEmail;private Long requirementId;private String type;private String title;@Column(length=2000)private String message;private boolean read;private LocalDateTime createdAt;
 @PrePersist void created(){if(createdAt==null)createdAt=LocalDateTime.now();}
 public Long getId(){return id;}public String getRecipientEmail(){return recipientEmail;}public void setRecipientEmail(String v){recipientEmail=v;}public Long getRequirementId(){return requirementId;}public void setRequirementId(Long v){requirementId=v;}public String getType(){return type;}public void setType(String v){type=v;}public String getTitle(){return title;}public void setTitle(String v){title=v;}public String getMessage(){return message;}public void setMessage(String v){message=v;}public boolean isRead(){return read;}public void setRead(boolean v){read=v;}public LocalDateTime getCreatedAt(){return createdAt;}
}
