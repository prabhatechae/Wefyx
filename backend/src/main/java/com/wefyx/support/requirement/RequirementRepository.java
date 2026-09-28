package com.wefyx.support.requirement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.List;

public interface RequirementRepository extends JpaRepository<Requirement,Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    java.util.Optional<Requirement> findWithLockById(Long id);
    List<Requirement> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String email);
    List<Requirement> findByVendorNameIgnoreCaseOrderByCreatedAtDesc(String vendor);
}
