package com.wefyx.support.catalog;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name="catalog_products",indexes={@Index(name="idx_catalog_active_category",columnList="active,category")})
public class CatalogProduct {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,unique=true,length=80) private String code;
    @Column(nullable=false,length=180) private String name;
    @Column(length=500) private String specification;
    @Column(length=80) private String category;
    @Column(length=80) private String brand;
    @Column(length=160) private String vendor;
    @Column(length=500) private String imageUrl;
    @Column(length=2000) private String description;
    @Column(precision=12,scale=2) private BigDecimal buyPrice;
    @Column(precision=12,scale=2) private BigDecimal rentalPrice;
    private Integer stockQuantity;
    private boolean active=true;
    private boolean purchasable=true;
    private boolean rentable=true;
    private boolean featured=false;
    @Version private Long version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist void create(){var now=LocalDateTime.now();createdAt=now;updatedAt=now;}
    @PreUpdate void update(){updatedAt=LocalDateTime.now();}

    public Long getId(){return id;} public void setId(Long v){id=v;}
    public String getCode(){return code;} public void setCode(String v){code=v;}
    public String getName(){return name;} public void setName(String v){name=v;}
    public String getSpecification(){return specification;} public void setSpecification(String v){specification=v;}
    public String getCategory(){return category;} public void setCategory(String v){category=v;}
    public String getBrand(){return brand;} public void setBrand(String v){brand=v;}
    public String getVendor(){return vendor;} public void setVendor(String v){vendor=v;}
    public String getImageUrl(){return imageUrl;} public void setImageUrl(String v){imageUrl=v;}
    public String getDescription(){return description;} public void setDescription(String v){description=v;}
    public BigDecimal getBuyPrice(){return buyPrice;} public void setBuyPrice(BigDecimal v){buyPrice=v;}
    public BigDecimal getRentalPrice(){return rentalPrice;} public void setRentalPrice(BigDecimal v){rentalPrice=v;}
    public Integer getStockQuantity(){return stockQuantity;} public void setStockQuantity(Integer v){stockQuantity=v;}
    public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
    public boolean isPurchasable(){return purchasable;} public void setPurchasable(boolean v){purchasable=v;}
    public boolean isRentable(){return rentable;} public void setRentable(boolean v){rentable=v;}
    public boolean isFeatured(){return featured;} public void setFeatured(boolean v){featured=v;}
    public Long getVersion(){return version;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
