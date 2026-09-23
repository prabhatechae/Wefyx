package com.wefyx.support.requirement;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VendorQuotationRepository extends JpaRepository<VendorQuotation,Long> {
    List<VendorQuotation> findByRequirementIdOrderByAmountAsc(Long requirementId);
    List<VendorQuotation> findByVendorEmailIgnoreCaseOrderByCreatedAtDesc(String vendorEmail);
    Optional<VendorQuotation> findByRequirementIdAndVendorEmailIgnoreCase(Long requirementId,String vendorEmail);
}
