package com.wefyx.support.requirement;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_quotations")
public class VendorQuotation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long requirementId;
    @Column(nullable = false) private String vendorName;
    private String vendorEmail;
    private BigDecimal amount;
    private Integer leadTimeDays;
    @Column(length = 3000) private String notes;
    @Enumerated(EnumType.STRING) private VendorQuotationStatus status = VendorQuotationStatus.INVITED;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    @PrePersist void createDates(){if(createdAt==null)createdAt=LocalDateTime.now();updatedAt=LocalDateTime.now();}
    @PreUpdate void updateDate(){updatedAt=LocalDateTime.now();}
    public Long getId(){return id;} public Long getRequirementId(){return requirementId;} public void setRequirementId(Long v){requirementId=v;}
    public String getVendorName(){return vendorName;} public void setVendorName(String v){vendorName=v;} public String getVendorEmail(){return vendorEmail;} public void setVendorEmail(String v){vendorEmail=v;}
    public BigDecimal getAmount(){return amount;} public void setAmount(BigDecimal v){amount=v;} public Integer getLeadTimeDays(){return leadTimeDays;} public void setLeadTimeDays(Integer v){leadTimeDays=v;}
    public String getNotes(){return notes;} public void setNotes(String v){notes=v;} public VendorQuotationStatus getStatus(){return status;} public void setStatus(VendorQuotationStatus v){status=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;} public LocalDateTime getSubmittedAt(){return submittedAt;} public void setSubmittedAt(LocalDateTime v){submittedAt=v;}
}
