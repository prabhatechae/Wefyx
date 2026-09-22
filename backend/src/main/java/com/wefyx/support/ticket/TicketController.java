package com.wefyx.support.ticket;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.*;
import com.wefyx.support.config.AccessControl;
import com.wefyx.support.config.AccessControl.Role;
import com.wefyx.support.notification.NotificationService;
import com.wefyx.support.requirement.RequirementRepository;
import com.wefyx.support.resource.AuditService;
import com.wefyx.support.user.*;

@RestController @RequestMapping("/api/tickets")
public class TicketController {
 private final TicketRepository tickets; private final RequirementRepository requirements; private final AccessControl access;
 private final UserRepository users; private final NotificationService notifications; private final AuditService audit;
 public TicketController(TicketRepository tickets,RequirementRepository requirements,AccessControl access,UserRepository users,NotificationService notifications,AuditService audit){this.tickets=tickets;this.requirements=requirements;this.access=access;this.users=users;this.notifications=notifications;this.audit=audit;}

 @GetMapping public List<SupportTicket> all(Authentication auth){Role role=access.role(auth);if(role==Role.CUSTOMER)return tickets.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(auth.getName());if(role==Role.VENDOR)throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Vendors cannot access customer support tickets");return tickets.findAll().stream().sorted(Comparator.comparing(SupportTicket::getCreatedAt,Comparator.nullsLast(Comparator.naturalOrder())).reversed()).toList();}
 @GetMapping("/{id}") public SupportTicket one(@PathVariable Long id,Authentication auth){var ticket=find(id);requireVisible(ticket,auth);return ticket;}
 @GetMapping("/summary") public Map<String,Long> summary(Authentication auth){var rows=all(auth);Map<String,Long> result=new LinkedHashMap<>();result.put("total",(long)rows.size());for(var status:TicketStatus.values())result.put(status.name(),rows.stream().filter(t->t.getStatus()==status).count());return result;}

 @PostMapping @ResponseStatus(HttpStatus.CREATED) public SupportTicket create(@RequestBody SupportTicket input,Authentication auth){
  Role role=access.require(auth,Role.CUSTOMER,Role.EMPLOYEE,Role.SUPER_ADMIN);var ticket=new SupportTicket();
  if(role==Role.CUSTOMER){
   var customer=users.findByEmailIgnoreCase(auth.getName()).orElseThrow(()->new ResponseStatusException(HttpStatus.FORBIDDEN,"Customer account was not found"));
   ticket.setCustomerEmail(customer.getEmail());ticket.setCustomer(customer.getOrganization()==null||customer.getOrganization().isBlank()?customer.getName():customer.getOrganization());
   if(input.getRequirementId()!=null){var requirement=requirements.findById(input.getRequirementId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Requirement record not found"));if(!auth.getName().equalsIgnoreCase(requirement.getCustomerEmail()))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"You can create a ticket only for your own requirement");tickets.findByRequirementId(requirement.getId()).ifPresent(existing->{throw new ResponseStatusException(HttpStatus.CONFLICT,"A ticket already exists for this requirement: "+existing.getReference());});ticket.setRequirementId(requirement.getId());ticket.setSubject(requirement.getTitle());ticket.setDescription(requirement.getDescription());ticket.setCategory(blank(input.getCategory())?requirement.getCategory():input.getCategory());ticket.setPriority(priority(blank(input.getPriority()==null?null:input.getPriority().name())?requirement.getPriority():input.getPriority().name()));}
   else{ticket.setSubject(required(input.getSubject(),"Subject"));ticket.setDescription(required(input.getDescription(),"Description"));ticket.setCategory(blank(input.getCategory())?"General support":input.getCategory());ticket.setPriority(input.getPriority()==null?TicketPriority.MEDIUM:input.getPriority());}
   ticket.setAssignee("Unassigned");ticket.setStatus(TicketStatus.OPEN);
  }else{ticket=input;validateStaffTicket(ticket);if(ticket.getStatus()==null)ticket.setStatus(TicketStatus.OPEN);if(blank(ticket.getAssignee()))ticket.setAssignee("Unassigned");}
  ticket.setReference(nextReference());var saved=tickets.save(ticket);audit.log("Ticket created","Tickets",saved.getReference());notifyEmployees(saved,"New customer ticket",saved.getReference()+" · "+saved.getSubject());return saved;
 }

 @PatchMapping("/{id}/assign") public SupportTicket assign(@PathVariable Long id,@RequestBody Map<String,String> body,Authentication auth){
  var ticket=find(id);Role role=access.require(auth,Role.SUPER_ADMIN,Role.EMPLOYEE);String email=required(body.get("assigneeEmail"),"Assignee email");
  if(role==Role.EMPLOYEE&&!auth.getName().equalsIgnoreCase(email))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Employees can assign tickets only to themselves");
  var employee=users.findByEmailIgnoreCase(email).filter(u->u.getStatus()==UserStatus.ACTIVE&&isEmployee(u)).orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Select an active employee account"));
  ticket.setAssignee(employee.getName());ticket.setAssigneeEmail(employee.getEmail());var saved=tickets.save(ticket);
  notifications.send(employee.getEmail(),ticket.getRequirementId(),"TICKET_ASSIGNED","Ticket assigned to you",ticket.getReference()+" · "+ticket.getSubject());notifyCustomer(ticket,"Ticket assigned","Your ticket was assigned to "+employee.getName()+".");audit.log("Ticket assigned","Tickets",ticket.getReference()+" · "+employee.getEmail());return saved;
 }

 @PatchMapping("/{id}/status") public SupportTicket status(@PathVariable Long id,@RequestBody Map<String,String> body,Authentication auth){
  var ticket=find(id);requireWorker(ticket,auth);TicketStatus next;try{next=TicketStatus.valueOf(required(body.get("status"),"Status").toUpperCase(Locale.ROOT));}catch(IllegalArgumentException error){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid ticket status");}
  if(next==TicketStatus.RESOLVED){ticket.setResolution(required(body.get("resolution"),"Resolution"));}else if(body.containsKey("resolution"))ticket.setResolution(body.get("resolution"));ticket.setStatus(next);var saved=tickets.save(ticket);notifyCustomer(ticket,"Ticket status updated",ticket.getReference()+" is now "+next.name().replace('_',' ').toLowerCase(Locale.ROOT)+".");audit.log("Ticket status changed","Tickets",ticket.getReference()+" · "+next);return saved;
 }

 @PatchMapping("/{id}/reopen") public SupportTicket reopen(@PathVariable Long id,Authentication auth){var ticket=find(id);if(access.role(auth)!=Role.CUSTOMER||!auth.getName().equalsIgnoreCase(ticket.getCustomerEmail()))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Only the ticket customer can reopen this ticket");if(!EnumSet.of(TicketStatus.RESOLVED,TicketStatus.CLOSED).contains(ticket.getStatus()))throw new ResponseStatusException(HttpStatus.CONFLICT,"Only a resolved or closed ticket can be reopened");ticket.setStatus(TicketStatus.OPEN);ticket.setResolution(null);var saved=tickets.save(ticket);notifyEmployees(ticket,"Ticket reopened",ticket.getReference()+" was reopened by the customer");return saved;}
 @PutMapping("/{id}") public SupportTicket update(@PathVariable Long id,@RequestBody SupportTicket input,Authentication auth){var ticket=find(id);requireWorker(ticket,auth);ticket.setSubject(required(input.getSubject(),"Subject"));ticket.setDescription(input.getDescription());ticket.setCategory(input.getCategory());ticket.setPriority(input.getPriority()==null?ticket.getPriority():input.getPriority());return tickets.save(ticket);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id,Authentication auth){access.require(auth,Role.SUPER_ADMIN);tickets.deleteById(id);}

 private SupportTicket find(Long id){return tickets.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Ticket not found"));}
 private void requireVisible(SupportTicket ticket,Authentication auth){Role role=access.role(auth);if(role==Role.SUPER_ADMIN||role==Role.EMPLOYEE)return;if(role==Role.CUSTOMER&&auth.getName().equalsIgnoreCase(ticket.getCustomerEmail()))return;throw new ResponseStatusException(HttpStatus.FORBIDDEN,"This ticket is not available to your account");}
 private void requireWorker(SupportTicket ticket,Authentication auth){Role role=access.require(auth,Role.SUPER_ADMIN,Role.EMPLOYEE);if(role==Role.EMPLOYEE&&(blank(ticket.getAssigneeEmail())||!auth.getName().equalsIgnoreCase(ticket.getAssigneeEmail())))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Assign this ticket to yourself before updating it");}
 private void notifyCustomer(SupportTicket ticket,String title,String message){if(!blank(ticket.getCustomerEmail()))notifications.send(ticket.getCustomerEmail(),ticket.getRequirementId(),"TICKET_STATUS",title,message);}
 private void notifyEmployees(SupportTicket ticket,String title,String message){users.findAll().stream().filter(u->u.getStatus()==UserStatus.ACTIVE&&isEmployee(u)).forEach(u->notifications.send(u.getEmail(),ticket.getRequirementId(),"TICKET_QUEUE",title,message));}
 private static boolean isEmployee(SupportUser user){String role=String.valueOf(user.getRole()).toUpperCase(Locale.ROOT);return role.contains("EMPLOYEE")||role.contains("TECH")||role.contains("ENGINEER")||role.contains("SUPPORT")||role.contains("MANAGER");}
 private String nextReference(){long number=tickets.count()+1;while(true){String candidate="TKT-"+LocalDateTime.now().getYear()+"-"+String.format("%05d",number++);if(tickets.findAll().stream().noneMatch(t->candidate.equals(t.getReference())))return candidate;}}
 private static void validateStaffTicket(SupportTicket ticket){ticket.setSubject(required(ticket.getSubject(),"Subject"));ticket.setCustomer(required(ticket.getCustomer(),"Customer"));if(ticket.getPriority()==null)ticket.setPriority(TicketPriority.MEDIUM);}
 private static TicketPriority priority(String value){if(value==null)return TicketPriority.MEDIUM;return switch(value.trim().toUpperCase(Locale.ROOT)){case "URGENT","CRITICAL"->TicketPriority.CRITICAL;case "HIGH"->TicketPriority.HIGH;case "LOW"->TicketPriority.LOW;default->TicketPriority.MEDIUM;};}
 private static String required(String value,String label){if(blank(value))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,label+" is required");return value.trim();}
 private static boolean blank(String value){return value==null||value.isBlank();}
}
