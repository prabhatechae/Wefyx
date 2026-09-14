package com.wefyx.support.ticket;
import org.springframework.boot.CommandLineRunner;import org.springframework.context.annotation.Bean;import org.springframework.context.annotation.Configuration;import java.util.List;import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
@Configuration @ConditionalOnProperty(name="wefyx.seed.enabled",havingValue="true") public class TicketSeedData {@Bean CommandLineRunner seedTickets(TicketRepository r){return args->{if(r.count()>0)return;r.saveAll(List.of(
 new SupportTicket("TKT-2026-1256","Email service unavailable","ABC Trading LLC","Ahmed Khan",TicketPriority.CRITICAL,TicketStatus.OPEN,"Email"),
 new SupportTicket("TKT-2026-1255","Laptop display issue","Wefyx Technologies","Mike Johnson",TicketPriority.MEDIUM,TicketStatus.IN_PROGRESS,"Hardware"),
 new SupportTicket("TKT-2026-1254","VPN access failure","TechSolutions LLC","Fatima Hassan",TicketPriority.HIGH,TicketStatus.PENDING,"Network"),
 new SupportTicket("TKT-2026-1253","Network latency alert","Rentals UAE","Ahmed Khan",TicketPriority.HIGH,TicketStatus.IN_PROGRESS,"Network"),
 new SupportTicket("TKT-2026-1252","Printer not responding","MSP Global Solutions","Mike Johnson",TicketPriority.LOW,TicketStatus.RESOLVED,"Hardware"),
 new SupportTicket("TKT-2026-1251","Account locked","ABC Trading LLC","Fatima Hassan",TicketPriority.MEDIUM,TicketStatus.CLOSED,"Access")) );};}}
