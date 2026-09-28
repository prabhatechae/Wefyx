package com.wefyx.support.requirement;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_quotations")
public class VendorQuotation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long requirementId;
    private Long parentQuotationId;
    @Column(nullable = false) private Integer version = 1;
    @Column(nullable = false) private String vendorName;
    private String vendorEmail;
    private BigDecimal amount;
    @Column(length = 12000) private String lineItemsJson;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal grandTotal;
    private Integer leadTimeDays;
    private LocalDate deliveryDate;
    private LocalDate validUntil;
    @Column(length = 4000) private String paymentTerms;
    private String attachmentUrl;
    @Column(length = 4000) private String reviewNotes;
    private Long approvedByStaffId;
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
    public Long getParentQuotationId(){return parentQuotationId;} public void setParentQuotationId(Long v){parentQuotationId=v;} public Integer getVersion(){return version;} public void setVersion(Integer v){version=v;}
    public String getLineItemsJson(){return lineItemsJson;} public void setLineItemsJson(String v){lineItemsJson=v;} public BigDecimal getSubtotal(){return subtotal;} public void setSubtotal(BigDecimal v){subtotal=v;} public BigDecimal getTaxAmount(){return taxAmount;} public void setTaxAmount(BigDecimal v){taxAmount=v;} public BigDecimal getDiscountAmount(){return discountAmount;} public void setDiscountAmount(BigDecimal v){discountAmount=v;} public BigDecimal getGrandTotal(){return grandTotal;} public void setGrandTotal(BigDecimal v){grandTotal=v;}
    public LocalDate getDeliveryDate(){return deliveryDate;} public void setDeliveryDate(LocalDate v){deliveryDate=v;} public LocalDate getValidUntil(){return validUntil;} public void setValidUntil(LocalDate v){validUntil=v;} public String getPaymentTerms(){return paymentTerms;} public void setPaymentTerms(String v){paymentTerms=v;} public String getAttachmentUrl(){return attachmentUrl;} public void setAttachmentUrl(String v){attachmentUrl=v;} public String getReviewNotes(){return reviewNotes;} public void setReviewNotes(String v){reviewNotes=v;} public Long getApprovedByStaffId(){return approvedByStaffId;} public void setApprovedByStaffId(Long v){approvedByStaffId=v;}
    public String getNotes(){return notes;} public void setNotes(String v){notes=v;} public VendorQuotationStatus getStatus(){return status;} public void setStatus(VendorQuotationStatus v){status=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;} public LocalDateTime getSubmittedAt(){return submittedAt;} public void setSubmittedAt(LocalDateTime v){submittedAt=v;}
}
