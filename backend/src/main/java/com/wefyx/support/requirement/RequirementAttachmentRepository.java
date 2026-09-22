package com.wefyx.support.requirement;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequirementAttachmentRepository extends JpaRepository<RequirementAttachment,Long> {
    List<RequirementAttachment> findByRequirementIdOrderByCreatedAtAsc(Long requirementId);
}
