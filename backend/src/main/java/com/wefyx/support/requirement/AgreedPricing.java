package com.wefyx.support.requirement;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** A write-once financial record created only after requester confirmation. */
@Entity
@Table(name = "agreed_pricing_snapshots", uniqueConstraints = @UniqueConstraint(columnNames = "requirementId"))
public class AgreedPricing {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, updatable = false) private Long requirementId;
    @Column(nullable = false, updatable = false) private Long quotationId;
    @Column(updatable = false) private String vendorEmail;
    @Column(nullable = false, updatable = false) private String employeeEmail;
    @Column(updatable = false) private Long approvedByStaffId;
    @Column(precision = 19, scale = 2, updatable = false) private BigDecimal subtotal;
    @Column(precision = 19, scale = 2, updatable = false) private BigDecimal taxAmount;
    @Column(precision = 19, scale = 2, updatable = false) private BigDecimal discountAmount;
    @Column(precision = 19, scale = 2, updatable = false) private BigDecimal totalCost;
    @Column(length = 16000, updatable = false) private String frozenSnapshot;
    @Column(unique = true, nullable = false, updatable = false) private String purchaseOrderReference;
    @Column(updatable = false) private String confirmedIp;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @PrePersist void created(){ if(createdAt==null) createdAt=LocalDateTime.now(); }
    public Long getId(){return id;} public Long getRequirementId(){return requirementId;} public void setRequirementId(Long v){requirementId=v;} public Long getQuotationId(){return quotationId;} public void setQuotationId(Long v){quotationId=v;}
    public String getVendorEmail(){return vendorEmail;} public void setVendorEmail(String v){vendorEmail=v;} public String getEmployeeEmail(){return employeeEmail;} public void setEmployeeEmail(String v){employeeEmail=v;} public Long getApprovedByStaffId(){return approvedByStaffId;} public void setApprovedByStaffId(Long v){approvedByStaffId=v;}
    public BigDecimal getSubtotal(){return subtotal;} public void setSubtotal(BigDecimal v){subtotal=v;} public BigDecimal getTaxAmount(){return taxAmount;} public void setTaxAmount(BigDecimal v){taxAmount=v;} public BigDecimal getDiscountAmount(){return discountAmount;} public void setDiscountAmount(BigDecimal v){discountAmount=v;} public BigDecimal getTotalCost(){return totalCost;} public void setTotalCost(BigDecimal v){totalCost=v;}
    public String getFrozenSnapshot(){return frozenSnapshot;} public void setFrozenSnapshot(String v){frozenSnapshot=v;} public String getPurchaseOrderReference(){return purchaseOrderReference;} public void setPurchaseOrderReference(String v){purchaseOrderReference=v;} public String getConfirmedIp(){return confirmedIp;} public void setConfirmedIp(String v){confirmedIp=v;} public LocalDateTime getCreatedAt(){return createdAt;}
}
