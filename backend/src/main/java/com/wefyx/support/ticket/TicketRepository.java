package com.wefyx.support.ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface TicketRepository extends JpaRepository<SupportTicket,Long>{
 long countByStatus(TicketStatus status);
 Optional<SupportTicket> findByRequirementId(Long requirementId);
 List<SupportTicket> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String customerEmail);
 List<SupportTicket> findByAssigneeEmailIgnoreCaseOrderByCreatedAtDesc(String assigneeEmail);
}
