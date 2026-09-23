package com.wefyx.support.dashboard;

import com.wefyx.support.user.*; import com.wefyx.support.ticket.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/dashboard")
public class DashboardController {
    private final UserRepository users; private final TicketRepository tickets; public DashboardController(UserRepository users,TicketRepository tickets){this.users=users;this.tickets=tickets;}
    @GetMapping("/summary") public Map<String,Object> summary(){long total=users.count();Map<String,Object> m=new LinkedHashMap<>();m.put("totalUsers",total);m.put("technicians",users.countByRoleContainingIgnoreCase("Technician")+users.countByRoleContainingIgnoreCase("Engineer"));m.put("customers",users.countByRoleContainingIgnoreCase("Customer"));m.put("vendors",users.countByRoleContainingIgnoreCase("Vendor"));m.put("activeTickets",tickets.countByStatus(TicketStatus.OPEN)+tickets.countByStatus(TicketStatus.IN_PROGRESS)+tickets.countByStatus(TicketStatus.PENDING));m.put("activeUsers",users.countByStatus(UserStatus.ACTIVE));m.put("inactiveUsers",users.countByStatus(UserStatus.INACTIVE));m.put("pendingUsers",users.countByStatus(UserStatus.PENDING));m.put("suspendedUsers",users.countByStatus(UserStatus.SUSPENDED));m.put("deletedUsers",users.countByStatus(UserStatus.DELETED));m.put("growth",List.of(Math.max(0,total-25),Math.max(0,total-20),Math.max(0,total-15),Math.max(0,total-10),Math.max(0,total-5),total));return m;}
}
