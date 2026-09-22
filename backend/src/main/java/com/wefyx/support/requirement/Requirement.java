package com.wefyx.support.requirement;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "requirements")
public class Requirement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true, nullable = false) private String reference;
    @NotBlank private String title;
    @Column(length = 4000) private String description;
    private String category;
    private String priority;
    private String customerName;
    private String customerEmail;
    private String organization;
    private String employeeName;
    private String employeeEmail;
    private String vendorName;
    @Column(length = 3000) private String employeeNotes;
    @Column(length = 3000) private String vendorNotes;
    @Column(length = 3000) private String resolution;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.VARCHAR) @Column(length = 50) private RequirementStatus status = RequirementStatus.SUBMITTED;
    private boolean quotationRequested;
    private BigDecimal estimatedAmount;
    private BigDecimal agreedAmount;
    private Long selectedQuotationId;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.VARCHAR) @Column(length = 50) private QuotationStatus quotationStatus = QuotationStatus.NOT_REQUESTED;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    @PrePersist void createDates(){ if(createdAt==null) createdAt=LocalDateTime.now(); updatedAt=LocalDateTime.now(); }
    @PreUpdate void updateDate(){ updatedAt=LocalDateTime.now(); }
    public Long getId(){return id;} public String getReference(){return reference;} public void setReference(String v){reference=v;}
    public String getTitle(){return title;} public void setTitle(String v){title=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;}
    public String getCategory(){return category;} public void setCategory(String v){category=v;} public String getPriority(){return priority;} public void setPriority(String v){priority=v;}
    public String getCustomerName(){return customerName;} public void setCustomerName(String v){customerName=v;} public String getCustomerEmail(){return customerEmail;} public void setCustomerEmail(String v){customerEmail=v;}
    public String getOrganization(){return organization;} public void setOrganization(String v){organization=v;} public String getEmployeeName(){return employeeName;} public void setEmployeeName(String v){employeeName=v;}
    public String getEmployeeEmail(){return employeeEmail;} public void setEmployeeEmail(String v){employeeEmail=v;}
    public String getVendorName(){return vendorName;} public void setVendorName(String v){vendorName=v;} public String getEmployeeNotes(){return employeeNotes;} public void setEmployeeNotes(String v){employeeNotes=v;}
    public String getVendorNotes(){return vendorNotes;} public void setVendorNotes(String v){vendorNotes=v;} public String getResolution(){return resolution;} public void setResolution(String v){resolution=v;}
    public RequirementStatus getStatus(){return status;} public void setStatus(RequirementStatus v){status=v;} public boolean isQuotationRequested(){return quotationRequested;} public void setQuotationRequested(boolean v){quotationRequested=v;}
    public BigDecimal getEstimatedAmount(){return estimatedAmount;} public void setEstimatedAmount(BigDecimal v){estimatedAmount=v;} public BigDecimal getAgreedAmount(){return agreedAmount;} public void setAgreedAmount(BigDecimal v){agreedAmount=v;}
    public Long getSelectedQuotationId(){return selectedQuotationId;} public void setSelectedQuotationId(Long v){selectedQuotationId=v;}
    public QuotationStatus getQuotationStatus(){return quotationStatus;} public void setQuotationStatus(QuotationStatus v){quotationStatus=v;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
    public LocalDateTime getResolvedAt(){return resolvedAt;} public void setResolvedAt(LocalDateTime v){resolvedAt=v;}
}
