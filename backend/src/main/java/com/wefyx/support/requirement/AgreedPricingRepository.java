package com.wefyx.support.requirement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface AgreedPricingRepository extends JpaRepository<AgreedPricing,Long> { Optional<AgreedPricing> findByRequirementId(Long requirementId); }
