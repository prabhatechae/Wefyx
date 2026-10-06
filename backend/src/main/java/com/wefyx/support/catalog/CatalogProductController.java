package com.wefyx.support.catalog;

import com.wefyx.support.config.AccessControl;
import com.wefyx.support.config.AccessControl.Role;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/catalog/products")
public class CatalogProductController {
    private final CatalogProductRepository products; private final AccessControl access;
    public CatalogProductController(CatalogProductRepository products,AccessControl access){this.products=products;this.access=access;}

    @GetMapping public List<CatalogProduct> list(@RequestParam(defaultValue="false") boolean all,Authentication auth){
        if(all){access.require(auth,Role.SUPER_ADMIN);return products.findAll().stream().sorted(Comparator.comparing(CatalogProduct::getName,String.CASE_INSENSITIVE_ORDER)).toList();}
        return products.findByActiveTrueOrderByFeaturedDescNameAsc();
    }
    @GetMapping("/{code}") public CatalogProduct one(@PathVariable String code){var item=find(code);if(!item.isActive())throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Product not available");return item;}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public CatalogProduct create(@RequestBody CatalogProduct input,Authentication auth){access.require(auth,Role.SUPER_ADMIN);input.setId(null);validate(input,null);return products.save(input);}
    @PutMapping("/{id}") public CatalogProduct update(@PathVariable Long id,@RequestBody CatalogProduct input,Authentication auth){access.require(auth,Role.SUPER_ADMIN);var item=products.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Product not found"));copy(input,item);validate(item,id);return products.save(item);}
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void remove(@PathVariable Long id,Authentication auth){access.require(auth,Role.SUPER_ADMIN);var item=products.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Product not found"));item.setActive(false);products.save(item);}

    private CatalogProduct find(String code){return products.findByCodeIgnoreCase(code).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Product not found"));}
    private void copy(CatalogProduct from,CatalogProduct to){to.setCode(from.getCode());to.setName(from.getName());to.setSpecification(from.getSpecification());to.setCategory(from.getCategory());to.setBrand(from.getBrand());to.setVendor(from.getVendor());to.setImageUrl(from.getImageUrl());to.setDescription(from.getDescription());to.setBuyPrice(from.getBuyPrice());to.setRentalPrice(from.getRentalPrice());to.setStockQuantity(from.getStockQuantity());to.setActive(from.isActive());to.setPurchasable(from.isPurchasable());to.setRentable(from.isRentable());to.setFeatured(from.isFeatured());}
    private void validate(CatalogProduct item,Long id){item.setCode(required(item.getCode(),"Product code").toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9-]+","-"));item.setName(required(item.getName(),"Product name"));item.setCategory(required(item.getCategory(),"Category"));item.setSpecification(clean(item.getSpecification()));item.setBrand(clean(item.getBrand()));item.setVendor(clean(item.getVendor()));item.setImageUrl(clean(item.getImageUrl()));item.setDescription(clean(item.getDescription()));item.setStockQuantity(Math.max(0,item.getStockQuantity()==null?0:item.getStockQuantity()));if(products.existsByCodeIgnoreCaseAndIdNot(item.getCode(),id==null?-1L:id))throw new ResponseStatusException(HttpStatus.CONFLICT,"Product code already exists");if(item.isPurchasable())price(item.getBuyPrice(),"Purchase price");if(item.isRentable())price(item.getRentalPrice(),"Rental price");if(!item.isPurchasable()&&!item.isRentable())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Enable purchase, rental, or both");}
    private static void price(BigDecimal value,String name){if(value==null||value.signum()<0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,name+" is required");}
    private static String required(String value,String label){if(value==null||value.isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,label+" is required");return value.trim();}
    private static String clean(String value){return value==null?"":value.trim();}
}
