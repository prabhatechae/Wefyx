package com.wefyx.support.ticket;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/tickets")
public class TicketController {
 private final TicketRepository repository;
 public TicketController(TicketRepository repository){this.repository=repository;}
 @GetMapping public List<SupportTicket> all(){return repository.findAll();}
 @GetMapping("/summary") public Map<String,Long> summary(){Map<String,Long> m=new LinkedHashMap<>();m.put("total",repository.count());for(var s:TicketStatus.values())m.put(s.name(),repository.countByStatus(s));return m;}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public SupportTicket create(@Valid @RequestBody SupportTicket ticket){ticket.setReference("TKT-2026-"+String.format("%04d",repository.count()+1257));return repository.save(ticket);}
 @PutMapping("/{id}") public SupportTicket update(@PathVariable Long id,@Valid @RequestBody SupportTicket input){var t=repository.findById(id).orElseThrow();t.setSubject(input.getSubject());t.setCustomer(input.getCustomer());t.setAssignee(input.getAssignee());t.setPriority(input.getPriority());t.setStatus(input.getStatus());t.setCategory(input.getCategory());return repository.save(t);}
 @PatchMapping("/{id}/status") public SupportTicket status(@PathVariable Long id,@RequestBody Map<String,String> body){var t=repository.findById(id).orElseThrow();t.setStatus(TicketStatus.valueOf(body.get("status")));return repository.save(t);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){repository.deleteById(id);}
}
