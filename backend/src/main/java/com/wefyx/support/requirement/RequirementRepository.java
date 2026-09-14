package com.wefyx.support.requirement;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequirementRepository extends JpaRepository<Requirement,Long> {
    List<Requirement> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String email);
    List<Requirement> findByVendorNameIgnoreCaseOrderByCreatedAtDesc(String vendor);
}
