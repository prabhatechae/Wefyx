package com.wefyx.support.supportrequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PublicSupportRequestRepository extends JpaRepository<PublicSupportRequest,Long>{List<PublicSupportRequest> findAllByOrderByCreatedAtDesc();}
