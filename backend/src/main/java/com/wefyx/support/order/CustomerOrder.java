package com.wefyx.support.order;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_orders", indexes = {
    @Index(name = "idx_customer_orders_email", columnList = "customerEmail"),
    @Index(name = "idx_customer_orders_reference", columnList = "reference", unique = true)
})
public class CustomerOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private String reference;
    @Column(nullable = false) private String customerEmail;
    @Column(nullable = false) private String customerName;
    private String organization;
    @Column(nullable = false) private String status;
    @Column(nullable = false) private String currency;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal subtotal;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal vat;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal total;
    @Column(nullable = false) private Integer itemCount;
    @Column(nullable = false, columnDefinition = "text") private String itemsJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected CustomerOrder() {}
    @PrePersist void create(){if(createdAt==null)createdAt=LocalDateTime.now();updatedAt=LocalDateTime.now();}
    @PreUpdate void update(){updatedAt=LocalDateTime.now();}

    public Long getId(){return id;} public String getReference(){return reference;} public void setReference(String v){reference=v;}
    public String getCustomerEmail(){return customerEmail;} public void setCustomerEmail(String v){customerEmail=v;}
    public String getCustomerName(){return customerName;} public void setCustomerName(String v){customerName=v;}
    public String getOrganization(){return organization;} public void setOrganization(String v){organization=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;}
    public String getCurrency(){return currency;} public void setCurrency(String v){currency=v;}
    public BigDecimal getSubtotal(){return subtotal;} public void setSubtotal(BigDecimal v){subtotal=v;}
    public BigDecimal getVat(){return vat;} public void setVat(BigDecimal v){vat=v;}
    public BigDecimal getTotal(){return total;} public void setTotal(BigDecimal v){total=v;}
    public Integer getItemCount(){return itemCount;} public void setItemCount(Integer v){itemCount=v;}
    public String getItemsJson(){return itemsJson;} public void setItemsJson(String v){itemsJson=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
