package com.wefyx.support.profile;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "account_profile_photos")
public class AccountProfilePhoto {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true, length = 254) private String email;
    @Column(nullable = false, length = 100) private String contentType;
    @Lob @Column(nullable = false) private byte[] content;
    private LocalDateTime updatedAt;

    @PrePersist @PreUpdate void timestamp(){updatedAt=LocalDateTime.now();}
    public Long getId(){return id;}
    public String getEmail(){return email;} public void setEmail(String value){email=value;}
    public String getContentType(){return contentType;} public void setContentType(String value){contentType=value;}
    public byte[] getContent(){return content;} public void setContent(byte[] value){content=value;}
    public LocalDateTime getUpdatedAt(){return updatedAt;}
}
