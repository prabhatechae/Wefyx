package com.wefyx.support.ticket;
import org.springframework.data.jpa.repository.JpaRepository;
public interface TicketRepository extends JpaRepository<SupportTicket,Long>{ long countByStatus(TicketStatus status); }
