package com.wefyx.support.requirement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface VendorQuotationRepository extends JpaRepository<VendorQuotation,Long> {
    List<VendorQuotation> findByRequirementId(Long requirementId);
    List<VendorQuotation> findByRequirementIdOrderByAmountAsc(Long requirementId);
    List<VendorQuotation> findByVendorEmailIgnoreCaseOrderByCreatedAtDesc(String vendorEmail);
    Optional<VendorQuotation> findFirstByRequirementIdAndVendorEmailIgnoreCaseOrderByVersionDescIdDesc(Long requirementId,String vendorEmail);
    default Optional<VendorQuotation> findByRequirementIdAndVendorEmailIgnoreCase(Long requirementId,String vendorEmail) {
        return findFirstByRequirementIdAndVendorEmailIgnoreCaseOrderByVersionDescIdDesc(requirementId,vendorEmail);
    }
    List<VendorQuotation> findByRequirementIdAndVendorEmailIgnoreCaseOrderByVersionDesc(Long requirementId,String vendorEmail);
    List<VendorQuotation> findByRequirementIdAndStatus(Long requirementId,VendorQuotationStatus status);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<VendorQuotation> findWithLockById(Long id);
}
