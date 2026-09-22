package com.wefyx.support.supportrequest;
import com.wefyx.support.resource.AuditService;
import com.wefyx.support.user.UserRepository;
import com.wefyx.support.user.UserStatus;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;import java.util.*;
@RestController @RequestMapping("/api/support-requests") public class PublicSupportRequestController{
 private final PublicSupportRequestRepository repository;private final SupportMailService mail;private final AuditService audit;private final UserRepository users;private final String adminEmail;
 public PublicSupportRequestController(PublicSupportRequestRepository r,SupportMailService m,AuditService a,UserRepository u,@Value("${wefyx.auth.email}")String adminEmail){repository=r;mail=m;audit=a;users=u;this.adminEmail=adminEmail;}
 @PostMapping @ResponseStatus(HttpStatus.CREATED)public PublicSupportRequest create(@Valid @RequestBody PublicSupportRequest request){request.setReference("SUP-"+LocalDate.now().getYear()+"-"+String.format("%05d",repository.count()+1));request.setStatus("OPEN");request.setEmployeeReply(null);request.setRepliedBy(null);request.setEmailDelivered(false);request.setEmailError(null);var saved=repository.save(request);audit.log("Public support request created","Support",saved.getReference());return saved;}
 @GetMapping public List<PublicSupportRequest> all(Authentication auth){requireEmployee(auth);return repository.findAllByOrderByCreatedAtDesc();}
 @PatchMapping("/{id}/reply") public PublicSupportRequest reply(@PathVariable Long id,@RequestBody Map<String,String> body,Authentication auth){requireEmployee(auth);var item=repository.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Support request not found"));String reply=body.getOrDefault("reply","").trim();if(reply.isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Reply is required");item.setEmployeeReply(reply);item.setRepliedBy(body.getOrDefault("employeeName",auth.getName()));item.setRepliedAt(LocalDateTime.now());item.setStatus("ANSWERED");var delivery=mail.send(item);item.setEmailDelivered(delivery.delivered());item.setEmailError(delivery.error());var saved=repository.save(item);audit.log("Support request answered","Support",saved.getReference());return saved;}
 private void requireEmployee(Authentication auth){if(auth==null)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);if(adminEmail.equalsIgnoreCase(auth.getName()))return;var user=users.findByEmailIgnoreCase(auth.getName()).orElseThrow(()->new ResponseStatusException(HttpStatus.FORBIDDEN,"Employee access required"));if(user.getStatus()!=UserStatus.ACTIVE||!user.getRole().toUpperCase(Locale.ROOT).contains("EMPLOYEE"))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Employee access required");}
}
