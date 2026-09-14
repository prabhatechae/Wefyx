package com.wefyx.support.requirement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RequirementMessageRepository extends JpaRepository<RequirementMessage,Long>{List<RequirementMessage> findByRequirementIdOrderByCreatedAtAsc(Long requirementId);}
