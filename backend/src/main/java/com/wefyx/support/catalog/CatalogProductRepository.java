package com.wefyx.support.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface CatalogProductRepository extends JpaRepository<CatalogProduct,Long> {
    Optional<CatalogProduct> findByCodeIgnoreCase(String code);
    List<CatalogProduct> findByActiveTrueOrderByFeaturedDescNameAsc();
    boolean existsByCodeIgnoreCaseAndIdNot(String code,Long id);
}
