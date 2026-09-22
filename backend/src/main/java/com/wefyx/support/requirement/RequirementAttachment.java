package com.wefyx.support.requirement;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "requirement_attachments")
public class RequirementAttachment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long requirementId;
    @Column(nullable = false) private String fileName;
    @Column(nullable = false) private String contentType;
    @Column(nullable = false) private long fileSize;
    @Column(nullable = false) private String uploadedBy;
    @Lob @Basic(fetch = FetchType.LAZY) @Column(nullable = false) private byte[] content;
    private LocalDateTime createdAt;
    @PrePersist void created(){if(createdAt==null)createdAt=LocalDateTime.now();}
    public Long getId(){return id;} public Long getRequirementId(){return requirementId;} public void setRequirementId(Long v){requirementId=v;}
    public String getFileName(){return fileName;} public void setFileName(String v){fileName=v;} public String getContentType(){return contentType;} public void setContentType(String v){contentType=v;}
    public long getFileSize(){return fileSize;} public void setFileSize(long v){fileSize=v;} public String getUploadedBy(){return uploadedBy;} public void setUploadedBy(String v){uploadedBy=v;}
    public byte[] getContent(){return content;} public void setContent(byte[] v){content=v;} public LocalDateTime getCreatedAt(){return createdAt;}
}
